import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$ } from '../core/env.js';

/** A light pulse travels the connecting line; steps light up as it passes. */
export function initTimeline({ reducedMotion }) {
  const root = $('#timeline');
  if (!root) return;
  const steps = $$('.step', root);
  if (reducedMotion) {
    root.style.setProperty('--p', '1');
    steps.forEach((s) => s.classList.add('is-active'));
    return;
  }
  ScrollTrigger.create({
    trigger: root,
    start: 'top 75%',
    end: 'bottom 55%',
    scrub: 0.6,
    onUpdate: (s) => {
      const p = s.progress;
      root.style.setProperty('--p', p.toFixed(4));
      steps.forEach((step, i) => step.classList.toggle('is-active', p >= (i / steps.length) * 1.0 + 0.02 || p >= 0.999));
    },
  });
}
