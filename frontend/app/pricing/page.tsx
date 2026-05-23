import Link from "next/link";
import { ArrowRight, Github, HelpCircle } from "lucide-react";
import { MarketingNav } from "@/components/shell/MarketingNav";
import { MarketingFooter } from "@/components/shell/MarketingFooter";
import { Section, SectionHero } from "@/components/ui/Section";
import { PricingSection } from "@/components/landing/PricingSection";

const faqs = [
  {
    q: "Is ReviewAI really free?",
    a: "Yes. The source is MIT-licensed on GitHub. You bring your own Claude API key (Anthropic gives $5 free credits to start) and deploy to free-tier Railway + Vercel. Your only ongoing cost is Claude inference — which works out to about $0.01 per PR reviewed.",
  },
  {
    q: "How is this different from CodeRabbit or Cursor's review?",
    a: "Same idea, different trade-off. CodeRabbit is $24/dev/month and runs in their cloud. ReviewAI is open source — you own the deployment, the prompts, the data. The dashboard, accept-rate analytics, and re-review flow are all yours to modify.",
  },
  {
    q: "Why Claude over GPT-4?",
    a: "Claude 3.5 Sonnet has the strongest code reasoning of any model we tested, and its JSON-mode output is reliable. The 10-second latency is fine for a PR review workflow — humans aren't blocked on it.",
  },
  {
    q: "Will it leak my code to Anthropic?",
    a: "Claude calls send code to Anthropic by design — that's how the review happens. Anthropic's data policy is documented at docs.anthropic.com. For airgapped use cases, swap Claude for a self-hosted Llama 3 in the n8n workflow.",
  },
  {
    q: "What if Claude hallucinates a bug?",
    a: "It will, sometimes. That's why every finding has a severity, rationale, and one-click suggestion — developers can reject false positives in one click. The Postgres-tracked accept rate is the metric that proves the bot is useful (or not) for your team.",
  },
  {
    q: "Can I add custom rules?",
    a: "Currently the prompt is the rule book — edit prompts/reviewer.txt to add 'always flag direct DB access in services/' or whatever your team needs. Per-repo .aireview.yml is a planned v2 feature.",
  },
];

export default function PricingPage() {
  return (
    <div className="animate-fade-in">
      <MarketingNav />
      <PricingSection />

      <Section tone="dark">
        <SectionHero
          align="center"
          eyebrow={
            <>
              <HelpCircle className="h-3 w-3" />
              FAQ
            </>
          }
          title={
            <>
              Honest answers to the{" "}
              <span className="text-gradient">honest questions.</span>
            </>
          }
        />

        <div className="grid lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="glass-card p-5 group"
            >
              <summary className="cursor-pointer text-base font-semibold text-white flex items-start justify-between gap-3 list-none">
                <span>{f.q}</span>
                <span className="text-cyan-300 group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-300/90 leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 lg:p-10 text-center max-w-3xl mx-auto">
          <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Still on the fence?
          </h3>
          <p className="mt-3 text-sm lg:text-base text-slate-300/90 leading-relaxed">
            Self-hosting takes 30 minutes and costs $0. Try it on a sandbox repo
            — if it doesn't catch a bug in your first 5 PRs, delete the Railway
            service and you've lost nothing.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link href="/docs" className="btn-primary">
              Start self-hosting
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href="https://github.com/Madhavan1009"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
            >
              <Github className="h-4 w-4" />
              Read the code
            </a>
          </div>
        </div>
      </Section>

      <MarketingFooter />
    </div>
  );
}
