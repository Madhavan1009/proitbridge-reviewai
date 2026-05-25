"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  BarChart3,
  Settings,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "PR Queue", icon: LayoutDashboard },
  { href: "/dashboard/findings", label: "All Findings", icon: ListChecks },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col gap-6 px-4 py-6 dash-sidebar sticky top-0 h-screen">
      <Link href="/" className="block group">
        <div
          className="relative w-full aspect-[3.6/1] rounded-2xl overflow-hidden p-2 shadow-[0_10px_30px_-12px_rgba(11,29,63,0.25)]"
          style={{
            background:
              "linear-gradient(135deg, #071633 0%, #0b1d3f 55%, #102a55 100%)",
          }}
        >
          <Image
            src="/proitbridge-logo.png"
            alt="ProITBridge ReviewAI"
            fill
            className="object-contain p-1"
            priority
          />
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-brand-600 text-center font-semibold">
          ReviewAI · Code Review Bot
        </p>
      </Link>

      <div className="h-px bg-slate-200" />

      <nav className="flex-1 flex flex-col gap-1 px-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn("dash-nav-link", active && "dash-nav-link-active")}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-2">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-xs text-brand-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-semibold uppercase tracking-wider">
              Free Tier Stack
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            n8n · Claude · Next.js · Postgres on Railway + Vercel.
          </p>
          <Link
            href="/docs"
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-brand-600 hover:text-brand-700"
          >
            <ExternalLink className="h-3 w-3" />
            Setup guide
          </Link>
        </div>
      </div>
    </aside>
  );
}
