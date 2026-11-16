"use client";

import { useId } from "react";
import { Tabs } from "radix-ui";
import { BrandSelect } from "./BrandSelect";
import type { PresetOption } from "./options";
import type { PromptChoice, PromptMode } from "./types";

type PromptFieldProps = {
  label: string;
  value: PromptChoice;
  onChange: (next: PromptChoice) => void;
  presets: PresetOption[];
  placeholder: string;
  disabled?: boolean;
  note?: string;
};

const toggleItem =
  "cursor-pointer rounded-full px-3 py-1 text-xs font-medium text-ash outline-none transition-colors focus-visible:ring-2 focus-visible:ring-signal-lime/60 disabled:cursor-not-allowed disabled:opacity-50 data-[state=active]:bg-[linear-gradient(157deg,var(--color-signal-lime)_0%,var(--color-impact-green)_100%)] data-[state=active]:text-night";

// One prompt with a Custom/Preset pill toggle. Which one is chosen changes only the
// prompt; the models are picked in the cards above.
export function PromptField({
  label,
  value,
  onChange,
  presets,
  placeholder,
  disabled = false,
  note,
}: PromptFieldProps) {
  const id = useId();
  const fieldId = `${id}-field`;
  const selected = presets.find((preset) => preset.id === value.preset);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={fieldId} className="font-mono text-sm font-medium text-paper uppercase">
          {label}
        </label>
        <Tabs.Root
          value={value.mode}
          onValueChange={(mode) => onChange({ ...value, mode: mode as PromptMode })}
        >
          <Tabs.List
            aria-label={`${label} source`}
            className="flex items-start gap-0.5 rounded-full border-[1.5px] border-graphite bg-ink p-0.5"
          >
            <Tabs.Trigger value="custom" disabled={disabled} className={toggleItem}>
              Custom
            </Tabs.Trigger>
            <Tabs.Trigger value="preset" disabled={disabled} className={toggleItem}>
              Preset
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </div>

      {value.mode === "custom" ? (
        <textarea
          id={fieldId}
          placeholder={placeholder}
          value={value.custom}
          disabled={disabled}
          onChange={(event) => onChange({ ...value, custom: event.target.value })}
          className="h-[72px] w-full resize-none rounded-[14px] border-[1.5px] border-graphite bg-ink px-4 py-3 text-[13px] text-white outline-none transition-colors placeholder:text-smoke focus:border-signal-lime disabled:cursor-not-allowed disabled:opacity-60"
        />
      ) : (
        <div className="flex h-[72px] items-center rounded-[14px] border-[1.5px] border-graphite bg-ink p-4">
          <BrandSelect
            id={fieldId}
            value={value.preset}
            onChange={(preset) => onChange({ ...value, preset })}
            options={presets}
            placeholder="Select a preset"
            disabled={disabled}
          />
        </div>
      )}

      {value.mode === "preset" && selected ? (
        <p className="text-xs text-smoke">{selected.summary}</p>
      ) : null}
      {note ? <p className="text-xs text-smoke">{note}</p> : null}
    </div>
  );
}
