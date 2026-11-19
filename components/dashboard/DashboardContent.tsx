"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import DashboardSquare01Icon from "@hugeicons/core-free-icons/DashboardSquare01Icon";
import ListViewIcon from "@hugeicons/core-free-icons/ListViewIcon";
import ChevronDownIcon from "@hugeicons/core-free-icons/ChevronDownIcon";
import PlusSignCircleIcon from "@hugeicons/core-free-icons/PlusSignCircleIcon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import Tick02Icon from "@hugeicons/core-free-icons/Tick02Icon";
import * as DropdownMenu from "radix-ui/dropdown-menu";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { ApiError, getMe, listRuns } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { toExperiment } from "./toExperiment";
import ExperimentCard, { type Experiment } from "./ExperimentCard";
import ExperimentRow from "./ExperimentRow";
import CreateExperimentCard from "./CreateExperimentCard";
import { NewExperimentDialog } from "@/components/new-experiment/NewExperimentDialog";
import BarGraphPage from "@/components/graph/BarGraphPage";
import DeleteRunDialog from "@/components/runs/DeleteRunDialog";

type ViewMode = "grid" | "list";

const SORT_OPTIONS = [
  { label: "Most recent", value: "-created_at" },
  { label: "Oldest", value: "created_at" },
  { label: "Name A-Z", value: "name" },
  { label: "Name Z-A", value: "-name" },
  { label: "Highest cost", value: "-cost" },
  { label: "Most turns", value: "-turns_completed" },
] as const;

type Load =
  | { state: "loading" }
  | { state: "signed-out" }
  | { state: "error"; message: string }
  | { state: "ready"; experiments: Experiment[] };

function useDebounce(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

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
  onDelete,
}: {
  experiments: Experiment[];
  onCreate: () => void;
  onDelete?: (experiment: Experiment) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      <CreateExperimentCard onClick={onCreate} />
      {experiments.map((exp) => (
        <ExperimentCard key={exp.id} experiment={exp} onDelete={onDelete} />
      ))}
    </div>
  );
}

