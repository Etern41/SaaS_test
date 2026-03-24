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

export default function StatusChart({ statusCounts }: { statusCounts: StatusCounts }) {
  const data = STATUS_CONFIG.map((s) => ({
    name: s.label,
    count: statusCounts[s.key as keyof StatusCounts],
    color: s.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "hsl(220, 9%, 46%)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "hsl(220, 14%, 96%)" }}
          contentStyle={{
            borderRadius: "8px",
            border: "1px solid hsl(220, 13%, 90%)",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,.07)",
            fontSize: "13px",
          }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Bar dataKey="count" name="Задач" radius={[6, 6, 0, 0]} maxBarSize={60}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
