# Airtable schema

One base, five tables. Created automatically by `npm run setup:airtable`
(see `lib/config/createBase.ts`), documented here for reference and for
anyone extending the schema by hand.

## Leads

Every prospect, tagged by platform/vertical, moving through the funnel.

| Field | Type | Notes |
|---|---|---|
| Business Name | Single line text | |
| Email | Single line text | |
| Phone | Single line text | |
| Platform | Single select | Cold Email, Instagram, WhatsApp |
| Vertical | Single line text | Free text, not a fixed list, set per scrape/campaign |
| Source | Single line text | Which scraper source found them |
| Stage | Single select | Cold, Contacted, Warm, Booked, Client, Dead |
| Stage Updated At | Date/time | Set on every stage change |
| Contacted At | Date/time | Set the first time stage becomes Contacted |
| Warm At | Date/time | |
| Booked At | Date/time | |
| Client At | Date/time | |
| Dead At | Date/time | |
| Instagram Handle | Single line text | |
| WhatsApp Number | Single line text | |
| ManyChat Subscriber ID | Single line text | Used to match inbound/outbound ManyChat webhook events to a lead |
| Sequence Step | Number | Which cold email step this lead is currently on |
| Notes | Long text | |

## Interactions

Every touchpoint sent or received, linked to a lead. The raw log
everything else is computed from.

| Field | Type | Notes |
|---|---|---|
| Lead | Link to Leads | |
| Direction | Single select | Outbound, Inbound |
| Channel | Single select | Email, Instagram, WhatsApp |
| Step | Number | Sequence step number, if applicable |
| Content | Long text | |
| Occurred At | Date/time | |

## Sequences

Outreach scripts per platform/step, editable without touching automation.

| Field | Type | Notes |
|---|---|---|
| Platform | Single select | Cold Email, Instagram, WhatsApp |
| Vertical | Single line text | Matches a Lead's Vertical value |
| Step | Number | 1, 2, 3, ... |
| Delay Days | Number | Days after the previous step before sending this one |
| Subject | Single line text | Email only |
| Body | Long text | Supports `{{business_name}}` and `{{sender_name}}` tokens |
| Active | Checkbox | Inactive steps are skipped |

## Bookings

Confirmed calls, linked to a lead.

| Field | Type | Notes |
|---|---|---|
| Lead | Link to Leads | |
| Calendly Event URI | Single line text | Unique per booking, used to match cancellations |
| Scheduled At | Date/time | |
| Status | Single select | Scheduled, Canceled, Completed |

## Stats Snapshots

Nightly rollup of funnel counts and rates, for dashboard trend charts.

| Field | Type | Notes |
|---|---|---|
| Date | Date | One row per day |
| Total Leads | Number | |
| Cold / Contacted / Warm / Booked / Client / Dead | Number | Current count in each stage at rollup time |
| Cold to Warm Rate | Number | `% of leads that have a Warm At timestamp` |
| Warm to Booked Rate | Number | `% of Warm leads that have a Booked At timestamp` |
| Booked to Client Rate | Number | `% of Booked leads that have a Client At timestamp` |
| Platform Breakdown | Long text | JSON string, `{"Cold Email": 12, "Instagram": 5, "WhatsApp": 3}` |
