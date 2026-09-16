import { listAllLeads } from "../airtable/leads";
import { createSnapshot } from "../airtable/snapshots";
import { STAGES, PLATFORMS, type StatsSnapshotFields } from "../airtable/schema";

function rate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export async function runNightlyRollup(): Promise<StatsSnapshotFields> {
  const leads = await listAllLeads();

  const stageCounts = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<
    (typeof STAGES)[number],
    number
  >;
  for (const lead of leads) {
    stageCounts[lead.fields.Stage] = (stageCounts[lead.fields.Stage] ?? 0) + 1;
  }

  const reachedWarm = leads.filter((l) => Boolean(l.fields["Warm At"])).length;
  const reachedBooked = leads.filter((l) => Boolean(l.fields["Booked At"])).length;
  const reachedClient = leads.filter((l) => Boolean(l.fields["Client At"])).length;

  const platformBreakdown = Object.fromEntries(
    PLATFORMS.map((p) => [p, leads.filter((l) => l.fields.Platform === p).length])
  );

  const fields: StatsSnapshotFields = {
    Date: new Date().toISOString().slice(0, 10),
    "Total Leads": leads.length,
    Cold: stageCounts.Cold,
    Contacted: stageCounts.Contacted,
    Warm: stageCounts.Warm,
    Booked: stageCounts.Booked,
    Client: stageCounts.Client,
    Dead: stageCounts.Dead,
    "Cold to Warm Rate": rate(reachedWarm, leads.length),
    "Warm to Booked Rate": rate(reachedBooked, reachedWarm),
    "Booked to Client Rate": rate(reachedClient, reachedBooked),
    "Platform Breakdown": JSON.stringify(platformBreakdown),
  };

  await createSnapshot(fields);
  return fields;
}
