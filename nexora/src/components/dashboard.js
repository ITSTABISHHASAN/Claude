import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { $, $$, isMobileLayout } from '../core/env.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const W = 600;
const H = 200;
const N = 48;
const Y_MAX = 1400;

const FEED = [
  ['INV-2231 reconciled', 'ledger', '0.4s'],
  ['Refund approved · #88410', 'support', '1.1s'],
  ['PO-7712 matched to receipt', 'procure', '0.7s'],
  ['Churn risk flagged · Orinth', 'revenue', '2.3s'],
  ['Payroll export verified', 'people', '0.9s'],
  ['Ticket #55102 resolved', 'support', '1.6s'],
  ['Forecast updated · Q4', 'finance', '3.2s'],
  ['Vendor W-9 collected', 'procure', '0.5s'],
];

const fmt = (v, decimals = 0) =>
  v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

function el(name, attrs = {}) {
  const n = document.createElementNS(SVG_NS, name);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
}

/** Throughput: a 24h line with area, faint grid, emphasised endpoint and a hover crosshair. */
function lineChart(root, { live }) {
  const svg = root.querySelector('svg');
  const tip = root.querySelector('.chart__tip');

  const defs = el('defs');
  const grad = el('linearGradient', { id: 'area-grad', x1: '0', y1: '0', x2: '0', y2: '1' });
  grad.append(el('stop', { offset: '0', 'stop-color': '#2D7BFF', 'stop-opacity': '0.32' }), el('stop', { offset: '1', 'stop-color': '#2D7BFF', 'stop-opacity': '0' }));
  const clip = el('clipPath', { id: 'chart-clip' });
  const clipRect = el('rect', { x: '0', y: '-20', width: '0', height: String(H + 40) });
  clip.append(clipRect);
  defs.append(grad, clip);

  const gridG = el('g', { class: 'chart__grid' });
  [0.25, 0.5, 0.75, 1].forEach((f) => gridG.append(el('line', { x1: '0', x2: String(W), y1: String(H * f), y2: String(H * f) })));
  const plot = el('g', { 'clip-path': 'url(#chart-clip)' });
  const area = el('path', { class: 'chart__area' });
  const line = el('path', { class: 'chart__line' });
  plot.append(area, line);
  const cross = el('line', { class: 'chart__cross', y1: '0', y2: String(H), opacity: '0' });
  svg.append(defs, gridG, plot, cross);

  const end = document.createElement('span');
  end.className = 'chart__dot';
  const hoverDot = document.createElement('span');
  hoverDot.className = 'chart__dot chart__dot--hover';
  hoverDot.hidden = true;
  root.append(end, hoverDot);

  // A day of throughput with a working-hours swell.
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const data = Array.from({ length: N + 1 }, (_, i) => {
    const hour = i / 2;
    const day = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 0.5 + 0.5;
    return 380 + day * 640 + (rand() - 0.5) * 140;
  });
  let clockMinutes = 14 * 60;
  let phase = 0;

  const step = W / (N - 1);
  const yOf = (v) => H - (v / Y_MAX) * H;

  function pathFor(offset) {
    let d = '';
    for (let i = 0; i < data.length; i++) {
      const x = i * step - offset;
      const y = yOf(data[i]);
      if (i === 0) d += `M${x.toFixed(1)},${y.toFixed(1)}`;
      else {
        const px = (i - 1) * step - offset;
        const cx = (px + x) / 2;
        d += ` C${cx.toFixed(1)},${yOf(data[i - 1]).toFixed(1)} ${cx.toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`;
      }
    }
    return d;
  }

  function render() {
    const offset = phase * step;
    const d = pathFor(offset);
    line.setAttribute('d', d);
    area.setAttribute('d', `${d} L${W + step},${H} L${-step},${H} Z`);
    // Endpoint sits on the last visible sample.
    const lastIdx = N - 1;
    const v = data[lastIdx] + (data[lastIdx + 1] - data[lastIdx]) * phase;
    end.style.left = '100%';
    end.style.top = `${(yOf(v) / H) * 100}%`;
  }
  render();

  // Hover: crosshair and value.
  root.addEventListener('pointermove', (e) => {
    const r = root.getBoundingClientRect();
    const fx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const i = Math.round((fx * W + phase * step) / step);
    const idx = Math.min(data.length - 1, Math.max(0, i));
    const x = idx * step - phase * step;
    const v = data[idx];
    cross.setAttribute('x1', x);
    cross.setAttribute('x2', x);
    cross.setAttribute('opacity', '1');
    hoverDot.hidden = false;
    hoverDot.style.left = `${(x / W) * 100}%`;
    hoverDot.style.top = `${(yOf(v) / H) * 100}%`;
    const mins = clockMinutes - (N - 1 - idx) * 30;
    const hh = String(Math.floor((((mins / 60) % 24) + 24) % 24)).padStart(2, '0');
    const mm = String(((mins % 60) + 60) % 60).padStart(2, '0');
    tip.hidden = false;
    tip.textContent = `${hh}:${mm} · ${fmt(Math.round(v))} runs/min`;
    tip.style.left = `${Math.min(88, Math.max(12, (x / W) * 100))}%`;
    tip.style.top = `${(yOf(v) / H) * 100}%`;
  });
  root.addEventListener('pointerleave', () => {
    cross.setAttribute('opacity', '0');
    hoverDot.hidden = true;
    tip.hidden = true;
  });

  let running = false;
  let last = 0;
  const loop = (now) => {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    phase += dt / 2.4;
    if (phase >= 1) {
      phase -= 1;
      data.shift();
      const prev = data[data.length - 1];
      data.push(Math.min(Y_MAX * 0.92, Math.max(160, prev + (Math.random() - 0.48) * 150)));
      clockMinutes += 30;
    }
    render();
    requestAnimationFrame(loop);
  };

  return {
    draw() {
      return gsap.to(clipRect, { attr: { width: W }, duration: 2.2, ease: 'power2.inOut' });
    },
    showAll() { clipRect.setAttribute("width", String(W)); },
    play() {
      if (!live || running) return;
      running = true;
      last = performance.now();
      requestAnimationFrame(loop);
    },
    pause() { running = false; },
  };
}

