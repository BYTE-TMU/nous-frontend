"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

const LENGTH = 6;

type CodeInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

// Six digit boxes drawn over ONE real input. The input keeps typing, paste,
// autofill (one-time-code) and screen-reader labelling working; the boxes only
// show its value. Clicking a box focuses the input because it covers them.
export function CodeInput({ label, value, onChange, error, disabled }: CodeInputProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [focused, setFocused] = useState(false);
  const activeIndex = Math.min(value.length, LENGTH - 1);

  return (
    <div className="flex w-full flex-col gap-3">
      <label
        htmlFor={id}
        className="font-mono text-sm font-medium tracking-[0.08em] text-ash uppercase"
      >
        {label}
      </label>
      <div className="relative">
        <div className="flex gap-3" aria-hidden>
          {Array.from({ length: LENGTH }, (_, index) => {
            const active = focused && index === activeIndex && !disabled;
            return (
              <div
                key={index}
                className={cn(
                  "flex h-[84px] min-w-0 flex-1 items-center justify-center rounded-2xl border-[1.5px] bg-carbon font-mono text-4xl font-medium text-white transition-colors",
                  error ? "border-fox-red" : "border-graphite",
                  active && "border-2 border-signal-lime",
                  disabled && "opacity-60",
                )}
              >
                {index < value.length ? (
                  // Masked on purpose: the digits never show on screen.
                  "X"
                ) : null}
                {index >= value.length &&
                  active &&
                  index === value.length ? (
                    <span className="h-[34px] w-0.5 animate-pulse bg-signal-lime" />
                  ) : null}
              </div>
            );
          })}
        </div>
        <input
          id={id}
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={LENGTH}
          autoFocus
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="absolute inset-0 h-full w-full cursor-text opacity-0"
        />
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-fox-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}
