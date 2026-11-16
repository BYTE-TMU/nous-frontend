import type { Assessment, Turn } from "@/components/transcript/types";
import type { RunJudgements, RunMessage, RunResults, RunSummary } from "@/lib/api";
import { ExperimentStatusEnum } from "./ExperimentStatus";
import type { ExperimentSetup } from "./types";

export type ExperimentView = {
  name: string;
  attacker: string;
  defender: string;
  rule: string;
  status: ExperimentStatusEnum;
  turns: Turn[];
  setup: ExperimentSetup;
  /** The run can still change, so the page should keep refreshing it. */
  live: boolean;
  state: RunSummary["state"];
  costUsd: number;
  /** The judge's closing verdict. Only exists once the run has completed. */
  verdict?: { turn: number; explanation: string; excerpt: string };
};

const FINISHED: RunSummary["state"][] = ["completed", "failed"];

export const isLive = (state: RunSummary["state"]) => !FINISHED.includes(state);

/** "anthropic/claude-haiku-5.5" -> "claude-haiku-5.5" */
const shortModel = (model: string) => model.split("/").pop() ?? model;

/**
 * Judge scores are 0 held, 1 softened, 2 broke. Only 1 and 2 are worth flagging in the
 * transcript; the judge's first quote is the excerpt.
 */
function toAssessment(judgements: RunJudgements, turnNumber: number): Assessment | undefined {
  const result = judgements.judgements.find(
    (j) => j.turn_number === turnNumber && j.status === "completed",
  );
  if (!result || (result.score !== 1 && result.score !== 2)) return undefined;
  return {
    classification: result.score === 2 ? "broke" : "near_miss",
    explanation: result.explanation ?? "",
    excerpt: result.evidence?.[0] ?? "",
  };
}

/** Groups the flat message list into turns; a turn without a defender reply is still running. */
export function toTurns(messages: RunMessage[], judgements: RunJudgements): Turn[] {
  const byNumber = new Map<number, Turn>();
  for (const message of messages) {
    // The backend numbers each /turn message; the transcript displays each
    // attacker/defender pair as one turn (1+2 => 1, 3+4 => 2, etc.).
    const displayTurnNumber = Math.ceil(message.turn_number / 2);
    const turn = byNumber.get(displayTurnNumber) ?? {
      number: displayTurnNumber,
      attacker: { id: `t${displayTurnNumber}-a`, status: "pending" as const },
    };
    if (message.speaker === "attacker") {
      turn.attacker = {
        id: `t${displayTurnNumber}-a`,
        status: "complete",
        text: message.text,
      };
    } else {
      turn.defender = {
        id: `t${displayTurnNumber}-d`,
        status: "complete",
        text: message.text,
        // Judgements still use the backend's message turn number.
        assessment: toAssessment(judgements, message.turn_number),
      };
    }
    byNumber.set(displayTurnNumber, turn);
  }
  return [...byNumber.values()].sort((a, b) => a.number - b.number);
}

/**
 * A judged break is BROKE. Otherwise a run that is still going is IN PROGRESS, and one
 * that has ended is INCONCLUSIVE (it held, was stopped, or failed).
 */
export function toViewStatus(run: RunSummary, judgements: RunJudgements): ExperimentStatusEnum {
  if (judgements.broke) return ExperimentStatusEnum.BROKE;
  return isLive(run.state) ? ExperimentStatusEnum.IN_PROGRESS : ExperimentStatusEnum.INCONCLUSIVE;
}

export function toExperimentView(
  run: RunSummary,
  messages: RunMessage[],
  judgements: RunJudgements,
  results?: RunResults,
): ExperimentView {
  const attacker = shortModel(run.attacker_model);
  const defender = shortModel(run.defender_model);
  const rule = run.defender_prompt ?? run.defender_persona ?? "";
  return {
    name: run.name,
    attacker,
    defender,
    rule,
    status: toViewStatus(run, judgements),
    turns: toTurns(messages, judgements),
    setup: {
      defenderPersona: run.defender_persona ?? (rule ? "Custom prompt" : "—"),
      attackStrategy: run.attacker_prompt ?? "Chosen when the run starts",
      attackerModel: attacker,
      defenderModel: defender,
    },
    live: isLive(run.state),
    state: run.state,
    costUsd: run.cost.total_usd,
    verdict: results?.judge_verdict
      ? {
          // The results endpoint already numbers completed attacker/defender rounds.
          turn: results.judge_verdict.cited_turn,
          explanation: results.judge_verdict.explanation,
          excerpt: results.judge_verdict.excerpt ?? "",
        }
      : undefined,
  };
}
