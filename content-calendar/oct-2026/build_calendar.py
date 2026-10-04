"""Builds the October 2026 content calendar workbook for Syed Tabish Hasan + Zedtronix.

Run:  python3 build_calendar.py   ->  Content_Calendar_Oct2026_STH_Zedtronix.xlsx
"""
import calendar
import datetime as dt
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

import sth_posts
import zed_posts

OUT = Path(__file__).with_name("Content_Calendar_Oct2026_STH_Zedtronix.xlsx")
YEAR, MONTH = 2026, 10

NAVY = "0B1F3A"
CYAN = "00B4D8"
ZED_FILL = "E6FAF7"
WEEK_FILLS = ["FFFFFF", "F5F7FA"]

thin = Side(style="thin", color="D0D7E2")
BORDER = Border(left=thin, right=thin, top=thin, bottom=thin)
WRAP_TOP = Alignment(wrap_text=True, vertical="top")
CENTER = Alignment(horizontal="center", vertical="center", wrap_text=True)

KEY_DATES = [
    ("1 Oct (Thu)", "Q4 begins · Cybersecurity Awareness Month & Breast Cancer Awareness Month (Pink October) start", "Both", "Q4 challenge; AI-security content runs all month"),
    ("2 Oct (Fri)", "Jumu'ah", "Both", "Zedtronix AI Factory reveal"),
    ("5 Oct (Mon)", "World Teachers' Day", "Both", "Hunterz free sales training"),
    ("10 Oct (Sat)", "World Mental Health Day", "Both", "AI removes burnout: soft tone, no hard sell"),
    ("11 Oct (Sun)", "International Day of the Girl", "STH", "Women building AI in Pakistan"),
    ("14 Oct (Wed)", "World Standards Day", "Zedtronix", "Factory quality control (7-point QC)"),
    ("16 Oct (Fri)", "World Food Day · US Boss's Day", "Both", "AI for restaurants (Zed); 'AI exposes bad bosses' (STH)"),
    ("19–23 Oct", "Zedtronix 1st anniversary week (founded Oct 2025, exact date to confirm)", "Both", "Year One series, peaking with offer on Fri 23 Oct"),
    ("24 Oct (Sat)", "UN Day · AI Summit Pakistan, Islamabad (24–25 Oct, verify)", "Both", "AI for development = AI for business"),
    ("25 Oct (Sun)", "UK clocks go back (BST ends): UK becomes PKT −5", "Ops", "Shift UK-targeted post times one hour later in PKT from 26 Oct"),
    ("27 Oct (Tue)", "Kashmir Black Day (observed in Pakistan)", "Both", "Sensitive: calm educational content only, no promos or celebratory creative"),
    ("31 Oct (Sat)", "Halloween", "Both", "AI horror stories + month recap"),
    ("7–11 Dec", "GITEX GLOBAL 2026 moved to December, Expo City Dubai (no longer October)", "Both", "GCC pre-GITEX meeting push from 29 Oct"),
    ("Ongoing", "Pakistan National AI Initiative: 7 AI hubs, 560 startups, $1B by 2030", "STH", "Commentary (Day 8, Day 24)"),
]

