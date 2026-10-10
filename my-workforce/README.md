# My Workforce

An AI agent command center in the Zedtronix style: one **Main Agent** that plans and delegates, and six specialist agents.

| # | Agent | Does |
| --- | --- | --- |
| 1 | SEO · AEO · GEO | Researches keywords and search changes every day; keyword deep dives and clusters, on-page SEO, answer-engine FAQs, visibility in AI assistants |
| 2 | 3D Modeler | Character and object specs, topology, materials, rigging, Blender Python blockout scripts |
| 3 | Social Media | Creates posts for every social platform and deep-dives each platform's algorithm and trends every day; calendars, captions, reel scripts |
| 4 | Ads Manager | Meta Ads and Google Ads structure, targeting, budgets, ad copy, tracking |
| 5 | Lead Generator | Ideal customer profile, sourcing searches, scoring, outreach sequences |
| 6 | Full-Stack Dev | Architecture, data model, APIs and working code |

## Using it

- **Main Agent:** write a brief and press **Dispatch**. It picks the agents the brief needs (or the ones you choose under *Route to*), runs them in parallel and writes a summary.
- **One agent:** select an agent card (or its node in the network) to open its workspace, then type a task or pick a quick action.
- **Deliverables:** every result is kept, with tabs per agent, **Copy**, **.md** and **Download Excel**.

## Daily research desk

The SEO · AEO · GEO and Social Media agents research every day:

- **Keyword & search briefing (SEO):** keyword opportunities with intent, trend and priority; rising questions; Google and AI-search changes; competitor gaps; today's tasks.
- **Platform & algorithm briefing (Social Media):** what each platform's algorithm rewards and suppresses right now, recent changes, trends, and one ready-to-post idea per platform for today.

Enter your business or niche, seed keywords, market and platforms on the desk. With **Auto daily** on, both briefings run once a day, the first time My Workforce is open that day; **Research now** runs one any time. Each agent then uses its latest briefing as context in every other task (posts, keyword work, mission assignments). Briefings appear in Deliverables and download to Excel like everything else.

How current the research is depends on the engine:

- **API key with Opus 5.5 or Sonnet 5.5:** live web research. The agents search the web and every briefing ends with a *Sources* table. Searches are billed by Anthropic per search; turn it off in Settings.
- **Claude in this page / Haiku 5.5:** no web browsing, so briefings come from Claude's own knowledge and flag what to verify.
- **Demo:** template briefings.

A browser page only runs while it is open, so "daily" means the first time you open the dashboard each day.

## Excel export

Every agent's work downloads as an Excel workbook (`.xlsx`), built in the browser with no add-ons:

- **Mission:** one workbook with a *Summary* sheet (brief, plan, status, summary) and one sheet per agent (`01 SEO`, `02 3D`, `03 SMM`, `04 Ads`, `05 Leads`, `06 Dev`).
- **Single agent:** *Download Excel* in the agent's workspace saves just that task.
- Tables in an agent's answer become real spreadsheet columns with bold headers, and plain numbers stay numeric. Agents are told to put every list (keywords, posts, ads, leads, specs, endpoints) in tables so it lands in columns.

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
