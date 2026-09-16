import { getDashboardData } from "@/lib/dashboard/data";
import { StatTile } from "@/components/StatTile";
import { PipelineFunnel } from "@/components/PipelineFunnel";
import { PlatformBreakdown } from "@/components/PlatformBreakdown";
import { TrendChart } from "@/components/TrendChart";
import { ActivityFeed } from "@/components/ActivityFeed";
import { ScrapeForm } from "@/components/ScrapeForm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let data;
  let setupError: string | null = null;

  try {
    data = await getDashboardData();
  } catch (err) {
    setupError = err instanceof Error ? err.message : "Failed to load Airtable data";
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Lead Engine</h1>
          <p className="text-sm text-ink-muted">Cold to client, tracked end to end.</p>
        </div>
      </header>

      {setupError ? (
        <div className="card-raised border-accent/40">
          <p className="text-sm text-ink">
            Dashboard can&apos;t reach Airtable yet: <span className="text-ink-muted">{setupError}</span>
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            Set <code className="rounded bg-surface px-1 py-0.5">AIRTABLE_API_KEY</code> and{" "}
            <code className="rounded bg-surface px-1 py-0.5">AIRTABLE_BASE_ID</code> in your
            environment, see <code className="rounded bg-surface px-1 py-0.5">docs/SETUP.md</code>.
          </p>
        </div>
      ) : data ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatTile label="Total leads" value={String(data.totalLeads)} />
            <StatTile label="Cold to Warm" value={`${data.coldToWarmRate}%`} />
            <StatTile label="Warm to Booked" value={`${data.warmToBookedRate}%`} />
            <StatTile label="Booked to Client" value={`${data.bookedToClientRate}%`} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PipelineFunnel counts={data.stageCounts} />
            </div>
            <PlatformBreakdown counts={data.platformCounts} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TrendChart data={data.trend} />
            </div>
            <ActivityFeed items={data.recentActivity} />
          </div>

          <ScrapeForm />
        </div>
      ) : null}
    </main>
  );
}
