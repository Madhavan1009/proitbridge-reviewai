"use client";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  GitPullRequest,
  Zap,
} from "lucide-react";
import { Section, SectionHero } from "@/components/ui/Section";
import { StatCard } from "@/components/ui/StatCard";
import { SeverityTrendChart } from "@/components/dashboard/SeverityTrendChart";
import { CategoryDonut } from "@/components/dashboard/CategoryDonut";
import { TopFilesChart } from "@/components/dashboard/TopFilesChart";
import { AcceptRateChart } from "@/components/dashboard/AcceptRateChart";
import { mockStats } from "@/lib/mockData";

export default function AnalyticsPage() {
  return (
    <div className="animate-fade-in">
      <Section tone="dark">
        <SectionHero
          eyebrow={
            <>
              <BarChart3 className="h-3 w-3" />
              Review analytics
            </>
          }
          title={
            <>
              Is the bot actually{" "}
              <span className="text-gradient">helping?</span>
            </>
          }
          description="Four charts that answer that question with data. Accept rate is the headline — if developers consistently commit the bot's suggestions, it's adding value. If they don't, the prompt needs tuning."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="PRs reviewed"
            value={mockStats.prs_reviewed_week}
            icon={<GitPullRequest className="h-5 w-5" />}
            accent="brand"
            hint="Last 7 days"
            delta="+3 vs prev week"
          />
          <StatCard
            label="Findings posted"
            value={mockStats.findings_posted_week}
            icon={<Activity className="h-5 w-5" />}
            accent="medium"
            hint="Critical / High / Medium"
            delta="+12 vs prev week"
          />
          <StatCard
            label="Suggestions accepted"
            value={mockStats.suggestions_accepted_week}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accent="low"
            hint="Committed by developers"
            delta="71% accept rate"
          />
          <StatCard
            label="Accept rate"
            value={`${mockStats.accept_rate_pct}%`}
            icon={<Zap className="h-5 w-5" />}
            accent="cyan"
            hint="The bot's report card"
            delta="+6pp vs last week"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <SeverityTrendChart data={mockStats.severity_trend} />
          </div>
          <div>
            <CategoryDonut breakdown={mockStats.category_breakdown} />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AcceptRateChart data={mockStats.accept_rate_trend} />
          </div>
          <div>
            <TopFilesChart data={mockStats.top_files} />
          </div>
        </div>
      </Section>

      {/* WEEKLY DIGEST PREVIEW */}
      <Section tone="dark" className="!pt-0">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-gradient grid place-items-center text-white shadow-glow-blue">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 font-semibold">
                Weekly digest preview
              </p>
              <h3 className="text-lg font-semibold text-white tracking-tight">
                What the GitHub Actions cron will send to your manager
              </h3>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/[0.08] bg-navy-950/50 p-5 leading-relaxed text-slate-200 text-sm">
            <p>
              <span className="font-semibold text-white">Hey Engineering,</span>
            </p>
            <p className="mt-3">
              ReviewAI reviewed <span className="text-cyan-300 font-semibold">12 PRs</span> across{" "}
              <span className="text-cyan-300 font-semibold">3 repos</span> this week, posting{" "}
              <span className="text-cyan-300 font-semibold">47 findings</span>.
              Developers accepted{" "}
              <span className="text-emerald-300 font-semibold">71%</span> of suggestions —
              up 6 points from last week.
            </p>
            <p className="mt-3">
              The standout signal: <span className="text-rose-300 font-semibold">src/payments.py</span> received{" "}
              <span className="text-rose-300 font-semibold">8 findings</span> (4 critical) —
              this file is now the highest-flag concentration in the codebase
              and is a good candidate for a refactor sprint.
            </p>
            <p className="mt-3">
              Top categories this week: <span className="text-rose-300">Bugs (12)</span>,{" "}
              <span className="text-cyan-300">Test gaps (11)</span>,{" "}
              <span className="text-amber-300">Security (9)</span>. Slowest-to-merge PR:{" "}
              <span className="font-mono text-slate-300">payments-svc#138</span> (4 days,
              5 unresolved findings).
            </p>
            <p className="mt-3 text-slate-400 italic">
              — Sent every Monday at 09:00 IST · powered by Claude 3.5 Sonnet.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
