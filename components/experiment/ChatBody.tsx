import ChatContent from "./ChatContent";
import ExperimentOverview from "./ExperimentOverview";
import ExperimentResults from "./ExperimentResults";
import type { ExperimentView } from "./toExperimentView";

export default function ChatBody({ view }: { view: ExperimentView }) {
  return (
    <div className="grid grid-cols-8 gap-8 p-4 w-full h-full">
      <ChatContent
        turns={view.turns}
        attackerModel={view.attacker}
        defenderModel={view.defender}
        rule={view.rule}
      />
      <ExperimentOverview
        status={view.status}
        turns={view.turns}
        setup={view.setup}
        state={view.state}
      />
      <div className="col-span-8">
        <ExperimentResults
          status={view.status}
          state={view.state}
          verdict={view.verdict}
          costUsd={view.costUsd}
        />
      </div>
    </div>
  );
}
