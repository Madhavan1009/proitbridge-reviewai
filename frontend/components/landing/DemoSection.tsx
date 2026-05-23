"use client";

import { motion } from "framer-motion";
import { PlayCircle, Sparkles } from "lucide-react";
import { Section, SectionHero } from "@/components/ui/Section";

export function DemoSection() {
  return (
    <Section tone="light">
      <SectionHero
        tone="light"
        align="center"
        eyebrow={
          <>
            <PlayCircle className="h-3 w-3" />
            60-second walkthrough
          </>
        }
        title={
          <>
            Watch a junior dev open a PR with a SQL injection,{" "}
            <span className="text-gradient">and the bot catch it.</span>
          </>
        }
        description="Real PR. Real review. No splicing. From git push to inline comment to one-click fix to bot-marked-resolved — all hands-off."
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-4xl"
      >
        <div className="relative aspect-video rounded-3xl overflow-hidden border border-slate-200 shadow-[0_30px_60px_-30px_rgba(15,23,42,0.4)] bg-navy-950">
          {/* Placeholder for the demo video embed — replace src once the video is uploaded */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900" />
            <div className="absolute inset-0 bg-brand-radial opacity-60" />
            <div className="relative text-center px-6">
              <div className="mx-auto h-20 w-20 rounded-full bg-brand-gradient grid place-items-center shadow-glow-blue animate-pulse-glow">
                <PlayCircle className="h-10 w-10 text-white" />
              </div>
              <p className="mt-6 text-white text-lg font-semibold">
                Demo video coming after launch
              </p>
              <p className="mt-1.5 text-sm text-slate-300 max-w-md mx-auto">
                The 60-second walkthrough showing a PR going from open →
                reviewed → fixed → resolved.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-4 gap-3 text-center">
          {[
            { t: "0:00", l: "PR opened" },
            { t: "0:10", l: "Bot review posted" },
            { t: "0:30", l: "Dev accepts suggestion" },
            { t: "0:45", l: "Bot marks resolved" },
          ].map((s) => (
            <div
              key={s.t}
              className="card-light p-3 flex flex-col items-center"
            >
              <span className="text-xs font-mono text-brand-600">{s.t}</span>
              <span className="text-sm font-semibold text-slate-900 mt-1">
                {s.l}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 inline-flex items-center gap-2 justify-center w-full">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
          What you just saw: PR opened → AI reviews → developer accepts
          suggestion → AI re-reviews and marks resolved.
        </p>
      </motion.div>
    </Section>
  );
}
