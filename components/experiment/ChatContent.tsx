import Transcript from "@/components/transcript/Transcript";
import {
  PLACEHOLDER_MODELS,
  PLACEHOLDER_TURNS,
} from "@/components/transcript/placeholder-data";

export default function ChatContent() {
  // Placeholder data until the experiment read endpoint exists.
  return (
    <div className="col-span-6">
      <Transcript
        turns={PLACEHOLDER_TURNS}
        attackerModel={PLACEHOLDER_MODELS.attacker}
        defenderModel={PLACEHOLDER_MODELS.defender}
      />
    </div>
  );
}
