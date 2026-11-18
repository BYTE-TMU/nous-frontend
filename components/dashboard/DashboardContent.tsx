"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
import { ApiError, getMe, listRuns } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { toExperiment } from "./toExperiment";
import ExperimentCard, { type Experiment } from "./ExperimentCard";
import ExperimentRow from "./ExperimentRow";
import CreateExperimentCard from "./CreateExperimentCard";
import { NewExperimentDialog } from "@/components/new-experiment/NewExperimentDialog";
import BarGraphPage from "@/components/graph/BarGraphPage";

type ViewMode = "grid" | "list";

type Load =
  | { state: "loading" }
  | { state: "signed-out" }
  | { state: "error"; message: string }
  | { state: "ready"; experiments: Experiment[] };

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
      {children}
    </div>
  );
}

function ExperimentGrid({
  experiments,
  onCreate,
}: {
  experiments: Experiment[];
  onCreate: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
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
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [tab, setTab] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState(false);

  // Only decides whether to offer the "All users" toggle; the backend enforces access.
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getMe(token)
      .then((me) => setIsAdmin(me.is_admin))
      .catch(() => setIsAdmin(false));
  }, []);

  const fetchRuns = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoad({ state: "signed-out" });
      return;
    }
    setLoad({ state: "loading" });
    try {
      const runs = await (allUsers ? listRuns(token, { all: true }) : listRuns(token));
      setLoad({ state: "ready", experiments: runs.map(toExperiment) });
    } catch (failure) {
      if (failure instanceof ApiError && failure.status === 401) {
        clearToken();
        setLoad({ state: "signed-out" });
        return;
      }
      setLoad({
        state: "error",
        message:
          failure instanceof ApiError && failure.status === 0
            ? "Can't reach the server."
            : "Couldn't load your experiments.",
      });
    }
  }, [allUsers]);

  useEffect(() => {
    void fetchRuns();
  }, [fetchRuns]);

  // No token, or the backend said 401: this page has nothing to show a signed-out
  // visitor, so send them to log in instead.
  const signedOut = load.state === "signed-out";
  useEffect(() => {
    if (signedOut) router.replace("/login");
  }, [signedOut, router]);

  if (signedOut) return null;

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
        <TabsList variant="line" className="gap-2 bg-transparent p-0 h-auto">
          <TabsTrigger
            value="all"
            className="rounded-full border border-border px-5 py-1.5 text-sm font-medium group-data-[variant=line]/tabs-list:data-active:bg-primary group-data-[variant=line]/tabs-list:data-active:text-night after:hidden"
          >
            All
          </TabsTrigger>
          <TabsTrigger
            value="compare"
            className="rounded-full border border-border px-5 py-1.5 text-sm font-medium group-data-[variant=line]/tabs-list:data-active:bg-primary group-data-[variant=line]/tabs-list:data-active:text-night after:hidden"
          >
            Compare
          </TabsTrigger>
        </TabsList>

        {tab === "all" && <div className="flex flex-wrap items-center gap-2">
          {isAdmin ? (
            <Button
              variant={allUsers ? "default" : "outline"}
              className="rounded-full"
              aria-pressed={allUsers}
              onClick={() => setAllUsers((current) => !current)}
            >
              All users
            </Button>
          ) : null}
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
        </div>}
      </div>

      <div className="px-6 pb-6">
        <TabsContent value="all">
          {load.state === "loading" && <Notice>Loading experiments…</Notice>}
          {load.state === "error" && (
            <Notice>
              <p>{load.message}</p>
              <Button variant="outline" onClick={() => void fetchRuns()}>
                Try again
              </Button>
            </Notice>
          )}
          {load.state === "ready" &&
            (viewMode === "grid" ? (
              <ExperimentGrid
                experiments={load.experiments}
                onCreate={() => setCreateOpen(true)}
              />
            ) : (
              <ExperimentList
                experiments={load.experiments}
                onCreate={() => setCreateOpen(true)}
              />
            ))}
        </TabsContent>

        <TabsContent value="compare">
          <BarGraphPage />
        </TabsContent>
      </div>

      <NewExperimentDialog open={createOpen} onOpenChange={setCreateOpen} />
    </Tabs>
  );
}
