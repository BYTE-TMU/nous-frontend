"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import ArrowRight02Icon from "@hugeicons/core-free-icons/ArrowRight02Icon";
import ExperimentStatus from "@/components/experiment/ExperimentStatus";
import { Button } from "@/components/ui/button";
import type { Experiment } from "./ExperimentCard";

export default function ExperimentRow({
  experiment,
  isLast,
}: {
  experiment: Experiment;
  isLast?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-[180px_1fr_1fr_1fr_100px_140px_100px] items-center gap-4 border-x-2 border-b-2 border-border px-6 py-4 ${isLast ? "rounded-b-2xl" : ""}`}
    >
      <div>
        <ExperimentStatus status={experiment.status} />
      </div>

      <p className="text-base font-bold truncate">{experiment.name}</p>

      <div className="flex items-center gap-2">
        <span className="rounded-full border border-border px-3 py-1 text-sm font-medium">
          {experiment.attacker}
        </span>
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          size={16}
          className="shrink-0 text-muted-foreground"
        />
        <span className="rounded-full border border-border px-3 py-1 text-sm font-medium">
          {experiment.defender}
        </span>
      </div>

      <p className="text-sm text-muted-foreground truncate">
        {experiment.description}
      </p>

      <Button variant="outline" size="sm" className="rounded-full">
        cost
      </Button>

      <span className="text-sm">{experiment.date}</span>

      <span className="text-sm">
        {experiment.currentTurn} / {experiment.totalTurns}
      </span>
    </div>
  );
}
