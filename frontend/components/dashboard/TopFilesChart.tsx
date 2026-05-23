"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function TopFilesChart({
  data,
}: {
  data: Array<{ file: string; count: number }>;
}) {
  return (
    <div className="glass-card p-5 h-full">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">
        Most-flagged files
      </p>
      <p className="mt-1 text-sm text-slate-200">
        Where to start your next refactor.
      </p>

      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 3"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="rgba(255,255,255,0.4)"
              fontSize={11}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="file"
              stroke="rgba(255,255,255,0.55)"
              fontSize={11}
              width={130}
              tick={{ fontFamily: "ui-monospace, monospace" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0b1d3f",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "10px",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={`rgba(34, 211, 238, ${0.95 - i * 0.1})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
