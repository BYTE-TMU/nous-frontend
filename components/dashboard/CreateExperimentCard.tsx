"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import PlusSignCircleIcon from "@hugeicons/core-free-icons/PlusSignCircleIcon";

export default function CreateExperimentCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-card p-5 min-h-[200px] cursor-pointer hover:bg-muted transition-colors">
      <HugeiconsIcon
        icon={PlusSignCircleIcon}
        size={48}
        className="text-muted-foreground"
      />
      <span className="text-base font-medium text-muted-foreground">
        Create new experiment
      </span>
    </button>
  );
}
