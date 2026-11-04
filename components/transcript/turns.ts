import type { Turn } from "./types";

/** A turn is finished once the defender's reply has landed. */
export function countCompletedTurns(turns: Turn[]) {
  return turns.filter((t) => t.defender?.status === "complete").length;
}
