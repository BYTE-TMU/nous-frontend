// Local view types for the experiment side panel. These move to the generated
// `lib/api-schema.d.ts` once the backend exposes the run detail endpoint.

/** Locked when the conversation started. The rule under test is shown on the Summary tab. */
export type ExperimentSetup = {
  defenderPersona: string;
  attackStrategy: string;
  attackerModel: string;
  defenderModel: string;
};
