import type { GraphScore } from "./graphData";

const COLORS = ["var(--color-impact-green)", "var(--color-index-3)", "var(--color-index-6)"];

export function turnGradient(score: GraphScore | null, next: GraphScore | null | undefined, direction: "right" | "top"): string {
  const color = score === null ? "var(--color-smoke)" : COLORS[score];
  const nextColor = score === null || next == null ? color : COLORS[next];
  return `linear-gradient(to ${direction}, ${color}, ${nextColor})`;
}
