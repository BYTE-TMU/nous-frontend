import { ExperimentStatusEnum } from "@/components/experiment/ExperimentStatus";
import type { RunListItem } from "@/lib/api";
import type { Experiment } from "./ExperimentCard";

/**
 * The UI has three statuses; the backend has seven run states and no outcome in the
 * list response, so BROKE cannot be derived yet (BACKEND-ENDPOINTS.md Q1). Until it can:
 * a run that has not finished is IN PROGRESS, and a finished or failed one is
 * INCONCLUSIVE.
 */
export function toStatus(state: RunListItem["state"]): ExperimentStatusEnum {
  return state === "completed" || state === "failed"
    ? ExperimentStatusEnum.INCONCLUSIVE
    : ExperimentStatusEnum.IN_PROGRESS;
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
    status: toStatus(run.state),
    cost: formatCost(run.cost.total_usd),
  };
}
