"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { Category } from "@/lib/types";
import { categoryLabel } from "@/lib/utils";

const palette: Record<Category, string> = {
  bug: "#fb7185",
  security: "#f59e0b",
  performance: "#a78bfa",
  test: "#22d3ee",
  style: "#94a3b8",
  docs: "#5fd6f3",
};

export function CategoryDonut({
  breakdown,
}: {
  breakdown: Record<Category, number>;
}) {
  const data = (Object.keys(breakdown) as Category[]).map((k) => ({
    name: categoryLabel[k],
    key: k,
    value: breakdown[k],
  }));
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="dash-card p-5 h-full">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">
        Category breakdown
      </p>
      <p className="mt-1 text-sm text-slate-700">
        Distribution of findings over the last 7 days.
      </p>

      <div className="mt-4 grid grid-cols-[180px_1fr] gap-4 items-center">
        <div className="relative h-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={48}
                outerRadius={72}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {data.map((d) => (
                  <Cell key={d.key} fill={palette[d.key]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(15,23,42,0.12)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  boxShadow: "0 8px 20px -8px rgba(15,23,42,0.15)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="text-center">
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {total}
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Findings
              </p>
            </div>
          </div>
        </div>

        <ul className="space-y-1.5">
          {data.map((d) => (
            <li
              key={d.key}
              className="flex items-center gap-2 text-xs text-slate-700"
            >
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: palette[d.key] }}
              />
              <span className="flex-1">{d.name}</span>
              <span className="font-mono tabular-nums text-slate-500">
                {d.value}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
