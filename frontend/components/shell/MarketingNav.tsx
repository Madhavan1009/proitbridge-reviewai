"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Github, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/dashboard", label: "Dashboard" },
];

export function MarketingNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-navy-950/70 border-b border-white/[0.06]">
      <div className="max-w-[1500px] mx-auto px-6 lg:px-10 py-3.5 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="relative h-9 w-32">
            <Image
              src="/proitbridge-logo.png"
              alt="ProITBridge ReviewAI"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          <span className="hidden sm:inline-flex chip text-cyan-300 border-cyan-300/30 bg-cyan-300/5 text-[10px] uppercase tracking-[0.18em]">
            ReviewAI
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-2">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 rounded-xl text-sm transition-colors",
                  active
                    ? "text-white bg-white/[0.06]"
                    : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/Madhavan1009"
            target="_blank"
            rel="noreferrer"
            className="btn-secondary !px-3 !py-2 text-sm"
          >
            <Github className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
          <Link href="/dashboard" className="btn-primary !px-3.5 !py-2 text-sm">
            <span>Live Demo</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
