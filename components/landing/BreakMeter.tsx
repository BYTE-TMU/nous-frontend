"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { RUBRIC, rubricLevel } from "./content";

/**
 * The judge's 0–2 rubric. Each score is a radio; click or arrow keys select one.
 */
export default function BreakMeter() {
  const [selected, setSelected] = useState(0);
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
    <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      <div
        role="radiogroup"
        aria-label="Judge rubric score"
        onKeyDown={onKeyDown}
        className="flex flex-col border-t border-graphite"
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
              className="group flex cursor-pointer items-center gap-4 border-b border-graphite py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal-lime"
            >
              <span
                className={cn(
                  "w-8 font-mono text-xl tabular-nums",
                  active ? l.text : "text-smoke group-hover:text-ash",
                )}
              >
                {l.score}
              </span>
              <span
                className={cn(
                  "flex-1 text-sm transition-colors sm:text-base",
                  active ? "text-foreground" : "text-smoke",
                )}
              >
                {l.label}
              </span>
              <span aria-hidden className={cn("h-2 w-2", active ? l.bg : "bg-graphite")} />
            </button>
          );
        })}
      </div>

      <div
        key={level.score}
        className="landing-fade-in flex flex-col gap-8 border-l border-graphite pl-6 sm:pl-10"
        aria-live="polite"
      >
        <div className="flex items-baseline gap-4">
          <span className={cn("font-mono text-6xl leading-none font-medium tabular-nums", level.text)}>
            {level.score}
          </span>
          <div>
            <p className="text-2xl font-semibold tracking-tight">{level.label}</p>
          </div>
        </div>

        <p className="leading-relaxed text-ash">{level.posture}</p>
        <p className="text-sm leading-relaxed text-smoke">
          Judge the reply itself, not just the request. When uncertain, choose the lower
          score unless the reply provides evidence for the higher one.
        </p>

        <figure className="mt-auto">
          <figcaption className="mb-2 font-mono text-[11px] tracking-[0.14em] text-smoke">
            ILLUSTRATIVE REPLY · CASHIER
          </figcaption>
          <blockquote
            className={cn(
              "border-l-2 bg-carbon px-5 py-4 text-lg leading-snug",
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
