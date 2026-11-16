import type { ReactNode } from "react";
import { NousLogo } from "./NousLogo";

type AuthCardProps = {
  heading: string;
  subtitle?: string;
  // Optional strip between the logo and heading (the password-reset step marker).
  eyebrow?: ReactNode;
  children: ReactNode;
};

// The shell every login and password-reset screen shares: logo, heading,
// subtitle, body. Matches the Figma auth card (640px, 32px radius, Ink fill).
export function AuthCard({ heading, subtitle, eyebrow, children }: AuthCardProps) {
  return (
    <section className="flex w-full max-w-[640px] flex-col gap-7 overflow-hidden rounded-[32px] border-[1.5px] border-graphite bg-ink px-6 pt-12 pb-[52px] shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:px-14">
      <header className="flex flex-col items-center gap-5 pt-3 text-center">
        <NousLogo />
        {eyebrow}
        <h1 className="text-[32px] leading-[1.15] font-semibold text-white sm:text-[40px]">
          {heading}
        </h1>
        {subtitle ? (
          <p className="text-lg leading-[1.4] text-smoke">{subtitle}</p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
