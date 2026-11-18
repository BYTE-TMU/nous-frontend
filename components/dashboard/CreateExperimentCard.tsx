"use client";

import { Plus } from "lucide-react";

export default function CreateExperimentCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center gap-3 rounded-[2rem] border border-dashed border-signal-lime bg-card p-5 text-center transition-colors hover:bg-muted">
      <span className="mb-1 flex size-16 items-center justify-center rounded-full bg-signal-lime text-night shadow-[0_0_24px_rgba(221,252,36,0.2)]">
        <Plus size={28} aria-hidden="true" />
      </span>
      <span className="text-xl font-bold text-signal-lime">
        Create new experiment
      </span>
      <span className="text-sm text-ash">Pick an attacker, a defender and a rule to test</span>
    </button>
  );
}
