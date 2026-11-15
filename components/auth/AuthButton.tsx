import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Pill buttons from the branded login flow (Figma "Modal Button"). Scoped to the
// auth screens on purpose: the shared Button in components/ui stays untouched
// until the dashboard gets its own branding pass.
type AuthButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
};

const base =
  "flex w-full cursor-pointer items-center justify-center rounded-full px-9 py-[18px] text-[21px] leading-normal font-semibold outline-none transition-[filter,box-shadow] focus-visible:ring-2 focus-visible:ring-signal-lime/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  // Signal Lime → Impact Green, with the lime glow.
  primary:
    "bg-[linear-gradient(173deg,var(--color-signal-lime)_0%,var(--color-impact-green)_100%)] text-night shadow-[0_0_14px_rgba(221,252,36,0.3)] hover:brightness-95",
  secondary:
    "border-[1.5px] border-graphite bg-carbon text-paper hover:bg-input-fill",
} as const;

export function AuthButton({ variant = "primary", className, type = "button", ...props }: AuthButtonProps) {
  return <button type={type} className={cn(base, variants[variant], className)} {...props} />;
}
