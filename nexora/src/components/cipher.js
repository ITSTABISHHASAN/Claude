import { $ } from '../core/env.js';

const PLAIN = 'invoice_total: 48,209.00 USD';
const GLYPHS = '0123456789abcdef';

/** A record scrambles into ciphertext and back, on a slow loop while visible. */
export function initCipher({ reducedMotion }) {
  const line = $('#cipher-line');
  const state = $('#cipher-state');
  if (!line) return;
  const cipher = Array.from(PLAIN, (ch) => (ch === ' ' ? ' ' : GLYPHS[(Math.random() * 16) | 0])).join('');
  const render = (mask) => {
    line.innerHTML = '';
    Array.from(PLAIN).forEach((ch, i) => {
      if (mask[i]) {
        const s = document.createElement('span');
        s.className = 'c';
        s.textContent = mask[i] === 2 ? cipher[i] : GLYPHS[(Math.random() * 16) | 0];
        line.appendChild(s);
      } else {
        line.appendChild(document.createTextNode(ch));
      }
    });
  };

  if (reducedMotion) {
    render(Array.from(PLAIN, () => 2));
    return;
  }

  let encrypted = false;
  let raf = 0;
  let visible = false;
  let timer = 0;

  const run = () => {
    encrypted = !encrypted;
    if (state) state.textContent = encrypted ? 'Encrypted' : 'Decrypted';
    const start = performance.now();
    const order = Array.from(PLAIN, (_, i) => i).sort(() => Math.random() - 0.5);
    const frame = (now) => {
      const p = Math.min(1, (now - start) / 1100);
      const mask = Array(PLAIN.length).fill(encrypted ? 0 : 2);
      const n = Math.floor(p * PLAIN.length);
      order.forEach((idx, k) => {
        if (PLAIN[idx] === ' ') { mask[idx] = 0; return; }
        if (encrypted) mask[idx] = k < n ? 2 : k < n + 4 ? 1 : 0;
        else mask[idx] = k < n ? 0 : k < n + 4 ? 1 : 2;
      });
      render(mask);
      if (p < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
  };

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    clearInterval(timer);
    if (visible) {
      if (!encrypted) run();
      timer = setInterval(run, 3800);
    } else {
      cancelAnimationFrame(raf);
    }
  }).observe(line);
}
