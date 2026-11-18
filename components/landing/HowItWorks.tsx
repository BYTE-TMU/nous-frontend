import Reveal from "./Reveal";

const STEPS = [
  {
    title: "Set a boundary",
    body: "Choose attacker and defender models, then give the defender a rule to follow.",
    label: "INPUT / MODELS + PROMPTS",
  },
  {
    title: "Run the exchange",
    body: "The attacker challenges that rule over a conversation. Follow each message as it arrives.",
    label: "PROCESS / CONVERSATION",
  },
  {
    title: "Examine the result",
    body: "Read the transcript alongside the judge's scores and explanations.",
    label: "OUTPUT / TRANSCRIPT + ASSESSMENT",
  },
];

export default function HowItWorks() {
  return (
    <ol aria-label="Experiment workflow" className="flex flex-col md:flex-row md:items-stretch">
      {STEPS.map((step, index) => (
        <Reveal
          as="li"
          key={step.title}
          delay={index * 80}
          className="flex min-w-0 flex-1 flex-col md:flex-row md:items-stretch"
        >
          <div className="flex flex-1 flex-col border border-graphite bg-ink px-6 py-7">
            <p className="mb-5 font-mono text-[11px] tracking-[0.12em] text-signal-lime">{step.label}</p>
            <h3 className="mb-3 text-2xl font-semibold tracking-tight">{step.title}</h3>
            <p className="max-w-md leading-relaxed text-ash">{step.body}</p>
          </div>
          {index < STEPS.length - 1 && (
            <div aria-hidden className="flex h-12 items-center justify-center font-mono text-2xl text-signal-lime md:h-auto md:w-12 md:shrink-0">
              <span className="md:hidden">↓</span>
              <span className="hidden md:inline">→</span>
            </div>
          )}
        </Reveal>
      ))}
    </ol>
  );
}
