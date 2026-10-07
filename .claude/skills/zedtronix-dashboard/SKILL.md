---
name: zedtronix-dashboard
description: Recreates the default Zedtronix dashboard (the "Zedtronix Grid Console") exactly as saved, from a bundled template. Use this skill whenever the user asks to "create a default zedtronix dashboard", "make the zedtronix dashboard", "give me the standard/default Zedtronix dashboard", "rebuild the Zedtronix console", or any request for a Zedtronix dashboard without a different spec. It also covers small changes on top of the default, such as a new site name, app links, or extra apps in the launcher. Prefer this over designing a new dashboard from scratch whenever Zedtronix is mentioned.
---

# Zedtronix default dashboard

The user saved one dashboard as the Zedtronix default. When they ask for "the default Zedtronix dashboard", they want **that exact dashboard back**, not a fresh design that resembles it. So the job is to reproduce the template faithfully, then apply only the changes they ask for.

The template is `assets/zedtronix-dashboard.html`: one self-contained HTML file with no build step.

## What the default contains

Knowing what is in the template lets you change one part without breaking another.

- **Brand:** the Zedtronix logo, redrawn as inline SVG (three dark glass slabs forming a Z with an electric-blue edge glow and a light sweep, plus the "EDTRONIX" wordmark set in Michroma). The palette comes from the logo: near-black, dark glass, electric blue `#3d8bff`, and silver-blue text. There's a full light theme too. Tokens live in the `:root` blocks at the top of `<style>`.
- **Morphglass look:** frosted glass panels (`.glass`) with blue edge glow, a highlight that follows the cursor, and a canvas aurora behind everything. The aurora's blue blobs keep changing shape and brighten with the simulated sun.
- **Claude Code apps launcher:** six tiles named LEAD RESEARCH, NEXUS, NIMBLY CRM, SEO AGENT, HIGGSFIELD and SCOUT LEAD GENERATION. Each opens its app in a new tab. Links come from the `APPS` array in the script (permanent, for every viewer). A pencil on each tile lets a viewer set a link that is saved only in their own browser.
- **Live microgrid console:** an example site called Harbour Point, run by a simulated model (180 kWp solar, 400 kWh battery, mainland tie). It includes KPI tiles, an animated power-flow diagram, a liquid battery tube, a generation-against-load chart (hover, keyboard, table view), a site log, and feeder bars. All data is simulated and the page says so.

## Steps

1. **Copy the template unchanged.** Copy `assets/zedtronix-dashboard.html` to where the user wants it. If they didn't say, use `index.html` in the current project, or `zedtronix-dashboard.html` if `index.html` already holds something else. Never overwrite a different existing file without asking. Don't rewrite or "improve" the template from memory, because the user chose this exact version.
2. **Apply only the requested changes.** Common ones:
   - **App links:** fill the `url: ''` fields in the `APPS` array (search for `const APPS`). Use full `https://` addresses.
   - **Adding or removing apps:** edit `APPS`, giving each entry an `id`, `name`, `url` and a 24×24 line-icon `icon` path in the same style. The grid is 6 / 3 / 2 columns (desktop / tablet / phone), so counts of 6 or 12 fill the rows cleanly. Mention this if they pick another number.
   - **Site details:** the "Harbour Point microgrid" line in the header, the footer note, and the constants `PV_KWP`, `BATT_KWH`, `BATT_KW` and `RESERVE` near the top of the script. If capacity changes, update the matching visible text, such as "180 kWp" and "400 kWh".
   - **Wording such as titles and subtitles:** edit those strings in place.
   Keep the palette, logo and layout unless the user asks to change them.
3. **Publish it** when the Artifact tool is available. Artifacts supply their own document skeleton, so convert first:
   ```bash
   python3 <skill-dir>/scripts/make_artifact.py <your-copy.html> <scratchpad>/zedtronix-grid-console.html
   ```
   Then publish that file with the icon `dashboard`. If this conversation already published it, republish the same path so the link stays the same.
4. **Check before handing it over** if you changed anything beyond app links. Open it once in a browser (Playwright with the preinstalled Chromium works) and confirm three things: no page errors, no horizontal scroll at 390 px wide, and the link editor opens when you click an app tile that has no link. Google Fonts may fail to load in a sandbox; that's expected and not a bug.
5. **Tell the user** where the file is, give the artifact link, and list what you changed from the default. If any app links are still empty, say so and offer to fill them in.

## Things that are easy to break

- The CSS rule `[hidden] { display: none !important; }` must stay. Without it the hidden link-editor overlay covers the page and blocks every click.
- Colours come from tokens. A new element should use `var(--...)` tokens rather than literal colours, so both themes still work.
- The chart colours are cyan for solar and indigo for load. They were checked for colour-blind safety in both themes. Keep that pair if you touch the chart.
