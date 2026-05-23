"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Github, Sparkles } from "lucide-react";

export function FooterCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950" />
      <div className="absolute inset-0 -z-10 bg-brand-radial" />
      <div className="px-6 lg:px-10 py-16 lg:py-24 max-w-[1500px] mx-auto">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="section-eyebrow-dark inline-flex">
              <Sparkles className="h-3 w-3" />
              Strive For Better Future
            </p>
            <h2 className="mt-4 text-3xl lg:text-5xl font-bold tracking-tight text-white text-balance leading-tight">
              Stop reviewing the obvious stuff.{" "}
              <span className="text-gradient">Ship the bot.</span>
            </h2>
            <p className="mt-5 text-base lg:text-lg text-slate-300/90 max-w-2xl leading-relaxed">
              Fork the repo, deploy to Railway + Vercel, point a GitHub webhook
              at it. In under 30 minutes, every PR in your org gets a
              senior-engineer-quality review the moment it opens.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/docs" className="btn-primary !px-5 !py-3 text-base">
                Deploy Your Own
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/docs" className="btn-secondary !px-5 !py-3 text-base">
                <BookOpen className="h-4 w-4" />
                Read the Docs
              </Link>
              <a
                href="https://github.com/Madhavan1009"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary !px-5 !py-3 text-base"
              >
                <Github className="h-4 w-4" />
                Star on GitHub
              </a>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border border-white/15 bg-white/[0.04] backdrop-blur-xl p-6 shadow-card">
              <div className="relative h-16 w-full">
                <Image
                  src="/proitbridge-logo.png"
                  alt="ProITBridge"
                  fill
                  className="object-contain object-left"
                />
              </div>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                Built on the same{" "}
                <span className="text-cyan-300 font-semibold">
                  free-tier toolkit
                </span>{" "}
                ProITBridge uses internally — n8n, Claude, Next.js, Postgres.
                Deploy your own in under 30 minutes.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  { v: "10s", l: "Avg review" },
                  { v: "$0", l: "Infrastructure" },
                  { v: "MIT", l: "License" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-xl border border-white/10 bg-white/[0.03] py-3 px-2"
                  >
                    <p className="text-lg font-bold text-white tabular-nums">
                      {s.v}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-slate-400">
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
