import { gsap } from 'gsap';
import { $, $$ } from '../core/env.js';

/**
 * Draggable testimonial carousel. Inactive cards recede: smaller, dimmer and
 * blurred by their distance from centre. Works with drag, buttons, dots and
 * the arrow keys.
 */
export function initCarousel({ reducedMotion }) {
  const root = $('#carousel');
  if (!root) return;
  const track = $('.carousel__track', root);
  const cards = $$('.quote', track);
  const dotsWrap = $('.carousel__dots');
  const status = $('#carousel-status');
  const prev = $('[data-carousel-prev]');
  const next = $('[data-carousel-next]');

  let index = 0;
  let x = 0;
  let stepW = 0;
  const setX = gsap.quickSetter(track, 'x', 'px');

  const dots = cards.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    b.addEventListener('click', () => go(i));
    dotsWrap?.appendChild(b);
    return b;
  });

  const measure = () => {
    // offsetLeft ignores the scale transforms applied to receding cards.
    stepW = cards[1] ? cards[1].offsetLeft - cards[0].offsetLeft : cards[0].offsetWidth;
  };

  const paint = () => {
    setX(x);
    const pos = -x / stepW;
    cards.forEach((card, i) => {
      const d = Math.min(Math.abs(i - pos), 2);
      card.style.transform = `scale(${(1 - d * 0.07).toFixed(4)})`;
      card.style.opacity = (1 - d * 0.38).toFixed(3);
      const inner = card.firstElementChild;
      inner.style.filter = d > 0.05 ? `blur(${(d * 3).toFixed(2)}px)` : 'none';
    });
  };

  function go(i, { instant = false } = {}) {
    index = Math.max(0, Math.min(cards.length - 1, i));
    const target = -index * stepW;
    gsap.killTweensOf(state);
    state.x = x;
    if (instant || reducedMotion) {
      x = target;
      paint();
    } else {
      gsap.to(state, {
        x: target,
        duration: 0.9,
        ease: 'expo.out',
        onUpdate: () => { x = state.x; paint(); },
      });
    }
    cards.forEach((c, n) => c.setAttribute('aria-hidden', String(n !== index)));
    dots.forEach((d, n) => d.setAttribute('aria-selected', String(n === index)));
    if (status) status.textContent = `Testimonial ${index + 1} of ${cards.length}`;
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === cards.length - 1;
  }
  const state = { x: 0 };

  // Drag.
  let dragging = false;
  let startX = 0;
  let startOffset = 0;
  let lastX = 0;
  let lastT = 0;
  let v = 0;
  root.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    startX = lastX = e.clientX;
    lastT = performance.now();
    startOffset = x;
    v = 0;
    gsap.killTweensOf(state);
    root.setPointerCapture(e.pointerId);
    root.classList.add('is-dragging');
  });
  root.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const now = performance.now();
    v = (e.clientX - lastX) / Math.max(1, now - lastT);
    lastX = e.clientX;
    lastT = now;
    let nx = startOffset + (e.clientX - startX);
    const min = -(cards.length - 1) * stepW;
    if (nx > 0) nx *= 0.35;
    if (nx < min) nx = min + (nx - min) * 0.35;
    x = nx;
    paint();
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    root.classList.remove('is-dragging');
    const projected = x + v * 220;
    go(Math.round(-projected / stepW));
  };
  root.addEventListener('pointerup', end);
  root.addEventListener('pointercancel', end);
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
  });
  prev?.addEventListener('click', () => go(index - 1));
  next?.addEventListener('click', () => go(index + 1));

  measure();
  go(0, { instant: true });
  window.addEventListener('resize', () => { measure(); go(index, { instant: true }); });
}
