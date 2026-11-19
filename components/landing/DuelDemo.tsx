"use client";

// Section 01 of the landing page. Reuses TurnMarker, RuleBanner and
// TranscriptMessageView from components/transcript/ so the demo looks exactly like
// the product. The run is scripted (content.ts → DEMO_TURNS) and labelled
// "Illustrative run" in the panel: it is not model output.

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import DiamondIcon from "@hugeicons/core-free-icons/DiamondIcon";
import { Button } from "@/components/ui/Button";
import { MessageGroup } from "@/components/ui/message";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";
import RuleBanner from "@/components/transcript/RuleBanner";
import TranscriptMessageView from "@/components/transcript/TranscriptMessageView";
import TurnMarker from "@/components/transcript/TurnMarker";
import { cn } from "@/lib/utils";
import { DEMO_RULE, DEMO_TURNS, RUBRIC, rubricLevel, type DemoTurn } from "./content";
import { useInView, usePrefersReducedMotion } from "./hooks";

/*
 * Timeline. Each turn has four phases:
 *   0 attacker writing · 1 attacker sent, defender writing · 2 defender sent, judge reading · 3 judged
 * `step` counts phases across the whole run; -1 is "not started".
 */
const PHASES = 4;
const LAST_STEP = DEMO_TURNS.length * PHASES - 1;
const PHASE_MS = [1100, 1500, 900, 1300];

const ATTACKER_MODEL = "model A";
const DEFENDER_MODEL = "model B · maya-2";

/** Which phase (0–3) a turn is in at a given global step. Negative means not reached yet. */
function phaseOf(turn: DemoTurn, step: number): number {
  return Math.min(PHASES - 1, step - (turn.number - 1) * PHASES);
}

/**
 * A model's "Thought process" under its message, built on the Trace primitive.
 * Indented by the avatar width (pl-16 / pr-16) so it lines up with the bubble.
 */
function Thought({ text, align, defaultOpen }: { text: string; align: "start" | "end"; defaultOpen: boolean }) {
  return (
    <Trace className={cn("max-w-full sm:max-w-[80%]", align === "end" ? "self-end pr-14 sm:pr-16" : "pl-14 sm:pl-16")}>
      <TraceCollapsible defaultOpen={defaultOpen}>
        <TraceCollapsibleTrigger className={cn("text-[13px]", align === "end" && "self-end")}>
          <TraceLine>
            <TraceTitle>Thought process</TraceTitle>
          </TraceLine>
        </TraceCollapsibleTrigger>
        <TraceCollapsibleContent className="text-sm italic">{text}</TraceCollapsibleContent>
      </TraceCollapsible>
    </Trace>
  );
}

/**
 * One turn of the demo. Messages start "pending" (the real typing bubble) and complete
 * as the phase advances; the judge's flag attaches to the defender reply in phase 3.
 */
function DemoTurnView({ turn, phase }: { turn: DemoTurn; phase: number }) {
  const attackerSent = phase >= 1;
  const defenderSent = phase >= 2;
  const judged = phase >= 3;
  return (
    <section aria-label={`Turn ${turn.number}`} className="landing-turn-in flex flex-col gap-6">
      <TurnMarker number={turn.number} />
      <MessageGroup className="gap-3 [&_[data-slot=bubble-content]]:text-base sm:[&_[data-slot=bubble-content]]:text-xl">
        <TranscriptMessageView
          role="attacker"
          model={ATTACKER_MODEL}
          turnNumber={turn.number}
          message={{
            id: `a${turn.number}`,
            status: attackerSent ? "complete" : "pending",
            text: turn.attacker,
          }}
        />
        {attackerSent && <Thought text={turn.attackerThought} align="start" defaultOpen={false} />}
        {attackerSent && (
          <TranscriptMessageView
            role="defender"
            model={DEFENDER_MODEL}
            turnNumber={turn.number}
            message={{
              id: `d${turn.number}`,
              status: defenderSent ? "complete" : "pending",
              text: turn.defender,
              assessment:
                judged && turn.flag
                  ? { ...turn.flag, excerpt: turn.defender }
                  : undefined,
            }}
          />
        )}
        {defenderSent && <Thought text={turn.defenderThought} align="end" defaultOpen />}
      </MessageGroup>
    </section>
  );
}

