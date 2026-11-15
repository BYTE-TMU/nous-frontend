"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  ApiError,
  getRun,
  getRunJudgements,
  getRunResults,
  getRunTurns,
} from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import ChatBody from "./ChatBody";
import ChatHeader from "./ChatHeader";
import RunControls from "./RunControls";
import { toExperimentView, type ExperimentView } from "./toExperimentView";

const POLL_MS = 3000;

type Load =
  | { state: "loading" }
  | { state: "signed-out" }
  | { state: "not-found" }
  | { state: "error"; message: string }
  | { state: "ready"; view: ExperimentView };

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
      {children}
    </main>
  );
}

/** One experiment, loaded from the backend and refreshed while the run is still going. */
export default function ExperimentPage({ runId }: { runId: string }) {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fetchRun = useCallback(
    async (initial: boolean) => {
      const token = getToken();
      if (!token) {
        setLoad({ state: "signed-out" });
        return;
      }
      if (initial) setLoad({ state: "loading" });
      try {
        const [run, messages, judgements] = await Promise.all([
          getRun(runId, token),
          getRunTurns(runId, token),
          getRunJudgements(runId, token),
        ]);
        // The verdict exists only once the run is completed (other states answer 409).
        const results =
          run.state === "completed"
            ? await getRunResults(runId, token).catch(() => undefined)
            : undefined;
        const view = toExperimentView(run, messages, judgements, results);
        setLoad({ state: "ready", view });
        if (view.live) timer.current = setTimeout(() => void fetchRun(false), POLL_MS);
      } catch (failure) {
        if (failure instanceof ApiError && failure.status === 401) {
          clearToken();
          setLoad({ state: "signed-out" });
        } else if (failure instanceof ApiError && (failure.status === 404 || failure.status === 422)) {
          setLoad({ state: "not-found" });
        } else if (initial) {
          setLoad({
            state: "error",
            message:
              failure instanceof ApiError && failure.status === 0
                ? "Can't reach the server."
                : "Couldn't load this experiment.",
          });
        } else {
          // A failed refresh keeps what is on screen and tries again.
          timer.current = setTimeout(() => void fetchRun(false), POLL_MS);
        }
      }
    },
    [runId],
  );

  // After pause, resume or stop: show the new state now instead of waiting for the next poll.
  const refresh = useCallback(() => {
    clearTimeout(timer.current);
    void fetchRun(false);
  }, [fetchRun]);

  useEffect(() => {
    void fetchRun(true);
    return () => clearTimeout(timer.current);
  }, [fetchRun]);

  if (load.state === "loading") return <Notice>Loading experiment…</Notice>;
  if (load.state === "signed-out") {
    return (
      <Notice>
        <p>Log in to see this experiment.</p>
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
      </Notice>
    );
  }
  if (load.state === "not-found") {
    return (
      <Notice>
        <p>We couldn&apos;t find this experiment.</p>
        <Button asChild variant="outline">
          <Link href="/">Back to experiments</Link>
        </Button>
      </Notice>
    );
  }
  if (load.state === "error") {
    return (
      <Notice>
        <p>{load.message}</p>
        <Button variant="outline" onClick={() => void fetchRun(true)}>
          Try again
        </Button>
      </Notice>
    );
  }

  const { view } = load;
  return (
    <main className="flex h-full flex-col items-center justify-between">
      <ChatHeader
        name={view.name}
        status={view.status}
        attacker={view.attacker}
        defender={view.defender}
        controls={<RunControls runId={runId} state={view.state} onChanged={refresh} />}
      />
      <ChatBody view={view} />
    </main>
  );
}
