import type { Turn } from "@/components/transcript/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ExperimentStatusEnum } from "./ExperimentStatus";
import ExperimentSetupPanel from "./ExperimentSetupPanel";
import ExperimentSummary from "./ExperimentSummary";
import type { ExperimentSetup } from "./types";
import type { RunSummary } from "@/lib/api";

enum ExperimentTabEnum {
  SUMMARY = "Summary",
  SETUP = "Setup",
}

/** Lime track; the selected tab is a dark pill (Figma "Summary / Setup" toggle). */
const TAB =
  "h-full rounded-full text-base font-medium text-night/80 hover:text-night data-active:bg-night data-active:text-white data-active:shadow-none";

type Props = {
  status: ExperimentStatusEnum;
  turns: Turn[];
  setup: ExperimentSetup;
  state?: RunSummary["state"];
};

export default function ExperimentOverview({ status, turns, setup, state }: Props) {
  return (
    <div className="col-span-2">
      <Tabs defaultValue={ExperimentTabEnum.SUMMARY} className="gap-8">
        <TabsList className="w-full rounded-full border-[1.5px] border-black bg-signal-lime p-[5px] group-data-horizontal/tabs:h-12">
          <TabsTrigger value={ExperimentTabEnum.SUMMARY} className={TAB}>{ExperimentTabEnum.SUMMARY}</TabsTrigger>
          <TabsTrigger value={ExperimentTabEnum.SETUP} className={TAB}>{ExperimentTabEnum.SETUP}</TabsTrigger>
        </TabsList>
        <TabsContent value={ExperimentTabEnum.SUMMARY}>
          <ExperimentSummary status={status} turns={turns} state={state} />
        </TabsContent>
        <TabsContent value={ExperimentTabEnum.SETUP}>
          <ExperimentSetupPanel setup={setup} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
