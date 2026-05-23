"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Section, SectionHero } from "@/components/ui/Section";

const rows = [
  {
    before: "PRs sit unreviewed for 2–5 days",
    after: "AI review posted within 10 seconds of PR open",
  },
  {
    before: "Junior devs miss security & perf issues",
    after: "Bot flags SQL injection, leaked secrets, and slow paths automatically",
  },
  {
    before: "Senior eng burns 4–6 hrs/week on first-pass review",
    after: "Bot handles the first pass; humans focus on architecture",
  },
  {
    before: "Inconsistent review quality across the team",
    after: "Same standards applied to every PR, every time",
  },
  {
    before: "'Looks good to me' reviews that miss bugs",
    after: "Every finding has line number, severity, and a suggested fix",
  },
  {
    before: "Manual changelog writing on every release",
    after: "Auto-generated from PR titles + AI summaries",
  },
];

export function BeforeAfter() {
  return (
    <Section tone="dark">
      <SectionHero
        eyebrow={<>Before · After</>}
        title={
          <>
            Replace the <span className="text-rose-300/90 line-through decoration-rose-400/60">"LGTM"</span>{" "}
            with <span className="text-gradient">structured intelligence.</span>
          </>
        }
        description="Code review has been broken at most teams for a decade. ReviewAI doesn't replace your seniors — it gives them back the 4–6 hours a week they were spending finding the obvious stuff."
      />

      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
        <div className="hidden md:grid grid-cols-2 px-6 py-4 border-b border-white/[0.06] bg-white/[0.03]">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-rose-300/90 font-semibold">
            <X className="h-4 w-4" />
            Before ReviewAI
          </div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-300 font-semibold">
            <Check className="h-4 w-4" />
            After ReviewAI
          </div>
        </div>
        <ul>
          {rows.map((row, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="grid md:grid-cols-2 border-b border-white/[0.05] last:border-b-0"
            >
              <div className="px-6 py-4 flex items-start gap-3 bg-rose-500/[0.04]">
                <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-rose-500/15 border border-rose-400/30 grid place-items-center">
                  <X className="h-3 w-3 text-rose-300" />
                </span>
                <span className="text-sm text-slate-200">{row.before}</span>
              </div>
              <div className="px-6 py-4 flex items-start gap-3 bg-emerald-500/[0.04]">
                <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-emerald-500/15 border border-emerald-400/30 grid place-items-center">
                  <Check className="h-3 w-3 text-emerald-300" />
                </span>
                <span className="text-sm text-white font-medium">
                  {row.after}
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
