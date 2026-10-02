import { gsap } from 'gsap';
import { $, $$ } from '../core/env.js';

/**
 * Monthly / annual switch. The thumb stretches toward its destination before
 * its trailing edge follows, so it reads as one liquid shape; prices roll
 * through the change with a brief blur.
 */
export function initPricing({ reducedMotion }) {
  const sw = $('#billing-switch');
  if (!sw) return;
  const thumb = $('.billing__thumb', sw);
  const optM = $('#bill-monthly');
  const optA = $('#bill-annual');
  const amounts = $$('.tier__amount[data-monthly]');
  const notes = $$('.tier__note[data-note-monthly]');
  let annual = false;

  const set = (next) => {
    annual = next;
    sw.setAttribute('aria-checked', String(annual));
    optM.classList.toggle('is-active', !annual);
    optA.classList.toggle('is-active', annual);

    const lead = annual ? 'right' : 'left';
    const trail = annual ? 'left' : 'right';
    const d = reducedMotion ? 0 : 1;
    gsap.timeline()
      .to(thumb, { [lead]: 4, duration: 0.28 * d, ease: 'power3.in' })
      .to(thumb, { [trail]: 34, duration: 0.45 * d, ease: 'elastic.out(1, 0.6)' });

    amounts.forEach((el) => {
      const to = parseFloat(annual ? el.dataset.annual : el.dataset.monthly);
      const from = parseFloat(el.textContent) || to;
      const st = { v: from };
      if (reducedMotion) { el.textContent = String(to); return; }
      gsap.timeline()
        .to(el, { filter: 'blur(6px)', opacity: 0.4, duration: 0.2, ease: 'power2.in' })
        .to(st, { v: to, duration: 0.5, ease: 'power3.out', onUpdate: () => { el.textContent = String(Math.round(st.v)); } }, 0.05)
        .to(el, { filter: 'blur(0px)', opacity: 1, duration: 0.4, ease: 'power2.out', clearProps: 'filter' }, 0.3);
    });
    notes.forEach((n) => { n.textContent = annual ? n.dataset.noteAnnual : n.dataset.noteMonthly; });
  };

  sw.addEventListener('click', () => set(!annual));
  optM.addEventListener('click', () => set(false));
  optA.addEventListener('click', () => set(true));
}
