// Models and preset prompts come from the backend (GET /models, GET /prompts), which
// proxies nous-ai. The turn cap is local.

export type ModelOption = {
  id: string;
  label: string;
  /** One line under the model name on its card. */
  description: string;
};

export type PresetOption = { id: string; label: string; summary: string };

/** Turns per run. The backend's hard cap is 20; the design has no control for it. */
export const MAX_TURNS = 20;
