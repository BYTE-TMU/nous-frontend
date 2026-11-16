import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
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
  [ExperimentStatusEnum.HELD]: {
    title: "The Defender held its rule.",
    body: "No turn was judged a break before the conversation ended.",
  },
  [ExperimentStatusEnum.INCONCLUSIVE]: {
    title: "This conversation ended without a result.",
    body: "It stopped before the judge could decide.",
  },
};

const PAUSED = {
  title: "This conversation is paused.",
  body: "Resume it to keep going, or stop it to see the results.",
};

const FAILED = {
  title: "This run failed before it finished.",
  body: "It stopped early, so there is no result to show.",
};

const formatCost = (usd: number) => (usd > 0 && usd < 0.01 ? "<$0.01" : `$${usd.toFixed(2)}`);

export default function ExperimentResults({ status, state, verdict, costUsd }: Props) {
  const { title, body } =
    state === "failed" ? FAILED : state === "paused" ? PAUSED : COPY[status];
  const running = status === ExperimentStatusEnum.IN_PROGRESS;

  return (
    <section id="results" aria-label="Results" className="flex w-full scroll-mt-4 flex-col gap-5">
      <h2 className="text-[17px] font-medium">RESULTS</h2>
      <Card className={cn(
          "rounded-[13px] py-5 shadow-[0_4px_4px_rgba(0,0,0,0.25)] ring-0",
          running
            ? "border-2 border-dashed border-status-in-progress bg-status-in-progress/30"
            : "bg-muted/50",
        )}>
        <CardContent className="flex flex-row items-center gap-7 px-12">
          <ExperimentStatus status={status} variant="icon" className="size-[26px] shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="text-xl font-bold">{title}</p>
            <p className={cn("text-[17px]", !running && "text-muted-foreground")}>{body}</p>
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
