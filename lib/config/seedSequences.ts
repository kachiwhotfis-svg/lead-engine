import "dotenv/config";
import { createSequenceStep } from "../airtable/sequences";
import type { SequenceFields } from "../airtable/schema";

const VERTICAL = "Physical Clothing Stores (US)";

const steps: SequenceFields[] = [
  {
    Platform: "Cold Email",
    Vertical: VERTICAL,
    Step: 1,
    "Delay Days": 0,
    Subject: "Quick question about after-hours DMs",
    Body: `Hey {{business_name}},

Noticed {{business_name}} is active on Instagram, so you're probably getting DMs asking about sizing, restocks, and order status outside store hours too.

I build automated systems that answer those instantly and hand off to a human when it matters. Built one for a clinic that now handles booking questions around the clock, no missed leads.

Worth a 15 minute call to see if something similar fits your store?

{{sender_name}}`,
    Active: true,
  },
  {
    Platform: "Cold Email",
    Vertical: VERTICAL,
    Step: 2,
    "Delay Days": 3,
    Subject: "Re: Quick question about after-hours DMs",
    Body: `Following up in case this got buried.

Most stores lose sales to slow DM replies during busy hours, not lack of interest. An automated first response (still sounds like you, not a bot) fixes that without hiring anyone.

Happy to show you a 2 minute example if useful.

{{sender_name}}`,
    Active: true,
  },
  {
    Platform: "Cold Email",
    Vertical: VERTICAL,
    Step: 3,
    "Delay Days": 7,
    Subject: "Closing the loop",
    Body: `I'll stop following up after this one.

If faster customer response ever becomes a priority, I'm here. Otherwise, good luck with the season.

{{sender_name}}`,
    Active: true,
  },
  {
    Platform: "Instagram",
    Vertical: VERTICAL,
    Step: 1,
    "Delay Days": 0,
    Body: `Hey! Love what you're doing with {{business_name}} \u{1F64C} Quick one, do you handle sizing/restock DMs yourself or does someone help out?`,
    Active: true,
  },
  {
    Platform: "Instagram",
    Vertical: VERTICAL,
    Step: 2,
    "Delay Days": 3,
    Body: `No worries if you're slammed! Just flagging, I help stores like yours set up auto-replies for the common DM questions so nothing sits unanswered. Want a quick example?`,
    Active: true,
  },
  {
    Platform: "Instagram",
    Vertical: VERTICAL,
    Step: 3,
    "Delay Days": 7,
    Body: `All good, I'll leave it here! If DM volume ever gets overwhelming, feel free to reach out.`,
    Active: true,
  },
  {
    Platform: "WhatsApp",
    Vertical: VERTICAL,
    Step: 1,
    "Delay Days": 0,
    Body: `Hi {{business_name}}, quick question, when someone messages your store number asking "do you have this in stock?", who's answering that right now?`,
    Active: true,
  },
  {
    Platform: "WhatsApp",
    Vertical: VERTICAL,
    Step: 2,
    "Delay Days": 3,
    Body: `Following up, no pressure. I set up automated WhatsApp responses for common questions (stock, sizing, hours) so customers get an instant reply even when no one's free. Want to see how it works?`,
    Active: true,
  },
  {
    Platform: "WhatsApp",
    Vertical: VERTICAL,
    Step: 3,
    "Delay Days": 7,
    Body: `I'll stop here for now. If instant customer replies ever become a priority, just message me anytime.`,
    Active: true,
  },
];

async function main() {
  for (const step of steps) {
    const created = await createSequenceStep(step);
    console.log(`Created ${step.Platform} step ${step.Step} -> ${created.id}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
