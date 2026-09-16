import { listAllLeads } from "../airtable/leads";
import { listSnapshots } from "../airtable/snapshots";
import { listRecentInteractions } from "../airtable/interactions";
import { STAGES, PLATFORMS, type Stage, type Platform } from "../airtable/schema";

function rate(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export interface DashboardData {
  totalLeads: number;
  stageCounts: Record<Stage, number>;
  platformCounts: Record<Platform, number>;
  coldToWarmRate: number;
  warmToBookedRate: number;
  bookedToClientRate: number;
  trend: Array<{
    date: string;
    coldToWarm: number;
    warmToBooked: number;
    bookedToClient: number;
  }>;
  recentActivity: Array<{
    id: string;
    direction: string;
    channel: string;
    content: string;
    occurredAt: string;
  }>;
}

export async function getDashboardData(): Promise<DashboardData> {
  const [leads, snapshots, interactions] = await Promise.all([
    listAllLeads(),
    listSnapshots(30),
    listRecentInteractions(15),
  ]);

  const stageCounts = Object.fromEntries(STAGES.map((s) => [s, 0])) as Record<
    Stage,
    number
  >;
  for (const lead of leads) {
    stageCounts[lead.fields.Stage] = (stageCounts[lead.fields.Stage] ?? 0) + 1;
  }

  const platformCounts = Object.fromEntries(
    PLATFORMS.map((p) => [p, leads.filter((l) => l.fields.Platform === p).length])
  ) as Record<Platform, number>;

  const reachedWarm = leads.filter((l) => Boolean(l.fields["Warm At"])).length;
  const reachedBooked = leads.filter((l) => Boolean(l.fields["Booked At"])).length;
  const reachedClient = leads.filter((l) => Boolean(l.fields["Client At"])).length;

  return {
    totalLeads: leads.length,
    stageCounts,
    platformCounts,
    coldToWarmRate: rate(reachedWarm, leads.length),
    warmToBookedRate: rate(reachedBooked, reachedWarm),
    bookedToClientRate: rate(reachedClient, reachedBooked),
    trend: snapshots.map((s) => ({
      date: s.fields.Date,
      coldToWarm: s.fields["Cold to Warm Rate"],
      warmToBooked: s.fields["Warm to Booked Rate"],
      bookedToClient: s.fields["Booked to Client Rate"],
    })),
    recentActivity: interactions.map((i) => ({
      id: i.id,
      direction: i.fields.Direction,
      channel: i.fields.Channel,
      content: i.fields.Content ?? "",
      occurredAt: i.fields["Occurred At"],
    })),
  };
}
