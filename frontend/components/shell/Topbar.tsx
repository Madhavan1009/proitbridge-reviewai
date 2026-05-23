"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, Github, ShieldCheck } from "lucide-react";

const titles: Record<string, { title: string; sub: string }> = {
  "/dashboard": {
    title: "Live PR Queue",
    sub: "Pull requests currently under review",
  },
  "/dashboard/findings": {
    title: "All Findings",
    sub: "Every issue flagged across every PR",
  },
  "/dashboard/analytics": {
    title: "Review Analytics",
    sub: "Accept rate, severity mix, category breakdown",
  },
  "/dashboard/settings": {
    title: "Settings",
    sub: "Configure repos, thresholds, and webhook secrets",
  },
};

export function Topbar() {
  const pathname = usePathname();
  const meta = titles[pathname] || titles["/dashboard"];

  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-navy-950/60 border-b border-white/[0.05]">
      <div className="px-6 lg:px-10 py-4 flex items-center gap-4 max-w-[1600px] w-full mx-auto">
        <Link href="/" className="lg:hidden flex items-center">
          <div className="relative h-10 w-36">
            <Image
              src="/proitbridge-logo.png"
              alt="ProITBridge ReviewAI"
              fill
              className="object-contain object-left"
            />
          </div>
        </Link>

        <div className="hidden lg:block min-w-0">
          <h1 className="text-xl font-semibold text-white tracking-tight">
            {meta.title}
          </h1>
          <p className="text-sm text-slate-400">{meta.sub}</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="chip text-risk-low border-risk-low/30 bg-risk-low/10">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Bot</span>
            <span className="opacity-60">·</span>
            <span className="font-mono text-[10px]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-risk-low align-middle animate-pulse mr-1" />
              live
            </span>
          </span>
          <span className="chip text-brand-300 border-brand-300/30 bg-brand-300/5">
            <Cpu className="h-3.5 w-3.5" />
            <span>Claude</span>
            <span className="opacity-60">·</span>
            <span className="font-mono text-[10px]">sonnet-3.5</span>
          </span>
          <a
            href="https://github.com/Madhavan1009"
            target="_blank"
            rel="noreferrer"
            className="chip text-slate-200 border-white/15 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
