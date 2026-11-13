"use client";

import { useId } from "react";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { estimateCostUsd, formatUsd } from "./cost";
import { MODEL_OPTIONS, PRICES_ARE_PLACEHOLDER } from "./options";
import type { ExperimentForm } from "./types";

type ModelStepProps = {
  form: ExperimentForm;
  onChange: (patch: Partial<ExperimentForm>) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string;
};

type ModelSelectProps = {
  label: string;
  value: string;
  onChange: (id: string) => void;
  disabled: boolean;
};

function ModelSelect({ label, value, onChange, disabled }: ModelSelectProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-input p-4">
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {MODEL_OPTIONS.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Step 2: both models, the cost estimate, and Create.
export function ModelStep({ form, onChange, onBack, onSubmit, submitting, error }: ModelStepProps) {
  const attacker = MODEL_OPTIONS.find((model) => model.id === form.attackerModel);
  const defender = MODEL_OPTIONS.find((model) => model.id === form.defenderModel);
  const cost = estimateCostUsd(attacker, defender);
  const ready = Boolean(attacker && defender);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <ModelSelect
          label="Attacker model"
          value={form.attackerModel}
          onChange={(attackerModel) => onChange({ attackerModel })}
          disabled={submitting}
        />
        <ModelSelect
          label="Defender model"
          value={form.defenderModel}
          onChange={(defenderModel) => onChange({ defenderModel })}
          disabled={submitting}
        />
      </div>

      <div className="flex items-center justify-between gap-4 rounded-lg border border-input p-4">
        <span className="font-medium">Token cost estimate</span>
        <div className="text-right">
          <div role="status" aria-label="Token cost estimate" className="text-lg font-semibold">
            {formatUsd(cost)}
          </div>
          {PRICES_ARE_PLACEHOLDER ? (
            <p className="text-xs text-muted-foreground">Placeholder prices</p>
          ) : null}
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button type="button" onClick={onSubmit} disabled={!ready || submitting} aria-busy={submitting}>
          {submitting ? "Creating…" : "Create"}
        </Button>
      </div>
    </div>
  );
}
