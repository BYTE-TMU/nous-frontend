"use client";

import Image from "next/image";
import { useState } from "react";

const BRANCHES = [
  "M600 300 C525 296 490 256 440 208 C380 150 315 151 245 125 C190 105 170 76 120 48",
  "M447 215 C400 210 365 239 310 229 C252 218 214 186 160 193",
  "M340 161 C326 122 287 98 260 65",
  "M592 308 C520 328 496 377 440 401 C374 429 318 405 250 445 C196 476 173 510 130 552",
  "M450 395 C412 447 383 465 355 540",
  "M608 292 C680 276 699 224 755 203 C821 179 875 194 945 154 C1006 119 1022 85 1070 42",
  "M751 205 C797 193 816 139 865 112 C905 91 940 89 970 66",
  "M610 309 C688 317 718 357 765 390 C823 430 885 420 955 458 C1004 484 1043 522 1080 560",
  "M768 390 C802 365 842 356 887 368 C943 383 977 373 1022 343",
  "M835 424 C848 477 883 511 912 553",
];

export default function NeuralOpening() {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [toggled, setToggled] = useState(false);
  const active = hovered || focused || toggled;

  return (
    <section aria-label="Nous" className="flex min-h-[min(100svh,900px)] items-center justify-center overflow-hidden bg-black px-4">
      <button
        type="button"
        aria-label="Reveal the Nous wordmark"
        aria-pressed={active}
        data-active={active}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false);
          setFocused(false);
        }}
        onFocus={(event) => setFocused(event.currentTarget.matches(":focus-visible"))}
        onBlur={() => {
          setFocused(false);
          setToggled(false);
        }}
        onClick={() => setToggled((current) => !current)}
        className="neural-opening relative flex min-h-[22rem] w-full max-w-6xl cursor-pointer items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-signal-lime"
      >
        <svg aria-hidden="true" viewBox="0 0 1200 600" className="pointer-events-none absolute top-1/2 left-1/2 w-[min(130%,1200px)] -translate-x-1/2 -translate-y-1/2 overflow-visible">
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {BRANCHES.map((branch, index) => (
              <g key={branch}>
                <path d={branch} className="neural-branch" />
                <path
                  d={branch}
                  pathLength="100"
                  className="neural-signal"
                  style={{ animationDelay: `${(index % 5) * 180}ms` }}
                />
              </g>
            ))}
            <path
              d="M555 300 C564 278 582 269 600 270 C620 268 639 281 647 298 C641 320 622 334 600 331 C579 333 562 321 555 300 Z"
              className="neural-cell"
            />
            <ellipse cx="600" cy="301" rx="14" ry="12" className="neural-cell" />
          </g>
        </svg>
        <span aria-hidden="true" className="relative flex w-full max-w-[700px] items-center justify-center">
          <span lang="el" className="neural-greek text-[clamp(5rem,16vw,12rem)] leading-none font-semibold tracking-[-0.06em] text-paper">
            νοῦς
          </span>
          <span className="neural-brand absolute inset-0 flex items-center justify-center">
            <Image src="/brand/nous-wordmark.svg" alt="" width={1253} height={346} className="h-auto w-[85%]" priority />
          </span>
        </span>
      </button>
    </section>
  );
}
