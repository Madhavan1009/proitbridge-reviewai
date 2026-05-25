"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  GitPullRequest,
  Zap,
  Github,
  Sparkles,
} from "lucide-react";
import { PRRow } from "@/components/dashboard/PRRow";
import { cn } from "@/lib/utils";
import type { DashboardStats, Finding, PullRequest } from "@/lib/types";

type Filter = "all" | "open" | "merged" | "changes-requested";

const filters: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "merged", label: "Merged" },
  { key: "changes-requested", label: "Changes requested" },
];

export function DashboardClient({
  prs,
  findings,
  stats,
  dataSource,
}: {
  prs: PullRequest[];
  findings: Finding[];
  stats: DashboardStats;
  dataSource: "live" | "mock";
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filteredPRs = useMemo(() => {
    if (filter === "all") return prs;
    if (filter === "merged") return prs.filter((p) => p.status === "merged");
    if (filter === "open") return prs.filter((p) => p.status === "open");
    if (filter === "changes-requested")
      return prs.filter((p) => p.status === "open" && p.total_findings > 0);
    return prs;
  }, [filter, prs]);

  return (
    <div className="animate-fade-in px-6 lg:px-10 py-8 max-w-[1500px] mx-auto">
      {/* STAT STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <LightStat
          label="PRs reviewed (week)"
          value={stats.prs_reviewed_week}
          icon={<GitPullRequest className="h-5 w-5" />}
          accent="brand"
          hint="Across all watched repos"
        />
        <LightStat
          label="Findings posted"
          value={stats.findings_posted_week}
          icon={<AlertTriangle className="h-5 w-5" />}
          accent="amber"
          hint="Last 7 days"
        />
        <LightStat
          label="Suggestions accepted"
          value={stats.suggestions_accepted_week}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="emerald"
          hint="Committed by developers"
        />
        <LightStat
          label="Accept rate"
          value={`${stats.accept_rate_pct}%`}
          icon={<Zap className="h-5 w-5" />}
          accent="cyan"
          hint="The signal the bot is useful"
        />
      </div>

      {/* HERO */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] font-semibold text-brand-700 border border-brand-200 bg-brand-50">
            <Activity className="h-3 w-3" />
            Live PR Queue
          </div>
          <h1 className="mt-3 text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            Pull requests under{" "}
            <span className="text-gradient">active review</span>
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
            Click any row to expand the findings inline. Re-pushes automatically
            re-review — you'll see resolution markers appear as the bot revisits
            old findings.
          </p>
        </div>
        <DataSourcePill source={dataSource} />
      </div>

      {/* FILTER PILLS */}
      <div className="mb-5 flex items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "dash-chip transition-all",
              filter === f.key
                ? "text-white bg-brand-gradient border-transparent shadow-sm"
                : "text-slate-600 border-slate-200 bg-white hover:bg-slate-50"
            )}
          >
            {f.label}
            <span className="ml-1 font-mono text-[10px] opacity-70">
              {f.key === "all"
                ? prs.length
                : prs.filter((p) => {
                    if (f.key === "merged") return p.status === "merged";
                    if (f.key === "open") return p.status === "open";
                    if (f.key === "changes-requested")
                      return p.status === "open" && p.total_findings > 0;
                    return false;
                  }).length}
            </span>
          </button>
        ))}
        <a
          href="https://github.com/Madhavan1009"
          target="_blank"
          rel="noreferrer"
          className="ml-auto dash-btn-secondary !px-3 !py-1.5 text-xs"
        >
          <Github className="h-3.5 w-3.5" />
          View on GitHub
        </a>
      </div>

      {/* PR LIST */}
      <div className="space-y-3">
        {filteredPRs.length === 0 ? (
          <div className="dash-card p-10 text-center">
            <div className="mx-auto h-12 w-12 grid place-items-center rounded-2xl bg-brand-gradient shadow-sm">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              No PRs match this filter
            </h3>
            <p className="mt-1.5 max-w-md mx-auto text-sm text-slate-500">
              Try switching to 'All', or open a PR on a watched repo to trigger
              a review.
            </p>
          </div>
        ) : (
          filteredPRs.map((pr) => (
            <PRRow key={pr.id} pr={pr} findings={findings} />
          ))
        )}
      </div>
    </div>
  );
}

function LightStat({
  label,
  value,
  icon,
  accent,
  hint,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: "brand" | "amber" | "emerald" | "cyan";
  hint?: string;
}) {
  const accentColors: Record<typeof accent, string> = {
    brand: "text-brand-600 bg-brand-50 border-brand-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    cyan: "text-cyan-600 bg-cyan-50 border-cyan-100",
  };

  return (
    <div className="dash-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-slate-900">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <div
          className={cn(
            "h-10 w-10 rounded-xl grid place-items-center border",
            accentColors[accent]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

export function DataSourcePill({ source }: { source: "live" | "mock" }) {
  if (source === "live") {
    return (
      <span
        className="dash-chip text-emerald-700 border-emerald-200 bg-emerald-50"
        title="Reading findings from your Railway Postgres"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Live data · Postgres
      </span>
    );
  }
  return (
    <span
      className="dash-chip text-slate-600 border-slate-200 bg-slate-100"
      title="No DB rows yet — showing bundled demo data. Open a PR on the demo repo to populate."
    >
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Demo data · open a PR to populate
    </span>
  );
}
