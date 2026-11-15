import { Card, CardContent } from "@/components/ui/Card";
import ExperimentStatus, { ExperimentStatusEnum } from "./ExperimentStatus";
import type { ExperimentView } from "./toExperimentView";

type Props = {
  status: ExperimentStatusEnum;
  state?: ExperimentView["state"];
  verdict?: ExperimentView["verdict"];
  costUsd?: number;
};

const COPY = {
  [ExperimentStatusEnum.IN_PROGRESS]: {
    title: "This conversation is still running.",
    body: "Results appear here once it breaks, or when you stop it — it may never end on its own.",
  },
  [ExperimentStatusEnum.BROKE]: {
    title: "The Defender broke its rule.",
    body: "The turn where it happened is highlighted in the transcript.",
  },
  [ExperimentStatusEnum.INCONCLUSIVE]: {
    title: "This conversation ended without a break.",
    body: "The Defender held its rule for every judged turn.",
  },
};

const FAILED = {
  title: "This run failed before it finished.",
  body: "It stopped early, so there is no result to show.",
};

const formatCost = (usd: number) => (usd > 0 && usd < 0.01 ? "<$0.01" : `$${usd.toFixed(2)}`);

export default function ExperimentResults({ status, state, verdict, costUsd }: Props) {
  const { title, body } = state === "failed" ? FAILED : COPY[status];
  const running = status === ExperimentStatusEnum.IN_PROGRESS;

  return (
    <section aria-label="Results" className="flex w-full flex-col gap-4">
      <h2 className="text-sm font-medium tracking-wide">RESULTS</h2>
      <Card className={running ? "border-2 border-dashed bg-muted/50 ring-0" : "bg-muted/50"}>
        <CardContent className="flex flex-row items-center gap-5">
          <ExperimentStatus status={status} variant="icon" className="size-8 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="text-lg font-bold">{title}</p>
            <p className="text-muted-foreground">{body}</p>
            {verdict && (
              <div className="mt-2 flex flex-col gap-1 text-sm">
                <p>
                  <span className="font-medium">Judge, turn {verdict.turn}:</span>{" "}
                  {verdict.explanation}
                </p>
                {verdict.excerpt && (
                  <blockquote className="border-l-2 pl-3 text-muted-foreground italic">
                    {verdict.excerpt}
                  </blockquote>
                )}
              </div>
            )}
            {costUsd !== undefined && (
              <p className="mt-1 text-xs text-muted-foreground">
                {running ? "Cost so far" : "Total cost"}: {formatCost(costUsd)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
