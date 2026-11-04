import type { Turn } from "@/components/transcript/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ExperimentStatusEnum } from "./ExperimentStatus";
import ExperimentSetupPanel from "./ExperimentSetupPanel";
import ExperimentSummary from "./ExperimentSummary";
import type { ExperimentSetup } from "./types";

enum ExperimentTabEnum {
  SUMMARY = "Summary",
  SETUP = "Setup",
}

type Props = {
  rule: string;
  status: ExperimentStatusEnum;
  turns: Turn[];
  setup: ExperimentSetup;
};

export default function ExperimentOverview({ rule, status, turns, setup }: Props) {
  return (
    <div className="col-span-2">
      <Tabs defaultValue={ExperimentTabEnum.SUMMARY}>
        <TabsList>
          <TabsTrigger value={ExperimentTabEnum.SUMMARY}>{ExperimentTabEnum.SUMMARY}</TabsTrigger>
          <TabsTrigger value={ExperimentTabEnum.SETUP}>{ExperimentTabEnum.SETUP}</TabsTrigger>
        </TabsList>
        <TabsContent value={ExperimentTabEnum.SUMMARY}>
          <ExperimentSummary rule={rule} status={status} turns={turns} />
        </TabsContent>
        <TabsContent value={ExperimentTabEnum.SETUP}>
          <ExperimentSetupPanel setup={setup} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
