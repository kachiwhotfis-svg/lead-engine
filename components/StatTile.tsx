export function StatTile({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption?: string;
}) {
  return (
    <div className="card flex flex-col gap-1">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-3xl font-semibold tracking-tight text-ink">{value}</span>
      {caption ? <span className="text-xs text-ink-muted">{caption}</span> : null}
    </div>
  );
}
