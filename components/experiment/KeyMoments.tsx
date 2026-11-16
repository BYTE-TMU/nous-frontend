import { Card, CardContent } from "../ui/Card";
import KeyMomentCard from "./KeyMomentCard";
import type { KeyMoment } from "./deriveKeyMoments";

type Props = {
  moments: KeyMoment[];
  /** The run has ended, so "so far" no longer applies. */
  final?: boolean;
};

export default function KeyMoments({ moments, final = false }: Props) {
  const broke = moments.some((m) => m.classification === "broke");
  const lastSoftened = moments.findLast((m) => m.classification === "softened");

  return (
    <section aria-label="Key moments" className="flex flex-col gap-3.5">
      <h3 className="text-[15px] font-medium">KEY MOMENTS</h3>
      {moments.map((moment) => (
        <KeyMomentCard key={`${moment.turn}-${moment.classification}`} moment={moment} />
      ))}
      {!broke && (
        <Card size="sm" className="min-h-12 justify-center rounded-[13px] border-[1.5px] border-dashed border-black bg-signal-lime text-black ring-0">
          <CardContent className="flex items-center gap-2 px-5 text-xs">
            <span aria-hidden className="inline-block size-2 shrink-0 rounded-full bg-black" />
            <p>
              <span className="font-semibold">{final ? "No break." : "No break so far."}</span>
              {lastSoftened && ` Closest call was turn ${lastSoftened.turn}.`}
            </p>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
