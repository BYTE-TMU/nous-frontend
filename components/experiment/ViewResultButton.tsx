"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import ArrowDown01Icon from "@hugeicons/core-free-icons/ArrowDown01Icon";
import { Button } from "@/components/ui/Button";

/** Shown once a run has ended: scrolls down to the Results section. */
export default function ViewResultButton() {
  return (
    <Button
      variant="outline"
      className="h-9 rounded-full border-signal-lime bg-ink px-4 text-base font-medium hover:bg-signal-lime hover:text-night"
      onClick={() =>
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    >
      View Result
      <HugeiconsIcon icon={ArrowDown01Icon} data-icon="inline-end" />
    </Button>
  );
}
