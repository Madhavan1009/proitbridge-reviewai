import Link from "next/link";
import {
  BookOpen,
  Github,
  Database,
  Cloud,
  ShieldCheck,
  Cpu,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { MarketingNav } from "@/components/shell/MarketingNav";
import { MarketingFooter } from "@/components/shell/MarketingFooter";
import { Section, SectionHero } from "@/components/ui/Section";

const steps = [
  {
    n: "01",
    icon: <Github className="h-5 w-5" />,
    title: "Fork the repo",
    body: "Clone github.com/Madhavan1009/proitbridge-reviewai to your account. The repo is self-contained — no submodules, no external dependencies beyond the public ones.",
    cmd: "git clone https://github.com/Madhavan1009/proitbridge-reviewai\ncd proitbridge-reviewai",
  },
  {
    n: "02",
    icon: <Database className="h-5 w-5" />,
    title: "Provision Postgres",
    body: "Create a Postgres service on Railway (free tier). Copy the DATABASE_URL and run the schema from postgres/schema.sql.",
    cmd: "psql $DATABASE_URL < postgres/schema.sql",
  },
  {
    n: "03",
    icon: <Cloud className="h-5 w-5" />,
    title: "Deploy n8n",
    body: "Add an n8n service to the same Railway project. Use the official Docker image n8nio/n8n:latest. Set the env vars from DEPLOYMENT.md (basic auth, Postgres URL, Anthropic key, webhook secret).",
    cmd: "# Railway → Add Service → Docker Image\n# image: n8nio/n8n:latest\n# port: 5678",
  },
  {
    n: "04",
    icon: <Sparkles className="h-5 w-5" />,
    title: "Import workflows",
    body: "Open the n8n UI at your Railway URL. Import the four workflow JSONs from n8n/. Wire your credentials (Anthropic, GitHub, Postgres). Activate each workflow.",
    cmd: "# In n8n UI:\n# 1. Import pr-review.json\n# 2. Import pr-resync.json\n# 3. Import pr-merged.json\n# 4. Import weekly-digest.json",
  },
  {
    n: "05",
    icon: <ShieldCheck className="h-5 w-5" />,
    title: "Add the GitHub webhook",
    body: "Repo Settings → Webhooks → Add webhook. Point it at your n8n webhook URL. Use the same secret you put in GITHUB_WEBHOOK_SECRET on the n8n side. Subscribe to 'Pull requests' events.",
    cmd: "Payload URL: https://<n8n>.up.railway.app/webhook/pr-review\nContent type: application/json\nSecret: <same as GITHUB_WEBHOOK_SECRET>",
  },
  {
    n: "06",
    icon: <Cpu className="h-5 w-5" />,
    title: "Deploy the dashboard",
    body: "Push frontend/ to GitHub, import the project on Vercel, set DATABASE_URL. The dashboard reads directly from Postgres via Next.js server components — no separate API needed.",
    cmd: "vercel --prod\n# or: connect repo → Vercel → Root: frontend/",
  },
];

export default function DocsPage() {
  return (
    <div className="animate-fade-in">
      <MarketingNav />

      {/* HERO */}
      <Section tone="dark" className="!pt-16 lg:!pt-20">
        <SectionHero
          eyebrow={
            <>
              <BookOpen className="h-3 w-3" />
              Setup guide
            </>
          }
          title={
            <>
              Deploy ProITBridge ReviewAI in{" "}
              <span className="text-gradient">30 minutes.</span>
            </>
          }
          description="Six steps. One free Railway project. One Vercel deployment. One GitHub webhook. That's it."
        />

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <div className="glass-card p-5 sticky top-24">
              <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 font-semibold">
                Before you start
              </p>
              <ul className="mt-3 space-y-2.5 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-300">→</span>
                  <span>An Anthropic API key (Claude 3.5 Sonnet)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-300">→</span>
                  <span>A free Railway account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-300">→</span>
                  <span>A free Vercel account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-300">→</span>
                  <span>A GitHub repo to point the webhook at</span>
                </li>
              </ul>
              <div className="mt-5 pt-5 border-t border-white/[0.08]">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400 font-semibold">
                  Total cost
                </p>
                <p className="mt-2 text-2xl font-bold text-white tracking-tight">
                  $0 / month
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  + ~$0.01 / PR for Claude inference
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            {steps.map((s) => (
              <div key={s.n} className="glass-card p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-brand-gradient grid place-items-center text-white shadow-glow-blue">
                    {s.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-cyan-300">
                        STEP {s.n}
                      </span>
                    </div>
                    <h3 className="mt-1 text-lg font-bold text-white tracking-tight">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-300/90 leading-relaxed">
                      {s.body}
                    </p>
                    <pre className="mt-3 rounded-lg bg-navy-950/60 border border-white/[0.06] p-3 text-[12px] leading-6 text-cyan-200/90 overflow-x-auto whitespace-pre mono">
                      {s.cmd}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ENV VARS REFERENCE */}
      <Section tone="light">
        <SectionHero
          tone="light"
          eyebrow={<>Reference</>}
          title={
            <>
              Environment variables{" "}
              <span className="text-gradient">cheat sheet.</span>
            </>
          }
          description="Everything you need to wire up. Generate the secrets with `openssl rand -hex 32`."
        />

        <div className="grid lg:grid-cols-2 gap-5">
          <EnvTable
            title="n8n (Railway service)"
            rows={[
              ["ANTHROPIC_API_KEY", "Your Claude API key"],
              ["GITHUB_WEBHOOK_SECRET", "32-char random, shared with GitHub"],
              ["DATABASE_URL", "Postgres connection string"],
              ["N8N_ENCRYPTION_KEY", "32-char random"],
              ["N8N_BASIC_AUTH_USER", "admin"],
              ["N8N_BASIC_AUTH_PASSWORD", "Strong password"],
              ["WEBHOOK_URL", "https://your-n8n.up.railway.app/"],
            ]}
          />
          <EnvTable
            title="frontend (Vercel)"
            rows={[
              ["DATABASE_URL", "Same Postgres connection string"],
              [
                "NEXT_PUBLIC_N8N_WEBHOOK_URL",
                "https://your-n8n.up.railway.app/webhook/pr-review",
              ],
            ]}
          />
        </div>

        <div className="mt-10 grid lg:grid-cols-3 gap-4">
          <DocLink
            href="https://docs.anthropic.com/en/api/getting-started"
            title="Claude API"
            blurb="How to get your API key and quota."
          />
          <DocLink
            href="https://docs.n8n.io"
            title="n8n docs"
            blurb="Workflow editor, code nodes, credentials."
          />
          <DocLink
            href="https://docs.railway.app"
            title="Railway docs"
            blurb="Service deployment, env vars, Postgres."
          />
        </div>
      </Section>

      {/* CTA */}
      <Section tone="dark">
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 lg:p-10 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Stuck on a step?
          </h3>
          <p className="mt-3 text-sm lg:text-base text-slate-300/90 leading-relaxed">
            Open an issue on GitHub. The full DEPLOYMENT.md in the repo has
            screenshots and the exact env vars for every service.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://github.com/Madhavan1009"
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              <Github className="h-4 w-4" />
              Open an issue
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <Link href="/dashboard" className="btn-secondary">
              See the dashboard demo
            </Link>
          </div>
        </div>
      </Section>

      <MarketingFooter />
    </div>
  );
}

function EnvTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<[string, string]>;
}) {
  return (
    <div className="card-light overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 bg-slate-50">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
          {title}
        </p>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k} className="border-b border-slate-100 last:border-b-0">
              <td className="px-5 py-3 font-mono text-[12px] text-brand-700 align-top whitespace-nowrap">
                {k}
              </td>
              <td className="px-5 py-3 text-slate-600">{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocLink({
  href,
  title,
  blurb,
}: {
  href: string;
  title: string;
  blurb: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="card-light p-5 hover:border-brand-500/40 transition-colors group"
    >
      <p className="text-base font-bold text-slate-900 tracking-tight inline-flex items-center gap-1.5">
        {title}
        <ArrowRight className="h-3.5 w-3.5 text-brand-500 transition-transform group-hover:translate-x-0.5" />
      </p>
      <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{blurb}</p>
    </a>
  );
}
