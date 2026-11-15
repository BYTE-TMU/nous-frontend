"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import PauseIcon from "@hugeicons/core-free-icons/PauseIcon";
import PlayIcon from "@hugeicons/core-free-icons/PlayIcon";
import StopIcon from "@hugeicons/core-free-icons/StopIcon";
import { Button } from "@/components/ui/Button";
import { ApiError, pauseRun, resumeRun, stopRun, type RunSummary } from "@/lib/api";
import { getToken } from "@/lib/auth";

type State = RunSummary["state"];

type Props = {
  runId: string;
  state: State;
  /** Called after any attempt, so the page can refresh straight away. */
  onChanged: () => void;
};

type Action = "pause" | "resume" | "stop";

const CALLS = { pause: pauseRun, resume: resumeRun, stop: stopRun } as const;

/** What the backend will accept in each state (see POST /runs/{id}/pause|resume|stop). */
export function availableActions(state: State) {
  return {
    pause: state === "running" || state === "judging",
    resume: state === "paused",
    stop: !["completed", "failed", "stopping"].includes(state),
  };
}

function failureMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 409) return "That isn't possible in the run's current state.";
    if (error.status === 503) return "The server couldn't queue that. Try again.";
    if (error.status === 401) return "Your session has expired. Log in again.";
    if (error.status === 0) return "Can't reach the server.";
  }
  return "Something went wrong. Please try again.";
}

/** Pause / resume / stop for a run. Renders nothing once the run has ended. */
export default function RunControls({ runId, state, onChanged }: Props) {
  const [busy, setBusy] = useState<Action | null>(null);
  const [confirmStop, setConfirmStop] = useState(false);
  const [error, setError] = useState("");

  const can = availableActions(state);
  if (state === "completed" || state === "failed") return null;

  async function run(action: Action) {
    setBusy(action);
    setError("");
    setConfirmStop(false);
    try {
      await CALLS[action](runId, getToken());
    } catch (failure) {
      setError(failureMessage(failure));
    } finally {
      setBusy(null);
      onChanged();
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-row gap-2">
        {can.resume ? (
          <Button variant="secondary" size="lg" disabled={busy !== null} onClick={() => void run("resume")}>
            <HugeiconsIcon icon={PlayIcon} size="lg" data-icon="inline-start" />
            {busy === "resume" ? "Resuming…" : "Resume"}
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="lg"
            disabled={!can.pause || busy !== null}
            onClick={() => void run("pause")}
          >
            <HugeiconsIcon icon={PauseIcon} size="lg" data-icon="inline-start" />
            {state === "pausing" || busy === "pause" ? "Pausing…" : "Pause"}
          </Button>
        )}

        {confirmStop ? (
          <>
            <Button variant="outline" size="lg" onClick={() => setConfirmStop(false)}>
              Cancel
            </Button>
            <Button size="lg" disabled={busy !== null} onClick={() => void run("stop")}>
              Confirm stop
            </Button>
          </>
        ) : (
          <Button
            size="lg"
            disabled={!can.stop || busy !== null}
            onClick={() => setConfirmStop(true)}
          >
            <HugeiconsIcon icon={StopIcon} size="lg" data-icon="inline-start" />
            {state === "stopping" || busy === "stop" ? "Stopping…" : "Stop"}
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
