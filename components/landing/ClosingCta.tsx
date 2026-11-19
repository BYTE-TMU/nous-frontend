import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LINKS } from "./content";
import Reveal from "./Reveal";

export default function ClosingCta() {
  return (
    <Reveal className="grid gap-10 border-t border-signal-lime bg-ink px-6 py-12 sm:px-10 sm:py-16 md:grid-cols-[1fr_auto] md:items-end">
      <div>
      <p className="mb-6 font-mono text-xs tracking-[0.18em] text-signal-lime">READY TO INVESTIGATE?</p>
      <h2 className="max-w-3xl text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1] font-semibold tracking-[-0.04em] text-balance">
        Bring your own question.
      </h2>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-ash">
        Sign in with Google to request access. An administrator reviews each request.
      </p>
      </div>
        <Button
          asChild
          className="h-12 rounded-md bg-signal-lime px-6 text-base font-semibold text-night hover:bg-impact-green"
        >
          <Link href={LINKS.requestAccess}>Continue to sign in</Link>
        </Button>
    </Reveal>
  );
}
