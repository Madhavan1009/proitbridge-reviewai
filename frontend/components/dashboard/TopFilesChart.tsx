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
    <div className="dash-card p-5 h-full">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">
        Most-flagged files
      </p>
      <p className="mt-1 text-sm text-slate-700">
        Where to start your next refactor.
      </p>

      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
            <CartesianGrid
              stroke="rgba(15,23,42,0.08)"
              strokeDasharray="3 3"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="rgba(15,23,42,0.45)"
              fontSize={11}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="file"
              stroke="rgba(15,23,42,0.6)"
              fontSize={11}
              width={130}
              tick={{ fontFamily: "ui-monospace, monospace" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid rgba(15,23,42,0.12)",
                borderRadius: "10px",
                fontSize: "12px",
                boxShadow: "0 8px 20px -8px rgba(15,23,42,0.15)",
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={`rgba(4, 107, 210, ${0.95 - i * 0.08})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