function ExperimentList({
  experiments,
  onCreate,
  onDelete,
}: {
  experiments: Experiment[];
  onCreate: () => void;
  onDelete?: (experiment: Experiment) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-[180px_1fr_1fr_1fr_100px_140px_100px_90px] items-center gap-4 rounded-t-2xl border-2 border-border px-6 py-4">
        <span className="text-sm font-semibold underline">Status</span>
        <span className="text-sm font-semibold underline">Experiment</span>
        <span className="text-sm font-semibold underline">
          {"Attacker \u2192 Defender"}
        </span>
        <span className="text-sm font-semibold underline">Description</span>
        <span className="text-sm font-semibold underline">Cost</span>
        <span className="text-sm font-semibold underline">Date</span>
        <span className="text-sm font-semibold underline">Turns</span>
        <span />
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
          onDelete={onDelete}
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
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [allUsers, setAllUsers] = useState(false);
  const [accountRetry, setAccountRetry] = useState(0);
  const [runsRetry, setRunsRetry] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState("-created_at");
  const [canDelete, setCanDelete] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Experiment | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const onDelete = canDelete ? setPendingDelete : undefined;
  const currentSortLabel =
    SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Most recent";

  useEffect(() => {
    let cancelled = false;
    const token = getToken();
    if (!token) {
      setLoad({ state: "signed-out" });
      return;
    }
    setLoad({ state: "loading" });
    void getMe(token)
      .then((me) => {
        if (cancelled) return;
        setAllUsers(me.is_admin);
        setIsAdmin(me.is_admin);
        setCanDelete(me.can_delete_runs === true);
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
          clearToken();
          setLoad({ state: "signed-out" });
        } else {
          setLoad({
            state: "error",
            message: failure instanceof ApiError && failure.status === 0
              ? "Can't reach the server."
              : "Couldn't confirm your account.",
          });
        }
      });
    return () => { cancelled = true; };
  }, [accountRetry]);

  useEffect(() => {
    if (isAdmin === null) return;
    let cancelled = false;
    const token = getToken();
    if (!token) {
      setLoad({ state: "signed-out" });
      return;
    }
    setLoad({ state: "loading" });
    const options: { all?: boolean; q?: string; sort?: string } = {};
    if (allUsers) options.all = true;
    if (debouncedQuery) options.q = debouncedQuery;
    if (sort !== "-created_at") options.sort = sort;
    const runsRequest = Object.keys(options).length > 0
      ? listRuns(token, options)
      : listRuns(token);
    void runsRequest
      .then((runs) => {
        if (!cancelled) setLoad({ state: "ready", experiments: runs.map(toExperiment) });
      })
      .catch((failure: unknown) => {
        if (cancelled) return;
        if (failure instanceof ApiError && failure.status === 401) {
          clearToken();
          setLoad({ state: "signed-out" });
        } else {
          setLoad({
            state: "error",
            message: failure instanceof ApiError && failure.status === 0
              ? "Can't reach the server."
              : "Couldn't load your experiments.",
          });
        }
      });
    return () => { cancelled = true; };
  }, [isAdmin, allUsers, debouncedQuery, sort, runsRetry]);

  const retry = useCallback(() => {
    if (isAdmin === null) setAccountRetry((value) => value + 1);
    else setRunsRetry((value) => value + 1);
  }, [isAdmin]);

  // No token, or the backend said 401: this page has nothing to show a signed-out
  // visitor, so send them to log in instead.
  const signedOut = load.state === "signed-out";
  useEffect(() => {
    if (signedOut) router.replace("/login");
  }, [signedOut, router]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

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

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <label>
              <span className="sr-only">Run owner</span>
              <select
                value={allUsers ? "all" : "own"}
                onChange={(event) => {
                  setLoad({ state: "loading" });
                  setAllUsers(event.target.value === "all");
                }}
                className="min-h-10 rounded-full border border-border bg-carbon px-4 text-sm text-white"
              >
                <option value="all">All users</option>
                <option value="own">Your runs</option>
              </select>
            </label>
          )}
          {tab === "all" && <>
          {searchOpen ? (
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Search01Icon} size={18} className="text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search experiments..."
                aria-label="Search experiments"
                className="h-10 w-48 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close search"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setSearchOpen(true)}>
              <HugeiconsIcon icon={Search01Icon} size={20} />
            </Button>
          )}

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

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button variant="outline" className="rounded-full gap-2">
                {currentSortLabel}
                <HugeiconsIcon icon={ChevronDownIcon} size={14} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="z-50 min-w-[180px] rounded-lg border border-border bg-card p-1 shadow-lg"
              >
                <DropdownMenu.RadioGroup value={sort} onValueChange={setSort}>
                  {SORT_OPTIONS.map((option) => (
                    <DropdownMenu.RadioItem
                      key={option.value}
                      value={option.value}
                      className="relative flex cursor-default select-none items-center rounded-md py-2 pl-7 pr-3 text-sm text-muted-foreground outline-none transition-colors data-[highlighted]:bg-muted data-[highlighted]:text-foreground data-[state=checked]:font-medium data-[state=checked]:text-foreground"
                    >
                      <DropdownMenu.ItemIndicator className="absolute left-2">
                        <HugeiconsIcon icon={Tick02Icon} size={14} />
                      </DropdownMenu.ItemIndicator>
                      {option.label}
                    </DropdownMenu.RadioItem>
                  ))}
                </DropdownMenu.RadioGroup>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
          </>}
        </div>
      </div>

      <div className="px-6 pb-6">
        <TabsContent value="all">
          {load.state === "loading" && <Notice>Loading experiments…</Notice>}
          {load.state === "error" && (
            <Notice>
              <p>{load.message}</p>
              <Button variant="outline" onClick={retry}>
                Try again
              </Button>
            </Notice>
          )}
          {load.state === "ready" && (
            load.experiments.length === 0 ? (
              <>
                <Notice>
                  <p>{debouncedQuery ? "No matching experiments" : "No experiments yet"}</p>
                  {debouncedQuery ? <p className="text-sm">Try a different search term</p> : null}
                </Notice>
                <div className="mx-auto w-fit">
                  <CreateExperimentCard onClick={() => setCreateOpen(true)} />
                </div>
              </>
            ) : load.state === "ready" &&
            (viewMode === "grid" ? (
              <ExperimentGrid
                experiments={load.experiments}
                onCreate={() => setCreateOpen(true)}
                onDelete={onDelete}
              />
            ) : (
              <ExperimentList
                experiments={load.experiments}
                onCreate={() => setCreateOpen(true)}
                onDelete={onDelete}
              />
            )))}
        </TabsContent>

        <TabsContent value="compare">
          {isAdmin === null ? (
            <Notice>
              {load.state === "error" ? (
                <>
                  <p>{load.message}</p>
                  <Button variant="outline" onClick={retry}>Try again</Button>
                </>
              ) : "Loading experiments…"}
            </Notice>
          ) : (
            <BarGraphPage key={allUsers ? "all-users" : "your-runs"} allUsers={allUsers} />
          )}
        </TabsContent>
      </div>

      <NewExperimentDialog open={createOpen} onOpenChange={setCreateOpen} />
      <DeleteRunDialog
        run={pendingDelete}
        onClose={() => setPendingDelete(null)}
        onDeleted={() => {
          setPendingDelete(null);
          setRunsRetry((value) => value + 1);
        }}
      />
    </Tabs>
  );
}
