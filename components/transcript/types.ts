// Local view types for the transcript. These move to the generated `lib/types.ts`
// once the backend exposes experiment/turn read endpoints (master plan, step 3).

export type MessageStatus = "complete" | "pending";

export type TranscriptMessage = {
  id: string;
  status: MessageStatus;
  /** Absent while the message is pending. */
  text?: string;
  /** The model's own account of how it got here. Absent when the model gave none. */
  reasoning?: string;
};

/** The judge's view of a turn, when it flagged something. Turns with nothing to flag have none. */
export type AssessmentClassification = "near_miss" | "broke";

export type Assessment = {
  classification: AssessmentClassification;
  /** One or two sentences from the judge. */
  explanation: string;
  /** A verbatim part of the defender's reply that the explanation refers to. */
  excerpt: string;
};

export type DefenderMessage = TranscriptMessage & {
  assessment?: Assessment;
};

/** One turn: an attacker message and the defender's reply. */
export type Turn = {
  number: number;
  attacker: TranscriptMessage;
  /** Absent until the attacker's message is complete and the defender has started. */
  defender?: DefenderMessage;
};

export type TranscriptRole = "attacker" | "defender";
