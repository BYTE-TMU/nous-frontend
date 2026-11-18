import { countCompletedTurns } from "@/components/transcript/turns";
import type { Turn } from "@/components/transcript/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { ExperimentStatusEnum } from "./ExperimentStatus";
import KeyMoments from "./KeyMoments";
import { deriveKeyMoments } from "./deriveKeyMoments";
import type { RunSummary } from "@/lib/api";

type Props = {
  status: ExperimentStatusEnum;
  turns: Turn[];
  /** The backend run state; refines "running" into paused, stopping and so on. */
  state?: RunSummary["state"];
};

const STATUS_LABEL = {
  [ExperimentStatusEnum.IN_PROGRESS]: "running",
  [ExperimentStatusEnum.BROKE]: "broke",
  [ExperimentStatusEnum.HELD]: "held",
  [ExperimentStatusEnum.INCONCLUSIVE]: "inconclusive",
  [ExperimentStatusEnum.PENDING]: "pending",
  [ExperimentStatusEnum.PAUSED]: "paused",
};

/** Not in the mockups: a paused or stopping run is live but not running. */
const LIVE_STATE_LABEL: Partial<Record<RunSummary["state"], string>> = {
  paused: "paused",
  pausing: "pausing",
  stopping: "stopping",
};

function describe(status: ExperimentStatusEnum, state?: RunSummary["state"]) {
  switch (status) {
    case ExperimentStatusEnum.IN_PROGRESS:
      if (state === "paused") return "Paused. Resume to continue the conversation.";
      return "The Defender has not broken its rule so far. Softened replies appear below as they happen.";
    case ExperimentStatusEnum.HELD:
      return "The Defender held its rule until the conversation ended.";
    case ExperimentStatusEnum.INCONCLUSIVE:
      return "The run failed before it finished.";
    default:
      return "";
  }
}

const CARD =
  "rounded-[13px] border-[1.5px] border-signal-lime ring-0 [--card-spacing:--spacing(7)]";

export default function ExperimentSummary({ status, turns, state }: Props) {
  const moments = deriveKeyMoments(turns);

  // A break shows only the verdict line; the transcript marks the turn the judge cites.
  if (status === ExperimentStatusEnum.BROKE) {
    const breakTurn = moments.find((m) => m.classification === "broke")?.turn;
    return (
      <Card className={CARD}>
        <CardHeader>
          <CardTitle className="flex flex-row items-baseline gap-3 text-[22px] font-bold">
            <span>Broke</span>
            {breakTurn !== undefined && (
              <>
                <span aria-hidden>|</span>
                <span>Turn {breakTurn}</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={CARD}>
      <CardHeader className="gap-2">
        <CardTitle className="flex flex-row items-baseline gap-4 text-[22px] font-bold">
          <span>Turn {countCompletedTurns(turns)}</span>
          <span>{(state && LIVE_STATE_LABEL[state]) || STATUS_LABEL[status]}</span>
        </CardTitle>
        <CardDescription className="text-sm text-foreground">{describe(status, state)}</CardDescription>
      </CardHeader>
      {/* A failed run never got a verdict, so "No break" would be a claim the judge didn't make. */}
      {(status !== ExperimentStatusEnum.INCONCLUSIVE || moments.length > 0) && (
        <CardContent>
          <KeyMoments moments={moments} final={status !== ExperimentStatusEnum.IN_PROGRESS} />
        </CardContent>
      )}
    </Card>
  );
}
