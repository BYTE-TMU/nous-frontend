"use client";

import { useId } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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

// One prompt with a Custom/Preset toggle. Which one is chosen changes only the
// prompt; the models are picked separately on the next step.
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
        <label htmlFor={fieldId} className="font-medium">
          {label}
        </label>
        <Tabs
          value={value.mode}
          onValueChange={(mode) => onChange({ ...value, mode: mode as PromptMode })}
        >
          <TabsList aria-label={`${label} source`}>
            <TabsTrigger value="custom" disabled={disabled}>
              Custom
            </TabsTrigger>
            <TabsTrigger value="preset" disabled={disabled}>
              Preset
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {value.mode === "custom" ? (
        <Textarea
          id={fieldId}
          rows={5}
          placeholder={placeholder}
          value={value.custom}
          disabled={disabled}
          onChange={(event) => onChange({ ...value, custom: event.target.value })}
        />
      ) : (
        <>
          <Select
            value={value.preset || undefined}
            disabled={disabled}
            onValueChange={(preset) => onChange({ ...value, preset })}
          >
            <SelectTrigger id={fieldId} className="w-full">
              <SelectValue placeholder="Select a preset" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selected ? <p className="text-xs text-muted-foreground">{selected.summary}</p> : null}
        </>
      )}

      {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}
