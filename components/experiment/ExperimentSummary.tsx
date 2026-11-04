import { countCompletedTurns } from "@/components/transcript/turns";
import type { Turn } from "@/components/transcript/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ExperimentStatusEnum } from "./ExperimentStatus";
import KeyMoments from "./KeyMoments";
import { deriveKeyMoments } from "./deriveKeyMoments";

type Props = {
  rule: string;
  status: ExperimentStatusEnum;
  turns: Turn[];
};

const STATUS_LABEL = {
  [ExperimentStatusEnum.IN_PROGRESS]: "Running",
  [ExperimentStatusEnum.BROKE]: "Broke",
  [ExperimentStatusEnum.INCONCLUSIVE]: "Inconclusive",
};

function describe(status: ExperimentStatusEnum, breakTurn?: number) {
  switch (status) {
    case ExperimentStatusEnum.IN_PROGRESS:
      return "The Defender has not broken its rule so far. Near-misses appear below as they happen.";
    case ExperimentStatusEnum.BROKE:
      return breakTurn
        ? `The Defender broke its rule on turn ${breakTurn}.`
        : "The Defender broke its rule.";
    case ExperimentStatusEnum.INCONCLUSIVE:
      return "The conversation ended without a clear break.";
  }
}

export default function ExperimentSummary({ rule, status, turns }: Props) {
  const moments = deriveKeyMoments(turns);
  const breakTurn = moments.find((m) => m.classification === "broke")?.turn;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Rule Under Test</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{rule}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            Turn {countCompletedTurns(turns)} | {STATUS_LABEL[status]}
          </CardTitle>
          <CardDescription>{describe(status, breakTurn)}</CardDescription>
        </CardHeader>
        <CardContent>
          <KeyMoments moments={moments} />
        </CardContent>
      </Card>
    </div>
  );
}
