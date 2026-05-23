import Image from "next/image";
import Link from "next/link";
import { Github, Sparkles, ArrowUpRight } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06]">
      <div className="absolute inset-0 -z-10 bg-brand-radial opacity-60" />
      <div className="max-w-[1500px] mx-auto px-6 lg:px-10 py-14">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative h-12 w-40">
                <Image
                  src="/proitbridge-logo.png"
                  alt="ProITBridge"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="mt-4 text-sm text-slate-300/80 max-w-md leading-relaxed">
              ProITBridge ReviewAI — open-source AI code review for GitHub. The
              alternative to CodeRabbit and Cursor's review feature, built
              entirely on a free-tier stack.
            </p>
            <p className="mt-3 text-[11px] uppercase tracking-[0.22em] text-cyan-300/80 inline-flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              Strive For Better Future
            </p>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Product
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/how-it-works"
                  className="text-slate-300 hover:text-white"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-slate-300 hover:text-white"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-slate-300 hover:text-white"
                >
                  Docs
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-slate-300 hover:text-white"
                >
                  Dashboard demo
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Resources
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href="https://github.com/Madhavan1009"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 hover:text-white inline-flex items-center gap-1"
                >
                  GitHub repo <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.anthropic.com/en/api/getting-started"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 hover:text-white inline-flex items-center gap-1"
                >
                  Claude API <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.n8n.io"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 hover:text-white inline-flex items-center gap-1"
                >
                  n8n docs <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://docs.railway.app"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 hover:text-white inline-flex items-center gap-1"
                >
                  Railway <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Open Source
            </p>
            <p className="mt-3 text-sm text-slate-300/90 leading-relaxed">
              Fork it, host it, own it. Bring your own Claude key and a Railway
              account — you'll be reviewing PRs in under 30 minutes.
            </p>
            <a
              href="https://github.com/Madhavan1009"
              target="_blank"
              rel="noreferrer"
              className="mt-4 btn-secondary text-sm"
            >
              <Github className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} ProITBridge. All rights reserved.</span>
          <span className="font-mono opacity-70">
            n8n · Claude · Next.js · Postgres · Railway · Vercel
          </span>
        </div>
      </div>
    </footer>
  );
}
