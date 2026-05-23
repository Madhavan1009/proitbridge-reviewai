"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardStats } from "@/lib/types";

const colors = {
  critical: "#dc2626",
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e",
  nit: "#94a3b8",
};

export function SeverityTrendChart({
  data,
}: {
  data: DashboardStats["severity_trend"];
}) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">
            7-day finding trend
          </p>
          <p className="mt-1 text-sm text-slate-200">
            Stacked by severity, all watched repos.
          </p>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              {Object.entries(colors).map(([k, c]) => (
                <linearGradient
                  key={k}
                  id={`g-${k}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={c} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke="rgba(255,255,255,0.4)"
              fontSize={11}
              tickFormatter={(d) =>
                new Date(d).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis
              stroke="rgba(255,255,255,0.4)"
              fontSize={11}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0b1d3f",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#f8fafc" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              iconType="circle"
            />
            {(["critical", "high", "medium", "low", "nit"] as const).map(
              (k) => (
                <Area
                  key={k}
                  type="monotone"
                  dataKey={k}
                  stackId="1"
                  stroke={colors[k]}
                  fill={`url(#g-${k})`}
                  strokeWidth={1.5}
                />
              )
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
