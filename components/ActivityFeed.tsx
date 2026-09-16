function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ActivityFeed({
  items,
}: {
  items: Array<{
    id: string;
    direction: string;
    channel: string;
    content: string;
    occurredAt: string;
  }>;
}) {
  return (
    <div className="card">
      <h2 className="mb-5 text-sm font-medium text-ink-muted">Recent activity</h2>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-muted">Nothing yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span
                className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  item.direction === "Inbound" ? "bg-stage-client" : "bg-accent"
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-ink">
                  <span className="text-ink-muted">
                    {item.direction === "Inbound" ? "Received" : "Sent"} via {item.channel}
                  </span>
                </p>
                <p className="truncate text-xs text-ink-muted">{item.content}</p>
              </div>
              <span className="shrink-0 text-xs text-ink-muted">
                {timeAgo(item.occurredAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
