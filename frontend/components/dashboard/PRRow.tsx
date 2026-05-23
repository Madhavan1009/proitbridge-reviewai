"use client";

import Link from "next/link";
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
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="shrink-0 h-9 w-9 rounded-xl bg-white/[0.04] border border-white/10 grid place-items-center text-cyan-300">
          {pr.status === "merged" ? (
            <GitMerge className="h-4 w-4" />
          ) : (
            <GitPullRequest className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white truncate">
              {pr.title}
            </p>
            <span className="font-mono text-[11px] text-slate-500">
              #{pr.pr_number}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
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
                    "chip !py-0.5 !px-2 text-[10px] font-mono tabular-nums",
                    sev === "critical" &&
                      "text-risk-critical border-risk-critical/40 bg-risk-critical/10",
                    sev === "high" &&
                      "text-risk-high border-risk-high/40 bg-risk-high/10",
                    sev === "medium" &&
                      "text-risk-medium border-risk-medium/40 bg-risk-medium/10",
                    sev === "low" &&
                      "text-risk-low border-risk-low/40 bg-risk-low/10",
                    sev === "nit" &&
                      "text-slate-400 border-slate-400/40 bg-slate-400/10"
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
            className="border-t border-white/[0.06] overflow-hidden"
          >
            <div className="px-5 py-4 space-y-3 bg-white/[0.02]">
              {prFindings.length === 0 ? (
                <p className="text-sm text-slate-400 italic">
                  No findings — clean PR.
                </p>
              ) : (
                prFindings.map((f) => <FindingItem key={f.id} finding={f} />)
              )}

              <div className="pt-3 border-t border-white/[0.06] flex items-center gap-3 text-xs">
                <a
                  href={`https://github.com/${pr.repo}/pull/${pr.pr_number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1"
                >
                  <Github className="h-3.5 w-3.5" />
                  Open on GitHub
                </a>
                <span className="font-mono text-slate-500">
                  {pr.head_sha}
                </span>
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
      <span className="chip text-violet-300 border-violet-300/30 bg-violet-300/5 shrink-0">
        Merged
      </span>
    );
  }
  if (totalFindings === 0) {
    return (
      <span className="chip text-emerald-300 border-emerald-300/30 bg-emerald-300/5 shrink-0">
        Clean
      </span>
    );
  }
  return (
    <span className="chip text-amber-300 border-amber-300/30 bg-amber-300/5 shrink-0">
      Changes requested
    </span>
  );
}

function FindingItem({ finding }: { finding: Finding }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
      <div className="flex items-center gap-2 flex-wrap">
        <SeverityBadge severity={finding.severity} />
        <CategoryChip category={finding.category} />
        <span className="ml-auto font-mono text-[11px] text-slate-500">
          {finding.file_path}:{finding.line_number}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-200 leading-relaxed">
        {finding.message}
      </p>
      {finding.suggestion && (
        <pre className="mt-2.5 rounded-lg bg-emerald-400/[0.05] border border-emerald-400/20 px-3 py-2 text-[11.5px] text-emerald-100/95 overflow-x-auto whitespace-pre mono">
          {finding.suggestion}
        </pre>
      )}
      {finding.rationale && (
        <p className="mt-2 text-[12px] text-slate-400 leading-relaxed italic">
          {finding.rationale}
        </p>
      )}
      {finding.resolved && (
        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_-1px_rgba(52,211,153,0.8)]" />
          Resolved
        </div>
      )}
    </div>
  );
}
