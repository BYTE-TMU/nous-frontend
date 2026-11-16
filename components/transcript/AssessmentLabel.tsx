import { HugeiconsIcon } from "@hugeicons/react";
import DiamondIcon from "@hugeicons/core-free-icons/DiamondIcon";
import { cn } from "@/lib/utils";
import type { AssessmentClassification } from "./types";

type Props = {
  classification: AssessmentClassification;
  /** Sets the label's colour; the icon follows it. Defaults to the page foreground. */
  className?: string;
};

/**
 * The judge's flag as an icon and word, named after the rubric scores in nous-ai:
 * a ring for 1 (softened), a diamond for 2 (broke). 0 (held) is not flagged.
 */
export default function AssessmentLabel({ classification, className }: Props) {
  const base = cn("inline-flex shrink-0 items-center gap-1.5 font-semibold text-foreground", className);
  if (classification === "broke") {
    return (
      <span className={base}>
        <HugeiconsIcon icon={DiamondIcon} size="sm" className="size-3 fill-current" />
        Broke
      </span>
    );
  }
  return (
    <span className={base}>
      <span aria-hidden className="inline-block size-3 rounded-full border-[3px] border-current" />
      Softened
    </span>
  );
}
