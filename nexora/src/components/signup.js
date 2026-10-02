import { gsap } from 'gsap';
import { $ } from '../core/env.js';
import { orb } from '../core/orb-state.js';

/** Early-access form: validates locally and confirms inline. */
export function initSignup() {
  const form = $('#signup');
  const input = $('#signup-email');
  const status = $('#signup-status');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value || !input.checkValidity()) {
      status.textContent = 'Enter a work email like you@company.com.';
      status.className = 'signup__status mono is-error';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    input.removeAttribute('aria-invalid');
    status.textContent = `You're on the list. We'll write to ${value} when your workspace is ready.`;
    status.className = 'signup__status mono is-ok';
    form.reset();
    gsap.fromTo(orb, { pulse: 1 }, { pulse: 0, duration: 2.4, ease: 'power2.out' });
  });
}

/** CTAs make the orb pulse while hovered or focused. */
export function initOrbPulse() {
  document.querySelectorAll('[data-orb-pulse]').forEach((el) => {
    const on = () => gsap.to(orb, { pulse: 1, duration: 0.6, ease: 'power2.out' });
    const off = () => gsap.to(orb, { pulse: 0, duration: 0.9, ease: 'power2.out' });
    el.addEventListener('pointerenter', on);
    el.addEventListener('pointerleave', off);
    el.addEventListener('focus', on);
    el.addEventListener('blur', off);
  });
}
