import type { RunCreateRequest } from "../../lib/api";
import { MAX_TURNS } from "./options";
import type { ExperimentForm } from "./types";

const pad = (n: number) => String(n).padStart(2, "0");

/** The name is optional in the design but required by the backend. */
function defaultName(now: Date): string {
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `Experiment ${date} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/**
 * Maps the form onto POST /runs. Each prompt is either a preset name or custom text.
 * A defender preset is sent as defender_persona; an attacker preset sends nothing, so
 * nous-ai uses its default attacker prompt with the real turn cap.
 */
export function buildRunRequest(form: ExperimentForm, now: Date = new Date()): RunCreateRequest {
  const request: RunCreateRequest = {
    name: form.name.trim() || defaultName(now),
    attacker_model: form.attackerModel,
    defender_model: form.defenderModel,
    max_turns: MAX_TURNS,
  };

  const attacker = form.attackerPrompt;
  if (attacker.mode === "custom" && attacker.custom.trim()) {
    request.attacker_prompt = attacker.custom.trim();
  }

  const { mode, custom, preset } = form.defenderPrompt;
  if (mode === "preset" && preset) request.defender_persona = preset;
  if (mode === "custom" && custom.trim()) request.defender_persona_prompt = custom.trim();
  return request;
}
