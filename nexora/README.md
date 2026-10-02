# NEXORA marketing site

Marketing site for NEXORA, the operating system for autonomous business. It is
a dark "morphglass" landing page: a raymarched liquid-glass orb, frosted-glass
UI and scroll-driven motion.

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # static output in dist/
npm run preview   # serve dist/ on http://localhost:4173
```

## Rebranding

The product name, tagline, description and site URL live in `.env`. Vite
substitutes them into both HTML pages (`%VITE_BRAND%` and so on) at build
time, so a rename is a one-line change. Palette, glass material, type scale,
spacing and easing are tokens in `src/styles/tokens.css`.

## Structure

```
index.html, docs.html        semantic markup, OG/Twitter meta, JSON-LD
src/main.js                  landing entry: wires every system below
src/docs.js                  docs entry (shares nav, cursor, transitions)
src/core/
  env.js                     feature detection (motion, pointer, hardware WebGL)
  orb-state.js               shared target state for the orb (plain object)
  choreography.js            scroll story: orb position/shape per section, pinned "shift"
  scroll.js                  Lenis + ScrollTrigger glue
  preloader.js               ring draws itself, 000→100 counter, flies into nav logo
  reveal.js                  blur-to-sharp letter stagger, silver shimmer sweep
  cursor.js                  glowing dot, trailing halo, magnetic buttons
  transition.js              frosted-glass sweep for anchor jumps and page changes
src/components/              nav, tilt cards, dashboard, timeline, counters,
                             orbit, carousel, pricing, cipher, signup, marquee
src/gl/
  stage.js                   three.js renderer, adaptive resolution, particles
  shaders/orb.frag           SDF orb: blob → torus → fractured crystal → cube grid
src/styles/                  tokens, base, components, sections, docs
```

## How the orb works

The orb is a signed distance field raymarched in a full-screen fragment
shader. A single field blends between four shapes, which a fixed vertex mesh
cannot do across different topologies. Noise displaces the field the way
vertex displacement would displace a mesh. Glass shading refracts the
background per colour channel (chromatic aberration), adds a Fresnel
reflection of a procedural studio, a blue rim and a silver key highlight. A
faint grid behind the orb makes the refraction visible.

Scroll never touches WebGL directly. `choreography.js` writes target values
into `orb-state.js` and the stage eases toward them every frame. The stage is
loaded with a dynamic `import()`, so three.js arrives in its own chunk after
first paint.

## Performance and fallbacks

- Device pixel ratio is capped at 2. Resolution adapts to frame time, and on a
  weak GPU the shader drops to its `LITE` variant.
- Phones and touch devices get the `LITE` shader (fewer steps, one refraction
  sample, single-octave noise), fewer particles and a lower DPR cap.
- With no WebGL, or a software renderer (SwiftShader, llvmpipe, WARP), the
  site shows a CSS glass orb instead. Software WebGL runs the raymarcher on
  the CPU and blocks the main thread. Add `?gl=force` to the URL to override.
- `prefers-reduced-motion`: no preloader, no smooth scroll, no pinning or
  morphing; all content is laid out statically and the orb is drawn only when
  something changes.
- The preloader tracks real loading (fonts, WebGL module, window load) and
  never holds the page longer than 4.5 s.

Lighthouse 12 on the production build (local, headless Chromium):

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Mobile | 96 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

Headless Chromium has no GPU, so these runs take the CSS-orb path. On real
hardware the WebGL stage loads after first paint, in its own chunk.

## Accessibility

Skip link, visible focus rings, a keyboard-operable menu (Escape closes it), a
carousel driven by arrow keys, buttons and dots, and a pricing switch with
`role="switch"`. Split headings keep their text in `aria-label`, and all
decorative layers are `aria-hidden`. The marquee and orbit labels meet 4.5:1
contrast.

## Before launch

Content marked here is placeholder and must be replaced with real material:

- **Customer logos** in the marquee and **testimonials** (names, roles and
  companies are fictional).
- **Metrics** (10M+ tasks, 99.99% uptime, 4× faster close), dashboard
  figures, pricing and compliance badges (SOC 2, GDPR, ISO 27001). Only claim
  certifications you hold.
- Footer links that point at in-page anchors, and the social profile URLs.
- The early-access form validates and confirms locally. Connect it to your
  email or CRM endpoint in `src/components/signup.js`.
- `public/og.jpg` was rendered from the hero. Re-render it after rebranding.
