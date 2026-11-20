import { rubricLevel } from "@/components/landing/content";
import { cn } from "@/lib/utils";
import type { GraphRun } from "./graphData";
import { turnGradient } from "./turnGradient";

type Props = {
  runs: GraphRun[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function GraphChart({ runs, selectedId, onSelect }: Props) {
  const maxTurns = 20;
  const ticks = [20, 10, 0];

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[320px] gap-3 pt-3">
        <div className="relative h-[420px] w-10 shrink-0 font-mono text-xs text-smoke">
          {ticks.map((tick, index) => (
            <span key={index} className="absolute right-0 -translate-y-1/2" style={{ top: `${(1 - tick / maxTurns) * 100}%` }}>
              {tick}
            </span>
          ))}
          <span className="absolute top-1/2 -left-4 -translate-y-1/2 -rotate-90 whitespace-nowrap text-ash">Total turns</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="relative h-[420px] border-b border-l border-smoke/70">
            {[0, 0.5].map((position) => (
              <div key={position} aria-hidden className="absolute inset-x-0 border-t border-dashed border-graphite" style={{ top: `${position * 100}%` }} />
            ))}
            <div className="relative flex h-full items-end justify-center gap-3 px-3" style={{ minWidth: `${Math.max(280, runs.length * 82)}px` }}>
              {runs.map((run) => {
                const selected = run.summary.run_id === selectedId;
                const count = Math.min(maxTurns, Math.max(run.summary.turns_completed, ...run.turns.map((turn) => turn.number), 0));
                const turns = Array.from({ length: count }, (_, index) =>
                  run.turns.find((turn) => turn.number === index + 1) ?? { number: index + 1, score: null },
                );
                const description = turns.length
                  ? turns.map((turn) => `turn ${turn.number}: ${turn.score === null ? "unjudged" : rubricLevel(turn.score).label}`).join(", ")
                  : "no completed turns";
                return (
                  <button
                    key={run.summary.run_id}
                    type="button"
                    aria-label={`${run.summary.name}, ${description}`}
                    aria-pressed={selected}
                    onClick={() => onSelect(run.summary.run_id)}
                    className={cn(
                      "flex w-16 shrink-0 flex-col-reverse overflow-hidden rounded-md outline-none focus-visible:ring-2 focus-visible:ring-signal-lime",
                      selected && "ring-2 ring-signal-lime",
                      turns.length === 0 && "border border-dashed border-smoke",
                    )}
                    style={{ height: turns.length ? `${turns.length / maxTurns * 100}%` : "24px" }}
                  >
                    {turns.map((turn, index) => (
                      <span
                        key={turn.number}
                        title={`Turn ${turn.number}: ${turn.score === null ? "Unjudged" : rubricLevel(turn.score).label}`}
                        className="min-h-0 w-full flex-1"
                        style={{ background: turnGradient(turn.score, turns[index + 1]?.score, "top") }}
                      />
                    ))}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-center gap-3 px-3 pt-2" style={{ minWidth: `${Math.max(280, runs.length * 82)}px` }}>
            {runs.map((run) => (
              <span key={run.summary.run_id} title={run.summary.name} className={cn("w-16 shrink-0 truncate text-center font-mono text-xs", run.summary.run_id === selectedId ? "text-signal-lime" : "text-smoke")}>
                {run.summary.run_id.slice(0, 8)}
              </span>
            ))}
          </div>
          <p className="pt-4 text-center text-sm text-ash">Experiment ID</p>
          {runs.some((run) => run.summary.turns_completed > maxTurns || run.turns.some((turn) => turn.number > maxTurns)) && (
            <p className="pt-2 text-center text-sm text-ash">Only the first 20 turns are shown.</p>
          )}
        </div>
      </div>
    </div>
  );
}
