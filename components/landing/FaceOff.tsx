"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "./hooks";

/**
 * The brandmark, staged as the product: the defender (Blue Freeze, bottom-left) and
 * attacker (Fox Red, top-right) pull against each other across the N, while the judge
 * (Signal Lime) circles both. Path and circle geometry match public/brand/nous-brandmark.svg.
 *
 * The pointer nudges the two parties apart (CSS vars set in rAF); everything else is CSS.
 */
export default function FaceOff() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
        const y = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
        el.style.setProperty("--px", x.toFixed(3));
        el.style.setProperty("--py", y.toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="landing-faceoff relative mx-auto aspect-square w-full max-w-[520px] select-none"
    >
      {/* Judge orbit */}
      <div className="absolute inset-[2%] rounded-full border border-signal-lime/15" />
      <div className="landing-orbit absolute inset-[2%]">
        <span className="absolute top-0 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal-lime shadow-[0_0_24px_4px_rgb(221_252_36/0.55)]" />
      </div>
      <div className="landing-orbit-reverse absolute inset-[12%] rounded-full border border-dashed border-graphite" />

      <svg viewBox="-40 -40 368 419" className="absolute inset-[16%] h-[68%] w-[68%] overflow-visible">
        <defs>
          <linearGradient id="landing-duel" x1="44.6" y1="294.3" x2="243.1" y2="44.6" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--color-defender)" />
            <stop offset="1" stopColor="var(--color-attacker)" />
          </linearGradient>
        </defs>

        <path
          d="M0 4.07422V154.849H99.5461L201.654 334.73H287.345V181.045H201.654L99.5461 4.07422H0Z"
          className="fill-white"
        />

        {/* Tension line between the two parties */}
        <line
          x1="44.6"
          y1="294.3"
          x2="243.1"
          y2="44.6"
          stroke="url(#landing-duel)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="2 10"
          className="landing-flow"
        />

        <g className="landing-party-defender">
          <circle cx="44.571" cy="294.309" r="44.5458" className="fill-defender" />
        </g>
        <g className="landing-party-attacker">
          <circle cx="243.081" cy="44.5704" r="44.5458" className="fill-attacker" />
        </g>
      </svg>

      {/* Labels */}
      <span className="absolute top-[7%] right-[2%] font-mono text-[11px] tracking-[0.2em] text-attacker">
        ATTACKER
      </span>
      <span className="absolute bottom-[7%] left-[2%] font-mono text-[11px] tracking-[0.2em] text-defender">
        DEFENDER
      </span>
      <span className="absolute top-[3%] left-[8%] font-mono text-[11px] tracking-[0.2em] text-signal-lime">
        JUDGE
      </span>
    </div>
  );
}
