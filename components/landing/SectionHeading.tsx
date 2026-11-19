import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";

type Props = {
  id: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
};

export default function SectionHeading({ id, title, children, className }: Props) {
  return (
    <Reveal className={cn("mb-12 max-w-3xl md:mb-16", className)}>
      <h2 id={id} className="text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance">
        {title}
      </h2>
      {children && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-ash">{children}</div>}
    </Reveal>
  );
}
