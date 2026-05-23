"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Github,
  GitPullRequest,
  Zap,
} from "lucide-react";
import { Section, SectionHero } from "@/components/ui/Section";
import { StatCard } from "@/components/ui/StatCard";
import { PRRow } from "@/components/dashboard/PRRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { mockFindings, mockPRs, mockStats } from "@/lib/mockData";

type Filter = "all" | "open" | "merged" | "changes-requested";

const filters: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "merged", label: "Merged" },
  { key: "changes-requested", label: "Changes requested" },
];

export default function DashboardPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const filteredPRs = useMemo(() => {
    if (filter === "all") return mockPRs;
    if (filter === "merged")
      return mockPRs.filter((p) => p.status === "merged");
    if (filter === "open") return mockPRs.filter((p) => p.status === "open");
    if (filter === "changes-requested")
      return mockPRs.filter(
        (p) => p.status === "open" && p.total_findings > 0
      );
    return mockPRs;
  }, [filter]);

  return (
    <div className="animate-fade-in">
      {/* STAT STRIP */}
      <Section tone="dark" className="!py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="PRs reviewed (week)"
            value={mockStats.prs_reviewed_week}
            icon={<GitPullRequest className="h-5 w-5" />}
            accent="brand"
            hint="Across all watched repos"
          />
          <StatCard
            label="Findings posted"
            value={mockStats.findings_posted_week}
            icon={<AlertTriangle className="h-5 w-5" />}
            accent="medium"
            hint="Last 7 days"
          />
          <StatCard
            label="Suggestions accepted"
            value={mockStats.suggestions_accepted_week}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accent="low"
            hint="Committed by developers"
          />
          <StatCard
            label="Accept rate"
            value={`${mockStats.accept_rate_pct}%`}
            icon={<Zap className="h-5 w-5" />}
            accent="cyan"
            hint="The signal the bot is useful"
          />
        </div>
      </Section>

      {/* PR QUEUE */}
      <Section tone="dark" className="!pt-0">
        <SectionHero
          eyebrow={
            <>
              <Activity className="h-3 w-3" />
              Live PR queue
            </>
          }
          title={
            <>
              Pull requests under{" "}
              <span className="text-gradient">active review</span>
            </>
          }
          description="Click any row to expand the findings inline. Re-pushes automatically re-review — you'll see resolution markers appear as the bot revisits old findings."
        />

        <div className="mb-5 flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "chip transition-all",
                filter === f.key
                  ? "text-white bg-brand-gradient border-transparent shadow-glow-blue"
                  : "text-slate-300 border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
              )}
            >
              {f.label}
              <span className="ml-1 font-mono text-[10px] opacity-70">
                {f.key === "all"
                  ? mockPRs.length
                  : mockPRs.filter((p) => {
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
            className="ml-auto chip text-slate-300 border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            View on GitHub
          </a>
        </div>

        <div className="space-y-3">
          {filteredPRs.length === 0 ? (
            <EmptyState
              title="No PRs match this filter"
              description="Try switching to 'All' or open a PR on a watched repo to trigger a review."
            />
          ) : (
            filteredPRs.map((pr) => (
              <PRRow key={pr.id} pr={pr} findings={mockFindings} />
            ))
          )}
        </div>
      </Section>
    </div>
  );
}
