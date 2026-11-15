"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import DashboardSquare01Icon from "@hugeicons/core-free-icons/DashboardSquare01Icon";
import ListViewIcon from "@hugeicons/core-free-icons/ListViewIcon";
import ChevronDownIcon from "@hugeicons/core-free-icons/ChevronDownIcon";
import PlusSignCircleIcon from "@hugeicons/core-free-icons/PlusSignCircleIcon";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/Button";
import { ExperimentStatusEnum } from "@/components/experiment/ExperimentStatus";
import ExperimentCard, { type Experiment } from "./ExperimentCard";
import ExperimentRow from "./ExperimentRow";
import CreateExperimentCard from "./CreateExperimentCard";
import { NewExperimentDialog } from "@/components/new-experiment/NewExperimentDialog";

type ViewMode = "grid" | "list";

const MOCK_EXPERIMENTS: Experiment[] = [
  {
    id: "1",
    name: "Experiment name",
    attacker: "Attacker X",
    defender: "Defender X",
    description: "Lorem ipsum dolor sit amet consectetur.",
    date: "10/11/2026",
    currentTurn: 4,
    totalTurns: 10,
    status: ExperimentStatusEnum.IN_PROGRESS,
  },
  {
    id: "2",
    name: "Experiment name",
    attacker: "Attacker X",
    defender: "Defender X",
    description: "Lorem ipsum dolor sit amet consectetur.",
    date: "10/11/2026",
    currentTurn: 8,
    totalTurns: 10,
    status: ExperimentStatusEnum.BROKE,
  },
  {
    id: "3",
    name: "Experiment name",
    attacker: "Attacker X",
    defender: "Defender X",
    description: "Lorem ipsum dolor sit amet consectetur.",
    date: "10/11/2026",
    currentTurn: 10,
    totalTurns: 10,
    status: ExperimentStatusEnum.INCONCLUSIVE,
  },
  {
    id: "4",
    name: "Experiment name",
    attacker: "Attacker X",
    defender: "Defender X",
    description: "Lorem ipsum dolor sit amet consectetur.",
    date: "10/11/2026",
    currentTurn: 8,
    totalTurns: 10,
    status: ExperimentStatusEnum.BROKE,
  },
  {
    id: "5",
    name: "Experiment name",
    attacker: "Attacker X",
    defender: "Defender X",
    description: "Lorem ipsum dolor sit amet consectetur.",
    date: "10/11/2026",
    currentTurn: 10,
    totalTurns: 10,
    status: ExperimentStatusEnum.INCONCLUSIVE,
  },
  {
    id: "6",
    name: "Experiment name",
    attacker: "Attacker X",
    defender: "Defender X",
    description: "Lorem ipsum dolor sit amet consectetur.",
    date: "10/11/2026",
    currentTurn: 4,
    totalTurns: 10,
    status: ExperimentStatusEnum.IN_PROGRESS,
  },
  {
    id: "7",
    name: "Experiment name",
    attacker: "Attacker X",
    defender: "Defender X",
    description: "Lorem ipsum dolor sit amet consectetur.",
    date: "10/11/2026",
    currentTurn: 8,
    totalTurns: 10,
    status: ExperimentStatusEnum.BROKE,
  },
  {
    id: "8",
    name: "Experiment name",
    attacker: "Attacker X",
    defender: "Defender X",
    description: "Lorem ipsum dolor sit amet consectetur.",
    date: "10/11/2026",
    currentTurn: 10,
    totalTurns: 10,
    status: ExperimentStatusEnum.INCONCLUSIVE,
  },
  {
    id: "9",
    name: "Experiment name",
    attacker: "Attacker X",
    defender: "Defender X",
    description: "Lorem ipsum dolor sit amet consectetur.",
    date: "10/11/2026",
    currentTurn: 4,
    totalTurns: 10,
    status: ExperimentStatusEnum.IN_PROGRESS,
  },
  {
    id: "10",
    name: "Experiment name",
    attacker: "Attacker X",
    defender: "Defender X",
    description: "Lorem ipsum dolor sit amet consectetur.",
    date: "10/11/2026",
    currentTurn: 4,
    totalTurns: 10,
    status: ExperimentStatusEnum.IN_PROGRESS,
  },
  {
    id: "11",
    name: "Experiment name",
    attacker: "Attacker X",
    defender: "Defender X",
    description: "Lorem ipsum dolor sit amet consectetur.",
    date: "10/11/2026",
    currentTurn: 8,
    totalTurns: 10,
    status: ExperimentStatusEnum.BROKE,
  },
];

