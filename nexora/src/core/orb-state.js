/**
 * Target state for the WebGL orb. Scroll choreography and UI write here;
 * the stage eases toward it every frame. Units:
 *   x, y    centre offset in viewport heights from screen centre (y up)
 *   radius  fraction of viewport height
 *   morph   0 blob · 1 torus · 2 crystal · 3 cube grid
 */
export const orb = {
  x: 0,
  y: 0.1,
  radius: 0.28,
  alpha: 0,
  morph: 0,
  dim: 0,
  pulse: 0,
  beams: 1,
};
