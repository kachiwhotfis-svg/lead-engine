# Setup

Everything in this repo is built and works locally. Nothing sends or runs
against real prospects until you plug in your own accounts below. Follow
this in order, each step unblocks the next.

## What you need

- An Airtable account (free tier is fine to start)
- An email account you're willing to send cold outreach from, plus its SMTP
  and IMAP details (Gmail with an app password works)
- A ManyChat account already connected to your Instagram and WhatsApp
- A Calendly account
- A Vercel account
- Node.js 18+ installed locally, for the one-time setup scripts and for
  running the scraper (see the Playwright note near the bottom)

## 1. Local setup

```
git clone https://github.com/kachiwhotfis-svg/lead-engine
cd lead-engine
npm install
cp .env.example .env
```

You'll fill in `.env` as you go through the rest of this doc.

## 2. Airtable

1. Go to [airtable.com/create/tokens](https://airtable.com/create/tokens)
   and create a personal access token with these scopes:
   `data.records:read`, `data.records:write`, `schema.bases:read`,
   `schema.bases:write`. Copy it into `AIRTABLE_API_KEY` in `.env`.
2. Find your workspace ID. It's in the URL when you open a workspace on
   airtable.com, it looks like `wsp...`. Put it in `AIRTABLE_WORKSPACE_ID`
   in `.env` (this one's only needed for the next command, you can remove
   it after).
3. Run:
   ```
   npm run setup:airtable
   ```
   This creates a new base called "Lead Engine" with all five tables
   (Leads, Interactions, Sequences, Bookings, Stats Snapshots) and the
   correct fields, matching `docs/AIRTABLE_SCHEMA.md`. It prints a base ID
   at the end, copy that into `AIRTABLE_BASE_ID` in `.env`.
4. Seed the outreach copy for the clothing store vertical:
   ```
   npm run seed:sequences
   ```
   This pushes the three-step cold email, Instagram, and WhatsApp
   sequences from `sequences/outreach-copy.md` into the Sequences table.
   After this, edit copy directly in Airtable, not in code, that's the
   point of the Sequences table.

## 3. Cold email (SMTP + IMAP)

Any provider works as long as it gives you SMTP and IMAP access. For
Gmail:

1. Turn on 2-Step Verification on the sending account.
2. Create an [App Password](https://myaccount.google.com/apppasswords).
3. Set in `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=you@gmail.com
   SMTP_PASS=<the app password>
   FROM_EMAIL=you@gmail.com
   FROM_NAME=Your Name

   IMAP_HOST=imap.gmail.com
   IMAP_PORT=993
   IMAP_USER=you@gmail.com
   IMAP_PASS=<the same app password>
   ```

This is the account the cold email sequencer sends from, and the inbox the
reply watcher checks for replies.

## 4. ManyChat (Instagram + WhatsApp DMs)

ManyChat's API doesn't expose flow-building, so this part is manual, done
once inside their visual flow builder:

1. In `.env`, set `MANYCHAT_WEBHOOK_SECRET` to any random string.
2. Deploy this app first (see step 6) so you have a live URL, e.g.
   `https://lead-engine.vercel.app`.
3. In each ManyChat flow (Instagram and WhatsApp), wherever you send the
   first outbound message or receive a reply, add an **External Request**
   action pointed at:
   ```
   POST https://<your-deployment>/api/webhooks/manychat
   Header: x-manychat-secret: <MANYCHAT_WEBHOOK_SECRET>
   ```
   with this JSON body, filling in ManyChat's dynamic fields:
   ```json
   {
     "subscriber_id": "{{subscriber_id}}",
     "platform": "instagram",
     "handle": "{{ig_username}}",
     "name": "{{first_name}} {{last_name}}",
     "direction": "outbound",
     "message": "the text you just sent or received",
     "vertical": "Physical Clothing Stores (US)"
   }
   ```
   Set `"platform": "whatsapp"` and use the WhatsApp phone field for
   `handle` in the WhatsApp flow. Set `"direction": "inbound"` on the flow
   trigger that fires when a contact replies.

This is what flips a lead Cold to Contacted on your first outbound DM, and
Contacted to Warm the moment they reply, same as the cold email side.

## 5. Calendly

1. In `.env`, set `CALENDLY_WEBHOOK_SIGNING_KEY` to any random string you
   choose, then register a webhook subscription with Calendly's API (their
   dashboard doesn't expose this directly):
   ```
   curl -X POST https://api.calendly.com/webhook_subscriptions \
     -H "Authorization: Bearer <your Calendly API token>" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://<your-deployment>/api/webhooks/calendly",
       "events": ["invitee.created", "invitee.canceled"],
       "organization": "<your organization URI>",
       "scope": "organization",
       "signing_key": "<the same CALENDLY_WEBHOOK_SIGNING_KEY>"
     }'
   ```
   Your organization URI comes from `GET https://api.calendly.com/users/me`.

## 6. Deploy to Vercel

1. Push this repo to GitHub (already done if you're reading this from the
   repo).
2. Import it into Vercel, framework preset Next.js.
3. Add every variable from `.env` (except `AIRTABLE_WORKSPACE_ID`, that one
   was only for local setup) to the Vercel project's environment variables.
4. Set `CRON_SECRET` to any random string, both in Vercel's env vars and
   locally if you want to hit the cron routes manually.
5. Deploy. `vercel.json` already defines two scheduled jobs:
   - `/api/cron/sequence` daily, checks for replies then sends
     initial/follow-up emails
   - `/api/cron/rollup` daily, snapshots the funnel for the dashboard trend
     chart
   Vercel's free tier only allows daily cron runs. If you upgrade to Pro,
   tighten the schedule in `vercel.json` for faster reply detection.

## 7. Running the scraper

The scraper launches a real headless Chromium browser (Playwright). That
works great from your own machine:

```
npm run scrape -- "Physical Clothing Stores (US)" "clothing store" "Austin, TX"
```

It does not work out of the box on Vercel's default serverless runtime,
which doesn't ship a full browser and has short execution limits. The
dashboard's "Run a scrape" form calls the same code through
`/api/scrape`, useful once this app is hosted somewhere with real
Node/Playwright support (a small VPS, Railway, Render), but on Vercel it
will likely time out. Until then, run scrapes locally or from a scheduled
GitHub Action on your own machine's schedule, both write to the same
Airtable base either way.

## 8. Verifying it end to end

- [ ] `npm run setup:airtable` created the base, all 5 tables visible in
      Airtable
- [ ] `npm run seed:sequences` populated the Sequences table
- [ ] `npm run scrape -- "..." "..." "..."` creates Cold leads in Airtable
- [ ] Dashboard at your Vercel URL shows the leads and stats
- [ ] Hitting `/api/cron/sequence` (with the `Authorization: Bearer
      $CRON_SECRET` header) sends a real first-touch email to a Cold lead
      and flips it to Contacted
- [ ] Replying to that email from a different inbox flips the lead to Warm
      on the next `/api/cron/sequence` run
- [ ] A test ManyChat flow hitting `/api/webhooks/manychat` creates or
      updates a lead
- [ ] A test Calendly booking hits `/api/webhooks/calendly` and flips the
      lead to Booked
- [ ] `/api/cron/rollup` creates a row in Stats Snapshots and the
      dashboard's trend chart picks it up
