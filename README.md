# Lead Engine

A self-contained lead generation, outreach, and tracking system. Finds
prospects, runs multi-step outreach across cold email and Instagram/WhatsApp
DM, tracks each lead's progress from cold to booked to client, and shows the
conversion numbers on a dashboard.

One Next.js app, no third-party workflow tool and no third-party scraper:

- **Scraper** (`lib/scraper/`) — Playwright-based, configurable vertical and
  source (directory sites, Instagram profiles, specific URLs), writes
  straight to Airtable with its own dedup.
- **Outreach** (`lib/outreach/`) — cold email sequencer with IMAP reply
  watching, plus a ManyChat webhook handler for Instagram/WhatsApp DMs.
- **Bookings** — a Calendly webhook flips leads to Booked and tracks
  cancellations.
- **Reporting** (`lib/reporting/`) — nightly funnel rollup for the dashboard
  trend chart.
- **Dashboard** (`app/`) — reads Airtable directly: totals, conversion
  rates, pipeline by stage, platform breakdown, trend line, activity feed.

Airtable is the system of record (5 tables, see `docs/AIRTABLE_SCHEMA.md`).
Scheduling runs as Vercel Cron hitting API routes, no separate automation
server.

First vertical: physical clothing store owners in the US.

## Setup

See `docs/SETUP.md` for the full step-by-step, credentials needed, and a
verification checklist.

## Local development

```
npm install
cp .env.example .env   # fill in credentials, see docs/SETUP.md
npm run dev
```
