import { PRINCIPLES } from "./content";
import Reveal from "./Reveal";

// Section 05. The trust commitments researchers care about, drawn from the project
// spec's invariants. Copy lives in content.ts → PRINCIPLES.

/** A numbered 1/2/3-column list; each item reveals with a small per-column stagger. */
export default function Principles() {
  return (
    <ol className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
      {PRINCIPLES.map((p, i) => (
        <Reveal
          as="li"
          key={p.title}
          delay={(i % 3) * 100}
          className="flex flex-col gap-3 border-t border-graphite pt-6 pb-10"
        >
          <span className="font-mono text-xs text-signal-lime">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="text-xl font-semibold tracking-tight">{p.title}</h3>
          <p className="leading-relaxed text-ash">{p.body}</p>
        </Reveal>
      ))}
    </ol>
  );
}