function bars(root, { live }) {
  const els = Array.from({ length: 12 }, () => {
    const i = document.createElement('i');
    root.appendChild(i);
    return i;
  });
  const shuffle = () => {
    const hs = els.map(() => 18 + Math.random() * 82);
    const peak = hs.indexOf(Math.max(...hs));
    els.forEach((b, i) => {
      b.style.setProperty('--h', `${hs[i].toFixed(0)}%`);
      b.classList.toggle('is-peak', i === peak);
    });
  };
  els.forEach((b) => b.style.setProperty('--h', '6%'));
  let timer = 0;
  return {
    play() {
      shuffle();
      if (live && !timer) timer = setInterval(shuffle, 2200);
    },
    pause() { clearInterval(timer); timer = 0; },
  };
}

function feed(root, { live }) {
  let n = 0;
  const add = (animate) => {
    const [what, agent, t] = FEED[n++ % FEED.length];
    const li = document.createElement('li');
    li.innerHTML = `<span>${what}</span><span><b>${agent}</b> · ${t}</span>`;
    if (animate) li.classList.add('is-new');
    root.prepend(li);
    while (root.children.length > 6) root.lastElementChild.remove();
  };
  for (let i = 0; i < 6; i++) add(false);
  let timer = 0;
  return {
    play() { if (live && !timer) timer = setInterval(() => add(true), 2600); },
    pause() { clearInterval(timer); timer = 0; },
  };
}

function kpis(root, { live }) {
  const items = $$('[data-kpi]', root).map((node) => ({
    node,
    target: parseFloat(node.dataset.kpi),
    decimals: parseInt(node.dataset.decimals || '0', 10),
    suffix: node.dataset.suffix || '',
    liveStep: parseFloat(node.dataset.live || '0'),
    value: 0,
  }));
  const paint = (it) => { it.node.textContent = fmt(it.value, it.decimals) + it.suffix; };
  let timer = 0;
  return {
    count() {
      items.forEach((it) => {
        gsap.to(it, { value: it.target, duration: 2, ease: 'expo.out', onUpdate: () => paint(it) });
      });
    },
    showAll() { items.forEach((it) => { it.value = it.target; paint(it); }); },
    play() {
      if (!live || timer) return;
      timer = setInterval(() => {
        items.forEach((it) => {
          if (!it.liveStep) return;
          it.value += Math.round(Math.random() * it.liveStep);
          paint(it);
        });
      }, 1800);
    },
    pause() { clearInterval(timer); timer = 0; },
  };
}

