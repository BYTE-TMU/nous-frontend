"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  ApiError,
  getMe,
  getRun,
  getRunJudgements,
  getRunResults,
  getRunTurns,
} from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import ChatBody from "./ChatBody";
import ChatHeader from "./ChatHeader";
import RunControls from "./RunControls";
import RenameRun from "./RenameRun";
import ViewResultButton from "./ViewResultButton";
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
  const router = useRouter();
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getMe(token)
      .then((me) => setAdmin(me.is_admin === true))
      .catch(() => setAdmin(false));
  }, []);

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

  // No token, or the backend said 401: send the visitor to log in instead of
  // showing a signed-out page.
  const signedOut = load.state === "signed-out";
  useEffect(() => {
    if (signedOut) router.replace("/login");
  }, [signedOut, router]);

  if (signedOut) return null;
  if (load.state === "loading") return <Notice>Loading experiment…</Notice>;
  if (load.state === "not-found") {
    return (
      <Notice>
        <p>We couldn&apos;t find this experiment.</p>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to experiments</Link>
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
        controls={
          <div className="flex items-center gap-2">
            {admin ? <RenameRun runId={runId} name={view.name} onRenamed={refresh} /> : null}
            {view.live ? (
              <RunControls runId={runId} state={view.state} onChanged={refresh} />
            ) : (
              <ViewResultButton />
            )}
          </div>
        }
      />
      <ChatBody view={view} />
    </main>
  );
}
