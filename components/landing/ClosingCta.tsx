import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LINKS } from "./content";
import Reveal from "./Reveal";

// The final call to action. Access is allowlisted, so the primary action is
// "Request access" (→ /waitlist), never "Sign up".

/** A dark panel with a slowly drifting, heavily blurred aurora behind the headline. */
export default function ClosingCta() {
  return (
    <Reveal className="relative isolate overflow-hidden rounded-3xl border border-graphite bg-ink px-6 py-16 text-center sm:px-12 sm:py-24">
      {/* Aurora, paired with a heavy layer blur per Brand Guidelines §02. */}
      <div
        aria-hidden
        className="landing-aurora absolute top-1/2 left-1/2 -z-10 h-[140%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-aurora opacity-30 blur-[90px]"
      />
      <p className="mb-6 font-mono text-xs tracking-[0.18em] text-ash">BY INVITATION · FOR RESEARCHERS</p>
      <h2 className="mx-auto max-w-3xl text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1] font-semibold tracking-[-0.04em] text-balance">
        Find the turn where it gives in.
      </h2>
      <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ash">
        Access is granted from an allowlist. Tell us what you&apos;re studying and we&apos;ll be in touch.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Button
          asChild
          className="h-12 rounded-xl bg-gradient-primary px-6 text-base font-semibold text-night hover:opacity-90"
        >
          <Link href={LINKS.requestAccess}>Request access</Link>
        </Button>
        <Button asChild variant="outline" className="h-12 rounded-xl border-graphite bg-night/60 px-6 text-base">
          <Link href={LINKS.signIn}>I have an account</Link>
        </Button>
      </div>
    </Reveal>
  );
}
