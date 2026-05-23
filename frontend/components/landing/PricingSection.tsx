"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Github, Sparkles, ArrowRight } from "lucide-react";
import { Section, SectionHero } from "@/components/ui/Section";

const tiers = [
  {
    name: "Self-hosted",
    price: "$0",
    period: "forever",
    description: "Fork the repo, deploy it yourself. Unlimited everything.",
    features: [
      "Unlimited PRs reviewed",
      "All severities (critical → nit)",
      "Re-review on push",
      "Postgres analytics",
      "MIT licensed",
      "Bring your own Claude key",
    ],
    cta: { label: "View on GitHub", href: "https://github.com/Madhavan1009", icon: <Github className="h-4 w-4" /> },
    accent: false,
  },
  {
    name: "Cloud Starter",
    price: "$19",
    period: "/ month",
    description: "We host n8n + Postgres for you. One org, unlimited PRs.",
    features: [
      "1 GitHub org · unlimited repos",
      "Hosted n8n & Postgres",
      "Email + Slack notifications",
      "Weekly review-quality digest",
      "Email support",
      "Onboard in 5 minutes",
    ],
    cta: { label: "Start free trial", href: "#", icon: <ArrowRight className="h-4 w-4" /> },
    accent: true,
    badge: "Most popular",
  },
  {
    name: "Cloud Team",
    price: "$49",
    period: "/ month",
    description: "Multi-org, priority Claude inference, custom rules.",
    features: [
      "Multi-org · multi-tenant",
      "Priority Claude routing",
      "Custom .aireview.yml rules per repo",
      "Auto-fix PRs (bot opens its own)",
      "SSO + audit log",
      "Priority support",
    ],
    cta: { label: "Talk to us", href: "#", icon: <ArrowRight className="h-4 w-4" /> },
    accent: false,
  },
];

export function PricingSection() {
  return (
    <Section tone="light" id="pricing">
      <SectionHero
        tone="light"
        align="center"
        eyebrow={
          <>
            <Sparkles className="h-3 w-3" />
            Pricing
          </>
        }
        title={
          <>
            The bot is free. Hosting is{" "}
            <span className="text-gradient">your call.</span>
          </>
        }
        description="Self-host on free-tier Railway + Vercel for $0, or pay us to babysit the infra. Either way, the source is on GitHub."
      />

      <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {tiers.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
            className={
              "relative rounded-3xl border p-6 flex flex-col " +
              (t.accent
                ? "bg-navy-900 border-brand-500/40 text-white shadow-[0_30px_60px_-30px_rgba(4,107,210,0.5)]"
                : "card-light")
            }
          >
            {t.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 chip text-cyan-300 border-cyan-300/40 bg-navy-950 shadow-glow text-[10px]">
                <Sparkles className="h-3 w-3" />
                {t.badge}
              </span>
            )}

            <div>
              <h3
                className={
                  "text-lg font-bold tracking-tight " +
                  (t.accent ? "text-white" : "text-slate-900")
                }
              >
                {t.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span
                  className={
                    "text-4xl font-bold tracking-tight " +
                    (t.accent ? "text-white" : "text-slate-900")
                  }
                >
                  {t.price}
                </span>
                <span
                  className={
                    "text-sm " + (t.accent ? "text-slate-400" : "text-slate-500")
                  }
                >
                  {t.period}
                </span>
              </div>
              <p
                className={
                  "mt-2 text-sm leading-relaxed " +
                  (t.accent ? "text-slate-300" : "text-slate-600")
                }
              >
                {t.description}
              </p>
            </div>

            <ul className="mt-5 flex-1 space-y-2.5">
              {t.features.map((f) => (
                <li
                  key={f}
                  className={
                    "flex items-start gap-2 text-sm " +
                    (t.accent ? "text-slate-200" : "text-slate-700")
                  }
                >
                  <Check
                    className={
                      "h-4 w-4 mt-0.5 shrink-0 " +
                      (t.accent ? "text-cyan-300" : "text-brand-500")
                    }
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={t.cta.href}
              target={t.cta.href.startsWith("http") ? "_blank" : undefined}
              rel={t.cta.href.startsWith("http") ? "noreferrer" : undefined}
              className={
                "mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all " +
                (t.accent
                  ? "bg-brand-gradient text-white shadow-glow-blue hover:brightness-110"
                  : "bg-slate-900 text-white hover:bg-slate-800")
              }
            >
              {t.cta.label}
              {t.cta.icon}
            </Link>
          </motion.div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-slate-500 max-w-2xl mx-auto">
        Pricing tiers are illustrative. ProITBridge ReviewAI is open source —
        fork it and host it free, forever. We may launch a managed cloud at
        the prices above if there's enough demand.
      </p>
    </Section>
  );
}
