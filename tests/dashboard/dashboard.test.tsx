import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardContent from "../../components/dashboard/DashboardContent";
import { toExperiment, toStatus } from "../../components/dashboard/toExperiment";
import { ExperimentStatusEnum } from "../../components/experiment/ExperimentStatus";
import { ApiError, type RunListItem } from "../../lib/api";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

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

  it("treats unfinished runs as in progress and finished or failed ones as inconclusive", () => {
    for (const state of ["pending", "running", "pausing", "paused", "stopping"] as const) {
      expect(toStatus(state)).toBe(ExperimentStatusEnum.IN_PROGRESS);
    }
    for (const state of ["completed", "failed"] as const) {
      expect(toStatus(state)).toBe(ExperimentStatusEnum.INCONCLUSIVE);
    }
  });
});

describe("DashboardContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("asks the user to log in, without calling the backend, when there is no token", async () => {
    render(<DashboardContent />);
    expect(await screen.findByText("Log in to see your experiments.")).toBeInTheDocument();
    expect(listRuns).not.toHaveBeenCalled();
  });

  it("shows the user's runs from the backend", async () => {
    window.localStorage.setItem("nous.access_token", "tok");
    listRuns.mockResolvedValue([run(), run({ run_id: "r2", name: "Second run" })]);
    render(<DashboardContent />);
    expect(await screen.findByText("Refund test")).toBeInTheDocument();
    expect(screen.getByText("Second run")).toBeInTheDocument();
    expect(listRuns).toHaveBeenCalledWith("tok");
    expect(screen.getByRole("link", { name: "Open Refund test" })).toHaveAttribute(
      "href",
      "/experiment/r1",
    );
    expect(screen.getByText("Create new experiment")).toBeInTheDocument();
  });

  it("still offers Create new experiment when the user has no runs", async () => {
    window.localStorage.setItem("nous.access_token", "tok");
    listRuns.mockResolvedValue([]);
    render(<DashboardContent />);
    expect(await screen.findByText("Create new experiment")).toBeInTheDocument();
  });

  it("clears an expired token and asks to log in again on a 401", async () => {
    window.localStorage.setItem("nous.access_token", "stale");
    listRuns.mockRejectedValue(new ApiError(401, "no"));
    render(<DashboardContent />);
    expect(await screen.findByText("Log in to see your experiments.")).toBeInTheDocument();
    expect(window.localStorage.getItem("nous.access_token")).toBeNull();
  });

  it("shows a retryable error when the backend is unreachable", async () => {
    window.localStorage.setItem("nous.access_token", "tok");
    listRuns.mockRejectedValueOnce(new ApiError(0, "offline"));
    listRuns.mockResolvedValueOnce([run()]);
    render(<DashboardContent />);
    expect(await screen.findByText("Can't reach the server.")).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Refund test")).toBeInTheDocument();
  });
});
