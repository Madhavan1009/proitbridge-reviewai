import type { Category, Severity } from "./types";

export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "just now";
  const diff = Math.max(0, Date.now() - then);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatPct(value: number): string {
  return `${Math.round(value)}%`;
}

export const severityColor: Record<Severity, string> = {
  critical: "text-risk-critical border-risk-critical/40 bg-risk-critical/10",
  high: "text-risk-high border-risk-high/40 bg-risk-high/10",
  medium: "text-risk-medium border-risk-medium/40 bg-risk-medium/10",
  low: "text-risk-low border-risk-low/40 bg-risk-low/10",
  nit: "text-slate-400 border-slate-400/40 bg-slate-400/10",
};

export const severityDot: Record<Severity, string> = {
  critical:
    "bg-risk-critical shadow-[0_0_12px_-2px_rgba(220,38,38,0.9)]",
  high: "bg-risk-high shadow-[0_0_12px_-2px_rgba(239,68,68,0.8)]",
  medium: "bg-risk-medium shadow-[0_0_12px_-2px_rgba(245,158,11,0.8)]",
  low: "bg-risk-low shadow-[0_0_12px_-2px_rgba(34,197,94,0.8)]",
  nit: "bg-slate-400",
};

export const severityLabel: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  nit: "Nit",
};

export const categoryTone: Record<Category, string> = {
  bug: "text-rose-300 border-rose-300/30 bg-rose-300/5",
  security: "text-amber-300 border-amber-300/30 bg-amber-300/5",
  performance: "text-violet-300 border-violet-300/30 bg-violet-300/5",
  test: "text-cyan-300 border-cyan-300/30 bg-cyan-300/5",
  style: "text-slate-300 border-slate-300/30 bg-slate-300/5",
  docs: "text-brand-300 border-brand-300/30 bg-brand-300/5",
};

export const categoryLabel: Record<Category, string> = {
  bug: "Bug",
  security: "Security",
  performance: "Performance",
  test: "Test",
  style: "Style",
  docs: "Docs",
};

export const categoryIcon: Record<Category, string> = {
  bug: "🐛",
  security: "🔒",
  performance: "⚡",
  test: "🧪",
  style: "💅",
  docs: "📚",
};
