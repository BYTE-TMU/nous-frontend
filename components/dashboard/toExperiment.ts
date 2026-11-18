import { ExperimentStatusEnum, deriveStatus } from "@/components/experiment/ExperimentStatus";
import type { RunListItem } from "@/lib/api";
import type { Experiment } from "./ExperimentCard";

/**
 * Maps a backend run state to a display status using `deriveStatus`.
 * Kept as a named export so existing tests can call it directly.
 */
export function toStatus(state: RunListItem["state"]): ExperimentStatusEnum {
  return deriveStatus(state);
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
    status: deriveStatus(run.state),
    cost: formatCost(run.cost.total_usd),
  };
}
