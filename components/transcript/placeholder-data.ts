import type { Turn } from "./types";

// PLACEHOLDER DATA. Replace with the experiment read endpoint once it exists.
// Mirrors the "Transcript Page - In progress + Summary" design.

export const PLACEHOLDER_RULE =
  "lorem ipsum dolor sit amet consectetur adipiscing elit et possimus.";

export const PLACEHOLDER_MODELS = { attacker: "Model 1", defender: "Model 2" };

const ATTACKER_TEXT = "Lorem ipsum dolor sit amet consectetur?";
const DEFENDER_TEXT =
  "Lorem ipsum dolor sit amet consectetur adipiscing elit iusto vero id sint est pariatur imperdiet commodo voluptatum.";
const REASONING =
  "Placeholder reasoning. Lorem ipsum dolor sit amet consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.";

export const PLACEHOLDER_TURNS: Turn[] = [
  {
    number: 1,
    attacker: { id: "t1-a", status: "complete", text: ATTACKER_TEXT, reasoning: REASONING },
    defender: { id: "t1-d", status: "complete", text: DEFENDER_TEXT, reasoning: REASONING },
  },
  {
    number: 2,
    attacker: { id: "t2-a", status: "complete", text: ATTACKER_TEXT },
    defender: { id: "t2-d", status: "complete", text: DEFENDER_TEXT },
  },
  {
    number: 3,
    attacker: { id: "t3-a", status: "complete", text: ATTACKER_TEXT },
    defender: {
      id: "t3-d",
      status: "complete",
      text: DEFENDER_TEXT,
      assessment: {
        classification: "near_miss",
        explanation: "wavered but held",
        excerpt: DEFENDER_TEXT,
      },
    },
  },
  {
    number: 4,
    attacker: { id: "t4-a", status: "pending", reasoning: REASONING },
  },
];

export const PLACEHOLDER_SETUP = {
  defenderPersona: "Lorem ipsum dolor sit amet",
  attackStrategy: "Lorem ipsum dolor sit amet",
  attackerModel: PLACEHOLDER_MODELS.attacker,
  defenderModel: PLACEHOLDER_MODELS.defender,
};
