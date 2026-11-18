"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
import { ApiError } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { useRuns } from "@/lib/hooks";
import { toExperiment } from "./toExperiment";
import ExperimentCard, { type Experiment } from "./ExperimentCard";
import ExperimentRow from "./ExperimentRow";
import CreateExperimentCard from "./CreateExperimentCard";
import { NewExperimentDialog } from "@/components/new-experiment/NewExperimentDialog";

type ViewMode = "grid" | "list";

const SORT_OPTIONS = [
  { label: "Most recent", value: "-created_at" },
  { label: "Oldest", value: "created_at" },
  { label: "Name A-Z", value: "name" },
  { label: "Name Z-A", value: "-name" },
  { label: "Highest cost", value: "-cost" },
  { label: "Most turns", value: "-turns_completed" },
] as const;

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
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [createOpen, setCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState("-created_at");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);

  const { data, isLoading, isError, error, refetch } = useRuns({
    q: debouncedQuery || undefined,
    sort,
  });

  const experiments = data?.map(toExperiment) ?? [];
  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Most recent";

  // Handle 401 → redirect to login
  const is401 = isError && error instanceof ApiError && error.status === 401;
  useEffect(() => {
    if (is401) {
      clearToken();
      router.replace("/login");
    }
  }, [is401, router]);

  // No token at all → redirect to login
  const hasToken = typeof window !== "undefined" && !!getToken();
  useEffect(() => {
    if (!hasToken) router.replace("/login");
  }, [hasToken, router]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  if (!hasToken || is401) return null;

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
          {searchOpen ? (
            <div className="flex items-center gap-1">
              <HugeiconsIcon icon={Search01Icon} size={18} className="text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search experiments..."
                className="h-8 w-48 text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
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
                      className="relative flex items-center rounded-md pl-7 pr-3 py-2 text-sm text-muted-foreground outline-none transition-colors cursor-default select-none data-[highlighted]:bg-muted data-[highlighted]:text-foreground data-[state=checked]:text-foreground data-[state=checked]:font-medium"
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
        </div>
      </div>

      <div className="px-6 pb-6">
        <TabsContent value="all">
          {isLoading && <Notice>Loading experiments…</Notice>}
          {isError && !is401 && (
            <Notice>
              <p>
                {error instanceof ApiError && error.status === 0
                  ? "Can't reach the server."
                  : "Couldn't load your experiments."}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </Notice>
          )}
          {!isLoading && !isError && experiments.length === 0 && (
            <>
              <Notice>
                <p>{debouncedQuery ? "No matching experiments" : "No experiments yet"}</p>
                {debouncedQuery && (
                  <p className="text-sm">Try a different search term</p>
                )}
              </Notice>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-4 gap-6">
                  <CreateExperimentCard onClick={() => setCreateOpen(true)} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="flex w-full items-center gap-4 rounded-2xl border-2 border-border px-6 py-4 text-left cursor-pointer hover:bg-muted transition-colors"
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
              )}
            </>
          )}
          {!isLoading && !isError && experiments.length > 0 &&
            (viewMode === "grid" ? (
              <ExperimentGrid
                experiments={experiments}
                onCreate={() => setCreateOpen(true)}
              />
            ) : (
              <ExperimentList
                experiments={experiments}
                onCreate={() => setCreateOpen(true)}
              />
            ))}
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
