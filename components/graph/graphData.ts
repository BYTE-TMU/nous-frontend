import { getRunJudgements, getRunResults, getRunTurns } from "@/lib/api";
import type { RunListItem, RunSummary } from "@/lib/api";
import { toTurns } from "@/components/experiment/toExperimentView";

type Summary = Pick<
  RunSummary,
  "run_id" | "name" | "state" | "attacker_model" | "defender_model" |
  "turns_completed" | "max_turns" | "cost"
>;

export type GraphScore = 0 | 1 | 2;
export type GraphTurn = { number: number; score: GraphScore | null };
export type GraphOutcome = "held" | "broke" | "inconclusive" | "in progress";
export type GraphRun = {
  summary: Summary;
  turns: GraphTurn[];
  outcome: GraphOutcome;
  breakTurn: number | null;
};

function score(value: number | null): GraphScore | null {
  if (value === null || value === 0 || value === 1 || value === 2) return value;
  throw new Error(`Unsupported judge score: ${value}`);
}

export async function loadGraphRun(summary: Summary | RunListItem, token: string): Promise<GraphRun> {
  if (summary.state === "completed") {
    const result = await getRunResults(summary.run_id, token);
    return {
      summary,
      turns: result.per_turn.map((turn) => ({ number: turn.turn, score: score(turn.classification) })),
      outcome: result.outcome,
      breakTurn: result.break_turn,
    };
  }

  const [messages, judgements] = await Promise.all([
    getRunTurns(summary.run_id, token),
    getRunJudgements(summary.run_id, token),
  ]);
  const turns = toTurns(messages, judgements)
    .filter((turn) => turn.defender?.status === "complete")
    .map((turn) => ({
      number: turn.number,
      score: score(turn.defender?.judgement?.state === "scored" ? turn.defender.judgement.score : null),
    }));
  const breakTurn = turns.find((turn) => turn.score === 2)?.number ?? null;
  return {
    summary,
    turns,
    outcome: breakTurn !== null ? "broke" : summary.state === "failed" ? "inconclusive" : "in progress",
    breakTurn,
  };
}
