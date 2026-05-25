"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Github,
  GitMerge,
  GitPullRequest,
  User,
  Clock,
} from "lucide-react";
import { cn, severityLabel, timeAgo } from "@/lib/utils";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { CategoryChip } from "@/components/ui/CategoryChip";
import type { Finding, PullRequest, Severity } from "@/lib/types";

export function PRRow({
  pr,
  findings,
}: {
  pr: PullRequest;
  findings: Finding[];
}) {
  const [open, setOpen] = useState(false);
  const prFindings = findings.filter((f) => f.pr_id === pr.id);
  const counts = pr.findings_by_severity ?? {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    nit: 0,
  };

  return (
    <div className="dash-card overflow-hidden dash-card-hover">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center gap-4"
      >
        <div className="shrink-0 h-9 w-9 rounded-xl bg-brand-50 border border-brand-100 grid place-items-center text-brand-600">
          {pr.status === "merged" ? (
            <GitMerge className="h-4 w-4" />
          ) : (
            <GitPullRequest className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {pr.title}
            </p>
            <span className="font-mono text-[11px] text-slate-400">
              #{pr.pr_number}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Github className="h-3 w-3" />
              <span className="font-mono">{pr.repo}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <User className="h-3 w-3" />
              {pr.author}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo(pr.reviewed_at)}
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          {(["critical", "high", "medium", "low", "nit"] as Severity[]).map(
            (sev) =>
              counts[sev] > 0 ? (
                <span
                  key={sev}
                  className={cn(
                    "dash-chip !py-0.5 !px-2 text-[10px] font-mono tabular-nums",
                    sev === "critical" && "sev-critical",
                    sev === "high" && "sev-high",
                    sev === "medium" && "sev-medium",
                    sev === "low" && "sev-low",
                    sev === "nit" && "sev-nit"
                  )}
                  title={`${counts[sev]} ${severityLabel[sev]}`}
                >
                  {counts[sev]} {severityLabel[sev]}
                </span>
              ) : null
          )}
        </div>

        <StatusBadge status={pr.status} totalFindings={pr.total_findings} />

        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-200 overflow-hidden"
          >
            <div className="px-5 py-4 space-y-3 bg-slate-50/50">
              {prFindings.length === 0 ? (
                <p className="text-sm text-slate-500 italic">
                  No findings — clean PR.
                </p>
              ) : (
                prFindings.map((f) => <FindingItem key={f.id} finding={f} />)
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center gap-3 text-xs">
                <a
                  href={`https://github.com/${pr.repo}/pull/${pr.pr_number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  <Github className="h-3.5 w-3.5" />
                  Open on GitHub
                </a>
                <span className="font-mono text-slate-400">{pr.head_sha}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({
  status,
  totalFindings,
}: {
  status: PullRequest["status"];
  totalFindings: number;
}) {
  if (status === "merged") {
    return (
      <span className="dash-chip text-violet-700 border-violet-200 bg-violet-50 shrink-0">
        Merged
      </span>
    );
  }
  if (totalFindings === 0) {
    return (
      <span className="dash-chip text-emerald-700 border-emerald-200 bg-emerald-50 shrink-0">
        Clean
      </span>
    );
  }
  return (
    <span className="dash-chip text-amber-700 border-amber-200 bg-amber-50 shrink-0">
      Changes requested
    </span>
  );
}

function FindingItem({ finding }: { finding: Finding }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex items-center gap-2 flex-wrap">
        <SeverityBadge severity={finding.severity} tone="light" />
        <CategoryChip category={finding.category} tone="light" />
        <span className="ml-auto font-mono text-[11px] text-slate-400">
          {finding.file_path}:{finding.line_number}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-800 leading-relaxed">
        {finding.message}
      </p>
      {finding.suggestion && (
        <pre className="mt-2.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11.5px] text-emerald-900 overflow-x-auto whitespace-pre mono">
          {finding.suggestion}
        </pre>
      )}
      {finding.rationale && (
        <p className="mt-2 text-[12px] text-slate-500 leading-relaxed italic">
          {finding.rationale}
        </p>
      )}
      {finding.resolved && (
        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Resolved
        </div>
      )}
    </div>
  );
}
