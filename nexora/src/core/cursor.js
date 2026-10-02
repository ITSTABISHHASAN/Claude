import { gsap } from 'gsap';
import { $, $$ } from './env.js';

/**
 * Glowing dot with a trailing halo. Buttons marked [data-magnetic] pull
 * toward the pointer and the halo locks onto them.
 */
export function initCursor() {
  const root = $('.cursor');
  if (!root) return;
  document.documentElement.classList.add('has-cursor');
  const dot = $('.cursor__dot', root);
  const halo = $('.cursor__halo', root);

  const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
  const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
  const haloX = gsap.quickTo(halo, 'x', { duration: 0.55, ease: 'power3.out' });
  const haloY = gsap.quickTo(halo, 'y', { duration: 0.55, ease: 'power3.out' });

  let stuck = null;
  root.classList.add('is-hidden');

  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    root.classList.remove('is-hidden');
    dotX(e.clientX);
    dotY(e.clientY);
    if (stuck) {
      const r = stuck.getBoundingClientRect();
      haloX(r.left + r.width / 2 + (e.clientX - (r.left + r.width / 2)) * 0.15);
      haloY(r.top + r.height / 2 + (e.clientY - (r.top + r.height / 2)) * 0.15);
    } else {
      haloX(e.clientX);
      haloY(e.clientY);
    }
  }, { passive: true });
  document.addEventListener('pointerleave', () => root.classList.add('is-hidden'));

  const interactive = 'a, button, [data-tilt], input, [role="switch"], .carousel';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest?.(interactive)) root.classList.add('is-hover');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest?.(interactive) && !e.relatedTarget?.closest?.(interactive)) root.classList.remove('is-hover');
  });

  // Magnetic pull.
  $$('[data-magnetic]').forEach((el) => {
    const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      x(mx * 0.28);
      y(my * 0.38);
      el.style.setProperty('--bx', `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty('--by', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    el.addEventListener('pointerenter', () => { stuck = el; });
    el.addEventListener('pointerleave', () => {
      stuck = null;
      x(0);
      y(0);
    });
  });
}
