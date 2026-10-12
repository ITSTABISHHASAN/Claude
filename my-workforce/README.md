# My Workforce

An AI agent command center in the Zedtronix style: one **Main Agent** that plans and delegates, and six specialist agents.

| # | Agent | Does |
| --- | --- | --- |
| 1 | SEO · AEO · GEO | Researches keywords and search changes every day; keyword deep dives and clusters, on-page SEO, answer-engine FAQs, visibility in AI assistants |
| 2 | 3D Modeler | Character and object specs, topology, materials, rigging, Blender Python blockout scripts |
| 3 | Social Media | Creates posts for every social platform and deep-dives each platform's algorithm and trends every day; calendars, captions, reel scripts |
| 4 | Ads Manager | Meta Ads and Google Ads structure, targeting, budgets, ad copy, tracking |
| 5 | Lead Generator | Researches new leads every day with contact details and LinkedIn links; ideal customer profile, scoring, outreach sequences |
| 6 | Full-Stack Dev | Architecture, data model, APIs and working code |

## Using it

- **Main Agent:** write a brief and press **Dispatch**. It picks the agents the brief needs (or the ones you choose under *Route to*), runs them in parallel and writes a summary.
- **One agent:** select an agent card (or its node in the network) to open its workspace, then type a task or pick a quick action.
- **Deliverables:** every result is kept, with tabs per agent, **Copy**, **.md** and **Download Excel**.

## Daily research desk

The SEO · AEO · GEO, Social Media and Lead Generator agents research every day:

- **Keyword & search briefing (SEO):** keyword opportunities with intent, trend and priority; rising questions; Google and AI-search changes; competitor gaps; today's tasks.
- **Platform & algorithm briefing (Social Media):** what each platform's algorithm rewards and suppresses right now, recent changes, trends, and one ready-to-post idea per platform for today.
- **Daily lead list (Lead Generator):** new prospects that match *Leads: who to find*, *Decision makers* and *Market* (5 to 30 a day). Each row has company, website, contact name, role, email, phone, LinkedIn profile, LinkedIn company page, other social, location, why they fit and the source page. Companies found on earlier days are skipped. Every contact detail is then checked automatically (see *Verified leads* below).

Enter your business or niche, seed keywords, market, platforms and lead targets on the desk. With **Auto daily** on, all three run once a day, the first time My Workforce is open that day; **Research now** runs one any time. Each agent then uses its latest briefing as context in every other task (posts, keyword work, mission assignments). Briefings appear in Deliverables and download to Excel like everything else.

How current the research is depends on the engine:

- **API key with Opus 5.5 or Sonnet 5.5:** live web research. The agents search the web and every briefing ends with a *Sources* table. Searches are billed by Anthropic per search; turn it off in Settings.
- **Claude in this page / Haiku 5.5:** no web browsing, so briefings come from Claude's own knowledge and flag what to verify.
- **Demo:** template briefings.

### Lead contact details

Leads are only real with live web research (API key with Opus 5.5 or Sonnet 5.5). The agent searches the web and opens company websites, contact pages and directories. It reports an email, phone number or profile link only when it is published on a page it found, puts that page in the *Source* column, and writes "—" otherwise. It never guesses emails from name patterns and never includes home addresses or personal phone numbers. Any LinkedIn link that did not appear in the pages it searched or opened is marked **(check)**. Without live web research, the agent does not name companies or people; it gives you the searches to run instead.

### Verified leads

After each lead search, the app checks every contact detail against what the web tools actually returned (pages the agent opened, search results and cited passages; the agent's own words and search queries don't count):

| Detail | Verified when |
| --- | --- |
| Email | The exact address appears on an opened page or in the search results, is a valid address, and its domain has a mail server (DNS lookup via Google Public DNS; only the domain is sent) |
| Phone | The number appears on an opened page or in the search results (any formatting) and has 7 to 15 digits |
| LinkedIn | The profile link appeared in the search results or on an opened page |

A lead is **verified** when it has a verified email or a verified phone. Each daily lead list gets *Verified* and *Checks* columns, and the desk shows how many are verified.

**Verified leads (Excel)** builds one workbook from every day's research, merged and dated by the day each lead was first found:

- **Verified leads:** only verified records, showing only the verified email, phone and LinkedIn, plus the source page and checks. The header row is frozen and has filters.
- **Needs review:** everything else, with the reason (for example "Email ✖ not on any page the agent opened").
- **How verified:** counts and what the checks do and don't prove.

The checks can't prove that a mailbox exists or that the person still works there. Send a test email or check LinkedIn before outreach, and follow GDPR, PECR and CAN-SPAM (legitimate interest, clear opt-out).

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
