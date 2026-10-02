precision highp float;
varying float vAlpha;
varying float vSeed;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.0, d) * vAlpha;
  vec3 c = mix(vec3(0.55, 0.72, 1.0), vec3(0.31, 0.82, 1.0), step(0.8, vSeed));
  gl_FragColor = vec4(c * a, a);
}
