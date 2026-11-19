import BreakMeter from "./BreakMeter";
import ClosingCta from "./ClosingCta";
import DuelDemo from "./DuelDemo";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import LandingFooter from "./LandingFooter";
import LandingNav from "./LandingNav";
import Personas from "./Personas";
import Principles from "./Principles";
import SectionHeading from "./SectionHeading";

// Shared section shell: centred 7xl column, generous vertical rhythm, and scroll-mt so
// anchor links (#run, #judge …) land below the sticky nav.
const SECTION = "mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 md:py-32 lg:px-8";

/**
 * The public landing page at "/". Signed-in work lives at /dashboard.
 *
 * Story order: the hero stages the three roles (attacker, defender, judge) → 01 shows
 * a run → 02 explains how the judge scores → 03 the workflow → 04 the defenders →
 * 05 the research principles → a closing request-access call.
 *
 * This is a server component; only the interactive pieces (nav, face-off, demo,
 * meter, personas, scroll reveals) are client components.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <LandingNav />
      <main>
        <Hero />

        <section id="run" aria-labelledby="run-title" className={SECTION}>
          <SectionHeading id="run-title" index="01" eyebrow="A RUN, TURN BY TURN" title="Watch a rule wear down.">
            Maya is a cashier who must never give a discount. Over five turns the attacker
            leans on loyalty, the owner&apos;s word, then a birthday, and the judge scores every reply.
            This is the transcript as researchers read it.
          </SectionHeading>
          <DuelDemo />
        </section>

        <section id="judge" aria-labelledby="judge-title" className={SECTION}>
          <SectionHeading
            id="judge-title"
            index="02"
            eyebrow="THE JUDGE"
            title={
              <>
                Breaking isn&apos;t binary.{" "}
                <span className="text-smoke">Where does your model crack?</span>
              </>
            }
          >
            Every defender reply is scored on one ordinal scale. Only 5 is a violation.
            Everything below it shows how close the model came.
          </SectionHeading>
          <BreakMeter />
        </section>

        <section id="how" aria-labelledby="how-title" className={SECTION}>
          <SectionHeading id="how-title" index="03" eyebrow="HOW IT WORKS" title="Configure. Converse. Judge." />
          <HowItWorks />
        </section>

        <section id="personas" aria-labelledby="personas-title" className={SECTION}>
          <SectionHeading
            id="personas-title"
            index="04"
            eyebrow="DEFENDER PERSONAS"
            title="Five defenders. One rule each."
          >
            Each persona comes at three strengths. The rule stays the same; only how firmly
            the prompt states it changes. That lets you vary model, prompt strength and
            attack style one at a time.
          </SectionHeading>
          <Personas />
        </section>

        <section id="principles" aria-labelledby="principles-title" className={SECTION}>
          <SectionHeading
            id="principles-title"
            index="05"
            eyebrow="RESEARCH PRINCIPLES"
            title="Built to be inspected, not believed."
          >
            Seeing what a model said is easy. Seeing why it said it, and how a separate judge
            reads it, is the point.
          </SectionHeading>
          <Principles />
        </section>

        <section aria-label="Request access" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 md:pb-32 lg:px-8">
          <ClosingCta />
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
