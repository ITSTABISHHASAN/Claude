// Liquid-glass orb, raymarched as a signed distance field.
//
// One field morphs between four forms (blob → torus → fractured crystal →
// cube grid), which a fixed vertex mesh cannot do across different
// topologies. The "vertex displacement" is applied to the field instead:
// simplex noise pushes the surface in and out. Glass shading uses per-channel
// refraction of the background (chromatic aberration), Fresnel reflection of
// a procedural studio, blue rim light and a silver key highlight.
//
// LITE (phones, coarse pointers) trims steps, noise octaves and the
// chromatic samples.

precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uOrbPos;      // orb centre, in viewport-height units from screen centre (y up)
uniform float uOrbRadius;  // orb radius as a fraction of viewport height
uniform float uAlpha;
uniform float uMorph;      // 0 blob, 1 torus, 2 crystal, 3 cube grid
uniform float uDim;
uniform float uPulse;
uniform float uHover;
uniform vec3 uMouseWorld;  // cursor projected onto the orb, object space (pre-rotation)
uniform mat3 uRot;
uniform float uVel;
uniform float uBeams;

#ifdef LITE
  #define MAX_STEPS 44
#else
  #define MAX_STEPS 80
#endif

const vec3 VOID   = vec3(0.0196, 0.0235, 0.0392);
const vec3 SPACE  = vec3(0.0431, 0.0588, 0.1020);
const vec3 BLUE   = vec3(0.1765, 0.4824, 1.0);
const vec3 CYAN   = vec3(0.3098, 0.8196, 1.0);
const vec3 SILVER = vec3(0.7882, 0.8078, 0.8392);
const float BOUND = 1.45;

