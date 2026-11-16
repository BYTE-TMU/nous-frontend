"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { BrandSelect } from "./BrandSelect";
import type { ModelOption } from "./options";

type ModelCardProps = {
  role: "attacker" | "defender";
  value: string;
  onChange: (id: string) => void;
  options: ModelOption[];
  disabled: boolean;
};

const ROLES = {
  attacker: {
    label: "Attacker",
    dot: "/brand/dot-attacker.svg",
    card: "border-fox-red bg-fox-red/25",
    text: "text-fox-red",
  },
  defender: {
    label: "Defender",
    dot: "/brand/dot-defender.svg",
    card: "border-blue-freeze bg-blue-freeze/25",
    text: "text-blue-freeze",
  },
} as const;

// One role's model card: coloured by role, with the chosen model's name and blurb
// above the picker.
export function ModelCard({ role, value, onChange, options, disabled }: ModelCardProps) {
  const style = ROLES[role];
  const model = options.find((option) => option.id === value);

  return (
    <div
      className={cn(
        "flex min-h-[140px] flex-col gap-3 rounded-[26px] border-[1.5px] p-5",
        style.card,
      )}
    >
      <div className="flex items-center gap-2">
        <Image src={style.dot} alt="" width={10} height={10} />
        <span className={cn("font-mono text-sm font-medium uppercase", style.text)}>
          {style.label}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-[17px] font-bold text-paper">{model ? model.label : "No model selected"}</p>
        <p className="text-sm text-ash">{model ? model.description : "Choose a model below"}</p>
      </div>
      <BrandSelect
        value={value}
        onChange={onChange}
        options={options}
        placeholder="Select model"
        disabled={disabled}
        ariaLabel={`${style.label} model`}
      />
    </div>
  );
}
