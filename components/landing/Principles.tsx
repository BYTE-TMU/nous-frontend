import { PRINCIPLES } from "./content";
import Reveal from "./Reveal";

export default function Principles() {
  return (
    <ul className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
      {PRINCIPLES.map((p, i) => (
        <Reveal
          as="li"
          key={p.title}
          delay={(i % 3) * 100}
          className="flex flex-col gap-3 border-t border-graphite pt-6 pb-10"
        >
          <h3 className="text-xl font-semibold tracking-tight">{p.title}</h3>
          <p className="leading-relaxed text-ash">{p.body}</p>
        </Reveal>
      ))}
    </ul>
  );
}
