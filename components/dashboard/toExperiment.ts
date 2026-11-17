import { ExperimentStatusEnum } from "@/components/experiment/ExperimentStatus";
import type { RunListItem } from "@/lib/api";
import type { Experiment } from "./ExperimentCard";

/**
 * The list response carries a `broke` flag, so a run a judge scored as a break is BROKE even if
 * it later failed or was stopped. Otherwise: a run still going is IN PROGRESS, a completed one
 * HELD, and a failed one INCONCLUSIVE.
 */
export function toStatus(run: Pick<RunListItem, "state" | "broke">): ExperimentStatusEnum {
  if (run.broke) return ExperimentStatusEnum.BROKE;
  if (run.state === "completed") return ExperimentStatusEnum.HELD;
  return run.state === "failed" ? ExperimentStatusEnum.INCONCLUSIVE : ExperimentStatusEnum.IN_PROGRESS;
}

/** "anthropic/claude-haiku-5.5" -> "claude-haiku-5.5" */
const shortModel = (model: string) => model.split("/").pop() ?? model;

const formatCost = (usd: number) => (usd > 0 && usd < 0.01 ? "<$0.01" : `$${usd.toFixed(2)}`);

export function toExperiment(run: RunListItem): Experiment {
  return {
    id: run.run_id,
    name: run.name,
    attacker: shortModel(run.attacker_model),
    defender: shortModel(run.defender_model),
    description: run.description ?? "",
    date: new Date(run.created_at).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    currentTurn: run.turns_completed,
    totalTurns: run.max_turns,
    status: toStatus(run),
    cost: formatCost(run.cost.total_usd),
    owner: run.owner_email ?? undefined,
  };
}
