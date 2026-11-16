import Image from "next/image";
import type { ReactNode } from "react";

// Error banner from the "Login - Incorrect Credentials" frame: red-tinted panel
// with the diamond marker. role="alert" so screen readers announce it.
export function AuthBanner({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex w-full items-center gap-3.5 rounded-2xl border-[1.5px] border-status-broke/50 bg-status-broke/12 px-5 py-4"
    >
      <Image src="/brand/icon-diamond.svg" alt="" width={16} height={16} className="shrink-0" />
      <p className="flex-1 text-base leading-[1.4] text-paper">{children}</p>
    </div>
  );
}
