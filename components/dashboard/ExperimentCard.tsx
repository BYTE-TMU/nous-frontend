"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import ArrowRight02Icon from "@hugeicons/core-free-icons/ArrowRight02Icon";
import ExperimentStatus, {
  ExperimentStatusEnum,
} from "@/components/experiment/ExperimentStatus";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DELETABLE_STATES, type RunListItem } from "@/lib/api";
import RunProgress, { type ProgressData } from "./RunProgress";

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
  state: RunListItem["state"];
  /** Set only in the admin "all users" view. */
  owner?: string;
}

const STATUS_BORDER = {
  [ExperimentStatusEnum.IN_PROGRESS]: "hover:border-status-in-progress focus-visible:border-status-in-progress",
  [ExperimentStatusEnum.BROKE]: "hover:border-fox-red focus-visible:border-fox-red",
  [ExperimentStatusEnum.HELD]: "hover:border-impact-green focus-visible:border-impact-green",
  [ExperimentStatusEnum.INCONCLUSIVE]: "hover:border-ash focus-visible:border-ash",
};

export default function ExperimentCard({
  experiment,
  progress,
  onDelete,
}: {
  experiment: Experiment;
  progress?: ProgressData;
  onDelete?: (experiment: Experiment) => void;
}) {
  return (
    <Link
      href={`/experiment/${experiment.id}`}
      aria-label={`Open ${experiment.name}`}
      className={cn(
        "flex min-w-0 flex-col rounded-[2rem] border border-border bg-carbon p-6 transition-colors",
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
        <RunProgress completed={experiment.currentTurn} total={experiment.totalTurns} progress={progress} />
        <div className="mt-3 flex items-center justify-between gap-2 font-mono text-xs">
          <span className="text-muted-foreground">{experiment.date}</span>
          <div className="flex items-center gap-2">
            <span className={experiment.status === ExperimentStatusEnum.BROKE ? "text-fox-red" : "text-ash"}>
              turn {experiment.currentTurn} / {experiment.totalTurns}
            </span>
            {onDelete && DELETABLE_STATES.includes(experiment.state) ? (
              <Button
                variant="destructive"
                size="xs"
                className="rounded-full font-sans"
                aria-label={`Delete ${experiment.name}`}
                onClick={(event) => {
                  // The whole card is a link: don't open the run.
                  event.preventDefault();
                  event.stopPropagation();
                  onDelete(experiment);
                }}
              >
                Delete
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
