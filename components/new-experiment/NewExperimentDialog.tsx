"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError, createRun } from "../../lib/api";
import { getToken } from "../../lib/auth";
import { buildRunRequest } from "./buildRunRequest";
import { ModelStep } from "./ModelStep";
import { PromptStep } from "./PromptStep";
import { emptyForm, type ExperimentForm } from "./types";

type NewExperimentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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

// The only place a run gets created. Two steps: prompts, then models and cost.
// Closing the dialog throws the form away, as Cancel and X do in the design.
export function NewExperimentDialog({ open, onOpenChange }: NewExperimentDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<ExperimentForm>(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (patch: Partial<ExperimentForm>) => setForm((current) => ({ ...current, ...patch }));

  function handleOpenChange(next: boolean) {
    if (submitting && !next) return;
    if (!next) {
      setStep(1);
      setForm(emptyForm);
      setError("");
    }
    onOpenChange(next);
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const run = await createRun(buildRunRequest(form), getToken());
      setSubmitting(false);
      handleOpenChange(false);
      router.push(`/experiment?run=${run.run_id}`);
    } catch (failure) {
      setError(describeFailure(failure));
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Experiment</DialogTitle>
          <DialogDescription>
            Step {step} of 2: {step === 1 ? "prompts" : "models and cost"}
          </DialogDescription>
        </DialogHeader>
        {step === 1 ? (
          <PromptStep form={form} onChange={update} onNext={() => setStep(2)} />
        ) : (
          <ModelStep
            form={form}
            onChange={update}
            onBack={() => setStep(1)}
            onSubmit={() => void submit()}
            submitting={submitting}
            error={error}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
