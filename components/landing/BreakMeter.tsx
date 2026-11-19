"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { RUBRIC, rubricLevel } from "./content";

/**
 * The judge's 0–5 rubric as a staircase. Each step is a radio; hover, focus, click or
 * arrow keys select one. Rubric text is verbatim from nous-ai/eval/judgement_rubric.md.
 */
export default function BreakMeter() {
  // Start on 2 (Boundary Softening): the first level where a rule starts to give.
  const [selected, setSelected] = useState(2);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const level = rubricLevel(selected);

  // Roving focus: only the selected bar is tabbable; arrows move selection and focus together.
  const move = (to: number) => {
    const next = (to + RUBRIC.length) % RUBRIC.length;
    setSelected(next);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      move(selected + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      move(selected - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      move(0);
    } else if (e.key === "End") {
      e.preventDefault();
      move(RUBRIC.length - 1);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
      <div
        role="radiogroup"
        aria-label="Judge rubric score"
        onKeyDown={onKeyDown}
        className="flex h-[300px] items-end gap-2 sm:h-[380px] sm:gap-3"
      >
        {RUBRIC.map((l) => {
          const active = l.score === selected;
          return (
            <button
              key={l.score}
              ref={(el) => {
                refs.current[l.score] = el;
              }}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${l.score}: ${l.label}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setSelected(l.score)}
              onMouseEnter={() => setSelected(l.score)}
              className="group flex h-full flex-1 cursor-pointer flex-col justify-end gap-3 rounded-xl text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span
                className={cn(
                  "font-mono text-xs transition-colors sm:text-sm",
                  active ? "text-foreground" : "text-smoke group-hover:text-ash",
                )}
              >
                {l.score}
              </span>
              <span
                className={cn(
                  "relative block w-full overflow-hidden rounded-lg transition-all duration-500 ease-out",
                  active ? l.bg : "bg-carbon group-hover:bg-graphite",
                )}
                // Staircase: 22% at score 0 up to 100% at score 5.
                style={{ height: `${22 + l.score * 15.6}%` }}
              >
                {!active && (
                  <span className={cn("absolute inset-x-0 top-0 h-1", l.bg)} aria-hidden />
                )}
                {l.score === 5 && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-0 bottom-3 text-center font-mono text-[10px] tracking-[0.14em] sm:text-[11px]",
                      active ? "text-white" : "text-index-6",
                    )}
                  >
                    BREAK
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "hidden min-h-[2.5em] text-xs leading-tight transition-colors sm:block",
                  active ? "text-foreground" : "text-smoke",
                )}
              >
                {l.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Detail card. Keyed on the score so the fade-in replays on each change. */}
      <div
        key={level.score}
        className="landing-fade-in flex flex-col gap-6 rounded-2xl border border-graphite bg-ink p-6 sm:p-8"
        aria-live="polite"
      >
        <div className="flex items-baseline gap-4">
          <span className={cn("font-mono text-6xl leading-none font-medium tabular-nums", level.text)}>
            {level.score}
          </span>
          <div>
            <p className="text-2xl font-semibold tracking-tight">{level.label}</p>
            <p className="font-mono text-xs text-smoke">
              {level.score === 5 ? "A rule violation" : `${5 - level.score} step${level.score === 4 ? "" : "s"} from a break`}
            </p>
          </div>
        </div>

        <dl className="grid gap-4 text-sm">
          <div>
            <dt className="mb-1 font-mono text-[11px] tracking-[0.14em] text-smoke">RULE POSTURE</dt>
            <dd className="leading-relaxed text-ash">{level.posture}</dd>
          </div>
          <div>
            <dt className="mb-1 font-mono text-[11px] tracking-[0.14em] text-smoke">REQUIRED EVIDENCE</dt>
            <dd className="leading-relaxed text-ash">{level.evidence}</dd>
          </div>
        </dl>

        <figure className="mt-auto">
          <figcaption className="mb-2 font-mono text-[11px] tracking-[0.14em] text-smoke">
            TYPICAL DEFENDER LINE · CASHIER
          </figcaption>
          <blockquote
            className={cn(
              "rounded-[13px] rounded-tr-[4px] border-[1.5px] bg-muted px-5 py-4 text-lg leading-snug",
              level.border,
            )}
          >
            “{level.example}”
          </blockquote>
        </figure>
      </div>
    </div>
  );
}
