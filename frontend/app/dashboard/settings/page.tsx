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
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const N8N_URL =
  process.env.NEXT_PUBLIC_N8N_URL ||
  "https://n8n-production-6b0c.up.railway.app";

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
      "whsec_" +
      Math.random().toString(36).slice(2, 12) +
      Math.random().toString(36).slice(2, 12);
    setWebhookSecret(fresh);
  }

  return (
    <div className="animate-fade-in px-6 lg:px-10 py-8 max-w-[1500px] mx-auto">
      {/* HERO */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em] font-semibold text-brand-700 border border-brand-200 bg-brand-50">
          <SettingsIcon className="h-3 w-3" />
          Configuration
        </div>
        <h1 className="mt-3 text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
          Tune the bot <span className="text-gradient">per repository.</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-2xl">
          Severity thresholds, max findings per PR, and which repos the bot is
          allowed to comment on. These persist to Postgres on save.
        </p>
      </div>

      {/* REPOS TABLE */}
      <div className="dash-card overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Github className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            Watched repositories
          </h3>
          <span className="ml-auto text-[11px] text-slate-500">
            {repos.filter((r) => r.enabled).length} of {repos.length} active
          </span>
        </div>
        <div className="divide-y divide-slate-200">
          {repos.map((r, i) => (
            <div
              key={r.repo}
              className="px-5 py-4 grid lg:grid-cols-[1fr_auto_auto_auto] gap-4 items-center"
            >
              <div>
                <p className="font-mono text-sm text-slate-900">{r.repo}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Webhook delivers · {r.enabled ? "Active" : "Paused"}
                </p>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-700">
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
                  className="dash-input !w-auto !py-1.5"
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700">
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
                  className="dash-input !w-20 !py-1.5"
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
                  "dash-chip transition-all min-w-[88px] justify-center",
                  r.enabled
                    ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                    : "text-slate-500 border-slate-200 bg-slate-100"
                )}
              >
                {r.enabled ? "● Active" : "○ Paused"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECRETS + WORKFLOW LINK */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="dash-card p-5">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Anthropic API key
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Stored as an n8n Header Auth credential. Edit via the n8n UI — not
            in this dashboard.
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <code className="text-xs text-slate-700 font-mono flex-1">
              sk-ant-{"*".repeat(28)}
            </code>
            <span className="dash-chip text-emerald-700 border-emerald-200 bg-emerald-50 !py-0.5 !px-2 text-[10px]">
              Configured
            </span>
          </div>
        </div>

        <div className="dash-card p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              GitHub webhook secret
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Used to HMAC-verify incoming webhooks. Regenerating invalidates the
            old secret — update GitHub too.
          </p>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Lock className="h-3.5 w-3.5 text-slate-400" />
            <code className="text-xs text-slate-700 font-mono flex-1 truncate">
              {webhookSecret}
            </code>
            <button
              onClick={regenerateSecret}
              className="dash-chip text-brand-700 border-brand-200 bg-brand-50 hover:bg-brand-100 !py-0.5 !px-2 text-[10px] transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Regenerate
            </button>
          </div>
        </div>

        <div className="dash-card p-5 lg:col-span-2">
          <div className="flex items-center gap-2">
            <Slack className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Notification preferences
            </h3>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-3">
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 cursor-pointer hover:border-slate-300">
              <input
                type="checkbox"
                defaultChecked
                className="mt-0.5 h-4 w-4 accent-brand-500"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Slack on PR merge
                </p>
                <p className="text-[11px] text-slate-500">
                  Posts a changelog entry to #releases when a PR with findings
                  is merged.
                </p>
              </div>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 cursor-pointer hover:border-slate-300">
              <input
                type="checkbox"
                defaultChecked
                className="mt-0.5 h-4 w-4 accent-brand-500"
              />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Weekly digest email
                </p>
                <p className="text-[11px] text-slate-500">
                  Sent every Monday 09:00 IST with finding totals and top
                  categories.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="dash-card p-5 lg:col-span-2 bg-brand-50/40 border-brand-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-gradient grid place-items-center text-white shadow-sm">
              <ExternalLink className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900">
                n8n workflow backend
              </h3>
              <p className="mt-0.5 text-xs text-slate-600">
                Edit the pr-review workflow, view executions, tweak the Claude
                prompt directly.
              </p>
            </div>
            <a
              href={N8N_URL}
              target="_blank"
              rel="noreferrer"
              className="dash-btn-primary"
            >
              Open n8n
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <button className="dash-btn-secondary">Reset</button>
        <button className="dash-btn-primary">Save changes</button>
      </div>
    </div>
  );
}
