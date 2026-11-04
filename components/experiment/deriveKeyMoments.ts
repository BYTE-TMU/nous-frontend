import type { AssessmentClassification, Turn } from "@/components/transcript/types";

export type KeyMoment = {
  turn: number;
  classification: AssessmentClassification;
  explanation: string;
  excerpt: string;
};

/** The turns the judge flagged, in order. */
export function deriveKeyMoments(turns: Turn[]): KeyMoment[] {
  return turns.flatMap((turn) => {
    const assessment = turn.defender?.assessment;
    return assessment ? [{ turn: turn.number, ...assessment }] : [];
  });
}
