import { Card, CardContent } from "@/components/ui/card";
import ExperimentStatus, { ExperimentStatusEnum } from "./ExperimentStatus";

type Props = {
  status: ExperimentStatusEnum;
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
    body: "The Defender held its rule for every turn.",
  },
};

export default function ExperimentResults({ status }: Props) {
  const { title, body } = COPY[status];
  const running = status === ExperimentStatusEnum.IN_PROGRESS;

  return (
    <section aria-label="Results" className="flex w-full flex-col gap-4">
      <h2 className="text-sm font-medium tracking-wide">RESULTS</h2>
      <Card className={running ? "border-2 border-dashed bg-muted/50 ring-0" : "bg-muted/50"}>
        <CardContent className="flex flex-row items-center gap-5">
          <ExperimentStatus status={status} variant="icon" className="size-8 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <p className="text-lg font-bold">{title}</p>
            <p className="text-muted-foreground">{body}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