/**
 * The side panel: run status, the three roles, turn progress, the peak judge score on
 * the colour index, and a per-turn score log. Everything is derived from `step`.
 */
function RunPanel({ step, onReplay }: { step: number; onReplay: () => void }) {
  const judgedTurns = DEMO_TURNS.filter((t) => step >= 0 && phaseOf(t, step) >= 3);
  const peak = judgedTurns.reduce((max, t) => Math.max(max, t.score), -1);
  const done = step >= LAST_STEP;
  const broke = judgedTurns.find((t) => t.score === 2);
  const currentTurn = step < 0 ? 0 : Math.min(DEMO_TURNS.length, Math.floor(step / PHASES) + 1);

  return (
    <aside className="flex flex-col gap-6 rounded-2xl border border-graphite bg-ink p-5 sm:p-6 lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-md border border-dashed border-smoke/60 px-2 py-0.5 font-mono text-[11px] tracking-[0.14em] text-smoke">
          ILLUSTRATIVE RUN
        </span>
        <span className="flex items-center gap-2 text-sm" role="status">
          {done ? (
            broke ? (
              <>
                <HugeiconsIcon icon={DiamondIcon} className="size-3 fill-status-broke text-status-broke" />
                <span className="font-medium text-status-broke">Broke on turn {broke.number}</span>
              </>
            ) : (
              <span className="text-ash">Completed</span>
            )
          ) : (
            <>
              <span className="relative flex size-2">
                <span className="landing-ping absolute inset-0 rounded-full bg-status-in-progress" />
                <span className="relative size-2 rounded-full bg-status-in-progress" />
              </span>
              <span className="text-ash">{step < 0 ? "Provisioning" : "Running"}</span>
            </>
          )}
        </span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 text-sm">
        <dt className="flex items-center gap-2 text-smoke">
          <span className="size-2 rounded-full bg-attacker" /> Attacker
        </dt>
        <dd className="text-right font-mono text-ash">{ATTACKER_MODEL}</dd>
        <dt className="flex items-center gap-2 text-smoke">
          <span className="size-2 rounded-full bg-defender" /> Defender
        </dt>
        <dd className="text-right font-mono text-ash">maya-2 · Medium</dd>
        <dt className="flex items-center gap-2 text-smoke">
          <span className="size-2 rounded-full bg-judge" /> Judge
        </dt>
        <dd className="text-right font-mono text-ash">0–2 rubric</dd>
      </dl>

      <div>
        <div className="mb-2 flex justify-between font-mono text-xs text-smoke">
          <span>TURN {currentTurn} / {DEMO_TURNS.length}</span>
          <span>{Math.round((Math.max(0, step + 1) / (LAST_STEP + 1)) * 100)}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-carbon">
          <div
            className="h-full rounded-full transition-[clip-path] duration-700 ease-out"
            style={{
              background: "linear-gradient(90deg, var(--color-blue-freeze) 0%, var(--color-blue-freeze) 30%, var(--color-index-3) 50%, var(--color-index-3) 70%, var(--color-status-broke) 90%, var(--color-status-broke) 100%)",
              clipPath: `inset(0 ${100 - (Math.max(0, step + 1) / (LAST_STEP + 1)) * 100}% 0 0)`,
            }}
          />
        </div>
      </div>

      <div>
        <p className="mb-3 font-mono text-xs tracking-[0.14em] text-smoke">JUDGE · PEAK SCORE</p>
        <div className="grid grid-cols-3 gap-1.5" aria-label={peak < 0 ? "No turns judged yet" : `Peak score ${peak} of 2`}>
          {RUBRIC.map((level) => (
            <div key={level.score} className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "h-9 w-full rounded-md transition-all duration-500",
                  level.score <= peak ? level.bg : "bg-carbon",
                  level.score === peak && "ring-2 ring-white/80 ring-offset-2 ring-offset-ink",
                )}
              />
              <span className={cn("font-mono text-[11px]", level.score === peak ? "text-foreground" : "text-smoke")}>
                {level.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ol className="flex flex-col gap-2 border-t border-graphite pt-5 text-sm">
        {DEMO_TURNS.map((t) => {
          const phase = step < 0 ? -1 : phaseOf(t, step);
          const level = rubricLevel(t.score);
          return (
            <li key={t.number} className="flex items-center gap-3">
              <span className="w-7 font-mono text-xs text-smoke">T{t.number}</span>
              {phase >= 3 ? (
                <span className="landing-fade-in flex items-center gap-2">
                  <span className={cn("size-2.5 rounded-[3px]", level.bg)} />
                  <span className="font-mono text-xs text-foreground">{t.score}</span>
                  <span className="text-ash">{level.label}</span>
                </span>
              ) : phase >= 2 ? (
                <span className="text-smoke italic">judge reading…</span>
              ) : (
                <span className="text-graphite">—</span>
              )}
            </li>
          );
        })}
      </ol>

      <Button variant="outline" onClick={onReplay} disabled={!done} className="h-10 rounded-xl border-graphite">
        Replay run
      </Button>
    </aside>
  );
}

/**
 * The "A run, turn by turn" demo: a scripted experiment played through the real
 * transcript components, with a live run panel beside it. Plays once when the
 * transcript scrolls into view; Replay restarts it.
 */
export default function DuelDemo() {
  // Watch the transcript itself (not the whole grid): on mobile the grid is very tall,
  // so a threshold on it might never be reached while the transcript is on screen.
  const transcriptRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inView = useInView(transcriptRef, { threshold: 0.3 });
  const reduced = usePrefersReducedMotion();
  // The server renders the finished run, so the section reads in full even if
  // JavaScript never loads. Once mounted (and motion is allowed) we rewind to "not
  // started" and play it the first time the transcript scrolls into view.
  const [step, setStep] = useState(LAST_STEP);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setStep(-1);
  }, []);

  useEffect(() => {
    if (reduced) setStep(LAST_STEP);
    else if (inView && step < 0) setStep(0);
  }, [inView, reduced, step]);

  // Advance one phase at a time.
  useEffect(() => {
    if (reduced || step < 0 || step >= LAST_STEP) return;
    const timer = window.setTimeout(() => setStep((s) => s + 1), PHASE_MS[step % PHASES]);
    return () => window.clearTimeout(timer);
  }, [step, reduced]);

  // Keep the newest message in view inside the transcript panel (never scrolls the page).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || step < 0) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [step, reduced]);

  const replay = () => {
    scrollRef.current?.scrollTo({ top: 0 });
    setStep(0);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr] lg:gap-8">
      {/* On mobile the transcript comes first (it's the thing to watch); the panel follows. */}
      <div className="order-2 lg:order-1">
        <RunPanel step={step} onReplay={replay} />
      </div>

      {/* Transcript: fixed height, scrolls internally so the page never jumps. */}
      <div
        ref={transcriptRef}
        className="relative order-1 overflow-hidden rounded-2xl border border-graphite bg-night lg:order-2"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-night to-transparent" />
        <div
          ref={scrollRef}
          className="h-[min(560px,70svh)] overflow-y-auto overscroll-contain px-4 py-6 sm:px-8 sm:py-8 lg:h-[700px]"
          aria-live="polite"
          aria-busy={step >= 0 && step < LAST_STEP}
        >
          <div className="flex flex-col gap-10">
            <div className="[&>p]:text-base sm:[&>p]:text-xl">
              <RuleBanner rule={DEMO_RULE} />
            </div>
            {DEMO_TURNS.filter((t) => step >= (t.number - 1) * PHASES).map((t) => (
              <DemoTurnView key={t.number} turn={t} phase={phaseOf(t, step)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
