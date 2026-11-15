import AssessmentLabel from "@/components/transcript/AssessmentLabel";
import { Card, CardContent } from "../ui/Card";
import type { KeyMoment } from "./deriveKeyMoments";

type Props = {
  moment: KeyMoment;
};

/** One turn the judge flagged: what the defender said, and why it matters. */
export default function KeyMomentCard({ moment }: Props) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-sm">
          <AssessmentLabel classification={moment.classification} />
          <span aria-hidden className="text-muted-foreground">
            •
          </span>
          <span className="text-muted-foreground">Turn {moment.turn}</span>
        </div>
        <blockquote className="text-xs text-muted-foreground italic">“{moment.excerpt}”</blockquote>
        <p className="text-xs font-semibold">{moment.explanation}</p>
      </CardContent>
    </Card>
  );
}
