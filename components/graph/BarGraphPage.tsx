"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ApiError, getRun, listRuns } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import GraphChart from "./GraphChart";
import GraphLegend from "./GraphLegend";
import GraphOverview from "./GraphOverview";
import { loadGraphRun, type GraphRun } from "./graphData";

type Load<T> =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; value: T };

const SELECT = "min-h-10 rounded-full border border-graphite bg-carbon px-4 text-sm text-white";

function errorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 0) return "Can't reach the server.";
  if (error instanceof ApiError && (error.status === 404 || error.status === 422)) return "Experiment not found.";
  if (error instanceof Error && error.message.startsWith("Unsupported judge score:")) return error.message;
  return "Couldn't load graph data.";
}

export default function BarGraphPage({ runId }: { runId?: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState<Load<GraphRun>>({ state: "loading" });
  const [recent, setRecent] = useState<Load<GraphRun[]>>({ state: "loading" });
  const [mode, setMode] = useState<"current" | "recent" | "all">(runId ? "current" : "all");
  const [selectedId, setSelectedId] = useState(runId ?? "");
  const [outcome, setOutcome] = useState("all");
  const [attacker, setAttacker] = useState("all");
  const [defender, setDefender] = useState("all");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!runId) return;
    let cancelled = false;
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setCurrent({ state: "loading" });
    void getRun(runId, token)
      .then((run) => loadGraphRun(run, token))
      .then((run) => {
        if (!cancelled) setCurrent({ state: "ready", value: run });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          clearToken();
          router.replace("/login");
        } else {
          setCurrent({ state: "error", message: errorMessage(error) });
        }
      });
    return () => { cancelled = true; };
  }, [runId, reload, router]);

  useEffect(() => {
    if (mode === "current") return;
    let cancelled = false;
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setRecent({ state: "loading" });
    void listRuns(token)
      .then(async (runs) => {
        const selectedRuns = mode === "recent" ? runs.slice(0, 10) : runs;
        const loaded: GraphRun[] = [];
        for (let i = 0; i < selectedRuns.length; i += 5) {
          if (cancelled) return;
          loaded.push(...await Promise.all(selectedRuns.slice(i, i + 5).map((run) => loadGraphRun(run, token))));
        }
        if (!cancelled) setRecent({ state: "ready", value: loaded });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          clearToken();
          router.replace("/login");
        } else {
          setRecent({ state: "error", message: errorMessage(error) });
        }
      });
    return () => { cancelled = true; };
  }, [mode, reload, router]);

  const load: Load<GraphRun[]> = mode === "current"
    ? current.state === "ready" ? { state: "ready", value: [current.value] } : current
    : recent;
  const runs = load.state === "ready" ? load.value : [];
  const attackers = [...new Set(runs.map((run) => run.summary.attacker_model))].sort();
  const defenders = [...new Set(runs.map((run) => run.summary.defender_model))].sort();
  const filtered = runs.filter((run) =>
    (outcome === "all" || run.outcome === outcome) &&
    (attacker === "all" || run.summary.attacker_model === attacker) &&
    (defender === "all" || run.summary.defender_model === defender),
  );
  const selected = filtered.find((run) => run.summary.run_id === selectedId) ?? filtered[0];

  return (
    <div className={runId ? "mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8" : "mx-auto max-w-7xl pb-8"}>
      {runId && <Link href={`/experiment/${encodeURIComponent(runId)}`} className="text-sm text-ash underline underline-offset-4 hover:text-signal-lime">
        Back to experiment
      </Link>}
      <div className={`${runId ? "mt-6" : "mt-2"} flex flex-wrap items-end justify-between gap-5`}>
        <div>
          <p className="font-mono text-xs tracking-[0.18em] text-signal-lime">BAR GRAPH</p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
            {runId ? (current.state === "ready" ? current.value.summary.name : "Experiment") : "Compare experiments"}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label>
            <span className="sr-only">Runs to display</span>
            <select
              value={mode}
              onChange={(event) => {
                const value = event.target.value;
                setMode(value === "recent" ? "recent" : value === "current" && runId ? "current" : "all");
                setOutcome("all");
                setAttacker("all");
                setDefender("all");
                setSelectedId(runId ?? "");
              }}
              className="min-h-10 rounded-full bg-signal-lime px-4 text-sm font-medium text-night"
            >
              {runId && <option value="current">Current</option>}
              <option value="all">All runs</option>
              <option value="recent">Last 10 runs</option>
            </select>
          </label>
          <details className="relative">
            <summary className="flex min-h-10 cursor-pointer list-none items-center rounded-full border border-graphite bg-carbon px-4 text-sm [&::-webkit-details-marker]:hidden">Filter ▾</summary>
            <div className="absolute right-0 z-20 mt-2 grid w-64 max-w-[calc(100vw-2rem)] gap-3 rounded-xl border border-graphite bg-carbon p-4 shadow-xl">
              <label className="grid gap-1 text-xs text-ash">
                Outcome
                <select value={outcome} onChange={(event) => setOutcome(event.target.value)} className={SELECT}>
                  <option value="all">All outcomes</option>
                  <option value="held">Held</option>
                  <option value="broke">Broke</option>
                  <option value="inconclusive">Inconclusive</option>
                  <option value="in progress">In progress</option>
                </select>
              </label>
              <label className="grid gap-1 text-xs text-ash">
                Attacker model
                <select value={attacker} onChange={(event) => setAttacker(event.target.value)} className={SELECT}>
                  <option value="all">All attackers</option>
                  {attackers.map((model) => <option key={model} value={model}>{model}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-xs text-ash">
                Defender model
                <select value={defender} onChange={(event) => setDefender(event.target.value)} className={SELECT}>
                  <option value="all">All defenders</option>
                  {defenders.map((model) => <option key={model} value={model}>{model}</option>)}
                </select>
              </label>
              <button type="button" className="text-left text-sm text-signal-lime underline" onClick={() => { setOutcome("all"); setAttacker("all"); setDefender("all"); }}>
                Clear filters
              </button>
            </div>
          </details>
          <GraphLegend />
          <Button variant="outline" className="rounded-full" onClick={() => setReload((value) => value + 1)}>Refresh</Button>
        </div>
      </div>
      {mode === "recent" && <p className="mt-4 text-sm text-smoke">Showing your 10 most recent runs.</p>}
      {mode === "all" && <p className="mt-4 text-sm text-smoke">Showing all your runs.</p>}
      <section aria-label="Run graph" className="mt-6 rounded-2xl border border-graphite bg-night/90 p-4 sm:p-6">
        {load.state === "loading" && <p role="status" className="py-20 text-center text-smoke">Loading graph…</p>}
        {load.state === "error" && (
          <div role="alert" className="flex flex-col items-center gap-4 py-20 text-center">
            <p>{load.message}</p>
            <Button variant="outline" onClick={() => setReload((value) => value + 1)}>Try again</Button>
          </div>
        )}
        {load.state === "ready" && !filtered.length && (
          <p className="py-20 text-center text-smoke">{runs.length ? "No runs match these filters." : "No runs to display."}</p>
        )}
        {load.state === "ready" && selected && (
          <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
            <GraphChart runs={filtered} selectedId={selected.summary.run_id} onSelect={setSelectedId} />
            <GraphOverview run={selected} />
          </div>
        )}
      </section>
    </div>
  );
}
