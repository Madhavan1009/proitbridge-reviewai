"use client";

import { useState } from "react";
import {
  Github,
  Key,
  Lock,
  RefreshCw,
  Settings as SettingsIcon,
  ShieldCheck,
  Slack,
} from "lucide-react";
import { Section, SectionHero } from "@/components/ui/Section";
import { cn } from "@/lib/utils";

const initialRepos = [
  {
    repo: "Madhavan1009/payments-svc",
    enabled: true,
    min_severity: "medium" as const,
    max_findings: 5,
  },
  {
    repo: "Madhavan1009/api-gateway",
    enabled: true,
    min_severity: "high" as const,
    max_findings: 5,
  },
  {
    repo: "Madhavan1009/etl-jobs",
    enabled: true,
    min_severity: "medium" as const,
    max_findings: 8,
  },
  {
    repo: "Madhavan1009/notifications",
    enabled: false,
    min_severity: "high" as const,
    max_findings: 3,
  },
];

export default function SettingsPage() {
  const [repos, setRepos] = useState(initialRepos);
  const [webhookSecret, setWebhookSecret] = useState(
    "whsec_" + "*".repeat(28)
  );

  function regenerateSecret() {
    const fresh =
      "whsec_" + Math.random().toString(36).slice(2, 12) + Math.random().toString(36).slice(2, 12);
    setWebhookSecret(fresh);
  }

  return (
    <div className="animate-fade-in">
      <Section tone="dark">
        <SectionHero
          eyebrow={
            <>
              <SettingsIcon className="h-3 w-3" />
              Configuration
            </>
          }
          title={
            <>
              Tune the bot{" "}
              <span className="text-gradient">per repository.</span>
            </>
          }
          description="Severity thresholds, max findings per PR, and which repos the bot is allowed to comment on. These persist to Postgres on save."
        />

        {/* REPOS */}
        <div className="glass-card overflow-hidden mb-6">
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-3">
            <Github className="h-4 w-4 text-cyan-300" />
            <h3 className="text-sm font-semibold text-white">
              Watched repositories
            </h3>
            <span className="ml-auto text-[11px] text-slate-400">
              {repos.filter((r) => r.enabled).length} of {repos.length} active
            </span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {repos.map((r, i) => (
              <div
                key={r.repo}
                className="px-5 py-4 grid lg:grid-cols-[1fr_auto_auto_auto] gap-4 items-center"
              >
                <div>
                  <p className="font-mono text-sm text-white">{r.repo}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Webhook delivers · {r.enabled ? "Active" : "Paused"}
                  </p>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Min severity</span>
                  <select
                    value={r.min_severity}
                    onChange={(e) => {
                      const v = e.target.value as typeof r.min_severity;
                      setRepos((rs) =>
                        rs.map((row, j) =>
                          i === j ? { ...row, min_severity: v } : row
                        )
                      );
                    }}
                    className="input-base !w-auto !py-1.5"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <span>Max findings / PR</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={r.max_findings}
                    onChange={(e) => {
                      const v = parseInt(e.target.value || "1", 10);
                      setRepos((rs) =>
                        rs.map((row, j) =>
                          i === j ? { ...row, max_findings: v } : row
                        )
                      );
                    }}
                    className="input-base !w-20 !py-1.5"
                  />
                </label>

                <button
                  onClick={() =>
                    setRepos((rs) =>
                      rs.map((row, j) =>
                        i === j ? { ...row, enabled: !row.enabled } : row
                      )
                    )
                  }
                  className={cn(
                    "chip transition-all min-w-[88px] justify-center",
                    r.enabled
                      ? "text-emerald-300 border-emerald-300/30 bg-emerald-300/5"
                      : "text-slate-400 border-slate-400/30 bg-slate-400/5"
                  )}
                >
                  {r.enabled ? "● Active" : "○ Paused"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECRETS */}
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="glass-card p-5">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-cyan-300" />
              <h3 className="text-sm font-semibold text-white">
                Anthropic API key
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Stored encrypted on the n8n side. Edit the value in Railway's env
              vars — never in this UI directly.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-navy-950/50 px-3 py-2">
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              <code className="text-xs text-slate-300 font-mono flex-1">
                sk-ant-{"*".repeat(28)}
              </code>
              <span className="chip text-emerald-300 border-emerald-300/30 bg-emerald-300/5 !py-0.5 !px-2 text-[10px]">
                Configured
              </span>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
              <h3 className="text-sm font-semibold text-white">
                GitHub webhook secret
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Used to HMAC-verify incoming webhooks. Regenerating invalidates
              the old secret — you'll need to update GitHub too.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-navy-950/50 px-3 py-2">
              <Lock className="h-3.5 w-3.5 text-slate-500" />
              <code className="text-xs text-slate-300 font-mono flex-1 truncate">
                {webhookSecret}
              </code>
              <button
                onClick={regenerateSecret}
                className="chip text-cyan-300 border-cyan-300/30 bg-cyan-300/5 hover:bg-cyan-300/10 !py-0.5 !px-2 text-[10px] transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Regenerate
              </button>
            </div>
          </div>

          <div className="glass-card p-5 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Slack className="h-4 w-4 text-cyan-300" />
              <h3 className="text-sm font-semibold text-white">
                Notification preferences
              </h3>
            </div>
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              <label className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 h-4 w-4 accent-brand-500"
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    Slack on PR merge
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Posts a changelog entry to #releases when a PR with findings
                    is merged.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 h-4 w-4 accent-brand-500"
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    Weekly digest email
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Sent every Monday 09:00 IST with finding totals and top
                    categories.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button className="btn-secondary">Reset</button>
          <button className="btn-primary">Save changes</button>
        </div>
      </Section>
    </div>
  );
}
