"use client";

import { motion } from "framer-motion";
import { Bug, Lock, Zap, FlaskConical } from "lucide-react";
import { Section, SectionHero } from "@/components/ui/Section";

const catches = [
  {
    icon: <Lock className="h-5 w-5" />,
    accent: "from-rose-500 to-amber-500",
    title: "Security",
    blurb: "SQL injection, XSS, hardcoded secrets, weak hashing, missing auth checks.",
    sample: 'query = f"SELECT * FROM users WHERE id={user_id}"',
    flag: "Critical · Use parameterized queries.",
  },
  {
    icon: <Bug className="h-5 w-5" />,
    accent: "from-rose-500 to-pink-500",
    title: "Bugs",
    blurb: "Race conditions, null derefs, off-by-one, missing error paths, broken transactions.",
    sample: "value = cache.get(key) or 0\ncache.set(key, value + 1)",
    flag: "High · TOCTOU race — use atomic INCR.",
  },
  {
    icon: <Zap className="h-5 w-5" />,
    accent: "from-violet-500 to-blue-500",
    title: "Performance",
    blurb: "N+1 queries, O(n²) loops, unbounded recursion, missing indexes, blocking I/O.",
    sample:
      "for i in range(len(items)):\n  for j in range(len(items)):\n    ...",
    flag: "Medium · Quadratic complexity. Use a Counter.",
  },
  {
    icon: <FlaskConical className="h-5 w-5" />,
    accent: "from-emerald-500 to-cyan-500",
    title: "Missing tests",
    blurb:
      "Detects untested code paths in changed files — especially security and money-handling code.",
    sample: "def transfer(from_id, to_id, amount): ...",
    flag: "High · Critical function with no test coverage.",
  },
];

export function WhatItCatches() {
  return (
    <Section tone="light">
      <SectionHero
        tone="light"
        align="center"
        eyebrow={<>What it catches</>}
        title={
          <>
            Every PR gets the{" "}
            <span className="text-gradient">same standards.</span> Every time.
          </>
        }
        description="The bot scans diffs across four categories. Findings are ranked by severity. Only critical / high / medium issues are posted by default — no nitpicks unless you ask for them."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {catches.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="card-light p-5 flex flex-col"
          >
            <div
              className={`h-11 w-11 rounded-xl grid place-items-center text-white bg-gradient-to-br ${c.accent} shadow-glow`}
            >
              {c.icon}
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 tracking-tight">
              {c.title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              {c.blurb}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <pre className="text-[11px] leading-relaxed text-slate-700 bg-slate-50 rounded-lg p-2.5 overflow-x-auto font-mono whitespace-pre">
                {c.sample}
              </pre>
              <p className="mt-2.5 text-[11px] text-rose-600 font-semibold">
                ⚠ {c.flag}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
