import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, isMobileLayout } from './env.js';
import { orb } from './orb-state.js';

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Scroll story for the orb.
 *   hero      blob, centred above the headline
 *   shift     pinned: torus → crystal → cube grid beside three statements
 *   middle    fades out so content sections stay calm
 *   final CTA returns as a full-scale blob behind the closing line
 *
 * Every frame the orb target is derived from ScrollTrigger progress values,
 * so scrubbing in either direction is deterministic.
 */
export function initChoreography({ reducedMotion }) {
  const shift = $('#shift');
  const cta = $('#cta');
  const footer = $('.footer');
  const items = $$('.shift__item', shift);
  const bars = $$('.shift__bars i', shift);
  const indexEl = $('#shift-index');

  const prog = { approach: 0, pin: 0, exit: 0, cta: 0, footer: 0 };

  // Hero → shift: orb drifts into its side position and becomes a torus.
  ScrollTrigger.create({
    trigger: shift,
    start: 'top bottom',
    end: 'top top',
    onUpdate: (s) => { prog.approach = s.progress; },
  });

  if (!reducedMotion) {
    // Pin the shift section while three statements play out.
    gsap.set(items, { autoAlpha: 0 });
    gsap.set(items[0], { autoAlpha: 1 });
    const parts = items.map((it) => it.querySelectorAll('.shift__kicker, .shift__statement, .shift__answer'));

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    items.forEach((it, i) => {
      if (i > 0) {
        tl.to(items[i - 1], { autoAlpha: 0, filter: 'blur(10px)', y: -30, duration: 0.5, ease: 'power2.in' }, `s${i}`)
          .set(it, { autoAlpha: 1 }, `s${i}+=0.45`)
          .fromTo(parts[i], { opacity: 0, filter: 'blur(12px)', y: 30 }, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.8, stagger: 0.12 }, `s${i}+=0.45`);
      }
      tl.to({}, { duration: 1 });
      tl.addLabel(`s${i + 1}`);
    });

    ScrollTrigger.create({
      trigger: shift,
      start: 'top top',
      end: () => `+=${window.innerHeight * 3}`,
      pin: true,
      scrub: 0.6,
      animation: tl,
      invalidateOnRefresh: true,
      onUpdate: (s) => {
        prog.pin = s.progress;
        const seg = s.progress * 3;
        bars.forEach((b, i) => b.style.setProperty('--p', clamp01(seg - i).toFixed(3)));
        const idx = seg > 1.95 ? 2 : seg > 0.7 ? 1 : 0;
        if (indexEl) indexEl.textContent = `0${idx + 1}`;
      },
    });

    // Leaving the shift: fade out and drift up.
    ScrollTrigger.create({
      trigger: '#product',
      start: 'top bottom',
      end: 'top 30%',
      onUpdate: (s) => { prog.exit = s.progress; },
    });
  }

  // Final CTA: the orb comes back.
  ScrollTrigger.create({
    trigger: cta,
    start: 'top bottom',
    end: 'center center',
    onUpdate: (s) => { prog.cta = s.progress; },
  });
  ScrollTrigger.create({
    trigger: footer,
    start: 'top bottom',
    end: 'bottom bottom',
    onUpdate: (s) => { prog.footer = s.progress; },
  });

  const update = () => {
    const mobile = isMobileLayout();
    const sideX = mobile ? 0 : Math.min(0.42, (window.innerWidth / window.innerHeight) * 0.24);
    const heroR = mobile ? 0.21 : 0.27;
    const sideR = mobile ? 0.2 : 0.25;

    const a = ease(clamp01(prog.approach));
    let x = lerp(0, sideX, a);
    let y = lerp(mobile ? 0.14 : 0.06, 0, a);
    let radius = lerp(heroR, sideR, a);
    let alpha = 1;
    let dim = lerp(0, mobile ? 0.45 : 0, a);
    let beams = 1;

    let morph = 0;
    if (!reducedMotion) {
      morph = clamp01((prog.approach - 0.35) / 0.65);
      // Crystal once statement two lands, cubes on three.
      const p = prog.pin * 3;
      morph += ease(clamp01((p - 0.55) / 0.5)) + ease(clamp01((p - 1.75) / 0.5));
    }

    const e = ease(clamp01(prog.exit));
    alpha *= 1 - e;
    y += e * 0.25;
    radius *= 1 - e * 0.25;
    beams = lerp(1, 0.55, e);
    if (reducedMotion) alpha = 1 - a;
    if (alpha < 0.02) morph = 0; // reset while invisible

    const c = ease(clamp01(prog.cta));
    if (c > 0) {
      x = lerp(x, 0, c);
      y = lerp(y, 0.02, c);
      radius = lerp(radius, mobile ? 0.26 : 0.36, c);
      alpha = Math.max(alpha, c);
      dim = lerp(dim, 0.32, c);
      morph = lerp(morph, 0, c);
      beams = lerp(beams, 1, c);
    }

    const f = ease(clamp01(prog.footer));
    if (f > 0) {
      y += f * 0.35;
      alpha *= 1 - f * 0.7;
    }

    orb.x = x;
    orb.y = y;
    orb.radius = radius;
    orb.dim = dim;
    orb.beams = beams;
    orb.morph = morph;
    if (orb.introDone) orb.alpha = alpha;
    if (import.meta.env.DEV && window.__orbOverride) Object.assign(orb, window.__orbOverride);
  };

  gsap.ticker.add(update);
}
