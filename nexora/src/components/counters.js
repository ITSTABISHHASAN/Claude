import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $$ } from '../core/env.js';

/** Metric numbers count up once when they enter the viewport. */
export function initCounters({ reducedMotion }) {
  if (reducedMotion) return;
  $$('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const state = { v: 0 };
    const paint = () => { el.textContent = state.v.toFixed(decimals); };
    paint();
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => gsap.to(state, { v: target, duration: 2.4, ease: 'expo.out', onUpdate: paint }),
    });
  });
}
