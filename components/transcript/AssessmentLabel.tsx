import { HugeiconsIcon } from "@hugeicons/react";
import DiamondIcon from "@hugeicons/core-free-icons/DiamondIcon";
import type { AssessmentClassification } from "./types";

type Props = {
  classification: AssessmentClassification;
};

/** The judge's flag as an icon and word: a ring for a near-miss, a diamond for a break. */
export default function AssessmentLabel({ classification }: Props) {
  if (classification === "broke") {
    return (
      <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
        <HugeiconsIcon icon={DiamondIcon} size="sm" className="size-3 fill-foreground" />
        Broke
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
      <span aria-hidden className="inline-block size-3 rounded-full border-[3px] border-foreground" />
      Near-miss
    </span>
  );
}