function ExperimentGrid({
  experiments,
  onCreate,
}: {
  experiments: Experiment[];
  onCreate: () => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-6">
      <CreateExperimentCard onClick={onCreate} />
      {experiments.map((exp) => (
        <ExperimentCard key={exp.id} experiment={exp} />
      ))}
    </div>
  );
}

function ExperimentList({
  experiments,
  onCreate,
}: {
  experiments: Experiment[];
  onCreate: () => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-[180px_1fr_1fr_1fr_100px_140px_100px] items-center gap-4 rounded-t-2xl border-2 border-border px-6 py-4">
        <span className="text-sm font-semibold underline">Status</span>
        <span className="text-sm font-semibold underline">Experiment</span>
        <span className="text-sm font-semibold underline">
          {"Attacker \u2192 Defender"}
        </span>
        <span className="text-sm font-semibold underline">Description</span>
        <span className="text-sm font-semibold underline">Cost</span>
        <span className="text-sm font-semibold underline">Date</span>
        <span className="text-sm font-semibold underline">Turns</span>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="flex w-full items-center gap-4 border-x-2 border-b-2 border-border px-6 py-4 text-left cursor-pointer hover:bg-muted transition-colors"
      >
        <HugeiconsIcon
          icon={PlusSignCircleIcon}
          size={32}
          className="text-muted-foreground"
        />
        <span className="text-base font-medium text-muted-foreground">
          Create new experiment
        </span>
      </button>

      {experiments.map((exp, i) => (
        <ExperimentRow
          key={exp.id}
          experiment={exp}
          isLast={i === experiments.length - 1}
        />
      ))}
    </div>
  );
}

export default function DashboardContent() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center justify-between px-6 py-4">
        <TabsList variant="line" className="gap-2 bg-transparent p-0 h-auto">
          <TabsTrigger
            value="all"
            className="rounded-full border border-border px-5 py-1.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground after:hidden"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="compare"
            className="rounded-full border border-border px-5 py-1.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground after:hidden"
          >
            Compare
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <HugeiconsIcon icon={Search01Icon} size={20} />
          </Button>

          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            className="rounded-full"
            onClick={() => setViewMode("grid")}
          >
            <HugeiconsIcon icon={DashboardSquare01Icon} size={18} />
          </Button>

          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            className="rounded-full"
            onClick={() => setViewMode("list")}
          >
            <HugeiconsIcon icon={ListViewIcon} size={18} />
          </Button>

          <Button variant="outline" className="rounded-full gap-2">
            Most recent
            <HugeiconsIcon icon={ChevronDownIcon} size={14} />
          </Button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <TabsContent value="all">
          {viewMode === "grid" ? (
            <ExperimentGrid
              experiments={MOCK_EXPERIMENTS}
              onCreate={() => setCreateOpen(true)}
            />
          ) : (
            <ExperimentList
              experiments={MOCK_EXPERIMENTS}
              onCreate={() => setCreateOpen(true)}
            />
          )}
        </TabsContent>

        <TabsContent value="compare">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Compare view coming soon
          </div>
        </TabsContent>
      </div>

      <NewExperimentDialog open={createOpen} onOpenChange={setCreateOpen} />
    </Tabs>
  );
}
