"use client";

import { useId } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { PromptField } from "./PromptField";
import {
  ATTACKER_PRESETS,
  ATTACKER_PROMPT_SUPPORTED,
  DEFENDER_PRESETS,
  SUGGESTIONS,
  type Suggestion,
} from "./options";
import type { ExperimentForm } from "./types";

type PromptStepProps = {
  form: ExperimentForm;
  onChange: (patch: Partial<ExperimentForm>) => void;
  onNext: () => void;
};

const suggestions = SUGGESTIONS.filter(
  (suggestion) => suggestion.target === "defender" || ATTACKER_PROMPT_SUPPORTED,
);

// Step 1: name and the two prompts.
export function PromptStep({ form, onChange, onNext }: PromptStepProps) {
  const nameId = useId();

  // The backend rejects a run with no defender rule (422), so don't let the tester
  // reach the submit step without one.
  const { mode, custom, preset } = form.defenderPrompt;
  const hasDefenderPrompt = mode === "preset" ? preset !== "" : custom.trim() !== "";

  // A suggestion fills its prompt as custom text, which the tester can then edit.
  function applySuggestion({ target, text }: Suggestion) {
    const key = target === "attacker" ? "attackerPrompt" : "defenderPrompt";
    onChange({ [key]: { ...form[key], mode: "custom", custom: text } });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor={nameId} className="font-medium">
          Experiment name (optional)
        </label>
        <Input
          id={nameId}
          value={form.name}
          placeholder="Experiment name"
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <PromptField
          label="Attacker prompt"
          value={form.attackerPrompt}
          onChange={(attackerPrompt) => onChange({ attackerPrompt })}
          presets={ATTACKER_PRESETS}
          placeholder="Ex: Attacker convinces the LLM to share something sensitive"
          disabled={!ATTACKER_PROMPT_SUPPORTED}
          note={
            ATTACKER_PROMPT_SUPPORTED
              ? undefined
              : "Not sent yet: the backend doesn't accept an attacker prompt."
          }
        />
        <PromptField
          label="Defender prompt"
          value={form.defenderPrompt}
          onChange={(defenderPrompt) => onChange({ defenderPrompt })}
          presets={DEFENDER_PRESETS}
          placeholder="Describe the rule or persona the defender follows"
        />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-medium">Suggestions</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => applySuggestion(suggestion)}
              className="flex flex-col gap-1 rounded-lg border border-input p-3 text-left transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <span className="font-medium">{suggestion.title}</span>
              <span className="text-xs text-muted-foreground">{suggestion.text}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {!hasDefenderPrompt && (
          <span className="text-xs text-muted-foreground">
            Add a defender prompt to continue.
          </span>
        )}
        <Button type="button" onClick={onNext} disabled={!hasDefenderPrompt}>
          Next
        </Button>
      </div>
    </div>
  );
}