RESEARCH = [
    ("LinkedIn 2026", "Dwell time is the top ranking signal. Saves, thoughtful comments and private shares outweigh likes.", "Hook in line 1, short lines, and a comment prompt on every post. Reply to every comment within 2 hours."),
    ("LinkedIn 2026", "PDF/document carousels are the highest-engagement format (~6.6% average). 8–12 slides works best.", "1–2 carousels a week (Tue playbooks). Keep to 8–12 slides."),
    ("LinkedIn 2026", "Short native video (<3 min) beats linked video. Many people watch on mute.", "Burned-in captions on every video. No external links in the post body; put them in the first comment."),
    ("Instagram 2026", "Watch time, sends per reach and likes per reach are the confirmed signals. DM sends carry 3–5× the weight of likes for non-follower reach.", "Make content worth sending: checklists, 'send this to your team' CTAs, humour."),
    ("Instagram 2026", "Trial Reels test content on non-followers first (1,000+ followers). Reels over 3 min stop being pushed to non-followers.", "Test Mr. Zed humour/meme Reels as Trial Reels. Keep Reels at 15–60s."),
    ("Pakistan audience", "Facebook ~69M, Instagram ~27M (18–24 the largest group), LinkedIn ~15M (25–34 the largest group). TikTok used by ~56% of internet users, ~75% among 18–24.", "Zedtronix leads with FB/IG/TikTok for mass awareness of Mr. Zed. LinkedIn carries B2B and personal brand."),
    ("Enterprise AI 2026", "'AI factories' and agentic AI are the defining 2026 enterprise themes. Gartner: 40% of enterprise apps will have task-specific agents by end of 2026. SMBs are adopting faster year on year.", "Supports both positionings: 'AI Factory' (Zedtronix) and 'agents, not prompts' (STH)."),
    ("Pakistan context", "There are already claims of a 'first industrial AI hub' (CIINAI/PIDC), a 'first locally hosted AI cloud' (Telenor/Data Vault), and PIAIC teaches 'Agent Factories'.", "Define 'AI Factory' precisely (a production line that builds and ships AI products for businesses) and keep evidence on file for the 'first' claim."),
]

PILLARS_STH = [
    ("GenAI Leadership", "30%", "POV on agents, ROI, governance, the CEO's role in AI", "Mon · Thu"),
    ("Tactical AI Playbook", "20%", "Saveable carousels: audits, ROI formula, decision guides", "Tue"),
    ("Founder / Entrepreneur Story", "25%", "Nokia Siemens accountant to AI founder, 2 companies, 3 time zones, wins and losses", "Wed"),
    ("Industry Commentary", "10%", "Pakistan AI policy, GCC/GITEX, global AI news from an SME angle", "Thu"),
    ("Community & Impact", "15%", "Hunterz, teachers, women in tech, gratitude, polls, newsletter", "Fri · Sat · Sun"),
]
PILLARS_ZED = [
    ("Mr. Zed Explains", "25%", "30–45s explainers: agents, RAG, AI Factory, automation vs chatbot", "Tue"),
    ("Made in the AI Factory", "25%", "Product and service showcases: digital engines, Mr. Zed companion, use cases by industry", "Mon · Wed"),
    ("Factory Floor (BTS)", "15%", "Team, process, QC, factory tour at NASTP", "Thu"),
    ("Ask Mr. Zed / Community", "15%", "Q&A, lives, polls, Hunterz", "Fri"),
    ("Trends & Humour", "10%", "Memes, trending audio, Halloween, POVs", "Sat"),
    ("Offers & Proof", "10%", "Free AI audit, anniversary build, Year One numbers", "Sun"),
]

CADENCE = [
    ("Syed Tabish Hasan", "LinkedIn (personal)", "Daily (31 posts) + weekly newsletter from 18 Oct", "1:00 PM PKT = 9 AM UK (BST), 12 PM GST. After 25 Oct: 2:00 PM PKT keeps 9 AM UK. US posts: 6:30 PM PKT."),
    ("Syed Tabish Hasan", "Instagram", "4–5×/week (carousels, Reels, quote cards) + daily Stories", "8:30–9:30 PM PKT"),
    ("Syed Tabish Hasan", "X / Threads", "Repurpose daily hooks as short threads", "Same as LinkedIn"),
    ("Syed Tabish Hasan", "YouTube Shorts", "Every talking-head video (Days 9, 22, 30)", "Evening PKT"),
    ("Zedtronix", "Instagram + Facebook", "Daily (31 posts), Reels-first, daily Stories", "8:00–9:00 PM PKT"),
    ("Zedtronix", "TikTok", "4–5×/week (all Mr. Zed Reels)", "9:00–11:00 PM PKT"),
    ("Zedtronix", "LinkedIn (company page)", "5×/week (B2B use cases, QC, launches, offers)", "1:00 PM PKT"),
    ("Zedtronix", "YouTube Shorts", "All Mr. Zed Explains + hero video", "Evening PKT"),
]

