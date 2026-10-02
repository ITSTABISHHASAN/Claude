import {
  WebGLRenderer,
  Scene,
  Camera,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
  BufferGeometry,
  BufferAttribute,
  Points,
  AdditiveBlending,
  Matrix3,
  Matrix4,
  Euler,
  Vector2,
  Vector3,
} from 'three';
import fullscreenVert from './shaders/fullscreen.vert?raw';
import orbFrag from './shaders/orb.frag?raw';
import particlesVert from './shaders/particles.vert?raw';
import particlesFrag from './shaders/particles.frag?raw';

const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));

/**
 * The persistent WebGL layer: background light, beams, particles and the
 * glass orb. It reads the shared `orb` target state every frame and eases
 * toward it, so scroll choreography never has to know about WebGL.
 */
export function createStage({ canvas, orb, scroll, lite = false, reducedMotion = false }) {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    alpha: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x05060a, 1);

  const maxDpr = Math.min(window.devicePixelRatio || 1, lite ? 1.25 : 2);
  let dpr = Math.min(maxDpr, lite ? 1 : 1.5);

  const scene = new Scene();
  const camera = new Camera();

  // Orb + background, one full-screen pass.
  const orbUniforms = {
    uRes: { value: new Vector2(1, 1) },
    uTime: { value: 0 },
    uOrbPos: { value: new Vector2(0, 0) },
    uOrbRadius: { value: 0.3 },
    uAlpha: { value: 0 },
    uMorph: { value: 0 },
    uDim: { value: 0 },
    uPulse: { value: 0 },
    uHover: { value: 0 },
    uMouseWorld: { value: new Vector3(0, 0, 10) },
    uRot: { value: new Matrix3() },
    uVel: { value: 0 },
    uBeams: { value: 1 },
  };
  const orbMaterial = new ShaderMaterial({
    vertexShader: fullscreenVert,
    fragmentShader: orbFrag,
    uniforms: orbUniforms,
    defines: lite ? { LITE: '' } : {},
    depthTest: false,
    depthWrite: false,
  });
  const quad = new Mesh(new PlaneGeometry(2, 2), orbMaterial);
  quad.frustumCulled = false;
  scene.add(quad);

  // Particles.
  const count = lite ? 160 : 520;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = Math.random() * 2.2 - 1.1;
    positions[i * 3 + 1] = Math.random() * 2.2 - 1.1;
    positions[i * 3 + 2] = Math.pow(Math.random(), 2.2);
    seeds[i] = Math.random();
  }
  const pGeo = new BufferGeometry();
  pGeo.setAttribute('position', new BufferAttribute(positions, 3));
  pGeo.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  const pUniforms = {
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uVel: { value: 0 },
    uPixelRatio: { value: dpr },
  };
  const particles = new Points(
    pGeo,
    new ShaderMaterial({
      vertexShader: particlesVert,
      fragmentShader: particlesFrag,
      uniforms: pUniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
  particles.frustumCulled = false;
  scene.add(particles);

  // Smoothed render state.
  const cur = { x: orb.x, y: orb.y, radius: orb.radius, alpha: 0, morph: orb.morph, dim: orb.dim, pulse: 0, hover: 0, beams: orb.beams };
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, px: 0, py: 0, speed: 0 };
  const lean = { x: 0, y: 0 };
  let vel = 0;
  let width = 1;
  let height = 1;

  const euler = new Euler();
  const m4 = new Matrix4();
  const tmp = new Vector3();

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    const size = renderer.getDrawingBufferSize(new Vector2());
    orbUniforms.uRes.value.copy(size);
    pUniforms.uPixelRatio.value = dpr;
  }

  function onPointer(e) {
    // Viewport-height units from the centre, y up: the shader's space.
    mouse.tx = (e.clientX - width / 2) / height;
    mouse.ty = -(e.clientY - height / 2) / height;
    mouse.active = e.pointerType === 'mouse';
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointer, { passive: true });
  resize();

  // Adaptive resolution: keep motion smooth on slower GPUs. Sampled over
  // wall time (not frame count) so a very slow device recovers quickly; if
  // the floor is reached and it is still slow, fall back to the LITE shader.
  const MIN_DPR = 0.5;
  let frameAcc = 0;
  let frameCount = 0;
  let windowStart = 0;
  let lastAdjust = 0;
  let isLite = lite;
  function adapt(dt, now) {
    if (!windowStart) windowStart = now;
    frameAcc += dt;
    frameCount++;
    if (now - windowStart < 0.6 || frameCount < 6) return;
    const avg = frameAcc / frameCount;
    frameAcc = 0;
    frameCount = 0;
    windowStart = now;
    if (avg > 0.024) {
      if (dpr > MIN_DPR) {
        // Pixel cost scales with dpr²: jump straight toward a 60 fps budget.
        dpr = Math.max(MIN_DPR, dpr * Math.max(0.5, Math.sqrt(0.016 / avg)));
        lastAdjust = now;
        resize();
      } else if (!isLite && avg > 0.03) {
        isLite = true;
        orbMaterial.defines = { LITE: '' };
        orbMaterial.needsUpdate = true;
      }
    } else if (avg < 0.0175 && dpr < maxDpr && now - lastAdjust > 3) {
      dpr = Math.min(maxDpr, dpr + 0.1);
      lastAdjust = now;
      resize();
    }
  }

  let raf = 0;
  let last = performance.now();
  let time = 0;
  let running = false;
  let lastSig = '';

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!reducedMotion) time += dt;

    // Ease toward target state.
    cur.x = damp(cur.x, orb.x, 4, dt);
    cur.y = damp(cur.y, orb.y, 4, dt);
    cur.radius = damp(cur.radius, orb.radius, 4, dt);
    cur.alpha = damp(cur.alpha, orb.alpha, 3.2, dt);
    cur.morph = Math.abs(orb.morph - cur.morph) > 1.5 ? orb.morph : damp(cur.morph, orb.morph, 3.5, dt);
    cur.dim = damp(cur.dim, orb.dim, 4, dt);
    cur.pulse = damp(cur.pulse, orb.pulse, 5, dt);
    cur.beams = damp(cur.beams, orb.beams, 3, dt);

    mouse.x = damp(mouse.x, mouse.tx, 6, dt);
    mouse.y = damp(mouse.y, mouse.ty, 6, dt);
    // Pointer speed (viewport heights / s): ripples answer movement, not presence.
    const sp = dt > 0 ? Math.hypot(mouse.tx - mouse.px, mouse.ty - mouse.py) / dt : 0;
    mouse.px = mouse.tx;
    mouse.py = mouse.ty;
    mouse.speed = Math.max(sp, damp(mouse.speed, 0, 2.5, dt));

    const v = Math.min(Math.abs(scroll.velocity || 0) / 30, 1);
    vel = damp(vel, v, 3, dt);

    // Lean toward the cursor: a small drift and a tilt.
    const dx = mouse.x - cur.x;
    const dy = mouse.y - cur.y;
    lean.x = damp(lean.x, reducedMotion ? 0 : Math.max(-1, Math.min(1, dx / 0.6)), 3, dt);
    lean.y = damp(lean.y, reducedMotion ? 0 : Math.max(-1, Math.min(1, dy / 0.6)), 3, dt);

    const ox = cur.x + lean.x * 0.018;
    const oy = cur.y + lean.y * 0.018;
    const spin = time * 0.08;
    euler.set(-lean.y * 0.45, lean.x * 0.55 + spin, 0, 'YXZ');
    m4.makeRotationFromEuler(euler).invert();
    orbUniforms.uRot.value.setFromMatrix4(m4);

    // Hover: is the cursor over the orb? Project it onto the unit sphere
    // so the ripple starts where the pointer touches the glass.
    const k = cur.radius / 0.516;
    const qx = (mouse.x - ox) / k;
    const qy = (mouse.y - oy) / k;
    const inside = mouse.active && Math.hypot(mouse.x - ox, mouse.y - oy) < cur.radius * 1.05;
    const excite = inside && cur.alpha > 0.5 && !reducedMotion ? Math.min(1, 0.25 + mouse.speed * 1.6) : 0;
    cur.hover = damp(cur.hover, excite, excite > cur.hover ? 6 : 1.5, dt);
    tmp.set(qx, qy, -2).normalize();
    const b = 4 * tmp.z;
    const h = b * b - (16 - 1);
    const t = h > 0 ? -b - Math.sqrt(h) : -b;
    orbUniforms.uMouseWorld.value.set(tmp.x * t, tmp.y * t, 4 + tmp.z * t);

    const u = orbUniforms;
    u.uTime.value = time;
    u.uOrbPos.value.set(ox, oy);
    u.uOrbRadius.value = cur.radius * (1 + cur.pulse * 0.025);
    u.uAlpha.value = cur.alpha;
    u.uMorph.value = cur.morph;
    u.uDim.value = cur.dim;
    u.uPulse.value = cur.pulse;
    u.uHover.value = cur.hover;
    u.uVel.value = vel;
    u.uBeams.value = cur.beams;

    pUniforms.uTime.value = time;
    pUniforms.uScroll.value = (scroll.y || 0) / height;
    pUniforms.uVel.value = vel;

    if (reducedMotion) {
      // Nothing moves on its own: only draw when the scroll-driven state changes.
      const sig = [cur.x, cur.y, cur.radius, cur.alpha, cur.dim, pUniforms.uScroll.value].map((n) => n.toFixed(3)).join();
      if (sig === lastSig) return;
      lastSig = sig;
    }
    renderer.render(scene, camera);
    if (!reducedMotion) adapt(dt, now / 1000);
  }

  return {
    renderer,
    start() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    /** Render once synchronously, so the first frame exists before fade-in. */
    warm() {
      renderer.render(scene, camera);
    },
  };
}
