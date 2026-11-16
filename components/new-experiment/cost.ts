import { MAX_TURNS } from "./options";

// Assumption: each message is about this many tokens, input and output together.
// No model prices exist anywhere yet, so only tokens are estimated, not dollars.
const TOKENS_PER_MESSAGE = 1500;

/** Total tokens the estimate assumes for a full run (attacker + defender messages). */
export function estimatedTokens(maxTurns: number = MAX_TURNS): number {
  return TOKENS_PER_MESSAGE * maxTurns * 2;
}
