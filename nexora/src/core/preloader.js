import { gsap } from 'gsap';
import { $ } from './env.js';

/**
 * Silver ring draws itself while a mono counter runs 000 → 100, tracking
 * real loading tasks (fonts, WebGL module). Then the mark gains its "N",
 * flies into the nav logo, and the page is revealed.
 *
 * Resolves when the page is uncovered so the hero intro can start.
 */
export function runPreloader({ tasks = [], minDuration = 1.3, maxWait = 4.5 } = {}) {
  const el = $('#preloader');
  if (!el || getComputedStyle(el).display === 'none') {
    el?.remove();
    return Promise.resolve();
  }

  const ring = $('.preloader__ring', el);
  const n = $('.preloader__n', el);
  const mark = $('.preloader__mark', el);
  const count = $('#preloader-count');
  const label = $('.preloader__label', el);
  const navMark = $('.nav .logo__mark');

  let settled = 0;
  tasks.forEach((t) => Promise.resolve(t).catch(() => {}).finally(() => { settled++; }));

  const start = performance.now();
  let lastTick = start;
  const state = { p: 0 };

  return new Promise((resolve) => {
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      // Slow devices never wait more than maxWait; the page works without GL.
      const real = tasks.length && elapsed < maxWait ? settled / tasks.length : 1;
      // Never run ahead of real progress, never finish before minDuration.
      const goal = Math.min(real * 0.98 + (real === 1 ? 0.02 : 0), elapsed / minDuration);
      const now = performance.now();
      const dt = Math.min((now - lastTick) / 1000, 0.25);
      lastTick = now;
      // Time-based easing, so a slow frame rate cannot stall the counter.
      state.p += (goal - state.p) * (1 - Math.exp(-dt * 7));
      if (goal >= 1 && state.p > 0.995) state.p = 1;
      ring.style.strokeDashoffset = String(1 - state.p);
      count.textContent = String(Math.round(state.p * 100)).padStart(3, '0');
      if (state.p >= 1) {
        gsap.ticker.remove(tick);
        exit();
      }
    };
    gsap.ticker.add(tick);

    function exit() {
      const tl = gsap.timeline({ onComplete: () => el.remove() });
      tl.to(n, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' })
        .to([count, label], { opacity: 0, y: 8, duration: 0.4, ease: 'power2.in' }, '<0.2');

      if (navMark) {
        const from = mark.getBoundingClientRect();
        const to = navMark.getBoundingClientRect();
        const scale = to.width / from.width;
        tl.to(mark, {
          x: to.left + to.width / 2 - (from.left + from.width / 2),
          y: to.top + to.height / 2 - (from.top + from.height / 2),
          scale,
          duration: 1.1,
          ease: 'expo.inOut',
        }, '+=0.05');
      }
      tl.to(el, { backgroundColor: 'rgba(5,6,10,0)', duration: 0.9, ease: 'power2.inOut' }, '<0.25')
        .add(() => resolve(), '<0.1')
        .add(() => document.documentElement.classList.remove('is-loading'), '>-0.15')
        .to(mark, { opacity: 0, duration: 0.3 }, '>-0.05');
    }
  });
}