KPIS = [
    ("STH LinkedIn followers", "Baseline 1 Oct: ___", "+10% by 31 Oct", ""),
    ("STH LinkedIn avg. engagement rate", "___", "≥ 4% (carousels ≥ 6%)", ""),
    ("STH newsletter subscribers", "0", "1,000+ by 31 Oct", ""),
    ("Discovery calls booked (Calendly)", "___", "20+ in October", ""),
    ("Zedtronix IG followers", "___", "+25%", ""),
    ("Mr. Zed hero video views (all platforms)", "0", "100K+", ""),
    ("Zedtronix sends/shares per Reel", "___", "Track weekly, aim for upward trend", ""),
    ("DM keyword leads (LEADS / CLINIC / FOOD / ZED / BPO / BUILD)", "0", "50+", ""),
    ("Free AI Factory Audits booked", "0", "30+", ""),
    ("Hunterz applications", "___", "Next cohort full", ""),
]

MR_ZED = [
    ("Who he is", "The face and manager of Zedtronix, Pakistan's first AI Factory. Also a real product: the Mr. Zed AI companion."),
    ("Personality", "Warm, witty, confident without arrogance. Explains complex AI in plain words. Proud of Pakistan, built for the world. Self-aware humour about being AI."),
    ("Voice", "Short sentences. English first, occasional Roman Urdu ('Assalam-o-Alaikum', 'chai break', 'bilkul'). Never uses jargon without explaining it."),
    ("Catchphrases", "'Factory's open.' · 'Raw problems in. Working AI out.' · 'Built in Pakistan. Built for the world.' · 'Mr. Zed: explained.' · 'No QC, no shipping.'"),
    ("Recurring series", "Mr. Zed Explains (Tue) · Made in the AI Factory (Mon) · Factory Floor (Thu) · Ask Mr. Zed (Fri) · Mr. Zed Moments (special days)"),
    ("Visual rules", "Same character model, colours and proportions every time. Navy #0B1F3A + cyan #00B4D8 + gold #F4B400 accent. Industrial-factory motifs: conveyor belts, QC stamps, shipping crates."),
    ("Costumes/props", "Chef hat (Food Day), security guard (Cyber month), party hat (anniversary), pumpkin (Halloween), librarian (RAG), apple (Teachers' Day)."),
    ("Never", "Gives medical, legal or financial advice. Mocks competitors. Comments on politics or religion. Promises results without data. Posts promotional or celebratory content on days of national mourning or observance."),
    ("Disclosure", "Always clearly an AI character. Never pretend Mr. Zed is a human."),
]

STH_COLS = [
    ("Date", 11), ("Day", 6), ("Week theme", 18), ("Pillar", 16), ("Format", 20), ("Platforms", 20),
    ("Post time", 14), ("Hook (first line)", 34), ("Full post copy (LinkedIn)", 70), ("Instagram / cross-post adaptation", 40),
    ("Video script", 40), ("Visual / creative brief", 34), ("CTA & engagement tactic", 28), ("Hashtags", 24), ("Status", 12),
]
ZED_COLS = [
    ("Date", 11), ("Day", 6), ("Week theme", 18), ("Series", 18), ("Format", 20), ("Platforms", 20),
    ("Post time", 14), ("Hook (first line)", 34), ("Caption", 60), ("Mr. Zed script / slide plan", 55),
    ("Visual / creative brief", 34), ("CTA & engagement tactic", 28), ("Hashtags", 24), ("Status", 12),
]


def header(ws, row, cols, fill=NAVY):
    for i, (name, width) in enumerate(cols, start=1):
        c = ws.cell(row=row, column=i, value=name)
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor=fill)
        c.alignment = CENTER
        c.border = BORDER
        ws.column_dimensions[get_column_letter(i)].width = width
    ws.row_dimensions[row].height = 30


def title(ws, text, sub, span):
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=span)
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=span)
    t = ws.cell(row=1, column=1, value=text)
    t.font = Font(bold=True, size=16, color=NAVY)
    s = ws.cell(row=2, column=1, value=sub)
    s.font = Font(italic=True, size=10, color="5A6B82")
    ws.row_dimensions[1].height = 26


def write_rows(ws, start, rows, fill_cols=None):
    for r_off, values in enumerate(rows):
        r = start + r_off
        for c_idx, v in enumerate(values, start=1):
            cell = ws.cell(row=r, column=c_idx, value=v)
            cell.alignment = WRAP_TOP
            cell.border = BORDER
            if fill_cols:
                cell.fill = PatternFill("solid", fgColor=fill_cols)