// ── noise ──────────────────────────────────────────────────────────────
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float hash11(float p) { return fract(sin(p * 127.1) * 43758.5453); }
float hash21(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float vnoise(float x) {
  float i = floor(x);
  float f = fract(x);
  return mix(hash11(i), hash11(i + 1.0), f * f * (3.0 - 2.0 * f));
}

mat2 rot2(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// ── shapes ─────────────────────────────────────────────────────────────
float sdBlob(vec3 p) {
  float n = snoise(p * 0.8 + vec3(0.0, 0.0, uTime * 0.14)) * 0.045;
  #ifndef LITE
  n += snoise(p * 1.9 - vec3(uTime * 0.1)) * 0.016;
  #endif
  return (length(p) - 1.0 - n) * 0.85;
}

float sdTorus(vec3 p) {
  p.yz = rot2(1.15) * p.yz;
  p.xz = rot2(uTime * 0.25) * p.xz;
  vec2 q = vec2(length(p.xz) - 0.78, p.y);
  float wobble = snoise(p * 1.6 + uTime * 0.2) * 0.025;
  return length(q) - 0.3 - wobble;
}

// Hexagonal prism with tapered caps: a single quartz-like gem.
float sdGem(vec3 p) {
  float d = -1e5;
  for (int i = 0; i < 6; i++) {
    float a = float(i) * 1.0471976;
    vec2 cs = vec2(cos(a), sin(a));
    float r = dot(p.xz, cs);
    d = max(d, r - 0.6);
    d = max(d, (r + abs(p.y) * 0.9) * 0.7433 - 0.647);
  }
  return d;
}

// The gem split along two planes, its shards drifting slightly apart.
float sdCrystal(vec3 p) {
  p.xz = rot2(uTime * 0.2 + 0.4) * p.xz;
  p.xy = rot2(0.18) * p.xy;
  vec3 n1 = normalize(vec3(0.35, 1.0, 0.2));
  vec3 n2 = normalize(vec3(1.0, -0.25, 0.45));
  float gap = 0.05 + 0.025 * sin(uTime * 0.9);
  float s1 = dot(p, n1) >= 0.0 ? 1.0 : -1.0;
  float s2 = dot(p, n2) >= 0.0 ? 1.0 : -1.0;
  vec3 q = p - n1 * s1 * gap - n2 * s2 * gap;
  float d = sdGem(q);
  d = max(d, -s1 * dot(q, n1));
  d = max(d, -s2 * dot(q, n2));
  return d;
}

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

// 3×3×3 grid of glass cubes that breathe apart.
float sdCubes(vec3 p) {
  p.yz = rot2(0.62) * p.yz;
  p.xz = rot2(0.785 + uTime * 0.18) * p.xz;
  float s = 0.5;
  vec3 id = clamp(floor(p / s + 0.5), -1.0, 1.0);
  float h = hash21(id.xy + id.z * 7.13);
  float spread = 1.0 + 0.09 * (0.5 + 0.5 * sin(uTime * 0.9 + h * 6.2831));
  vec3 q = p - s * id * spread;
  return sdRoundBox(q, vec3(0.17), 0.045);
}

float shape(int i, vec3 p) {
  if (i == 0) return sdBlob(p);
  if (i == 1) return sdTorus(p);
  if (i == 2) return sdCrystal(p);
  return sdCubes(p);
}

float map(vec3 pw) {
  vec3 p = uRot * pw;
  float m = clamp(uMorph, 0.0, 3.0);
  int a = int(min(floor(m), 2.0));
  float f = m - float(a);
  float d;
  if (f < 0.001) {
    d = shape(a, p);
  } else if (f > 0.999) {
    d = shape(a + 1, p);
  } else {
    float k = f * f * (3.0 - 2.0 * f);
    d = mix(shape(a, p), shape(a + 1, p), k);
    #ifndef LITE
    // A liquid swell mid-transition so the morph reads as organic.
    d -= sin(f * 3.14159) * 0.07 * snoise(p * 2.2 + uTime * 0.4);
    #endif
  }
  // Cursor ripple travelling outward from the hover point.
  float md = length(pw - uMouseWorld);
  d -= uHover * 0.03 * sin(md * 15.0 - uTime * 5.5) * exp(-md * md * 3.5);
  // CTA pulse: a gentle breathing swell.
  d -= uPulse * (0.035 + 0.02 * sin(uTime * 4.0));
  return d;
}

vec3 calcNormal(vec3 p) {
  const vec2 e = vec2(1.0, -1.0) * 0.0025;
  return normalize(
    e.xyy * map(p + e.xyy) +
    e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) +
    e.xxx * map(p + e.xxx));
}

// ── environment ────────────────────────────────────────────────────────
vec3 background(vec2 p) {
  vec3 col = VOID;
  // Deep space haze from above.
  col += SPACE * 1.1 * smoothstep(1.3, 0.0, length(p - vec2(0.0, 0.62)));

  // Blue light behind the orb: the source the glass refracts. A soft halo
  // plus a brighter lobe low and to the right, so the lens flips it.
  float r = max(uOrbRadius, 0.05);
  vec2 d = p - uOrbPos;
  float vis = 0.25 + 0.75 * uAlpha;
  float halo = exp(-dot(d, d) / (r * r * 3.2));
  col += BLUE * 0.17 * halo * vis * (1.0 + uPulse * 0.7);
  vec2 dl = d - vec2(r * 0.42, -r * 0.5);
  col += BLUE * 0.3 * exp(-dot(dl, dl) / (r * r * 0.38)) * uAlpha * (1.0 + uPulse * 0.5);
  vec2 dc = d - vec2(-r * 0.55, r * 0.35);
  col += CYAN * 0.1 * exp(-dot(dc, dc) / (r * r * 0.12)) * uAlpha;
  // A diagonal gradient band so refraction has structure to bend.
  float band = exp(-pow(dot(d, normalize(vec2(1.0, 0.7))) / (r * 0.5), 2.0));
  col += mix(BLUE, CYAN, 0.35) * 0.1 * band * halo * uAlpha;

  // Faint line grid around the orb: refraction visibly bends it.
  float gs = 0.065;
  vec2 g = abs(fract(p / gs - 0.5) - 0.5) * gs;
  float pxw = 1.1 / uRes.y;
  float lines = max(1.0 - smoothstep(0.0, pxw, g.x), 1.0 - smoothstep(0.0, pxw, g.y));
  col += mix(SILVER, BLUE, 0.6) * lines * 0.045 * exp(-dot(d, d) / (r * r * 4.5)) * uAlpha;

  // Volumetric beams fanning down from the upper left.
  vec2 src = vec2(-0.6, 0.95);
  vec2 v = p - src;
  float ang = atan(v.x, -v.y);
  float beams = pow(vnoise(ang * 9.0 + uTime * 0.05), 3.0);
  beams += 0.7 * pow(vnoise(ang * 21.0 - uTime * 0.08 + 4.0), 4.0);
  float len = length(v);
  float fall = smoothstep(2.0, 0.15, len) * smoothstep(0.0, 0.4, len);
  col += mix(BLUE, CYAN, 0.25) * beams * fall * (0.05 + uVel * 0.12) * uBeams;

  // Vignette.
  col *= 1.0 - 0.32 * dot(p * 0.85, p * 0.85);
  return col;
}

vec3 envMap(vec3 r) {
  float y = r.y;
  vec3 c = mix(VOID, SPACE * 1.6, smoothstep(-0.7, 0.5, y));
  // Overhead softbox: the silver highlight band.
  c += SILVER * 0.95 * smoothstep(0.5, 0.92, y) * smoothstep(0.95, 0.1, abs(r.x));
  // Blue horizon.
  c += BLUE * 0.4 * exp(-pow((y + 0.05) * 4.5, 2.0));
  // Cyan strip light to the right.
  c += CYAN * 0.35 * smoothstep(0.7, 0.98, r.x) * smoothstep(0.55, 0.0, abs(y - 0.1));
  return c;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 p = (frag - 0.5 * uRes) / uRes.y;
  vec3 col = background(p);

  if (uAlpha > 0.003) {
    // Map screen to the orb's local camera: a unit field at distance 4
    // with focal length 2 spans 0.516 units of radius.
    float k = uOrbRadius / 0.516;
    vec2 q = (p - uOrbPos) / k;
    vec3 ro = vec3(0.0, 0.0, 4.0);
    vec3 rd = normalize(vec3(q, -2.0));

    float b = dot(ro, rd);
    float h = b * b - (dot(ro, ro) - BOUND * BOUND);
    if (h > 0.0) {
      float sh = sqrt(h);
      float t = -b - sh;
      float tmax = -b + sh;
      float dBest = 1e5;
      float tBest = t;
      bool hit = false;
      for (int i = 0; i < MAX_STEPS; i++) {
        float dist = map(ro + rd * t);
        if (dist < dBest) { dBest = dist; tBest = t; }
        if (dist < 0.0012) { hit = true; break; }
        t += dist * 0.8;
        if (t > tmax) break;
      }

      // Analytic-ish edge coverage so silhouettes stay smooth at any DPR.
      float px = 2.4 / (uRes.y * k);
      float cover = hit ? 1.0 : 1.0 - smoothstep(0.0, px, dBest);

      if (cover > 0.0) {
        vec3 pos = ro + rd * (hit ? t : tBest);
        vec3 n = calcNormal(pos);
        vec3 v = -rd;
        float ndv = clamp(dot(n, v), 0.0, 1.0);
        float fres = pow(1.0 - ndv, 3.0);

        // Refraction: a thick lens samples the backdrop inverted through the
        // body, with each channel bent a little more (chromatic aberration).
        float thick = (0.62 + 0.3 * (1.0 - ndv)) * uOrbRadius;
        vec2 off = -n.xy * thick;
        vec3 refr;
        #ifdef LITE
          refr = background(p + off);
        #else
          refr = vec3(
            background(p + off * 0.94).r,
            background(p + off).g,
            background(p + off * 1.07).b);
        #endif

        // Frosted body: the glass absorbs some light and cools what passes.
        // Brighter toward the top where the softbox fills it.
        vec3 glass = refr * vec3(0.42, 0.6, 0.9) + SPACE * 0.45;
        glass += BLUE * 0.05 * smoothstep(-0.4, 1.0, n.y);
        // Light gathering in the thick centre of the lens.
        glass += mix(BLUE, CYAN, 0.2) * pow(ndv, 4.0) * 0.12;
        vec3 r = reflect(rd, n);
        vec3 c = mix(glass, envMap(r), 0.12 + fres * 0.85);

        // Blue rim light from behind and a hairline of cyan.
        float rim = pow(1.0 - ndv, 2.4);
        c += BLUE * rim * 0.6 + CYAN * pow(1.0 - ndv, 7.0) * 0.4;

        // Silver key highlight, top left, and a soft fill.
        vec3 L = normalize(vec3(-0.55, 0.75, 0.6));
        c += SILVER * pow(max(dot(r, L), 0.0), 90.0) * 1.3;
        c += vec3(0.55, 0.72, 1.0) * pow(max(dot(r, normalize(vec3(0.75, -0.25, 0.5))), 0.0), 18.0) * 0.12;

        // Inner glow when the primary CTA is hovered.
        c += BLUE * uPulse * 0.22 * (1.0 - ndv);

        c = mix(c, c * 0.42, uDim);
        col = mix(col, c, cover * uAlpha);
      }
    }
  }

  // Dither to avoid banding in the dark gradients.
  col += (hash21(frag + fract(uTime) * 61.0) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
