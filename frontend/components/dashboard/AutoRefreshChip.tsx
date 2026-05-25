"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { RefreshCw, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const INTERVAL_SECONDS = 15;

/**
 * Polls for new data every 15s via Next.js `router.refresh()`.
 * Refresh re-runs the page's server components (which re-query Postgres)
 * and patches the React tree without a full page reload — so client
 * state like filters and scroll position is preserved.
 */
export function AutoRefreshChip() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState(INTERVAL_SECONDS);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!enabled) return;
    const tick = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          startTransition(() => {
            router.refresh();
          });
          return INTERVAL_SECONDS;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [enabled, router]);

  function refreshNow() {
    startTransition(() => {
      router.refresh();
    });
    setSecondsLeft(INTERVAL_SECONDS);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={refreshNow}
        className={cn(
          "dash-chip text-brand-700 border-brand-200 bg-brand-50",
          "hover:bg-brand-100 transition-colors"
        )}
        title="Refresh data now"
        disabled={isPending}
      >
        <RefreshCw
          className={cn("h-3 w-3", isPending && "animate-spin")}
        />
        {enabled ? (
          <>
            <span className="hidden sm:inline">Auto-refresh in</span>
            <span className="font-mono tabular-nums">{secondsLeft}s</span>
          </>
        ) : (
          <span>Auto-refresh paused</span>
        )}
      </button>
      <button
        onClick={() => setEnabled((e) => !e)}
        className="dash-chip text-slate-500 border-slate-200 bg-white hover:bg-slate-50 !px-2"
        title={enabled ? "Pause auto-refresh" : "Resume auto-refresh"}
      >
        {enabled ? (
          <Pause className="h-3 w-3" />
        ) : (
          <Play className="h-3 w-3" />
        )}
      </button>
    </div>
  );
}
