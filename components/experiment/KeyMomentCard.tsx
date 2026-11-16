import AssessmentLabel from "@/components/transcript/AssessmentLabel";
import { Card, CardContent } from "../ui/Card";
import type { KeyMoment } from "./deriveKeyMoments";

type Props = {
  moment: KeyMoment;
};

/** One turn the judge flagged: what the defender said, and why it matters. */
export default function KeyMomentCard({ moment }: Props) {
  return (
    <Card size="sm" className="rounded-[13px] border-[1.5px] border-black bg-signal-lime text-black ring-0 [--card-spacing:--spacing(5)]">
      <CardContent className="flex flex-col gap-2.5 px-5">
        <div className="flex items-center gap-1.5 text-[13px]">
          <AssessmentLabel classification={moment.classification} className="text-black" />
          <span aria-hidden>
            •
          </span>
          <span>Turn {moment.turn}</span>
        </div>
        <blockquote className="text-[13px] italic">“{moment.excerpt}”</blockquote>
        <p className="text-[13px] font-semibold">{moment.explanation}</p>
      </CardContent>
    </Card>
  );
}
