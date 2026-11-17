"use client";

import { useEffect, useState, type RefObject } from "react";

/** True when the viewer asked the OS for reduced motion. False during SSR. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * True once the element has entered the viewport (and stays true when `once`).
 * Falls back to true where IntersectionObserver is missing, so content never stays hidden.
 */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { threshold = 0.2, rootMargin = "0px", once = true }: IntersectionObserverInit & { once?: boolean } = {},
): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin, once]);
  return inView;
}