def date_of(day):
    return dt.date(YEAR, MONTH, day)


def calendar_sheet(ws, posts, cols, kind):
    title(
        ws,
        "Syed Tabish Hasan: Personal Brand Calendar, October 2026" if kind == "sth"
        else "Zedtronix × Mr. Zed: Pakistan's First AI Factory, October 2026",
        "Positioning: Generative AI Leader & successful entrepreneur. LinkedIn-first. [Brackets] = personalise/confirm before posting." if kind == "sth"
        else "Positioning: Pakistan's First AI Factory, with Mr. Zed as the face. Reels-first on IG/TikTok/FB, B2B on LinkedIn. [Brackets] = confirm.",
        len(cols),
    )
    header(ws, 4, cols)
    status_dv = DataValidation(type="list", formula1='"Idea,Drafted,Designed,Approved,Scheduled,Posted"', allow_blank=True)
    ws.add_data_validation(status_dv)
    for i, p in enumerate(posts):
        r = 5 + i
        d = date_of(p["day"])
        if kind == "sth":
            vals = [d, d.strftime("%a"), p["week_theme"], p["pillar"], p["fmt"], p["platforms"], p["time"],
                    p["hook"], p["copy"], p["ig"], p.get("script", ""), p["visual"], p["cta"], p["tags"], "Drafted"]
        else:
            vals = [d, d.strftime("%a"), p["week_theme"], p["series"], p["fmt"], p["platforms"], p["time"],
                    p["hook"], p["caption"], p["script"], p["visual"], p["cta"], p["tags"], "Drafted"]
        if p["day"] >= 26 and p["time"].startswith("1:00 PM PKT"):
            vals[6] = p["time"].replace("1:00 PM PKT", "2:00 PM PKT (UK now on GMT)", 1)
        week_fill = WEEK_FILLS[(d.isocalendar()[1]) % 2]
        for c_idx, v in enumerate(vals, start=1):
            cell = ws.cell(row=r, column=c_idx, value=v)
            cell.alignment = WRAP_TOP
            cell.border = BORDER
            cell.fill = PatternFill("solid", fgColor=week_fill)
        ws.cell(row=r, column=1).number_format = "DD-MMM-YY"
        ws.cell(row=r, column=8).font = Font(bold=True, color=NAVY)
        status_dv.add(ws.cell(row=r, column=len(vals)))
        if d < dt.date(2026, 10, 5):
            ws.cell(row=r, column=len(vals), value="Drafted (date passed: repurpose/shift)")
        ws.row_dimensions[r].height = 260 if kind == "sth" else 220
    ws.freeze_panes = "C5"
    ws.auto_filter.ref = f"A4:{get_column_letter(len(cols))}{4 + len(posts)}"


def month_view(ws):
    title(ws, "October 2026: Month at a Glance", "Top line in each cell = Syed Tabish Hasan (blue). Bottom line = Zedtronix / Mr. Zed (green).", 7)
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for i, d in enumerate(days, start=1):
        c = ws.cell(row=4, column=i, value=d)
        c.font = Font(bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor=NAVY)
        c.alignment = CENTER
        ws.column_dimensions[get_column_letter(i)].width = 32
    sth = {p["day"]: p for p in sth_posts.POSTS}
    zed = {p["day"]: p for p in zed_posts.POSTS}
    special = {1: "Q4 · Cyber Month", 5: "Teachers' Day", 10: "Mental Health Day", 11: "Day of the Girl",
               14: "Standards Day", 16: "Food Day · Boss's Day", 23: "ZEDTRONIX TURNS 1", 24: "UN Day · AI Summit PK",
               25: "UK clocks back", 27: "Kashmir Black Day (no promo)", 31: "Halloween"}
    for w, week in enumerate(calendar.monthcalendar(YEAR, MONTH)):
        r = 5 + w
        ws.row_dimensions[r].height = 150
        for c_idx, day in enumerate(week, start=1):
            cell = ws.cell(row=r, column=c_idx)
            cell.border = BORDER
            cell.alignment = WRAP_TOP
            if not day:
                cell.fill = PatternFill("solid", fgColor="EEEEEE")
                continue
            tag = f"  ★ {special[day]}" if day in special else ""
            cell.value = (f"{day}{tag}\n\n"
                          f"👤 STH · {sth[day]['pillar']}\n{sth[day]['hook']}\n\n"
                          f"🏭 ZED · {zed[day]['series']}\n{zed[day]['hook']}")
            cell.fill = PatternFill("solid", fgColor="FFF4D6" if day in special else "FFFFFF")


