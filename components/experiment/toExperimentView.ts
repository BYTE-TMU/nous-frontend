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
 * Judge scores follow the rubric in nous-ai (eval/judgement_rubric.md): 0 held, 1 softened,
 * 2 broke. Only 1 and 2 are worth flagging in the transcript; the judge's first quote is
 * the excerpt. `messageNumber` is the defender message's own `turn_number`: that is the
 * row the judge scores.
 */
function toAssessment(judgements: RunJudgements, messageNumber: number): Assessment | undefined {
  const result = judgements.judgements.find(
    (j) => j.turn_number === messageNumber && j.status === "completed",
  );
  if (!result || (result.score !== 1 && result.score !== 2)) return undefined;
  return {
    classification: result.score === 2 ? "broke" : "softened",
    explanation: result.explanation ?? "",
    excerpt: result.evidence?.[0] ?? "",
  };
}

/**
 * Groups the flat message list into rounds ("turns" in the UI: one attacker message plus the
 * defender's reply).
 *
 * The backend's `turn_number` counts messages, not rounds: attacker 1, defender 2, attacker 3,
 * defender 4... So a round is an attacker message and the defender message that follows it,
 * and its number is its position, not either message's `turn_number`.
 *
 * Only finished messages come back, so while the run is generating (`state === "running"`)
 * the next message is inferred: the defender's reply if the last round has none, otherwise
 * the attacker's next message.
 */
export function toTurns(
  messages: RunMessage[],
  judgements: RunJudgements,
  generating?: { maxTurns: number },
): Turn[] {
  const turns: Turn[] = [];
  let open: Turn | undefined;
  for (const message of [...messages].sort((a, b) => a.turn_number - b.turn_number)) {
    if (message.speaker === "attacker") {
      open = {
        number: turns.length + 1,
        attacker: { id: `t${turns.length + 1}-a`, status: "complete", text: message.text },
      };
      turns.push(open);
      continue;
    }
    if (!open) {
      open = {
        number: turns.length + 1,
        attacker: { id: `t${turns.length + 1}-a`, status: "pending" },
      };
      turns.push(open);
    }
    open.defender = {
      id: `t${open.number}-d`,
      status: "complete",
      text: message.text,
      assessment: toAssessment(judgements, message.turn_number),
    };
    open = undefined;
  }

  const last = turns.at(-1);
  if (generating) {
    if (last && last.attacker.status === "complete" && !last.defender) {
      last.defender = { id: `t${last.number}-d`, status: "pending" };
    } else if (turns.length < generating.maxTurns && (!last || last.defender)) {
      const number = turns.length + 1;
      turns.push({ number, attacker: { id: `t${number}-a`, status: "pending" } });
    }
  }
  return turns;
}

/**
 * The backend's outcomes are `broke` and `held`. A judged break is BROKE. A run that is still
 * going is IN PROGRESS, and a completed one without a break (it held, or was stopped) is HELD.
 * A failed run has no outcome, so it is INCONCLUSIVE.
 */
export function toViewStatus(run: RunSummary, judgements: RunJudgements): ExperimentStatusEnum {
  if (judgements.broke) return ExperimentStatusEnum.BROKE;
  if (isLive(run.state)) return ExperimentStatusEnum.IN_PROGRESS;
  return run.state === "completed" ? ExperimentStatusEnum.HELD : ExperimentStatusEnum.INCONCLUSIVE;
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
    turns: toTurns(
      messages,
      judgements,
      run.state === "running" ? { maxTurns: run.max_turns } : undefined,
    ),
    setup: {
      defenderPersona: run.defender_persona ?? (rule ? "Custom prompt" : "—"),
      rule: rule || "—",
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
