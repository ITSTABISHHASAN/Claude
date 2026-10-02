import { gsap } from 'gsap';
import { $, $$ } from '../core/env.js';

/**
 * Integration chips orbit a glowing core on two tilted rings. Positions are
 * projected from a 3D circle each frame; depth drives scale, blur and stacking.
 */
export function initOrbit({ reducedMotion }) {
  const root = $('#orbit');
  if (!root) return;
  const items = $$('.orbit__item', root);
  const tilt = 0.42;
  const rings = [[], []];
  items.forEach((it) => rings[+it.dataset.ring].push(it));
  const nodes = [];
  rings.forEach((list, r) => list.forEach((node, i) => nodes.push({
    node,
    chip: node.querySelector('.chip'),
    label: node.querySelector('.orbit__label'),
    ring: r,
    base: (i / list.length) * Math.PI * 2 + r * 0.4,
  })));

  let R = [150, 270];
  const measure = () => {
    const cs = getComputedStyle(root);
    R = [parseFloat(cs.getPropertyValue('--R0')) || 150, parseFloat(cs.getPropertyValue('--R1')) || 270];
  };
  measure();
  window.addEventListener('resize', measure);

  let t = 0;
  const place = () => {
    nodes.forEach(({ node, chip, label, ring, base }) => {
      const dir = ring === 0 ? 1 : -0.6;
      const a = base + t * 0.16 * dir;
      const x = Math.cos(a) * R[ring];
      const z = Math.sin(a);
      const y = z * R[ring] * tilt;
      const depth = (z + 1) / 2; // 0 back, 1 front
      const s = 0.72 + depth * 0.32;
      node.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
      // Depth fades the glass only; labels show on the front half, at full contrast.
      chip.style.opacity = (0.35 + depth * 0.65).toFixed(3);
      chip.style.filter = depth < 0.35 ? `blur(${((0.35 - depth) * 5).toFixed(2)}px)` : 'none';
      label.classList.toggle('is-back', depth < 0.55);
      node.style.zIndex = String(depth > 0.5 ? 60 : 10);
    });
  };
  place();
  if (reducedMotion) return;

  let active = false;
  const tick = (_, dt) => { t += dt / 1000; place(); };
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && !active) { active = true; gsap.ticker.add(tick); }
    else if (!e.isIntersecting && active) { active = false; gsap.ticker.remove(tick); }
  }).observe(root);
}
