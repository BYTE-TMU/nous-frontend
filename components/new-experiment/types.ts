export type PromptMode = "custom" | "preset";

/** One prompt, written by hand ("custom") or picked from a list ("preset"). */
export type PromptChoice = {
  mode: PromptMode;
  custom: string;
  preset: string;
};

export type ExperimentForm = {
  name: string;
  attackerPrompt: PromptChoice;
  defenderPrompt: PromptChoice;
  attackerModel: string;
  defenderModel: string;
};

export const emptyPrompt: PromptChoice = { mode: "custom", custom: "", preset: "" };

export const emptyForm: ExperimentForm = {
  name: "",
  attackerPrompt: emptyPrompt,
  defenderPrompt: emptyPrompt,
  attackerModel: "",
  defenderModel: "",
};
