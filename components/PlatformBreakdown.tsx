import { PLATFORMS, type Platform } from "@/lib/airtable/schema";

const PLATFORM_COLOR: Record<Platform, string> = {
  "Cold Email": "rgb(var(--color-accent))",
  Instagram: "rgb(var(--color-stage-contacted))",
  WhatsApp: "rgb(var(--color-stage-client))",
};

export function PlatformBreakdown({ counts }: { counts: Record<Platform, number> }) {
  const total = Math.max(1, PLATFORMS.reduce((sum, p) => sum + (counts[p] ?? 0), 0));

  return (
    <div className="card">
      <h2 className="mb-5 text-sm font-medium text-ink-muted">Leads by platform</h2>
      <div className="flex h-3 overflow-hidden rounded-full bg-surface-raised">
        {PLATFORMS.map((platform) => {
          const count = counts[platform] ?? 0;
          const pct = (count / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={platform}
              style={{ width: `${pct}%`, backgroundColor: PLATFORM_COLOR[platform] }}
            />
          );
        })}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {PLATFORMS.map((platform) => (
          <div key={platform} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-ink-muted">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: PLATFORM_COLOR[platform] }}
              />
              {platform}
            </span>
            <span className="font-medium text-ink">{counts[platform] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
