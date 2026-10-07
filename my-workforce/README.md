# My Workforce

An AI agent command center in the Zedtronix style: one **Main Agent** that plans and delegates, and six specialist agents.

| # | Agent | Does |
| --- | --- | --- |
| 1 | SEO · AEO · GEO | Keyword research and clusters, on-page SEO, answer-engine FAQs, visibility in AI assistants |
| 2 | 3D Modeler | Character and object specs, topology, materials, rigging, Blender Python blockout scripts |
| 3 | Social Media | Content calendars, captions, reel scripts for each channel |
| 4 | Ads Manager | Meta Ads and Google Ads structure, targeting, budgets, ad copy, tracking |
| 5 | Lead Generator | Ideal customer profile, sourcing searches, scoring, outreach sequences |
| 6 | Full-Stack Dev | Architecture, data model, APIs and working code |

## Using it

- **Main Agent:** write a brief and press **Dispatch**. It picks the agents the brief needs (or the ones you choose under *Route to*), runs them in parallel and writes a summary.
- **One agent:** select an agent card (or its node in the network) to open its workspace, then type a task or pick a quick action.
- **Deliverables:** every result is kept, with tabs per agent, **Copy** and **Download .md**.

## Engines (Settings)

- **Claude in this page:** when opened as a Claude artifact, agents run on the viewer's own Claude account.
- **Anthropic API key:** calls the Claude API directly from the browser (Opus 5.5 by default; Sonnet 5.5 and Haiku 5.5 available). The key stays in that browser's local storage, so use a key you can revoke and avoid shared computers.
- **Demo:** no AI calls; agents return template drafts so you can try the workflow.

History and settings are stored in the browser only.

## Install / run

It is a static site with no build step. Serve the folder over HTTPS (or `localhost`), for example:

```bash
cd my-workforce && python3 -m http.server 8080
```

Open `http://localhost:8080`; Chrome and Edge show **Install app** in the top bar (it installs as a standalone app via `manifest.webmanifest` and `sw.js`).
