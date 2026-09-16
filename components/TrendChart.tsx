"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface TrendPoint {
  date: string;
  coldToWarm: number;
  warmToBooked: number;
  bookedToClient: number;
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="card">
        <h2 className="mb-2 text-sm font-medium text-ink-muted">Conversion trend</h2>
        <p className="py-10 text-center text-sm text-ink-muted">
          No snapshots yet. The nightly rollup will start filling this in.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="mb-5 text-sm font-medium text-ink-muted">Conversion trend</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="rgb(var(--color-border))" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: "rgb(var(--color-ink-muted))", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "rgb(var(--color-border))" }}
            />
            <YAxis
              tick={{ fill: "rgb(var(--color-ink-muted))", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgb(var(--color-surface-raised))",
                border: "1px solid rgb(var(--color-border))",
                borderRadius: 12,
                color: "rgb(var(--color-ink))",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="coldToWarm"
              name="Cold to Warm"
              stroke="rgb(var(--color-stage-warm))"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="warmToBooked"
              name="Warm to Booked"
              stroke="rgb(var(--color-stage-booked))"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="bookedToClient"
              name="Booked to Client"
              stroke="rgb(var(--color-stage-client))"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
