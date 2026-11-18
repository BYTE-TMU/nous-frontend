"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  /** Stagger, in milliseconds. */
  delay?: number;
  as?: "div" | "li" | "section";
};

/**
 * Fades and lifts its children in on first scroll into view.
 *
 * Content is visible by default: the server render has no `data-reveal`, so if
 * JavaScript never runs the page still reads in full. Only after mount, and only for
 * elements still below the fold, do we set `data-reveal="pending"` (hidden in
 * globals.css) and then `"shown"` as they enter the viewport. Under reduced motion the
 * CSS ignores both states.
 */
export default function Reveal({ children, className, delay = 0, as: Tag = "div" }: Props) {
  const ref = useRef<HTMLDivElement & HTMLLIElement>(null);
  const [state, setState] = useState<"idle" | "pending" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Already on screen at mount: leave it alone rather than flash it out and back in.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setState("pending");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState("shown");
          observer.disconnect();
        }
      },
      // The huge top margin counts anything *above* the viewport as intersecting, so an
      // anchor-link jump that skips straight past an element still reveals it.
      { threshold: 0.15, rootMargin: "100000px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={state === "idle" ? undefined : state}
      className={cn("landing-reveal", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
