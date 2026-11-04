import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message";
import { cn } from "@/lib/utils";
import AssessmentLabel from "./AssessmentLabel";
import ReasoningTrace from "./ReasoningTrace";
import type { DefenderMessage, TranscriptMessage, TranscriptRole } from "./types";

const ROLE = {
  attacker: { label: "Attacker", initial: "A", align: "start" },
  defender: { label: "Defender", initial: "D", align: "end" },
} as const;

type Props = {
  role: TranscriptRole;
  model: string;
  message: TranscriptMessage | DefenderMessage;
  /** Used for the "judge cites turn N" footer on a break. */
  turnNumber: number;
};

/** One message from one model: avatar, role and model, its reasoning above, then the bubble. */
export default function TranscriptMessageView({ role, model, message, turnNumber }: Props) {
  const { label, initial, align } = ROLE[role];
  const pending = message.status === "pending";
  const assessment = "assessment" in message ? message.assessment : undefined;

  return (
    <Message align={align}>
      <MessageAvatar>
        <Avatar size="lg">
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent>
        <MessageHeader>
          <span className="font-semibold text-foreground">{label}</span>
          <span aria-hidden className="mx-1.5">
            •
          </span>
          <span>{model}</span>
        </MessageHeader>

        {pending ? (
          <ReasoningTrace running reasoning={message.reasoning} align={align} />
        ) : (
          <>
            <ReasoningTrace reasoning={message.reasoning} align={align} />
            <Bubble variant="muted" align={align}>
              <BubbleContent
                className={cn(
                  "border-foreground/60 px-4 py-3 text-base",
                  align === "start" ? "rounded-tl-sm" : "rounded-tr-sm",
                  assessment?.classification === "near_miss" && "border-dashed",
                )}
              >
                {message.text}
              </BubbleContent>
            </Bubble>
          </>
        )}

        {assessment && (
          <MessageFooter>
            <AssessmentLabel classification={assessment.classification} />
            <span aria-hidden className="mx-1.5">
              •
            </span>
            <span>
              {assessment.classification === "broke"
                ? `judge cites turn ${turnNumber}`
                : assessment.explanation}
            </span>
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
}
