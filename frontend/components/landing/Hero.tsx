"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Github,
  Shield,
  Sparkles,
  Zap,
  CheckCircle2,
  Brain,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
        <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-cyan-400/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="px-6 lg:px-10 py-16 lg:py-24 max-w-[1500px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="section-eyebrow-dark">
                <Shield className="h-3 w-3" />
                Open Source · Self-Hosted Code Review
              </p>
              <h1 className="mt-4 text-4xl lg:text-6xl font-bold tracking-tight text-white text-balance leading-[1.05]">
                Code reviews that{" "}
                <span className="text-gradient">never sleep.</span>
              </h1>
              <p className="mt-5 text-base lg:text-lg text-slate-300/90 leading-relaxed max-w-2xl">
                ProITBridge ReviewAI watches your pull requests 24/7.
                Senior-engineer-quality feedback in 10 seconds, inline on the
                diff, with one-click fixes. Self-hosted, open source,{" "}
                <span className="text-cyan-300 font-semibold">
                  $0 infrastructure.
                </span>
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard"
                  className="btn-primary !px-5 !py-3 text-base"
                >
                  Try the Live Demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://github.com/Madhavan1009"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary !px-5 !py-3 text-base"
                >
                  <Github className="h-4 w-4" />
                  View on GitHub
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <HeroBadge
                  icon={<CheckCircle2 className="h-3.5 w-3.5" />}
                  label="10s avg review"
                />
                <HeroBadge
                  icon={<Brain className="h-3.5 w-3.5" />}
                  label="Claude 3.5 Sonnet"
                />
                <HeroBadge
                  icon={<Zap className="h-3.5 w-3.5" />}
                  label="71% accept rate"
                />
                <HeroBadge
                  icon={<Sparkles className="h-3.5 w-3.5" />}
                  label="MIT licensed"
                />
              </div>

              <div className="mt-10 pt-6 border-t border-white/[0.08] flex flex-wrap gap-x-8 gap-y-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                <StatLine value="10s" label="Avg review latency" />
                <StatLine value="71%" label="Suggestions accepted" />
                <StatLine value="4" label="Critical bugs this week" />
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-6"
          >
            <HeroPRMock />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="chip text-slate-100 border-white/20 bg-white/[0.06] backdrop-blur">
      <span className="text-cyan-300">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

function StatLine({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-white tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-0.5 text-[10px]">{label}</p>
    </div>
  );
}

/**
 * The animated GitHub-PR-style mock. Inline comments appear one by one
 * to communicate "this is a real review happening on a real PR".
 */
