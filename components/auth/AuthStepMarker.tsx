import { cn } from "@/lib/utils";

// "STEP 2 OF 3" plus three bars, filled up to the current step.
export function AuthStepMarker({ step, total = 3 }: { step: number; total?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <p className="font-mono text-sm font-medium tracking-[0.08em] whitespace-nowrap text-signal-lime">
        STEP {step} OF {total}
      </p>
      <div className="flex items-center gap-2.5" aria-hidden>
        {Array.from({ length: total }, (_, index) => (
          <div
            key={index}
            className={cn(
              "h-1 w-8 rounded-[2px]",
              index < step ? "bg-signal-lime" : "bg-graphite",
            )}
          />
        ))}
      </div>
    </div>
  );
}
