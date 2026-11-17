import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";

type Props = {
  id: string;
  index: string;
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** Numbered section header: mono index + eyebrow, large title, optional lede. */
export default function SectionHeading({ id, index, eyebrow, title, children, className }: Props) {
  return (
    <Reveal className={cn("mb-12 max-w-3xl md:mb-16", className)}>
      <p className="mb-5 flex items-center gap-3 font-mono text-xs tracking-[0.18em] text-smoke">
        <span className="text-signal-lime">{index}</span>
        <span aria-hidden className="h-px w-8 bg-graphite" />
        {eyebrow}
      </p>
      <h2 id={id} className="text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
        {title}
      </h2>
      {children && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-ash">{children}</div>}
    </Reveal>
  );
}