/** Glowing wires from callouts to the parts of the dashboard they describe. */
function wires(stage) {
  const svg = $('#showcase-wires');
  const callouts = $$('.callout', stage);
  const paths = callouts.map(() => {
    const g = el('g', { class: 'wire-group' });
    const base = el('path', { class: 'wire' });
    const glow = el('path', { class: 'wire-glow', pathLength: '1' });
    const node = el('circle', { class: 'wire-node', r: '3.5' });
    g.append(base, glow, node);
    svg.append(g);
    return { base, glow, node };
  });

  return function update() {
    if (isMobileLayout()) return;
    const s = stage.getBoundingClientRect();
    callouts.forEach((c, i) => {
      const anchor = stage.querySelector(`[data-anchor="${c.dataset.callout}"]`);
      if (!anchor) return;
      const cr = c.getBoundingClientRect();
      const ar = anchor.getBoundingClientRect();
      const ax = ar.left + ar.width * (cr.left < ar.left ? 0.12 : 0.88) - s.left;
      const ay = ar.top + Math.min(ar.height * 0.45, 70) - s.top;
      const fromLeft = cr.left + cr.width / 2 < ar.left + ar.width / 2;
      const cx = (fromLeft ? cr.right : cr.left) - s.left;
      const cy = cr.top + cr.height / 2 - s.top;
      const dx = ax - cx;
      const d = `M${cx.toFixed(1)},${cy.toFixed(1)} C${(cx + dx * 0.55).toFixed(1)},${cy.toFixed(1)} ${(ax - dx * 0.35).toFixed(1)},${ay.toFixed(1)} ${ax.toFixed(1)},${ay.toFixed(1)}`;
      paths[i].base.setAttribute('d', d);
      paths[i].glow.setAttribute('d', d);
      paths[i].node.setAttribute('cx', ax.toFixed(1));
      paths[i].node.setAttribute('cy', ay.toFixed(1));
    });
  };
}

export function initDashboard({ reducedMotion }) {
  const stage = $('#showcase-stage');
  const dash = $('#dash');
  if (!stage || !dash) return;
  const live = !reducedMotion;

  const chart = lineChart($('#chart-line'), { live });
  const barChart = bars($('#chart-bars'), { live });
  const feedList = feed($('#feed'), { live });
  const metrics = kpis(dash, { live });
  const updateWires = wires(stage);

  if (reducedMotion) {
    chart.showAll();
    metrics.showAll();
    barChart.play();
    stage.classList.add('is-on');
    requestAnimationFrame(updateWires);
    window.addEventListener('resize', updateWires);
    return;
  }

  // Rotate into view on scroll.
  gsap.fromTo(dash,
    { rotationX: 32, y: 80, scale: 0.9, opacity: 0.35, transformPerspective: 1800 },
    {
      rotationX: 0,
      y: 0,
      scale: 1,
      opacity: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: stage,
        start: 'top 95%',
        end: 'top 22%',
        scrub: 0.8,
        onUpdate: (s) => {
          stage.classList.toggle('is-on', s.progress > 0.85);
        },
      },
    });

  let started = false;
  ScrollTrigger.create({
    trigger: stage,
    start: 'top 70%',
    end: 'bottom top',
    onToggle: (s) => {
      if (s.isActive) {
        if (!started) {
          started = true;
          chart.draw();
          metrics.count();
        }
        chart.play();
        barChart.play();
        feedList.play();
        metrics.play();
        gsap.ticker.add(updateWires);
      } else {
        chart.pause();
        barChart.pause();
        feedList.pause();
        metrics.pause();
        gsap.ticker.remove(updateWires);
      }
    },
  });
}
