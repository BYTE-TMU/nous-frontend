import Link from "next/link";
import type { GraphRun } from "./graphData";

export default function GraphOverview({ run }: { run: GraphRun }) {
  const nearMisses = run.turns.filter((turn) => turn.score === 1).map((turn) => turn.number);
  const unjudged = run.turns.filter((turn) => turn.score === null).length;
  const rows = [
    ["Outcome", run.outcome],
    ["Status", run.summary.state.replaceAll("_", " ")],
    ["Break turn", run.breakTurn === null ? "—" : `Turn ${run.breakTurn}`],
    ["Turns completed", String(run.summary.turns_completed)],
    ["Softened turns", nearMisses.length ? `${nearMisses.length} — ${nearMisses.map((n) => `turn ${n}`).join(", ")}` : "None recorded"],
    ["Unjudged turns", String(unjudged)],
    ["Judge verdict", run.verdict ?? "Not available"],
    ["Recorded cost", `$${run.summary.cost.total_usd.toFixed(3)} · ${run.summary.cost.total_tokens.toLocaleString()} tokens`],
  ];

  return (
    <aside aria-label="Experiment overview" className="rounded-2xl border border-impact-green/60 bg-deep-forest p-5 text-white sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-3">
        <h2 className="text-lg font-semibold">Overview</h2>
        <span className="font-mono text-xs text-ash">{run.summary.run_id.slice(0, 8)}</span>
      </div>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[7rem_1fr] gap-3 border-b border-white/15 py-3 last:border-0 sm:grid-cols-[8rem_1fr]">
            <dt className="font-mono text-[10px] tracking-[0.12em] text-impact-green uppercase">{label}</dt>
            <dd className="min-w-0 break-words text-sm">{value}</dd>
          </div>
        ))}
      </dl>
      <Link href={`/experiment/${encodeURIComponent(run.summary.run_id)}`} className="mt-3 inline-block text-sm text-white underline underline-offset-4 hover:text-signal-lime">
        View transcript
      </Link>
    </aside>
  );
}
