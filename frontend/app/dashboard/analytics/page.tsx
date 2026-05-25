"use client";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  GitPullRequest,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SeverityTrendChart } from "@/components/dashboard/SeverityTrendChart";
import { CategoryDonut } from "@/components/dashboard/CategoryDonut";
import { TopFilesChart } from "@/components/dashboard/TopFilesChart";
import { AcceptRateChart } from "@/components/dashboard/AcceptRateChart";
import { mockStats } from "@/lib/mockData";

export default function AnalyticsPage() {
  return (
    <div className="animate-fade-in px-6 lg:px-10 py-8 max-w-[1500px] mx-auto">
      {/* HERO */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] font-semibold text-brand-700 border border-brand-200 bg-brand-50">
          <BarChart3 className="h-3 w-3" />
          Review analytics
        </div>
        <h1 className="mt-3 text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Is the bot actually <span className="text-gradient">helping?</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
          Four charts that answer that question with data. Accept rate is the
          headline — if developers consistently commit the bot's suggestions,
          it's adding value. If they don't, the prompt needs tuning.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <LightStat
          label="PRs reviewed"
          value={mockStats.prs_reviewed_week}
          icon={<GitPullRequest className="h-5 w-5" />}
          accent="brand"
          delta="+3 vs prev week"
        />
        <LightStat
          label="Findings posted"
          value={mockStats.findings_posted_week}
          icon={<Activity className="h-5 w-5" />}
          accent="amber"
          delta="+12 vs prev week"
        />
        <LightStat
          label="Suggestions accepted"
          value={mockStats.suggestions_accepted_week}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accent="emerald"
          delta="71% accept rate"
        />
        <LightStat
          label="Accept rate"
          value={`${mockStats.accept_rate_pct}%`}
          icon={<Zap className="h-5 w-5" />}
          accent="cyan"
          delta="+6pp vs last week"
        />
      </div>

      {/* CHARTS */}
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <SeverityTrendChart data={mockStats.severity_trend} />
        </div>
        <div>
          <CategoryDonut breakdown={mockStats.category_breakdown} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <AcceptRateChart data={mockStats.accept_rate_trend} />
        </div>
        <div>
          <TopFilesChart data={mockStats.top_files} />
        </div>
      </div>

      {/* WEEKLY DIGEST PREVIEW */}
      <div className="dash-card p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-brand-gradient grid place-items-center text-white shadow-sm">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brand-700 font-semibold">
              Weekly digest preview
            </p>
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
              What the GitHub Actions cron sends to your manager
            </h3>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 leading-relaxed text-slate-700 text-sm">
          <p>
            <span className="font-semibold text-slate-900">Hey Engineering,</span>
          </p>
          <p className="mt-3">
            ReviewAI reviewed{" "}
            <span className="text-brand-700 font-semibold">12 PRs</span> across{" "}
            <span className="text-brand-700 font-semibold">3 repos</span> this
            week, posting{" "}
            <span className="text-brand-700 font-semibold">47 findings</span>.
            Developers accepted{" "}
            <span className="text-emerald-700 font-semibold">71%</span> of
            suggestions — up 6 points from last week.
          </p>
          <p className="mt-3">
            The standout signal:{" "}
            <span className="text-rose-700 font-semibold">
              src/payments.py
            </span>{" "}
            received{" "}
            <span className="text-rose-700 font-semibold">8 findings</span> (4
            critical) — this file is now the highest-flag concentration in the
            codebase and is a good candidate for a refactor sprint.
          </p>
          <p className="mt-3">
            Top categories this week:{" "}
            <span className="text-rose-700">Bugs (12)</span>,{" "}
            <span className="text-cyan-700">Test gaps (11)</span>,{" "}
            <span className="text-amber-700">Security (9)</span>. Slowest-to-
            merge PR:{" "}
            <span className="font-mono text-slate-600">payments-svc#138</span>{" "}
            (4 days, 5 unresolved findings).
          </p>
          <p className="mt-3 text-slate-500 italic">
            — Sent every Monday at 09:00 IST · powered by Claude.
          </p>
        </div>
      </div>
    </div>
  );
}

function LightStat({
  label,
  value,
  icon,
  accent,
  delta,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent: "brand" | "amber" | "emerald" | "cyan";
  delta?: string;
}) {
  const accentColors: Record<typeof accent, string> = {
    brand: "text-brand-600 bg-brand-50 border-brand-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    cyan: "text-cyan-600 bg-cyan-50 border-cyan-100",
  };
  const accentText: Record<typeof accent, string> = {
    brand: "text-brand-700",
    amber: "text-amber-700",
    emerald: "text-emerald-700",
    cyan: "text-cyan-700",
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
      {delta && (
        <div className={cn("mt-4 text-xs font-semibold", accentText[accent])}>
          {delta}
        </div>
      )}
    </div>
  );
}
