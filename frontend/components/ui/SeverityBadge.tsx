import { cn, severityColor, severityDot, severityLabel } from "@/lib/utils";
import type { Severity } from "@/lib/types";

export function SeverityBadge({
  severity,
  className,
}: {
  severity: Severity;
  className?: string;
}) {
  return (
    <span className={cn("chip", severityColor[severity], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", severityDot[severity])} />
      <span className="font-semibold tracking-wide">
        {severityLabel[severity]}
      </span>
    </span>
  );
}
