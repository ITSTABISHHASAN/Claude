import '@fontsource-variable/sora';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import 'lenis/dist/lenis.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, reducedMotion, finePointer, lite, supportsWebGL } from './core/env.js';
import { orb } from './core/orb-state.js';
import { initScroll, lockScroll, scroll, scrollToTarget } from './core/scroll.js';
import { runPreloader } from './core/preloader.js';
import { initCursor } from './core/cursor.js';
import { initTransitions, initNavState } from './core/transition.js';
import { initReveals, prepareHeading, revealHeading } from './core/reveal.js';
import { initChoreography } from './core/choreography.js';
import { initNav } from './components/nav.js';
import { initTilt } from './components/tilt.js';
import { initMarquee } from './components/marquee.js';
import { initDashboard } from './components/dashboard.js';
import { initTimeline } from './components/timeline.js';
import { initCounters } from './components/counters.js';
import { initOrbit } from './components/orbit.js';
import { initCarousel } from './components/carousel.js';
import { initPricing } from './components/pricing.js';
import { initCipher } from './components/cipher.js';
import { initSignup, initOrbPulse } from './components/signup.js';

const root = document.documentElement;
const opts = { reducedMotion };

// ── WebGL stage (lazy: three.js loads in its own chunk) ─────────────────
const canvas = $('#stage');
const glReady = supportsWebGL()
  ? import('./gl/stage.js')
      .then(({ createStage }) => {
        const stage = createStage({ canvas, orb, scroll, lite, reducedMotion });
        stage.warm();
        stage.start();
        return stage;
      })
      .catch((err) => {
        console.warn('[stage] WebGL unavailable, using CSS fallback.', err);
        root.classList.add('no-webgl');
        return null;
      })
  : Promise.resolve(root.classList.add('no-webgl'));

// ── Page systems ────────────────────────────────────────────────────────
window.scrollTo(0, 0);
const lenis = initScroll(opts);
const nav = initNav();
const transitions = initTransitions({ reducedMotion, closeMenu: nav.close });
initNavState();
if (finePointer && !reducedMotion) initCursor();

initMarquee();
initReveals(opts);
initChoreography(opts);
initTilt();
initDashboard(opts);
initTimeline(opts);
initCounters(opts);
initOrbit(opts);
initCarousel(opts);
initPricing(opts);
initCipher(opts);
initSignup();
initOrbPulse();

// Live "agents online" ticker in the hero.
const agents = $('#agents-online');
if (agents && !reducedMotion) {
  let n = 2481;
  setInterval(() => {
    n += Math.round((Math.random() - 0.4) * 6);
    agents.textContent = n.toLocaleString('en-US');
  }, 2200);
}

// ── Intro ───────────────────────────────────────────────────────────────
const heroTitle = $('#hero-title');
const heroItems = $$('[data-hero-item]');

function intro() {
  orb.introDone = true;
  canvas.classList.add('is-ready');
  ScrollTrigger.refresh();
  // Deep links (e.g. docs.html → index.html#pricing) land on their section.
  const target = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
  if (target) requestAnimationFrame(() => scrollToTarget(target, { immediate: true }));
  if (reducedMotion) {
    orb.alpha = 1;
    return;
  }
  gsap.fromTo(orb, { alpha: 0, radius: orb.radius * 0.7 }, { alpha: 1, radius: orb.radius, duration: 2.2, ease: 'expo.out' });
  revealHeading(heroTitle, { delay: 0.25 });
  gsap.to(heroItems, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.55, clearProps: 'filter,transform' });
  gsap.fromTo('.nav__pill', { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, ease: 'expo.out', delay: 0.1, clearProps: 'transform' });
}

if (!reducedMotion) {
  prepareHeading(heroTitle);
  gsap.set(heroItems, { opacity: 0, y: 24, filter: 'blur(8px)' });
}

const arrived = transitions.arrive();
const showPreloader = !reducedMotion && !arrived;

if (showPreloader) {
  root.classList.add('is-loading');
  lockScroll(true);
  runPreloader({
    tasks: [document.fonts?.ready, glReady, new Promise((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })))],
  }).then(() => {
    lockScroll(false);
    intro();
  });
} else {
  Promise.race([glReady, new Promise((r) => setTimeout(r, 600))]).then(intro);
}

document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => ScrollTrigger.refresh());

if (import.meta.env.DEV) window.__nexora = { orb, scroll, lenis, gsap, ScrollTrigger };
