import { $ } from '../core/env.js';

export function initNav() {
  const nav = $('#nav');
  const toggle = $('#nav-toggle');
  const links = $('#nav-links');
  if (!nav) return { close() {} };

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle?.setAttribute('aria-expanded', String(open));
    toggle?.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle?.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle?.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false);
  });
  links?.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });

  let scrolled = false;
  const onScroll = () => {
    const s = window.scrollY > 40;
    if (s !== scrolled) {
      scrolled = s;
      nav.classList.toggle('is-scrolled', s);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  return { close: () => setOpen(false) };
}
