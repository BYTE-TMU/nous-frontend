import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardContent from "../../components/dashboard/DashboardContent";
import { toExperiment, toStatus } from "../../components/dashboard/toExperiment";
import { ExperimentStatusEnum } from "../../components/experiment/ExperimentStatus";
import { ApiError, type RunListItem } from "../../lib/api";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace }) }));

const listRuns = vi.fn();
vi.mock("../../lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api")>()),
  listRuns: (...args: unknown[]) => listRuns(...args),
}));

const run = (overrides: Partial<RunListItem> = {}): RunListItem => ({
  run_id: "r1",
  name: "Refund test",
  description: "Can it be talked out of the rule?",
  state: "running",
  attacker_model: "anthropic/claude-haiku-5.5",
  defender_model: "anthropic/claude-opus-5.5",
  turns_completed: 3,
  max_turns: 10,
  cost: { total_usd: 0.234, total_tokens: 1000, breakdown: [] },
  created_at: "2026-11-14T12:00:00Z",
  ...overrides,
});

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("toExperiment", () => {
  it("maps a backend run onto what the cards show", () => {
    expect(toExperiment(run())).toMatchObject({
      id: "r1",
      name: "Refund test",
      attacker: "claude-haiku-5.5",
      defender: "claude-opus-5.5",
      description: "Can it be talked out of the rule?",
      currentTurn: 3,
      totalTurns: 10,
      cost: "$0.23",
      status: ExperimentStatusEnum.IN_PROGRESS,
    });
  });

  it("copes with a missing description and tiny costs", () => {
    const experiment = toExperiment(
      run({ description: null, cost: { total_usd: 0.002, total_tokens: 5, breakdown: [] } }),
    );
    expect(experiment.description).toBe("");
    expect(experiment.cost).toBe("<$0.01");
  });

  it("maps each backend state to the right display status", () => {
    expect(toStatus("pending")).toBe(ExperimentStatusEnum.PENDING);
    expect(toStatus("running")).toBe(ExperimentStatusEnum.IN_PROGRESS);
    expect(toStatus("stopping")).toBe(ExperimentStatusEnum.IN_PROGRESS);
    expect(toStatus("paused")).toBe(ExperimentStatusEnum.PAUSED);
    expect(toStatus("completed")).toBe(ExperimentStatusEnum.INCONCLUSIVE);
    expect(toStatus("failed")).toBe(ExperimentStatusEnum.INCONCLUSIVE);
  });
});

describe("DashboardContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("sends the user to /login, without calling the backend, when there is no token", async () => {
    render(<DashboardContent />, { wrapper });
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(listRuns).not.toHaveBeenCalled();
  });

  it("shows the user's runs from the backend", async () => {
    window.localStorage.setItem("nous.access_token", "tok");
    listRuns.mockResolvedValue([run(), run({ run_id: "r2", name: "Second run" })]);
    render(<DashboardContent />, { wrapper });
    expect(await screen.findByText("Refund test")).toBeInTheDocument();
    expect(screen.getByText("Second run")).toBeInTheDocument();
    expect(listRuns).toHaveBeenCalledWith("tok", { q: undefined, sort: "-created_at" });
    expect(screen.getByRole("link", { name: "Open Refund test" })).toHaveAttribute(
      "href",
      "/experiment/r1",
    );
    expect(screen.getByText("Create new experiment")).toBeInTheDocument();
  });

  it("still offers Create new experiment when the user has no runs", async () => {
    window.localStorage.setItem("nous.access_token", "tok");
    listRuns.mockResolvedValue([]);
    render(<DashboardContent />, { wrapper });
    expect(await screen.findByText("Create new experiment")).toBeInTheDocument();
  });

  it("clears an expired token and sends the user to /login on a 401", async () => {
    window.localStorage.setItem("nous.access_token", "stale");
    listRuns.mockRejectedValue(new ApiError(401, "no"));
    render(<DashboardContent />, { wrapper });
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(window.localStorage.getItem("nous.access_token")).toBeNull();
  });

  it("shows a retryable error when the backend is unreachable", async () => {
    window.localStorage.setItem("nous.access_token", "tok");
    listRuns.mockRejectedValueOnce(new ApiError(0, "offline"));
    listRuns.mockResolvedValueOnce([run()]);
    render(<DashboardContent />, { wrapper });
    expect(await screen.findByText("Can't reach the server.")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Refund test")).toBeInTheDocument();
  });
});
