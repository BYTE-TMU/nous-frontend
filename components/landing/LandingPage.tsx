import BreakMeter from "./BreakMeter";
import ClosingCta from "./ClosingCta";
import DuelDemo from "./DuelDemo";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import LandingFooter from "./LandingFooter";
import LandingNav from "./LandingNav";
import NeuralOpening from "./NeuralOpening";
import Principles from "./Principles";
import SectionHeading from "./SectionHeading";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <NeuralOpening />
      <LandingNav />
      <main>
        <Hero />

        <section id="run" aria-labelledby="run-title" className="mx-auto max-w-7xl scroll-mt-32 px-4 pt-20 pb-28 sm:px-6 md:pt-28 md:pb-40 lg:px-8">
          <SectionHeading id="run-title" title="A rule under pressure.">
            A cashier cannot offer a discount. Watch an attacker test that boundary,
            one exchange at a time.
          </SectionHeading>
          <DuelDemo />
        </section>

        <section id="judge" aria-labelledby="judge-title" className="scroll-mt-32 border-y border-graphite bg-ink px-4 py-20 sm:px-6 md:py-28 lg:px-8">
          <div className="mx-auto max-w-7xl">
          <SectionHeading
            id="judge-title"
            title="Between holding and breaking."
          >
            The judge scores the latest defender reply against its instructions.
            Select a score to see how the rubric defines it.
          </SectionHeading>
          <BreakMeter />
          </div>
        </section>

        <section id="how" aria-labelledby="how-title" className="mx-auto max-w-7xl scroll-mt-32 px-4 pt-28 pb-20 sm:px-6 md:pt-40 md:pb-28 lg:px-8">
          <SectionHeading id="how-title" title="Set the conditions. Follow the conversation." />
          <HowItWorks />
        </section>

        <section id="principles" aria-labelledby="principles-title" className="mx-auto max-w-7xl scroll-mt-32 px-4 pt-12 pb-28 sm:px-6 md:pb-40 lg:px-8">
          <SectionHeading
            id="principles-title"
            title="Keep the evidence in view."
          >
            A score is a starting point. The transcript is there to examine.
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
