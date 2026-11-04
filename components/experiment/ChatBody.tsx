import {
  PLACEHOLDER_RULE,
  PLACEHOLDER_SETUP,
  PLACEHOLDER_TURNS,
} from "@/components/transcript/placeholder-data";
import ChatContent from "./ChatContent";
import ExperimentOverview from "./ExperimentOverview";
import ExperimentResults from "./ExperimentResults";
import { ExperimentStatusEnum } from "./ExperimentStatus";

// Placeholder data until the experiment read endpoints exist.
const STATUS = ExperimentStatusEnum.IN_PROGRESS;

export default function ChatBody() {
  return (
    <div className="grid grid-cols-8 gap-8 p-4 w-full h-full">
      <ChatContent />
      <ExperimentOverview
        rule={PLACEHOLDER_RULE}
        status={STATUS}
        turns={PLACEHOLDER_TURNS}
        setup={PLACEHOLDER_SETUP}
      />
      <div className="col-span-8">
        <ExperimentResults status={STATUS} />
      </div>
    </div>
  );
}
