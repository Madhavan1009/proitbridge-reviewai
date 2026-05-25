"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AcceptRateChart({
  data,
}: {
  data: Array<{ day: string; rate: number }>;
}) {
  return (
    <div className="dash-card p-5">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-brand-600 font-semibold">
            The killer metric
          </p>
          <p className="mt-1 text-base font-semibold text-slate-900">
            Accept rate over time
          </p>
          <p className="text-xs text-slate-500">
            Proves the bot is genuinely useful — not just noisy.
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-slate-900 tabular-nums">
            {data[data.length - 1]?.rate ?? 0}
            <span className="text-base text-slate-500">%</span>
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Latest
          </p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="line-accent" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#046bd2" />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="rgba(15,23,42,0.08)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              stroke="rgba(15,23,42,0.45)"
              fontSize={11}
              tickFormatter={(d) =>
                new Date(d).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis
              stroke="rgba(15,23,42,0.45)"
              fontSize={11}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <ReferenceLine
              y={50}
              stroke="rgba(245, 158, 11, 0.5)"
              strokeDasharray="4 4"
              label={{
                value: "50% baseline",
                position: "insideTopRight",
                fill: "rgba(245, 158, 11, 0.9)",
                fontSize: 10,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid rgba(15,23,42,0.12)",
                borderRadius: "10px",
                fontSize: "12px",
                boxShadow: "0 8px 20px -8px rgba(15,23,42,0.15)",
              }}
              formatter={(v: number) => [`${v}%`, "Accept rate"]}
            />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="url(#line-accent)"
              strokeWidth={2.5}
              dot={{ fill: "#22d3ee", strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: "#22d3ee" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
