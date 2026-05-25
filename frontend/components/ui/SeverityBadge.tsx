import {
  cn,
  severityColor,
  severityColorLight,
  severityDot,
  severityLabel,
} from "@/lib/utils";
import type { Severity } from "@/lib/types";

export function SeverityBadge({
  severity,
  className,
  tone = "dark",
}: {
  severity: Severity;
  className?: string;
  tone?: "dark" | "light";
}) {
  const colorClass =
    tone === "light" ? severityColorLight[severity] : severityColor[severity];
  return (
    <span className={cn("dash-chip", colorClass, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", severityDot[severity])} />
      <span className="font-semibold tracking-wide">
        {severityLabel[severity]}
      </span>
    </span>
  );
}
