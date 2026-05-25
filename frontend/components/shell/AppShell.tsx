"use client";

import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  // Add a body class while the dashboard is mounted so we flip the
  // page background from the marketing dark gradient to a clean light
  // surface. The class is removed on unmount so the marketing pages
  // keep their dark hero.
  useEffect(() => {
    document.body.classList.add("dashboard-light");
    return () => document.body.classList.remove("dashboard-light");
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 min-w-0">{children}</main>
        <footer className="px-6 lg:px-10 py-6 text-xs text-slate-500 flex items-center justify-between border-t border-slate-200 bg-white">
          <span>
            © {new Date().getFullYear()} ProITBridge ·{" "}
            <span className="italic text-brand-600">
              Strive For Better Future
            </span>
          </span>
          <span className="opacity-70">
            n8n · Claude · Next.js · Postgres
          </span>
        </footer>
      </div>
    </div>
  );
}
