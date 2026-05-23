"use client";

import { useMemo, useState } from "react";
import { Filter, Github, Search } from "lucide-react";
import { Section, SectionHero } from "@/components/ui/Section";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { CategoryChip } from "@/components/ui/CategoryChip";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn, timeAgo } from "@/lib/utils";
import { mockFindings, mockPRs } from "@/lib/mockData";
import type { Category, Severity } from "@/lib/types";

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

export default function FindingsPage() {
  const [sev, setSev] = useState<Severity | "all">("all");
  const [cat, setCat] = useState<Category | "all">("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return mockFindings.filter((f) => {
      if (sev !== "all" && f.severity !== sev) return false;
      if (cat !== "all" && f.category !== cat) return false;
      if (q && !f.message.toLowerCase().includes(q.toLowerCase()))
        return false;
      return true;
    });
  }, [sev, cat, q]);

  return (
    <div className="animate-fade-in">
      <Section tone="dark">
        <SectionHero
          eyebrow={
            <>
              <Filter className="h-3 w-3" />
              All findings
            </>
          }
          title={
            <>
              Every issue flagged across{" "}
              <span className="text-gradient">every PR.</span>
            </>
          }
          description="Filter by severity, category, or search the message text. Click 'View on GitHub' to jump straight to the inline comment."
        />

        <div className="mb-5 grid lg:grid-cols-[1fr_auto_auto] gap-3 items-start">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search findings — e.g. 'sql injection', 'race condition'..."
              className="input-base !pl-10"
            />
          </label>
          <select
            value={sev}
            onChange={(e) => setSev(e.target.value as Severity | "all")}
            className="input-base !w-auto"
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
            className="input-base !w-auto"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-[0.16em] text-slate-400 bg-white/[0.02]">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">Severity</th>
                  <th className="text-left px-5 py-3 font-semibold">
                    Category
                  </th>
                  <th className="text-left px-5 py-3 font-semibold">File</th>
                  <th className="text-left px-5 py-3 font-semibold w-1/2">
                    Message
                  </th>
                  <th className="text-left px-5 py-3 font-semibold">
                    Accepted
                  </th>
                  <th className="text-left px-5 py-3 font-semibold">When</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10">
                      <EmptyState
                        title="No findings match"
                        description="Try clearing the filters or widening the severity range."
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map((f) => {
                    const pr = mockPRs.find((p) => p.id === f.pr_id);
                    return (
                      <tr
                        key={f.id}
                        className="border-t border-white/[0.06] hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3">
                          <SeverityBadge severity={f.severity} />
                        </td>
                        <td className="px-5 py-3">
                          <CategoryChip category={f.category} />
                        </td>
                        <td className="px-5 py-3 font-mono text-[12px] text-slate-300 whitespace-nowrap">
                          {f.file_path}
                          <span className="text-slate-500">
                            :{f.line_number}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-200">
                          {f.message}
                        </td>
                        <td className="px-5 py-3">
                          <AcceptedPill value={f.accepted} />
                        </td>
                        <td className="px-5 py-3 text-[11px] text-slate-400 whitespace-nowrap">
                          {timeAgo(f.created_at)}
                        </td>
                        <td className="px-3 py-3">
                          {pr && (
                            <a
                              href={`https://github.com/${pr.repo}/pull/${pr.pr_number}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-cyan-300 hover:text-cyan-200 inline-flex items-center gap-1 text-[12px]"
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
          Showing {filtered.length} of {mockFindings.length} findings.
        </p>
      </Section>
    </div>
  );
}

function AcceptedPill({ value }: { value: boolean | null }) {
  if (value === true) {
    return (
      <span className="chip text-emerald-300 border-emerald-300/30 bg-emerald-300/5 !py-0.5 !px-2 text-[10px]">
        ✓ Accepted
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="chip text-rose-300 border-rose-300/30 bg-rose-300/5 !py-0.5 !px-2 text-[10px]">
        ✗ Rejected
      </span>
    );
  }
  return (
    <span
      className={cn(
        "chip text-slate-400 border-slate-400/30 bg-slate-400/5 !py-0.5 !px-2 text-[10px]"
      )}
    >
      Pending
    </span>
  );
}
