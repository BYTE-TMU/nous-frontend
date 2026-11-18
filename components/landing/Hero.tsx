import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import FaceOff from "./FaceOff";
import { LINKS, RUBRIC } from "./content";

// The opening screen: headline and calls to action on the left, the animated brandmark
// face-off on the right, and a ticker of the judge's six rubric levels underneath.

/**
 * An endless marquee of the rubric levels, each with its colour-index swatch.
 * The track is two identical rows translated by -50%, so it loops without a seam.
 */
function RubricTicker() {
  // Two copies so the marquee loops seamlessly; the second is hidden from screen readers.
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10">
      {RUBRIC.map((level) => (
        <li key={level.score} className="flex items-center gap-3 whitespace-nowrap">
          <span className={cn("size-2 rounded-[2px]", level.bg)} />
          <span className="font-mono text-xs tracking-[0.18em] text-smoke uppercase">
            {level.score} · {level.label}
          </span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className="relative overflow-hidden border-y border-graphite/70 bg-ink/60 py-4 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
      <div className="landing-marquee flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      {/* Background: the brand's lime top glow plus a faint graphite grid, masked to fade out. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-gradient-glow" />
      <div
        aria-hidden
        className="landing-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 md:pt-20 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:px-8 lg:pt-24 lg:pb-24">
        <div className="landing-rise flex flex-col items-start">
          <p className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-graphite bg-ink/80 px-3 py-1 font-mono text-xs tracking-[0.14em] text-ash">
            <span className="relative flex size-2">
              <span className="landing-ping absolute inset-0 rounded-full bg-status-in-progress" />
              <span className="relative size-2 rounded-full bg-status-in-progress" />
            </span>
            ADVERSARIAL TESTBED FOR AI RESEARCHERS
          </p>

          <h1
            id="hero-title"
            className="text-[clamp(2.75rem,7.2vw,6rem)] leading-[0.95] font-semibold tracking-[-0.045em] text-balance"
          >
            Two models.
            <br />
            One rule.
            <br />
            {/* "breaks." is painted with the colour index (held → broke), the judge's own scale. */}
            <span className="text-smoke">Watch where it </span>
            <span className="bg-gradient-index bg-clip-text text-transparent">breaks.</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ash sm:text-xl">
            Nous sets an attacker model against a defender that holds a single operating rule.
            An independent judge scores every turn, and you read both sides&apos; reasoning as
            the pressure builds.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="h-12 rounded-xl bg-gradient-primary px-6 text-base font-semibold text-night hover:opacity-90"
            >
              <Link href={LINKS.requestAccess}>Request access</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-xl border-graphite px-6 text-base text-foreground"
            >
              <a href="#run">
                See a run <span aria-hidden>↓</span>
              </a>
            </Button>
          </div>

          <p className="mt-10 font-mono text-xs tracking-[0.14em] text-smoke">
            <span className="text-foreground">νοῦς</span> · GREEK, “MIND”
          </p>
        </div>

        <FaceOff />
      </div>

      <RubricTicker />
    </section>
  );
}
