import { $$ } from '../core/env.js';

/** Duplicate marquee content once so the CSS loop is seamless. */
export function initMarquee() {
  $$('[data-marquee] .marquee__track').forEach((track) => {
    Array.from(track.children).forEach((li) => {
      const clone = li.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  });
}
