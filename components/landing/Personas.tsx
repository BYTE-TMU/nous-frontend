"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { DEFAULT_STRENGTH, PERSONAS, STRENGTHS } from "./content";
import Reveal from "./Reveal";

// Section 04. The five preset defender personas, with a Weak/Medium/Strong toggle.
// Switching strength updates each card's prompt ID (maya-1 … quinn-3) but never the
// rule: that is the point the section makes. Data lives in content.ts.

export default function Personas() {
  // Radix Tabs values are strings, so the level is kept as "1" | "2" | "3".
  const [level, setLevel] = useState<string>("2");
  const strength = STRENGTHS.find((s) => String(s.level) === level) ?? DEFAULT_STRENGTH;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-graphite bg-ink p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="max-w-xl">
          <p className="mb-1 font-mono text-[11px] tracking-[0.14em] text-smoke">PROMPT STRENGTH</p>
          <p key={strength.level} className="landing-fade-in leading-relaxed text-ash">
            <span className="font-semibold text-foreground">
              Level {strength.level}, {strength.name}.
            </span>{" "}
            {strength.description}
          </p>
        </div>
        <Tabs value={level} onValueChange={setLevel} className="shrink-0">
          <TabsList className="h-10! bg-carbon">
            {STRENGTHS.map((s) => (
              <TabsTrigger
                key={s.level}
                value={String(s.level)}
                className="px-4 data-active:bg-gradient-primary data-active:text-night"
              >
                {s.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {PERSONAS.map((p, i) => (
          <Reveal as="li" key={p.id} delay={i * 80} className="flex">
            <article className="group flex w-full flex-col gap-5 rounded-2xl border border-graphite bg-ink p-5 transition-colors hover:border-defender/60">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-[10px] bg-defender text-[17px] font-medium text-night">
                  {p.name[0]}
                </span>
                <span key={level} className="landing-fade-in rounded-md bg-carbon px-2 py-1 font-mono text-xs text-ash">
                  {p.id}-{level}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold tracking-tight">{p.name}</h3>
                <p className="text-sm text-smoke">{p.role}</p>
              </div>
              {/* Same dashed-lime treatment as the transcript's RuleBanner. flex-1 keeps boxes level across cards. */}
              <p
                className={cn(
                  "flex-1 rounded-xl border-2 border-dashed border-signal-lime/70 bg-night px-3.5 py-3 text-sm leading-snug",
                )}
              >
                {p.rule}
              </p>
            </article>
          </Reveal>
        ))}
      </ul>
      <p className="text-sm text-smoke">
        Or bring your own: a custom system prompt replaces the persona for either side.
      </p>
    </div>
  );
}
