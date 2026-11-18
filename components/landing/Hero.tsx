import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LINKS } from "./content";

export default function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-4 pt-20 pb-24 sm:px-6 md:pt-28 md:pb-36 lg:px-8">
        <div className="landing-rise flex flex-col items-center text-center">
          <h1
            id="hero-title"
            className="text-[clamp(2.75rem,7.2vw,6rem)] leading-[0.95] font-semibold tracking-[-0.045em] text-balance"
          >
            Put the rule under{" "}
            <span className="text-signal-lime">pressure.</span>
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-ash sm:text-xl">
            Give a defender a rule. Let another model challenge it. Inspect the
            conversation and an independent judge&apos;s assessment, turn by turn.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              className="h-12 rounded-md bg-signal-lime px-6 text-base font-semibold text-night hover:bg-impact-green"
            >
              <Link href={LINKS.requestAccess}>Request access</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-md border-graphite px-6 text-base text-foreground"
            >
              <a href="#run">
                See a run <span aria-hidden>↓</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
