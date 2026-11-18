"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import ArrowRight02Icon from "@hugeicons/core-free-icons/ArrowRight02Icon";
import ExperimentStatus, {
  ExperimentStatusEnum,
} from "@/components/experiment/ExperimentStatus";
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

const STATUS_BORDER = {
  [ExperimentStatusEnum.IN_PROGRESS]: "hover:border-status-in-progress focus-visible:border-status-in-progress",
  [ExperimentStatusEnum.BROKE]: "hover:border-fox-red focus-visible:border-fox-red",
  [ExperimentStatusEnum.HELD]: "hover:border-impact-green focus-visible:border-impact-green",
  [ExperimentStatusEnum.INCONCLUSIVE]: "hover:border-ash focus-visible:border-ash",
};

const STATUS_PROGRESS = {
  [ExperimentStatusEnum.IN_PROGRESS]: "bg-gradient-duel",
  [ExperimentStatusEnum.BROKE]: "bg-fox-red",
  [ExperimentStatusEnum.HELD]: "bg-impact-green",
  [ExperimentStatusEnum.INCONCLUSIVE]: "bg-ash",
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
        "flex min-w-0 flex-col rounded-[2rem] border border-border bg-card bg-gradient-to-br via-card to-card p-6 transition-colors",
        STATUS_GRADIENT[experiment.status],
        STATUS_BORDER[experiment.status],
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="rounded-full border border-border px-3 py-1 font-mono text-xs">
          {experiment.cost}
        </span>
        <ExperimentStatus status={experiment.status} />
      </div>

      <h3 className="mb-2 break-words text-xl font-bold">{experiment.name}</h3>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="max-w-full break-all rounded-full border border-fox-red px-3 py-1 text-xs text-fox-red">
          <span aria-hidden="true">● </span>{experiment.attacker}
        </span>
        <HugeiconsIcon
          icon={ArrowRight02Icon}
          size={16}
          className="shrink-0 text-muted-foreground"
        />
        <span className="max-w-full break-all rounded-full border border-blue-freeze px-3 py-1 text-xs text-blue-freeze">
          <span aria-hidden="true">● </span>{experiment.defender}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        {experiment.description}
      </p>

      {experiment.owner ? (
        <p className="text-xs text-muted-foreground mb-3">by {experiment.owner}</p>
      ) : null}

      <div className="mt-auto pt-2">
        {experiment.totalTurns > 0 && (
          <div
            role="progressbar"
            aria-label="Completed turns"
            aria-valuemin={0}
            aria-valuemax={experiment.totalTurns}
            aria-valuenow={Math.max(0, Math.min(experiment.currentTurn, experiment.totalTurns))}
            className="h-1 w-full overflow-hidden rounded-full bg-graphite"
          >
            <div className={cn("h-full rounded-full", STATUS_PROGRESS[experiment.status])} style={{ width: `${Math.max(0, Math.min(experiment.currentTurn / experiment.totalTurns, 1)) * 100}%` }} />
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-2 font-mono text-xs">
        <span className="text-muted-foreground">{experiment.date}</span>
        <span className={experiment.status === ExperimentStatusEnum.BROKE ? "text-fox-red" : "text-ash"}>
          turn {experiment.currentTurn} / {experiment.totalTurns}
        </span>
        </div>
      </div>
    </Link>
  );
}
