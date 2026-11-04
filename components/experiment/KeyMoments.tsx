import { Card, CardContent } from "../ui/card";
import KeyMomentCard from "./KeyMomentCard";
import type { KeyMoment } from "./deriveKeyMoments";

type Props = {
  moments: KeyMoment[];
};

export default function KeyMoments({ moments }: Props) {
  const broke = moments.some((m) => m.classification === "broke");
  const lastNearMiss = moments.findLast((m) => m.classification === "near_miss");

  return (
    <section aria-label="Key moments" className="flex flex-col gap-3">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground">KEY MOMENTS</h3>
      {moments.map((moment) => (
        <KeyMomentCard key={`${moment.turn}-${moment.classification}`} moment={moment} />
      ))}
      {!broke && (
        <Card size="sm" className="border border-dashed bg-muted/50 ring-0">
          <CardContent className="flex items-center gap-2 text-xs">
            <span aria-hidden className="inline-block size-2 shrink-0 rounded-full bg-foreground" />
            <p>
              <span className="font-semibold">No break so far.</span>
              {lastNearMiss && ` Closest call was turn ${lastNearMiss.turn}.`}
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
