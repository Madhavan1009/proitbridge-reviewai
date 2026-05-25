import {
  categoryIcon,
  categoryLabel,
  categoryTone,
  categoryToneLight,
  cn,
} from "@/lib/utils";
import type { Category } from "@/lib/types";

export function CategoryChip({
  category,
  className,
  tone = "dark",
}: {
  category: Category;
  className?: string;
  tone?: "dark" | "light";
}) {
  const colorClass =
    tone === "light" ? categoryToneLight[category] : categoryTone[category];
  return (
    <span className={cn("dash-chip", colorClass, className)}>
      <span>{categoryIcon[category]}</span>
      <span>{categoryLabel[category]}</span>
    </span>
  );
}
