import { STAGES, type Stage } from "@/lib/airtable/schema";

const STAGE_COLOR_VAR: Record<Stage, string> = {
  Cold: "var(--color-stage-cold)",
  Contacted: "var(--color-stage-contacted)",
  Warm: "var(--color-stage-warm)",
  Booked: "var(--color-stage-booked)",
  Client: "var(--color-stage-client)",
  Dead: "var(--color-stage-dead)",
};

export function PipelineFunnel({ counts }: { counts: Record<Stage, number> }) {
  const max = Math.max(1, ...STAGES.map((s) => counts[s] ?? 0));

  return (
    <div className="card">
      <h2 className="mb-5 text-sm font-medium text-ink-muted">Pipeline by stage</h2>
      <div className="flex flex-col gap-3">
        {STAGES.map((stage) => {
          const count = counts[stage] ?? 0;
          const widthPct = Math.max(4, (count / max) * 100);
          return (
            <div key={stage} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-sm text-ink-muted">{stage}</span>
              <div className="h-8 flex-1 overflow-hidden rounded-lg bg-surface-raised">
                <div
                  className="h-full rounded-lg transition-all"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: `rgb(${STAGE_COLOR_VAR[stage]})`,
                  }}
                />
              </div>
              <span className="w-10 shrink-0 text-right text-sm font-medium text-ink">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
