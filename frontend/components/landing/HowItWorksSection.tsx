"use client";

import { motion } from "framer-motion";
import {
  Github,
  Brain,
  MessageSquare,
  Database,
  Workflow,
} from "lucide-react";
import { Section, SectionHero } from "@/components/ui/Section";
import { WorkflowFlow } from "@/components/workflow/WorkflowFlow";

const steps = [
  {
    icon: <Github className="h-5 w-5" />,
    title: "1 · Webhook fires",
    body: "GitHub posts a pull_request.opened event to your n8n webhook. n8n verifies the HMAC signature and pulls the changed files via the GitHub API.",
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: "2 · Claude reviews",
    body: "For each changed file, Claude 3.5 Sonnet reads the diff in the context of the full file. It returns structured JSON findings with line numbers, severity, and suggested fixes.",
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "3 · Inline comments",
    body: "Every finding becomes a GitHub review comment, posted on the exact line, with a one-click suggestion block the developer can commit directly from the UI.",
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: "4 · Track & learn",
    body: "Findings land in Postgres. Re-pushes trigger automatic re-review and resolved-marker updates. Accept rate becomes a metric you can actually optimize.",
  },
];

export function HowItWorksSection() {
  return (
    <Section tone="dark" id="how-it-works">
      <SectionHero
        eyebrow={
          <>
            <Workflow className="h-3 w-3" />
            How it works
          </>
        }
        title={
          <>
            From <span className="text-gradient">git push</span> to inline
            review in 10 seconds.
          </>
        }
        description="Four nodes. n8n is the orchestrator. Claude is the reviewer. Postgres is the memory. GitHub is the surface area. No Kubernetes, no microservices, no FastAPI middleman."
      />

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <WorkflowFlow />
        </div>
        <div className="lg:col-span-5 grid sm:grid-cols-2 lg:grid-cols-1 gap-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="glass-card p-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-brand-gradient grid place-items-center text-white shadow-glow-blue">
                  {s.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-300/90 leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}
