// Slow-drifting dust. Positions live in clip space; z is depth (0 far, 1 near),
// which sets size, brightness, drift speed and scroll parallax.
attribute float aSeed;
uniform float uTime;
uniform float uScroll;   // page scroll, in viewport heights
uniform float uVel;      // smoothed scroll velocity, 0..1
uniform float uPixelRatio;
varying float vAlpha;
varying float vSeed;

void main() {
  vec3 p = position;
  float speed = 0.006 + p.z * 0.014;
  float y = p.y + uTime * speed + uScroll * (0.12 + p.z * 0.38);
  y = mod(y + 1.1, 2.2) - 1.1;
  float x = p.x + sin(uTime * 0.12 + aSeed * 6.2831) * 0.015;
  gl_Position = vec4(x, y, 0.0, 1.0);
  gl_PointSize = (1.0 + p.z * 2.4) * uPixelRatio * (1.0 + uVel * 0.8);
  vAlpha = (0.1 + p.z * 0.5) * (0.55 + 0.45 * sin(uTime * 0.6 + aSeed * 40.0)) * (1.0 + uVel);
  vSeed = aSeed;
}
