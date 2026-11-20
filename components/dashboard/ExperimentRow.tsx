"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import ArrowRight02Icon from "@hugeicons/core-free-icons/ArrowRight02Icon";
import ExperimentStatus from "@/components/experiment/ExperimentStatus";
import { Button } from "@/components/ui/Button";
import type { Experiment } from "./ExperimentCard";
import { DELETABLE_STATES } from "@/lib/api";
import RunProgress, { type ProgressData } from "./RunProgress";

export default function ExperimentRow({
  experiment,
  progress,
  isLast,
  onDelete,
}: {
  experiment: Experiment;
  progress?: ProgressData;
  isLast?: boolean;
  onDelete?: (experiment: Experiment) => void;
}) {
  return (
    <Link
      href={`/experiment/${experiment.id}`}
      aria-label={`Open ${experiment.name}`}
      className={`grid grid-cols-[180px_1fr_1fr_1fr_100px_140px_100px_90px] items-center gap-4 border-x-2 border-b-2 border-border px-6 py-4 transition-colors hover:bg-muted ${isLast ? "rounded-b-2xl" : ""}`}
    >
      <div>
        <ExperimentStatus status={experiment.status} />
      </div>

      <p className="text-base font-bold truncate">{experiment.name}</p>

      <div className="flex min-w-0 flex-wrap items-center gap-2">
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

      <p className="text-sm text-muted-foreground truncate">
        {experiment.owner ? `${experiment.owner} · ` : ""}
        {experiment.description}
      </p>

      <Button variant="outline" size="sm" className="rounded-full">
        {experiment.cost}
      </Button>

      <span className="text-sm">{experiment.date}</span>

      <div className="min-w-0">
        <span className="text-sm">{experiment.currentTurn} / {experiment.totalTurns}</span>
        <div className="mt-2">
          <RunProgress completed={experiment.currentTurn} total={experiment.totalTurns} progress={progress} />
        </div>
      </div>
      <div className="flex justify-end">
        {onDelete && DELETABLE_STATES.includes(experiment.state) ? (
          <Button
            variant="destructive"
            size="sm"
            className="rounded-full"
            aria-label={`Delete ${experiment.name}`}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onDelete(experiment);
            }}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </Link>
  );
}
