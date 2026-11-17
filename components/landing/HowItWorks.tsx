import { HugeiconsIcon } from "@hugeicons/react";
import DiamondIcon from "@hugeicons/core-free-icons/DiamondIcon";
import Reveal from "./Reveal";

// Section 03. The experiment lifecycle (configure → converse → judge) as three cards,
// each with a small static vignette built from the same tokens the app uses: role dots,
// the in-progress pulse, the duel progress bar and the break gradient.

/** A select-like row: role dot, role name, chosen value. Mirrors the new-experiment form. */
function Chip({ dot, label, value }: { dot: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-graphite bg-input px-3 py-2 text-sm">
      <span className="flex items-center gap-2 text-smoke">
        <span className={`size-2 rounded-full ${dot}`} />
        {label}
      </span>
      <span className="truncate font-mono text-xs text-ash">{value}</span>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    title: "Configure",
    body: "Pick any OpenRouter model as the attacker and another as the defender. Give each a preset prompt or write your own.",
    visual: (
      <div className="flex flex-col gap-2">
        <Chip dot="bg-attacker" label="Attacker" value="any model" />
        <Chip dot="bg-defender" label="Defender" value="maya-3 · Strong" />
      </div>
    ),
  },
  {
    n: "02",
    title: "Converse",
    body: "The models talk in character for up to ten turns. You follow along live, with no chat box to type into. You watch and read.",
    visual: (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between font-mono text-xs text-smoke">
          <span className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="landing-ping absolute inset-0 rounded-full bg-status-in-progress" />
              <span className="relative size-2 rounded-full bg-status-in-progress" />
            </span>
            RUNNING
          </span>
          <span>TURN 4 / 10</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-carbon">
          <div className="landing-progress h-full w-[40%] rounded-full bg-gradient-duel" />
        </div>
      </div>
    ),
  },
  {
    n: "03",
    title: "Judge",
    body: "A separate judge model scores each defender reply on a 0–5 rubric, and cites the turn where the rule gave way.",
    visual: (
      <div className="flex items-center gap-3 rounded-lg bg-gradient-break px-3 py-2.5 text-sm font-medium text-white">
        <HugeiconsIcon icon={DiamondIcon} className="size-3 fill-current" />
        Broke · judge cites turn 7
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {STEPS.map((s, i) => (
        <Reveal as="li" key={s.n} delay={i * 120} className="flex">
          <div className="flex w-full flex-col gap-8 rounded-2xl border border-graphite bg-ink p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-signal-lime">{s.n}</span>
              {i < STEPS.length - 1 && (
                <span aria-hidden className="font-mono text-smoke">
                  →
                </span>
              )}
            </div>
            <div className="min-h-[88px]">{s.visual}</div>
            <div>
              <h3 className="mb-2 text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="leading-relaxed text-ash">{s.body}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </ol>
  );
}
