import { categoryIcon, categoryLabel, categoryTone, cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

export function CategoryChip({
  category,
  className,
}: {
  category: Category;
  className?: string;
}) {
  return (
    <span className={cn("chip", categoryTone[category], className)}>
      <span>{categoryIcon[category]}</span>
      <span>{categoryLabel[category]}</span>
    </span>
  );
}
