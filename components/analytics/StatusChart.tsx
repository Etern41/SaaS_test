"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface StatusCounts {
  TODO: number;
  IN_PROGRESS: number;
  REVIEW: number;
  DONE: number;
}

const STATUS_CONFIG = [
  { key: "TODO", label: "К выполнению", color: "#94a3b8" },
  { key: "IN_PROGRESS", label: "В работе", color: "#3b82f6" },
  { key: "REVIEW", label: "На проверке", color: "#f59e0b" },
  { key: "DONE", label: "Готово", color: "#10b981" },
];

/** Horizontal bars + category on Y — long Russian labels stay readable on narrow screens */
export default function StatusChart({ statusCounts }: { statusCounts: StatusCounts }) {
  const data = STATUS_CONFIG.map((s) => ({
    name: s.label,
    count: statusCounts[s.key as keyof StatusCounts],
    color: s.color,
  }));

  const chartHeight = Math.max(220, data.length * 52);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
      >
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={118}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(var(--border))",
            background: "hsl(var(--card))",
            color: "hsl(var(--card-foreground))",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,.07)",
            fontSize: "13px",
          }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Bar dataKey="count" name="Задач" radius={[0, 6, 6, 0]} maxBarSize={26} barSize={22}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
