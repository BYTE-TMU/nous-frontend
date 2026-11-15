"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import ArrowRight02Icon from "@hugeicons/core-free-icons/ArrowRight02Icon";
import ExperimentStatus, {
  ExperimentStatusEnum,
} from "@/components/experiment/ExperimentStatus";
import { Button } from "@/components/ui/Button";

export interface Experiment {
  id: string;
  name: string;
  attacker: string;
  defender: string;
  description: string;
  date: string;
  currentTurn: number;
  totalTurns: number;
  status: ExperimentStatusEnum;
}

export default function ExperimentCard({
  experiment,
}: {
  experiment: Experiment;
}) {
  return (
    <div className="flex flex-col rounded-2xl border-2 border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <Button variant="outline" size="sm" className="rounded-full">
          cost
        </Button>
        <ExperimentStatus status={experiment.status} />
      </div>

      <h3 className="text-lg font-bold mb-2">{experiment.name}</h3>

      <div className="flex items-center gap-2 mb-3">
        <span className="rounded-full border border-border px-3 py-1 text-xs">
          {experiment.attacker}
        </span>
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          size={16}
          className="shrink-0 text-muted-foreground"
        />
        <span className="rounded-full border border-border px-3 py-1 text-xs">
          {experiment.defender}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {experiment.description}
      </p>

      <div className="mt-auto border-t border-border pt-2 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{experiment.date}</span>
        <span className="text-sm text-muted-foreground">
          turn {experiment.currentTurn} / {experiment.totalTurns}
        </span>
      </div>
    </div>
  );
}
