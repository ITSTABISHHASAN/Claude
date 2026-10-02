import { gsap } from 'gsap';
import { $, $$ } from './env.js';
import { scrollToTarget } from './scroll.js';

const KEY = 'nx:transition';

/**
 * Frosted-glass panel that sweeps across the screen with a blue edge glow.
 * Same-page anchors: sweep in, jump, sweep out. Same-site pages: sweep in,
 * navigate, and the next page sweeps the panel out on arrival.
 */
export function initTransitions({ reducedMotion, closeMenu }) {
  const panel = $('#transition');
  if (!panel) return { arrive: () => {} };
  if (!document.documentElement.classList.contains('is-arriving')) gsap.set(panel, { xPercent: -102 });

  const cover = () =>
    gsap.fromTo(panel, { xPercent: -102, autoAlpha: 1 }, { xPercent: 0, duration: 0.75, ease: 'expo.inOut' });
  const reveal = () =>
    gsap.to(panel, { xPercent: 102, duration: 0.85, ease: 'expo.inOut', onComplete: () => gsap.set(panel, { autoAlpha: 0 }) });

  let busy = false;

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;

    const samePage = url.pathname === location.pathname;
    if (samePage && url.hash) {
      const target = $(url.hash === '#top' ? '#top' : url.hash);
      if (!target) return;
      e.preventDefault();
      closeMenu?.();
      if (reducedMotion || busy) {
        scrollToTarget(target, { immediate: reducedMotion });
        return;
      }
      // Short hops glide; long jumps get the glass sweep.
      const distance = Math.abs(target.getBoundingClientRect().top);
      if (distance < window.innerHeight * 1.5) {
        scrollToTarget(target);
        return;
      }
      busy = true;
      cover().then(() => {
        scrollToTarget(target, { immediate: true });
        history.replaceState(null, '', url.hash === '#top' ? location.pathname : url.hash);
        requestAnimationFrame(() => reveal().then(() => { busy = false; }));
      });
      focusTarget(target);
      return;
    }

    if (!samePage && !reducedMotion) {
      e.preventDefault();
      try { sessionStorage.setItem(KEY, '1'); } catch {}
      cover().then(() => { location.href = url.href; });
    }
  });

  // Back/forward cache: never leave the panel covering the page.
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) gsap.set(panel, { autoAlpha: 0, xPercent: 102 });
  });

  return {
    /** Called on load: sweep the panel away if we arrived via a transition. */
    arrive() {
      const arriving = document.documentElement.classList.contains('is-arriving');
      try { sessionStorage.removeItem(KEY); } catch {}
      if (!arriving) return false;
      gsap.set(panel, { xPercent: 0, autoAlpha: 1 });
      document.documentElement.classList.remove('is-arriving');
      reveal();
      return true;
    },
  };
}

function focusTarget(target) {
  const heading = target.querySelector('h1, h2');
  const el = heading || target;
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  setTimeout(() => el.focus({ preventScroll: true }), 800);
}

export function initNavState() {
  const links = $$('.nav__links a[data-nav]');
  const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const a = map.get(en.target.id);
      if (!a) return;
      if (en.isIntersecting) {
        links.forEach((l) => l.removeAttribute('aria-current'));
        a.setAttribute('aria-current', 'true');
      } else if (a.getAttribute('aria-current')) {
        a.removeAttribute('aria-current');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}
