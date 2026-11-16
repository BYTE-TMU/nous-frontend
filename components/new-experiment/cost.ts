import { MAX_TURNS, type ModelOption } from "./options";

// Assumption: each message is about this many tokens, input and output together.
// The judge model's cost is not included. Replace with a backend estimate once it
// exists.
const TOKENS_PER_MESSAGE = 1500;

/** Total tokens the estimate assumes for a full run (attacker + defender messages). */
export function estimatedTokens(maxTurns: number = MAX_TURNS): number {
  return TOKENS_PER_MESSAGE * maxTurns * 2;
}

/** One turn is an attacker message plus a defender message. */
export function estimateCostUsd(
  attacker: ModelOption | undefined,
  defender: ModelOption | undefined,
  maxTurns: number = MAX_TURNS,
): number | null {
  if (!attacker || !defender) return null;
  const perMessageTokens = TOKENS_PER_MESSAGE * maxTurns;
  const price = attacker.usdPerMillionTokens + defender.usdPerMillionTokens;
  return (perMessageTokens * price) / 1_000_000;
}

export function formatUsd(amount: number | null): string {
  if (amount === null) return "—";
  if (amount > 0 && amount < 0.01) return "<$0.01";
  return `$${amount.toFixed(2)}`;
}
