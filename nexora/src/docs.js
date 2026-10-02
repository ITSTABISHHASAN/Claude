import '@fontsource-variable/sora';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import 'lenis/dist/lenis.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';
import './styles/docs.css';

import { $, reducedMotion, finePointer, lite, supportsWebGL } from './core/env.js';
import { orb } from './core/orb-state.js';
import { initScroll, scroll } from './core/scroll.js';
import { initCursor } from './core/cursor.js';
import { initTransitions } from './core/transition.js';
import { initReveals, revealHeading, prepareHeading } from './core/reveal.js';
import { initNav } from './components/nav.js';
import { initTilt } from './components/tilt.js';

// Docs keep the light field but not the orb: a small, dim one sits top-right.
Object.assign(orb, { x: 0.62, y: 0.28, radius: 0.16, dim: 0.35, beams: 0.8, alpha: 0, introDone: true });

const canvas = $('#stage');
if (supportsWebGL()) {
  import('./gl/stage.js').then(({ createStage }) => {
    const stage = createStage({ canvas, orb, scroll, lite, reducedMotion });
    stage.start();
    canvas.classList.add('is-ready');
    orb.alpha = window.innerWidth > 900 ? 0.9 : 0;
  });
}

initScroll({ reducedMotion });
const nav = initNav();
const t = initTransitions({ reducedMotion, closeMenu: nav.close });
t.arrive();
if (finePointer && !reducedMotion) initCursor();
initTilt();
initReveals({ reducedMotion });
const title = $('#docs-title');
if (!reducedMotion && title) {
  prepareHeading(title);
  revealHeading(title, { delay: 0.2 });
}

// Copy the install command.
const copy = $('#copy-install');
copy?.addEventListener('click', async () => {
  const text = $('#install-cmd').textContent.trim();
  try {
    await navigator.clipboard.writeText(text);
    copy.textContent = 'Copied';
  } catch {
    const range = document.createRange();
    range.selectNodeContents($('#install-cmd'));
    getSelection().removeAllRanges();
    getSelection().addRange(range);
    copy.textContent = 'Selected';
  }
  setTimeout(() => { copy.textContent = 'Copy'; }, 1800);
});
