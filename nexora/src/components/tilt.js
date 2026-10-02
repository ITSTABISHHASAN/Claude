import { gsap } from 'gsap';
import { $$ } from '../core/env.js';

/** Glass cards lean toward the cursor; a specular highlight tracks it. */
export function initTilt() {
  $$('[data-tilt]').forEach((card) => {
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    gsap.set(card, { transformPerspective: 1200 });
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      ry((nx - 0.5) * 9);
      rx((0.5 - ny) * 9);
      card.style.setProperty('--mx', `${nx * 100}%`);
      card.style.setProperty('--my', `${ny * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      rx(0);
      ry(0);
    });
  });

  // Prompt card: retype the command on hover.
  $$('.ico-prompt__text[data-type]').forEach((el) => {
    const card = el.closest('.card');
    const full = el.dataset.type;
    let timer = 0;
    card?.addEventListener('pointerenter', () => {
      clearInterval(timer);
      let i = 0;
      el.textContent = '';
      timer = setInterval(() => {
        el.textContent = full.slice(0, ++i);
        if (i >= full.length) clearInterval(timer);
      }, 38);
    });
  });
}
