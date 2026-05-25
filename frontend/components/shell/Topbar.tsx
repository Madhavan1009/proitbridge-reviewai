"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cpu, Github, ShieldCheck, Workflow, ExternalLink } from "lucide-react";

const N8N_URL =
  process.env.NEXT_PUBLIC_N8N_URL ||
  "https://n8n-production-6b0c.up.railway.app";

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
    <header className="sticky top-0 z-20 dash-topbar">
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
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            {meta.title}
          </h1>
          <p className="text-sm text-slate-500">{meta.sub}</p>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="dash-chip text-emerald-700 border-emerald-200 bg-emerald-50">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Bot</span>
            <span className="opacity-50">·</span>
            <span className="font-mono text-[10px]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 align-middle animate-pulse mr-1" />
              live
            </span>
          </span>
          <span className="dash-chip text-brand-700 border-brand-200 bg-brand-50">
            <Cpu className="h-3.5 w-3.5" />
            <span>Claude</span>
            <span className="opacity-50">·</span>
            <span className="font-mono text-[10px]">haiku-4-5</span>
          </span>

          {/* Open n8n button — flagship action in the topbar */}
          <a
            href={N8N_URL}
            target="_blank"
            rel="noreferrer"
            className="dash-btn-primary !px-3.5 !py-2 text-sm"
            title="Open the n8n workflow backend"
          >
            <Workflow className="h-4 w-4" />
            <span className="hidden sm:inline">Open n8n</span>
            <ExternalLink className="h-3 w-3 opacity-80" />
          </a>

          <a
            href="https://github.com/Madhavan1009"
            target="_blank"
            rel="noreferrer"
            className="dash-btn-secondary !px-3 !py-2 text-sm"
            title="View source on GitHub"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
