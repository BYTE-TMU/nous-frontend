import type { GraphTurn } from "@/components/graph/graphData";
import { turnGradient } from "@/components/graph/turnGradient";

export type ProgressData =
  | { state: "loading" }
  | { state: "error" }
  | { state: "ready"; turns: GraphTurn[] };

const LABELS = ["Held", "Softened", "Broke"];

export default function RunProgress({
  completed,
  total,
  progress,
}: {
  completed: number;
  total: number;
  progress?: ProgressData;
}) {
  if (total <= 0) return null;
  const count = Math.max(0, Math.min(completed, total));
  const scores = Array.from({ length: count }, (_, index) =>
    progress?.state === "ready"
      ? progress.turns.find((turn) => turn.number === index + 1)?.score ?? null
      : null,
  );
  const description = progress?.state === "error"
    ? "Judge scores unavailable"
    : progress?.state !== "ready" && count > 0
      ? "Loading judge scores"
      : scores.map((score, index) => `Turn ${index + 1}: ${score === null ? "Unjudged" : LABELS[score]}`).join(", ");

  return (
    <div>
      <div
        role="progressbar"
        aria-label="Completed turns"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={count}
        aria-valuetext={`${count} of ${total} turns${description ? `. ${description}` : ""}`}
        title={description}
        className="h-1 w-full overflow-hidden rounded-full bg-graphite"
      >
        <div className="flex h-full" style={{ width: `${count / total * 100}%` }}>
          {scores.map((score, index) => {
            const next = scores[index + 1];
            return (
              <span
                key={index}
                className="h-full min-w-0 flex-1"
                style={{ background: turnGradient(score, next, "right") }}
              />
            );
          })}
        </div>
      </div>
      {progress?.state === "error" && <span className="text-xs text-smoke">Judge scores unavailable</span>}
    </div>
  );
}
