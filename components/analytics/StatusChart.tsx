"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface StatusCounts {
  TODO: number;
  IN_PROGRESS: number;
  REVIEW: number;
  DONE: number;
}

const STATUS_CONFIG = [
  { key: "TODO", label: "К выполнению", color: "#64748b" },
  { key: "IN_PROGRESS", label: "В работе", color: "#3b82f6" },
  { key: "REVIEW", label: "На проверке", color: "#f59e0b" },
  { key: "DONE", label: "Готово", color: "#22c55e" },
];

export default function StatusChart({
  statusCounts,
}: {
  statusCounts: StatusCounts;
}) {
  const data = STATUS_CONFIG.map((s) => ({
    name: s.label,
    value: statusCounts[s.key as keyof StatusCounts],
    color: s.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={12} />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" name="Задач" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
