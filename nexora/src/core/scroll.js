import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Live scroll readings shared with the WebGL stage. */
export const scroll = { y: 0, velocity: 0, lenis: null };

export function initScroll({ reducedMotion }) {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  if (reducedMotion) {
    const read = () => { scroll.y = window.scrollY; };
    window.addEventListener('scroll', read, { passive: true });
    read();
    return null;
  }

  const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.2 });
  lenis.on('scroll', (l) => {
    scroll.y = l.scroll;
    scroll.velocity = l.velocity;
    ScrollTrigger.update();
  });
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
    scroll.velocity *= 0.92;
  });
  gsap.ticker.lagSmoothing(0);
  scroll.lenis = lenis;
  return lenis;
}

export function scrollToTarget(target, { immediate = false } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (scroll.lenis) {
    scroll.lenis.scrollTo(el, { immediate, offset: 0, force: true });
  } else {
    el.scrollIntoView({ behavior: immediate ? 'auto' : 'smooth' });
  }
}

export function lockScroll(locked) {
  if (scroll.lenis) locked ? scroll.lenis.stop() : scroll.lenis.start();
  document.documentElement.classList.toggle('is-locked', locked);
}
