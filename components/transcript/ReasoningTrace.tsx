import { HugeiconsIcon } from "@hugeicons/react";
import AiBrain01Icon from "@hugeicons/core-free-icons/AiBrain01Icon";
import Loading03Icon from "@hugeicons/core-free-icons/Loading03Icon";
import { cn } from "@/lib/utils";
import {
  Trace,
  TraceCollapsible,
  TraceCollapsibleContent,
  TraceCollapsibleTrigger,
  TraceIcon,
  TraceLine,
  TraceTitle,
} from "@/components/ui/trace";

type Props = {
  /** The model's own account of its reasoning. */
  reasoning?: string;
  /** `running` while the message is still being produced. */
  running?: boolean;
  title?: string;
  /** Which side of the chat the owning message sits on. */
  align?: "start" | "end";
};

/**
 * A model's thought process, collapsed by default. With no reasoning and not running
 * it renders nothing: a missing thought is never invented.
 */
export default function ReasoningTrace({
  reasoning,
  running = false,
  title,
  align = "start",
}: Props) {
  const end = align === "end";
  const label = title ?? (running ? "Thinking…" : "Reasoning");
  const icon = (
    <TraceIcon>
      <HugeiconsIcon icon={running ? Loading03Icon : AiBrain01Icon} strokeWidth={2} />
    </TraceIcon>
  );

  if (!reasoning) {
    if (!running) return null;
    return (
      <Trace className={cn(end && "w-fit")}>
        <TraceLine status="running">
          {icon}
          <TraceTitle>{label}</TraceTitle>
        </TraceLine>
      </Trace>
    );
  }

  return (
    <TraceCollapsible defaultOpen={running} className={cn(end && "w-fit max-w-full items-end")}>
      <TraceCollapsibleTrigger>
        <TraceLine status={running ? "running" : undefined}>
          {icon}
          <TraceTitle>{label}</TraceTitle>
        </TraceLine>
      </TraceCollapsibleTrigger>
      <TraceCollapsibleContent
        className={cn(end && "mr-[calc(--spacing(2)-1px)] ml-0 border-r border-l-0 pr-4 pl-1 text-right")}
      >
        {reasoning}
      </TraceCollapsibleContent>
    </TraceCollapsible>
  );
}
