// Full-screen quad in clip space; the fragment shader works in pixels.
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
