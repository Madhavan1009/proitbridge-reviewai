"use client";

import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";

const stack = [
  { name: "n8n", role: "Orchestration" },
  { name: "Claude 3.5 Sonnet", role: "Reviewer LLM" },
  { name: "Next.js 14", role: "Dashboard" },
  { name: "Postgres", role: "State + analytics" },
  { name: "Railway", role: "Hosting" },
  { name: "Vercel", role: "Frontend" },
  { name: "GitHub", role: "Source of truth" },
  { name: "Semgrep", role: "Static analysis (optional)" },
];

export function TechStackBand() {
  return (
    <Section tone="dark">
      <div className="max-w-3xl">
        <p className="section-eyebrow-dark inline-flex">
          The stack
        </p>
        <h2 className="mt-3 text-2xl lg:text-3xl font-bold tracking-tight text-white text-balance">
          Built entirely on{" "}
          <span className="text-gradient">free-tier infrastructure.</span>
        </h2>
        <p className="mt-3 text-sm text-slate-300/90 leading-relaxed">
          No FastAPI middleman. No microservices. n8n orchestrates, Claude
          reviews, Next.js renders, Postgres remembers. That's the whole stack.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stack.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="glass-card p-4"
          >
            <p className="text-sm font-semibold text-white tracking-tight">
              {s.name}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-cyan-300/80">
              {s.role}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
