"use client";

import { useMemo, useState } from "react";
import { Filter, Github, Search, Sparkles } from "lucide-react";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { CategoryChip } from "@/components/ui/CategoryChip";
import { DataSourcePill } from "@/components/dashboard/DashboardClient";
import { AutoRefreshChip } from "@/components/dashboard/AutoRefreshChip";
import { cn, timeAgo } from "@/lib/utils";
import type { Category, Finding, PullRequest, Severity } from "@/lib/types";

const severities: Array<Severity | "all"> = [
  "all",
  "critical",
  "high",
  "medium",
  "low",
  "nit",
];
const categories: Array<Category | "all"> = [
  "all",
  "bug",
  "security",
  "performance",
  "test",
  "style",
  "docs",
];

export function FindingsClient({
  findings,
  prs,
  dataSource,
}: {
  findings: Finding[];
  prs: PullRequest[];
  dataSource: "live" | "mock";
}) {
  const [sev, setSev] = useState<Severity | "all">("all");
  const [cat, setCat] = useState<Category | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return findings.filter((f) => {
      if (sev !== "all" && f.severity !== sev) return false;
      if (cat !== "all" && f.category !== cat) return false;
      if (q && !f.message.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [findings, sev, cat, q]);

  return (
    <div className="animate-fade-in px-6 lg:px-10 py-8 max-w-[1500px] mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] font-semibold text-brand-700 border border-brand-200 bg-brand-50">
            <Filter className="h-3 w-3" />
            All findings
          </div>
          <h1 className="mt-3 text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Every issue flagged across{" "}
            <span className="text-gradient">every PR.</span>
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
            Filter by severity, category, or search the message text. Click
            'View on GitHub' to jump straight to the inline comment.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <DataSourcePill source={dataSource} />
          <AutoRefreshChip />
        </div>
      </div>

      {/* SEARCH + FILTERS */}
      <div className="mb-5 grid lg:grid-cols-[1fr_auto_auto] gap-3 items-start">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search findings — e.g. 'sql injection', 'race condition'..."
            className="dash-input !pl-10"
          />
        </label>
        <select
          value={sev}
          onChange={(e) => setSev(e.target.value as Severity | "all")}
          className="dash-input !w-auto"
        >
          {severities.map((s) => (
            <option key={s} value={s}>
              Severity: {s}
            </option>
          ))}
        </select>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value as Category | "all")}
          className="dash-input !w-auto"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              Category: {c}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="dash-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-[0.16em] text-slate-500 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Severity</th>
                <th className="text-left px-5 py-3 font-semibold">Category</th>
                <th className="text-left px-5 py-3 font-semibold">File</th>
                <th className="text-left px-5 py-3 font-semibold w-1/2">
                  Message
                </th>
                <th className="text-left px-5 py-3 font-semibold">Accepted</th>
                <th className="text-left px-5 py-3 font-semibold">When</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10">
                    <div className="text-center">
                      <div className="mx-auto h-12 w-12 grid place-items-center rounded-2xl bg-brand-gradient shadow-sm">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        No findings match
                      </h3>
                      <p className="mt-1.5 max-w-md mx-auto text-sm text-slate-500">
                        Try clearing the filters or widening the severity
                        range.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((f, i) => {
                  const pr = prs.find((p) => p.id === f.pr_id);
                  return (
                    <tr
                      key={f.id}
                      className={cn(
                        "border-b border-slate-100 last:border-b-0 hover:bg-slate-50/60 transition-colors",
                        i % 2 === 1 && "bg-slate-50/30"
                      )}
                    >
                      <td className="px-5 py-3">
                        <SeverityBadge severity={f.severity} tone="light" />
                      </td>
                      <td className="px-5 py-3">
                        <CategoryChip category={f.category} tone="light" />
                      </td>
                      <td className="px-5 py-3 font-mono text-[12px] text-slate-700 whitespace-nowrap">
                        {f.file_path}
                        <span className="text-slate-400">:{f.line_number}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-800">{f.message}</td>
                      <td className="px-5 py-3">
                        <AcceptedPill value={f.accepted} />
                      </td>
                      <td className="px-5 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                        {timeAgo(f.created_at)}
                      </td>
                      <td className="px-3 py-3">
                        {pr && (
                          <a
                            href={`https://github.com/${pr.repo}/pull/${pr.pr_number}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 text-[12px]"
                            title="View on GitHub"
                          >
                            <Github className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Showing {filtered.length} of {findings.length} findings.
      </p>
    </div>
  );
}

function AcceptedPill({ value }: { value: boolean | null }) {
  if (value === true) {
    return (
      <span className="dash-chip text-emerald-700 border-emerald-200 bg-emerald-50 !py-0.5 !px-2 text-[10px]">
        ✓ Accepted
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="dash-chip text-rose-700 border-rose-200 bg-rose-50 !py-0.5 !px-2 text-[10px]">
        ✗ Rejected
      </span>
    );
  }
  return (
    <span className="dash-chip text-slate-500 border-slate-200 bg-slate-100 !py-0.5 !px-2 text-[10px]">
      Pending
    </span>
  );
}