def table_sheet(ws, heading, sub, cols, rows, fill=None):
    title(ws, heading, sub, len(cols))
    header(ws, 4, cols)
    write_rows(ws, 5, rows, fill)
    for r in range(5, 5 + len(rows)):
        ws.row_dimensions[r].height = 60


def strategy_sheet(ws):
    title(ws, "Strategy, Research & Playbook: October 2026",
          "Prepared 4 Oct 2026 for Syed Tabish Hasan (Founder & CEO, Zedtronix & Catalyst Core Global)", 4)
    widths = [26, 22, 60, 50]
    for i, w in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = w
    r = 4

    def section(name):
        nonlocal r
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=4)
        c = ws.cell(row=r, column=1, value=name)
        c.font = Font(bold=True, size=12, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor=CYAN)
        r += 1

    def rows(hdr, data, heights=48):
        nonlocal r
        for i, h in enumerate(hdr, start=1):
            c = ws.cell(row=r, column=i, value=h)
            c.font = Font(bold=True, color="FFFFFF")
            c.fill = PatternFill("solid", fgColor=NAVY)
            c.border = BORDER
        r += 1
        for row in data:
            for i, v in enumerate(row, start=1):
                c = ws.cell(row=r, column=i, value=v)
                c.alignment = WRAP_TOP
                c.border = BORDER
            ws.row_dimensions[r].height = heights
            r += 1
        r += 1

    section("1. POSITIONING")
    rows(["Brand", "Positioning line", "Proof points (from profile)", "Tone"], [
        ("Syed Tabish Hasan", "\"I build digital engines, not websites.\" The Generative AI leader who makes AI pay for itself.",
         "16+ yrs finance/sales/BD across KSA, UK, US, GCC, PK · Nokia Siemens Networks → Financial Controller (KFB Holding) → Founder & CEO of Zedtronix + Catalyst Core Global · IBM watsonx Certified GenAI Engineer · PMI AI for Business · Anthropic Claude for Startups programme · Founder of Hunterz (free B2B sales training, NASTP)",
         "Direct, numbers-first, generous with frameworks, honest about failures. 'CFO brain, builder hands.'"),
        ("Zedtronix", "Pakistan's First AI Factory. Raw problems in, working AI out. Built in Pakistan, built for the world.",
         "AI agents, chatbots (incl. Mr. Zed), automation, AI-integrated web/apps/brand · clients in US/UK/GCC · NASTP Silicon Valley, Karachi · 1st anniversary Oct 2026 · sister co. Catalyst Core Global (40–70% cost savings)",
         "Bold, playful, proud, accessible. Mr. Zed fronts every piece of content."),
    ], 90)
    section("2. RESEARCH: WHAT'S WORKING ON SOCIAL IN 2026")
    rows(["Platform / area", "", "Insight", "How we use it"], [(a, "", b, c) for a, b, c in RESEARCH], 62)
    section("3. CONTENT PILLARS: SYED TABISH HASAN")
    rows(["Pillar", "Share", "What it covers", "Days"], PILLARS_STH)
    section("4. CONTENT PILLARS: ZEDTRONIX × MR. ZED")
    rows(["Pillar", "Share", "What it covers", "Days"], PILLARS_ZED)
    section("5. CADENCE & POSTING TIMES (PKT)")
    rows(["Brand", "Channel", "Frequency", "Best time"], CADENCE)
    section("6. MONTHLY NARRATIVE ARC")
    rows(["Week", "Dates", "Syed Tabish Hasan", "Zedtronix"], [
        ("Week 1", "1–4 Oct", "Q4 kickoff: 'the implementation gap'", "Teaser → reveal: Pakistan's First AI Factory → meet Mr. Zed"),
        ("Week 2", "5–11 Oct", "Build: audits, ROI, two-company operating system, Pakistan AI policy", "Inside the production lines: agents, use cases, BTS, free audit"),
        ("Week 3", "12–18 Oct", "Scale: agents not prompts, global markets, learning stack, newsletter launch", "Built for global SMEs: digital engines, QC, clinics, food, safety"),
        ("Week 4", "19–25 Oct", "One year of Zedtronix: lessons, gratitude, Mr. Zed origin, AI Summit", "Anniversary week: countdown, numbers, factory tour, offer, Hunterz"),
        ("Week 5", "26–31 Oct", "Future: CEO's AI role, ROI formula, GITEX prep, 2027 predictions, Halloween", "Future factory: Mr. Zed product, BPO, exports, live AMA, monthly report"),
    ])
    section("7. GOLDEN RULES")
    rows(["Rule", "", "Detail", ""], [
        ("Cross-brand synergy", "", "Tabish reshares every Zedtronix hero post with a personal comment in the first 60 minutes. Zedtronix page comments on Tabish's posts. Mr. Zed appears in Tabish's content (Days 22, 30, 31).", ""),
        ("Engagement window", "", "Spend 20 min before and 30 min after each post commenting on 10–15 relevant creators/prospects (US/UK/GCC SME founders, Pakistani tech leaders).", ""),
        ("Links", "", "No external links in the LinkedIn post body. Put the Calendly/website link in the first comment. On IG use link in bio + DM keyword auto-replies.", ""),
        ("Claims hygiene", "", "Only publish verified numbers. Keep evidence for 'Pakistan's First AI Factory'. Never imply Anthropic/IBM endorsement; say 'part of' / 'certified by' only.", ""),
        ("Sensitivity", "", "27 Oct (Kashmir Black Day): no promos or celebratory creative. Fridays: Jumu'ah-aware timing (avoid 12:30–2:30 PM PKT).", ""),
        ("Repurposing", "", "Each LinkedIn carousel → IG carousel → 3 X posts → 1 newsletter section. Each Reel → TikTok + Shorts + FB. The 30 Oct live → 5 November Reels.", ""),
        ("Dates already passed", "", "Today is 4 Oct, so posts for 1–3 Oct are past. Either publish them today/this week in compressed form (the AI Factory reveal is the priority) or keep them as evergreen backups.", ""),
    ], 52)


