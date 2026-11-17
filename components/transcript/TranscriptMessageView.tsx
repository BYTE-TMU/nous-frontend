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
import MessageMarkdown from "./MessageMarkdown";
import type { DefenderMessage, TranscriptMessage, TranscriptRole } from "./types";

// Role colours are brand tokens (Attacker = Fox Red, Defender = Blue Freeze).
// Class names are written out in full so Tailwind can see them.
const ROLE = {
  attacker: {
    label: "Attacker",
    initial: "A",
    align: "start",
    avatar: "bg-attacker",
    border: "border-attacker",
  },
  defender: {
    label: "Defender",
    initial: "D",
    align: "end",
    avatar: "bg-defender",
    border: "border-defender",
  },
} as const;

type Props = {
  role: TranscriptRole;
  model: string;
  message: TranscriptMessage | DefenderMessage;
  /** Round number, used for the "judge cites turn N" footer on a break. */
  turnNumber: number;
};

const DOT_SHADES = ["bg-night/30", "bg-night/60", "bg-night"];

/** The "…" bubble shown while a model is still writing its message. */
function TypingBubble({ role, align }: { role: string; align: "start" | "end" }) {
  return (
    <Bubble variant="muted" align={align}>
      <BubbleContent
        role="status"
        aria-label={`${role} is writing`}
        className="flex items-center gap-1.5 rounded-[13px] bg-smoke! px-[18px] py-[15px]"
      >
        {DOT_SHADES.map((shade, dot) => (
          <span
            key={dot}
            aria-hidden
            className={cn("size-2 animate-pulse rounded-full", shade)}
            style={{ animationDelay: `${dot * 200}ms` }}
          />
        ))}
      </BubbleContent>
    </Bubble>
  );
}

/** One message from one model: avatar, role and model, then the bubble, then the judge's flag. */
export default function TranscriptMessageView({ role, model, message, turnNumber }: Props) {
  const { label, initial, align, avatar, border } = ROLE[role];
  const pending = message.status === "pending";
  const assessment = "assessment" in message ? message.assessment : undefined;
  const judgement = "judgement" in message ? message.judgement : undefined;

  return (
    <Message align={align} className="gap-5">
      <MessageAvatar className="min-w-0 self-start rounded-none bg-transparent group-has-data-[slot=message-footer]/message:translate-y-0">
        <Avatar size="lg" className="size-11 rounded-[10px] after:hidden data-[size=lg]:size-11">
          <AvatarFallback
            className={cn("rounded-[10px] text-[17px] font-medium text-night", avatar)}
          >
            {initial}
          </AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent className="gap-2">
        <MessageHeader className="px-0 text-[13px]">
          <span className="font-semibold text-foreground">{label}</span>
          <span aria-hidden className="mx-1.5">
            •
          </span>
          <span>{model}</span>
        </MessageHeader>

        {pending ? (
          <TypingBubble role={label} align={align} />
        ) : (
          <Bubble variant="muted" align={align}>
            <BubbleContent
              className={cn(
                "rounded-[13px] border-[1.5px] px-[22px] py-[15px] text-xl leading-snug",
                border,
                align === "start" ? "rounded-tl-[4px]" : "rounded-tr-[4px]",
              )}
            >
              <MessageMarkdown>{message.text ?? ""}</MessageMarkdown>
            </BubbleContent>
          </Bubble>
        )}

        {assessment ? (
          <MessageFooter className="flex-wrap items-baseline gap-y-0.5 px-0 text-[13px]">
            <AssessmentLabel classification={assessment.classification} />
            <span aria-hidden className="mx-1.5">
              •
            </span>
            <span className="shrink-0">score {judgement?.state === "scored" ? judgement.score : "?"}/2</span>
            <span aria-hidden className="mx-1.5">
              •
            </span>
            <span className="min-w-0 break-words">
              {assessment.classification === "broke"
                ? `judge cites turn ${turnNumber}`
                : assessment.explanation}
            </span>
          </MessageFooter>
        ) : judgement ? (
          <MessageFooter className="flex-wrap items-baseline gap-y-0.5 px-0 text-[13px]">
            {judgement.state === "scored" ? (
              <>
                <span className="shrink-0 font-semibold text-foreground">Held</span>
                <span aria-hidden className="mx-1.5">
                  •
                </span>
                <span className="shrink-0">score {judgement.score}/2</span>
                {judgement.explanation ? (
                  <>
                    <span aria-hidden className="mx-1.5">
                      •
                    </span>
                    <span className="min-w-0 break-words">{judgement.explanation}</span>
                  </>
                ) : null}
              </>
            ) : (
              <span>{judgement.state === "failed" ? "Judge failed" : "Judging…"}</span>
            )}
          </MessageFooter>
        ) : null}
      </MessageContent>
    </Message>
  );
}
