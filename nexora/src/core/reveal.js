import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $$ } from './env.js';

/**
 * Split a heading into letters (words kept intact for wrapping).
 * Shimmer words stay whole so their silver gradient clips correctly.
 * Screen readers get the original text through aria-label.
 */
export function splitHeading(el) {
  if (el.dataset.splitDone) return el._units;
  const label = el.textContent.replace(/\s+/g, ' ').trim();
  el.setAttribute('aria-label', label);
  const units = [];
  const frag = document.createDocumentFragment();

  const pushWords = (text, parent) => {
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        parent.appendChild(document.createTextNode(' '));
        return;
      }
      const word = document.createElement('span');
      word.className = 'split-word';
      word.setAttribute('aria-hidden', 'true');
      for (const ch of part) {
        const c = document.createElement('span');
        c.className = 'split-char';
        c.textContent = ch;
        word.appendChild(c);
        units.push(c);
      }
      parent.appendChild(word);
    });
  };

  Array.from(el.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      pushWords(node.textContent, frag);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const clone = node.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      if (clone.classList.contains('shimmer')) {
        units.push(clone);
        frag.appendChild(clone);
      } else {
        const text = clone.textContent;
        clone.textContent = '';
        pushWords(text, clone);
        frag.appendChild(clone);
      }
    }
  });

  el.textContent = '';
  el.appendChild(frag);
  el.dataset.splitDone = '1';
  el._units = units;
  return units;
}

const FROM = { opacity: 0, filter: 'blur(12px)', yPercent: 35 };
const TO = { opacity: 1, filter: 'blur(0px)', yPercent: 0 };

/** Blur-to-sharp letter stagger, then a single silver sweep on key words. */
export function revealHeading(el, { delay = 0 } = {}) {
  const units = el._units || splitHeading(el);
  const shimmers = el.querySelectorAll('.shimmer');
  const tl = gsap.timeline({ delay });
  tl.fromTo(units, FROM, {
    ...TO,
    duration: 1.2,
    ease: 'expo.out',
    stagger: { each: 0.022 },
    clearProps: 'filter',
  });
  if (shimmers.length) {
    tl.fromTo(shimmers, { backgroundPosition: '100% 0' }, { backgroundPosition: '0% 0', duration: 1.6, ease: 'power2.inOut' }, '-=0.6');
  }
  return tl;
}

export function prepareHeading(el) {
  const units = splitHeading(el);
  gsap.set(units, FROM);
}

export function initReveals({ reducedMotion }) {
  const headings = $$('[data-split]:not([data-split="manual"])');
  const blocks = $$('[data-reveal]');

  if (reducedMotion) return;

  headings.forEach((el) => {
    prepareHeading(el);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => revealHeading(el),
    });
  });

  gsap.set(blocks, { opacity: 0, y: 28, filter: 'blur(6px)' });
  ScrollTrigger.batch(blocks, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.1,
        ease: 'expo.out',
        stagger: 0.08,
        clearProps: 'filter,transform',
      }),
  });
}
