"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import ArrowRight02Icon from "@hugeicons/core-free-icons/ArrowRight02Icon";
import ExperimentStatus, {
  ExperimentStatusEnum,
} from "@/components/experiment/ExperimentStatus";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

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
  cost: string;
  /** Set only in the admin "all users" view. */
  owner?: string;
}

const STATUS_GRADIENT = {
  [ExperimentStatusEnum.IN_PROGRESS]: "from-status-in-progress/15",
  [ExperimentStatusEnum.BROKE]: "from-status-broke/15",
  [ExperimentStatusEnum.HELD]: "from-impact-green/15",
  [ExperimentStatusEnum.INCONCLUSIVE]: "from-status-inconclusive/15",
};

export default function ExperimentCard({
  experiment,
}: {
  experiment: Experiment;
}) {
  return (
    <Link
      href={`/experiment/${experiment.id}`}
      aria-label={`Open ${experiment.name}`}
      className={cn(
        "flex flex-col rounded-2xl border-2 border-border bg-card bg-gradient-to-br via-card to-card p-5 transition-[filter] hover:brightness-110",
        STATUS_GRADIENT[experiment.status],
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <Button variant="outline" size="sm" className="rounded-full">
          {experiment.cost}
        </Button>
        <ExperimentStatus status={experiment.status} />
      </div>

      <h3 className="text-lg font-bold mb-2">{experiment.name}</h3>

      <div className="mb-3 flex flex-wrap items-center gap-2">
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

      {experiment.owner ? (
        <p className="text-xs text-muted-foreground mb-3">by {experiment.owner}</p>
      ) : null}

      <div className="mt-auto border-t border-border pt-2 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{experiment.date}</span>
        <span className="text-sm text-muted-foreground">
          turn {experiment.currentTurn} / {experiment.totalTurns}
        </span>
      </div>
    </Link>
  );
}