function HeroPRMock() {
  return (
    <div className="relative">
      <div className="absolute -inset-1 bg-brand-gradient opacity-30 blur-2xl rounded-3xl" />
      <div className="relative rounded-3xl border border-white/15 bg-navy-950/80 backdrop-blur-xl shadow-card overflow-hidden">
        {/* GitHub-style header */}
        <div className="px-4 py-3 border-b border-white/[0.08] flex items-center gap-3 bg-navy-900/60">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="flex items-center gap-2 ml-2 text-xs text-slate-300">
            <Github className="h-3.5 w-3.5" />
            <span className="font-mono">
              Madhavan1009/payments-svc
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-emerald-300">PR #142</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="chip text-emerald-300 border-emerald-300/30 bg-emerald-300/5 text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Open
            </span>
          </div>
        </div>

        {/* File path */}
        <div className="px-4 py-2 text-[11px] text-slate-400 font-mono border-b border-white/[0.06] bg-white/[0.02]">
          src/auth.py
        </div>

        {/* Diff */}
        <div className="font-mono text-[12.5px] leading-6 text-slate-200">
          <DiffLine n={45} kind="ctx" code="def get_user(user_id):" />
          <DiffLine n={46} kind="del" code='    """Look up a user by ID."""' />
          <DiffLine n={47} kind="add" code='    """Look up a user by ID — used by support dashboard."""' />
          <DiffLine
            n={48}
            kind="add"
            code={`    query = f"SELECT * FROM users WHERE id={user_id}"`}
          />

          {/* AI inline comment block */}
          <div
            className="px-4 py-3 my-1 mx-3 rounded-xl border border-risk-critical/40 bg-risk-critical/[0.06] animate-comment-pop"
            style={{ animationDelay: "0.8s" }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-5 w-5 rounded-md bg-brand-gradient grid place-items-center">
                <Brain className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-white">
                ReviewAI bot
              </span>
              <span className="chip text-risk-critical border-risk-critical/40 bg-risk-critical/10 !py-0.5 !px-2 text-[10px]">
                <span className="h-1 w-1 rounded-full bg-risk-critical" />
                CRITICAL
              </span>
              <span className="chip text-amber-300 border-amber-300/30 bg-amber-300/5 !py-0.5 !px-2 text-[10px]">
                🔒 Security
              </span>
              <span className="ml-auto text-[10px] text-slate-500">
                just now
              </span>
            </div>
            <p className="text-[12.5px] text-slate-200 leading-relaxed">
              <span className="font-semibold text-white">
                SQL injection via f-string.
              </span>{" "}
              user_id is interpolated directly into the query. Parameterize it.
            </p>
            <pre className="mt-2 rounded-lg bg-emerald-400/[0.05] border border-emerald-400/20 px-3 py-2 text-[11.5px] text-emerald-100/95 overflow-x-auto">
              {`+ cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))`}
            </pre>
          </div>

          <DiffLine
            n={49}
            kind="ctx"
            code="    return db.execute(query).fetchone()"
          />
          <DiffLine n={50} kind="ctx" code="" />
          <DiffLine n={51} kind="ctx" code="def list_users():" />

          {/* Second AI comment */}
          <div
            className="px-4 py-3 my-1 mx-3 rounded-xl border border-amber-300/40 bg-amber-300/[0.04] animate-comment-pop"
            style={{ animationDelay: "1.6s" }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-5 w-5 rounded-md bg-brand-gradient grid place-items-center">
                <Brain className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-semibold text-white">
                ReviewAI bot
              </span>
              <span className="chip text-risk-high border-risk-high/40 bg-risk-high/10 !py-0.5 !px-2 text-[10px]">
                <span className="h-1 w-1 rounded-full bg-risk-high" />
                HIGH
              </span>
              <span className="chip text-cyan-300 border-cyan-300/30 bg-cyan-300/5 !py-0.5 !px-2 text-[10px]">
                🧪 Test
              </span>
              <span className="ml-auto text-[10px] text-slate-500">
                just now
              </span>
            </div>
            <p className="text-[12.5px] text-slate-200 leading-relaxed">
              <span className="font-semibold text-white">No test coverage</span>{" "}
              for get_user — this is a security boundary. Add a test for valid
              and malformed input.
            </p>
          </div>
        </div>

        {/* Summary footer */}
        <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.02] flex items-center gap-3 text-xs">
          <CheckCircle2 className="h-3.5 w-3.5 text-cyan-300" />
          <span className="text-slate-300">
            Review complete — <span className="text-white font-semibold">3 findings</span>{" "}
            <span className="text-slate-500">(1 critical · 1 high · 1 medium)</span>
          </span>
          <span className="ml-auto font-mono text-cyan-300">8.2s</span>
        </div>
      </div>
    </div>
  );
}

function DiffLine({
  n,
  kind,
  code,
}: {
  n: number;
  kind: "add" | "del" | "ctx";
  code: string;
}) {
  const cls =
    kind === "add" ? "diff-add" : kind === "del" ? "diff-del" : "diff-ctx";
  const prefix = kind === "add" ? "+" : kind === "del" ? "-" : " ";
  const prefixCls =
    kind === "add"
      ? "text-emerald-300"
      : kind === "del"
      ? "text-rose-300"
      : "text-slate-500";
  return (
    <div className={`flex items-center px-3 ${cls}`}>
      <span className="w-9 shrink-0 text-right text-[10px] text-slate-500 select-none">
        {n}
      </span>
      <span className={`w-5 shrink-0 text-center ${prefixCls}`}>{prefix}</span>
      <span className="text-slate-200 whitespace-pre">{code}</span>
    </div>
  );
}
