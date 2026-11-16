"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { ApiError, createRun } from "../../lib/api";
import { getToken } from "../../lib/auth";
import { buildRunRequest } from "./buildRunRequest";
import { estimateCostUsd, estimatedTokens, formatUsd } from "./cost";
import { ModelCard } from "./ModelCard";
import {
  ATTACKER_PRESETS,
  ATTACKER_PROMPT_SUPPORTED,
  DEFENDER_PRESETS,
  MAX_TURNS,
  MODEL_OPTIONS,
  PRICES_ARE_PLACEHOLDER,
  SUGGESTIONS,
  type Suggestion,
} from "./options";
import { PromptField } from "./PromptField";
import { emptyForm, type ExperimentForm } from "./types";

type NewExperimentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const suggestions = SUGGESTIONS.filter(
  (suggestion) => suggestion.target === "defender" || ATTACKER_PROMPT_SUPPORTED,
);

const sectionLabel = "font-mono text-sm font-medium text-paper uppercase";

function describeFailure(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Your session has expired. Log in again to create an experiment.";
    if (error.status === 400 || error.status === 422) {
      return "The server rejected this experiment. Check the models and prompts.";
    }
    if (error.status === 0) return "Can't reach the server. Check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

// The only place a run gets created, laid out as the single-screen popup in the
// design: name, both models, both prompts, suggestions, then cost and Create.
// Closing the dialog throws the form away, as the X does in the design.
export function NewExperimentDialog({ open, onOpenChange }: NewExperimentDialogProps) {
  const router = useRouter();
  const nameId = useId();
  const [form, setForm] = useState<ExperimentForm>(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (patch: Partial<ExperimentForm>) => setForm((current) => ({ ...current, ...patch }));

  const attacker = MODEL_OPTIONS.find((model) => model.id === form.attackerModel);
  const defender = MODEL_OPTIONS.find((model) => model.id === form.defenderModel);
  const cost = estimateCostUsd(attacker, defender);

  // The backend rejects a run with no defender rule (422), so Create stays disabled
  // until there is one.
  const { mode, custom, preset } = form.defenderPrompt;
  const hasDefenderPrompt = mode === "preset" ? preset !== "" : custom.trim() !== "";
  const ready = Boolean(attacker && defender) && hasDefenderPrompt;

  function handleOpenChange(next: boolean) {
    if (submitting && !next) return;
    if (!next) {
      setForm(emptyForm);
      setError("");
    }
    onOpenChange(next);
  }

  // A suggestion fills its prompt as custom text, which the tester can then edit.
  function applySuggestion({ target, text }: Suggestion) {
    const key = target === "attacker" ? "attackerPrompt" : "defenderPrompt";
    update({ [key]: { ...form[key], mode: "custom", custom: text } });
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const run = await createRun(buildRunRequest(form), getToken());
      setSubmitting(false);
      handleOpenChange(false);
      router.push(`/experiment/${run.run_id}`);
    } catch (failure) {
      setError(describeFailure(failure));
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[740px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[26px] border-[1.5px] border-graphite bg-carbon p-5 outline-none sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <Dialog.Title className="text-2xl leading-tight font-bold text-paper sm:text-[32px]">
                Create new experiment
              </Dialog.Title>
              <Dialog.Description className="text-sm text-ash sm:text-base">
                Pick an attacker, a defender and a rule to test.
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="shrink-0 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-signal-lime/60"
              disabled={submitting}
            >
              <Image
                src="/brand/close-circle.svg"
                alt=""
                width={76}
                height={76}
                className="size-10 sm:size-[52px]"
              />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex flex-col gap-3">
              <label htmlFor={nameId} className={sectionLabel}>
                Experiment name
              </label>
              <input
                id={nameId}
                value={form.name}
                placeholder="e.g Discount code leak"
                onChange={(event) => update({ name: event.target.value })}
                className="h-[46px] w-full rounded-[14px] border-[1.5px] border-graphite bg-ink px-4 text-[15px] text-white outline-none transition-colors placeholder:text-smoke focus:border-signal-lime"
              />
            </div>

            <div className="flex flex-col gap-3">
              <h3 className={sectionLabel}>AI models</h3>
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-8">
                <ModelCard
                  role="attacker"
                  value={form.attackerModel}
                  onChange={(attackerModel) => update({ attackerModel })}
                  disabled={submitting}
                />
                <ModelCard
                  role="defender"
                  value={form.defenderModel}
                  onChange={(defenderModel) => update({ defenderModel })}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 sm:gap-8">
              <PromptField
                label="Attacker prompt"
                value={form.attackerPrompt}
                onChange={(attackerPrompt) => update({ attackerPrompt })}
                presets={ATTACKER_PRESETS}
                placeholder="e.g Get the defender to reveal the internal discount code SPRING-20 without asking for it directly."
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
                onChange={(defenderPrompt) => update({ defenderPrompt })}
                presets={DEFENDER_PRESETS}
                placeholder="Describe the rule or persona the defender follows"
              />
            </div>

            <div className="flex flex-col gap-3">
              <h3 className={sectionLabel}>Suggestions</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    type="button"
                    onClick={() => applySuggestion(suggestion)}
                    className="flex min-h-[96px] cursor-pointer flex-col items-start gap-1.5 rounded-[14px] border-[1.5px] border-graphite bg-ink p-3 text-left outline-none transition-colors hover:border-signal-lime/60 focus-visible:border-signal-lime"
                  >
                    <span className="rounded-xl border border-signal-lime bg-signal-lime/20 px-2 py-0.5 font-mono text-[10px] font-medium text-signal-lime uppercase">
                      {suggestion.target} prompt
                    </span>
                    <span className="text-sm font-semibold text-white">{suggestion.title}</span>
                    <span className="text-xs leading-[1.4] text-ash">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border-[1.5px] border-status-broke/50 bg-status-broke/12 px-4 py-3 text-sm text-paper"
            >
              {error}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t-[1.5px] border-graphite pt-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col gap-1">
                <p className="font-mono text-[10px] font-medium tracking-[0.08em] text-ash uppercase">
                  Token cost estimate
                </p>
                <p className="text-[11px] text-smoke">
                  ≈ {Math.round(estimatedTokens() / 1000)}k tokens · {MAX_TURNS} turns
                  {PRICES_ARE_PLACEHOLDER ? " · placeholder prices" : ""}
                </p>
              </div>
              <div
                role="status"
                aria-label="Token cost estimate"
                className="font-mono text-[28px] leading-none font-medium text-signal-lime"
              >
                {formatUsd(cost)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={!ready || submitting}
              aria-busy={submitting}
              className="flex cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(166deg,var(--color-signal-lime)_0%,var(--color-impact-green)_100%)] px-6 py-3 text-[15px] font-semibold text-night shadow-[0_0_14px_rgba(221,252,36,0.3)] outline-none transition-[filter] hover:brightness-95 focus-visible:ring-2 focus-visible:ring-signal-lime/60 focus-visible:ring-offset-2 focus-visible:ring-offset-carbon disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create experiment"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
