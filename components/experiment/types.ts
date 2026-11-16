// Local view types for the experiment side panel. These move to the generated
// `lib/types.ts` once the backend exposes the run detail endpoint.

/** Locked when the conversation started. The rule under test is also pinned above the transcript. */
export type ExperimentSetup = {
  defenderPersona: string;
  rule: string;
  attackStrategy: string;
  attackerModel: string;
  defenderModel: string;
};