def build():
    wb = Workbook()
    strategy_sheet(wb.active)
    wb.active.title = "Strategy & Research"

    month_view(wb.create_sheet("Month View"))
    calendar_sheet(wb.create_sheet("STH – Daily Posts"), sth_posts.POSTS, STH_COLS, "sth")
    calendar_sheet(wb.create_sheet("Zedtronix – Daily Posts"), zed_posts.POSTS, ZED_COLS, "zed")
    table_sheet(wb.create_sheet("Key Dates"), "Key Dates & Hooks: October 2026",
                "Verify event dates before publishing.",
                [("Date", 14), ("Occasion", 60), ("Brand", 12), ("Content hook", 60)], KEY_DATES)
    table_sheet(wb.create_sheet("Mr. Zed Brand Bible"), "Mr. Zed: Character & Voice Guide",
                "Use this so every designer, editor and writer produces the same Mr. Zed.",
                [("Element", 22), ("Guideline", 120)], MR_ZED, ZED_FILL)
    table_sheet(wb.create_sheet("KPI Tracker"), "October 2026 KPI Tracker",
                "Fill baselines on day 1 and update every Sunday.",
                [("Metric", 52), ("Baseline", 22), ("October target", 30), ("Actual (31 Oct)", 22)], KPIS)

    for ws in wb.worksheets:
        ws.sheet_view.showGridLines = False
        ws.sheet_properties.tabColor = {"STH – Daily Posts": "1E6FD9", "Zedtronix – Daily Posts": "00A88F"}.get(ws.title, NAVY)
    wb.save(OUT)
    print(f"Saved {OUT}")


if __name__ == "__main__":
    build()
