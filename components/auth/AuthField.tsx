import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Labelled text field from the branded login flow: a mono uppercase label row
// (with an optional action on the right, e.g. "Forgot password?") above a 60px
// input. Scoped to the auth screens; components/ui/input is left untouched.
type AuthFieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  error?: string;
  // Red border without a message, used when the banner above explains the error.
  invalid?: boolean;
  labelAction?: ReactNode;
};

export function AuthField({ label, error, invalid, labelAction, className, ...rest }: AuthFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hasError = Boolean(error) || Boolean(invalid);

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor={id}
          className="font-mono text-sm font-medium tracking-[0.08em] text-ash uppercase"
        >
          {label}
        </label>
        {labelAction}
      </div>
      <input
        id={id}
        aria-invalid={hasError ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "h-[60px] w-full min-w-0 rounded-2xl border-[1.5px] border-graphite bg-carbon px-[22px] text-xl text-white outline-none transition-colors placeholder:text-smoke focus:border-signal-lime focus:shadow-[inset_0_0_0_0.5px_var(--color-signal-lime)] disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-fox-red aria-invalid:focus:border-fox-red aria-invalid:focus:shadow-[inset_0_0_0_0.5px_var(--color-fox-red)]",
          className,
        )}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="text-sm text-fox-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}
