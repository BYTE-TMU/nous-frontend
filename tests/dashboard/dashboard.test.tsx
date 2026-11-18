import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardContent from "../../components/dashboard/DashboardContent";
import { toExperiment, toStatus } from "../../components/dashboard/toExperiment";
import { ExperimentStatusEnum } from "../../components/experiment/ExperimentStatus";
import { ApiError, type RunListItem } from "../../lib/api";

const replace = vi.fn();
const router = { push: vi.fn(), replace };
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const listRuns = vi.fn();
const getMe = vi.fn();
const getRunResults = vi.fn();
vi.mock("../../lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api")>()),
  listRuns: (...args: unknown[]) => listRuns(...args),
  getMe: (...args: unknown[]) => getMe(...args),
  getRunResults: (...args: unknown[]) => getRunResults(...args),
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

  it("shows BROKE whenever a judge scored a break, HELD when completed, INCONCLUSIVE only when failed", () => {
    for (const state of ["pending", "running", "pausing", "paused", "stopping"] as const) {
      expect(toStatus({ state, broke: false })).toBe(ExperimentStatusEnum.IN_PROGRESS);
    }
    expect(toStatus({ state: "completed", broke: false })).toBe(ExperimentStatusEnum.HELD);
    expect(toStatus({ state: "failed", broke: false })).toBe(ExperimentStatusEnum.INCONCLUSIVE);
    for (const state of ["running", "completed", "failed", "paused"] as const) {
      expect(toStatus({ state, broke: true })).toBe(ExperimentStatusEnum.BROKE);
    }
  });
});

describe("DashboardContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    getMe.mockResolvedValue({ id: "u1", email: "u@example.com", is_admin: false });
  });

  it("defaults admins to all users and applies Your runs in the dashboard and comparison", async () => {
    window.localStorage.setItem("nous.access_token", "tok");
    getMe.mockResolvedValue({ id: "u1", email: "a@example.com", is_admin: true });
    const mine = run({ name: "My run", state: "completed" });
    const other = run({ run_id: "r2", name: "Other run", state: "completed", owner_email: "other@example.com" });
    listRuns.mockImplementation((_token: string, options?: { all?: boolean }) =>
      Promise.resolve(options?.all ? [other, mine] : [mine]),
    );
    getRunResults.mockResolvedValue({
      outcome: "held", break_turn: null, turns_completed: 1, judge_verdict: null,
      per_turn: [{ turn: 1, classification: 0 }],
      cost: { total_usd: 0, total_tokens: 0, breakdown: [] },
    });
    render(<DashboardContent />);
    expect(await screen.findByText("by other@example.com")).toBeInTheDocument();
    expect(listRuns).toHaveBeenLastCalledWith("tok", { all: true });
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Run owner"), "own");
    expect(await screen.findByText("My run")).toBeInTheDocument();
    expect(screen.queryByText("Other run")).not.toBeInTheDocument();
    await user.click(screen.getByRole("tab", { name: "Compare" }));
    expect(await screen.findByRole("button", { name: /My run, turn 1: Held/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Other run, turn/ })).not.toBeInTheDocument();
    expect(listRuns).toHaveBeenLastCalledWith("tok");
    await user.selectOptions(screen.getByLabelText("Run owner"), "all");
    expect(await screen.findByRole("button", { name: /Other run, turn 1: Held/ })).toBeInTheDocument();
    expect(listRuns).toHaveBeenLastCalledWith("tok", { all: true });
    expect(screen.getByText("Showing runs from all users.")).toBeInTheDocument();
  });

  it("hides the All users toggle from non-admins", async () => {
    window.localStorage.setItem("nous.access_token", "tok");
    listRuns.mockResolvedValue([run()]);
    render(<DashboardContent />);
    expect(await screen.findByText("Refund test")).toBeInTheDocument();
    expect(screen.queryByLabelText("Run owner")).not.toBeInTheDocument();
  });

  it("sends the user to /login, without calling the backend, when there is no token", async () => {
    render(<DashboardContent />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(screen.queryByText(/Log in to see/)).not.toBeInTheDocument();
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

  it("opens a shared graph in Compare, with all runs or the latest ten", async () => {
    window.localStorage.setItem("nous.access_token", "tok");
    const runs = Array.from({ length: 11 }, (_, i) =>
      run({ run_id: `r${i + 1}`, name: `Run ${i + 1}`, state: "completed" }),
    );
    listRuns.mockResolvedValue(runs);
    getRunResults.mockResolvedValue({
      outcome: "held", break_turn: null, turns_completed: 1,
      judge_verdict: { cited_turn: 1, explanation: "Verdict text", excerpt: null },
      per_turn: [{ turn: 1, classification: 0 }],
      cost: { total_usd: 0, total_tokens: 0, breakdown: [] },
    });
    render(<DashboardContent />);
    await screen.findByText("Run 1");
    const user = userEvent.setup();
    await user.click(screen.getByRole("tab", { name: "Compare" }));
    expect(await screen.findByRole("button", { name: /Run 11, turn 1: Held/ })).toBeInTheDocument();
    expect(screen.queryByText("Verdict text")).not.toBeInTheDocument();
    expect(screen.queryByText("Judge verdict")).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Runs to display"), "recent");
    await screen.findByRole("button", { name: /Run 10, turn 1: Held/ });
    expect(screen.queryByRole("button", { name: /Run 11, turn 1: Held/ })).not.toBeInTheDocument();
    expect(listRuns).toHaveBeenLastCalledWith("tok");
  });

  it("uses each status colour for the card background while keeping a neutral border", async () => {
    window.localStorage.setItem("nous.access_token", "tok");
    listRuns.mockResolvedValue([
      run({ name: "Running" }),
      run({ run_id: "r2", name: "Held", state: "completed" }),
      run({ run_id: "r3", name: "Broke", state: "completed", broke: true }),
      run({ run_id: "r4", name: "Failed", state: "failed" }),
    ]);
    render(<DashboardContent />);
    const running = await screen.findByRole("link", { name: "Open Running" });
    expect(running).toHaveClass("from-status-in-progress/15", "border-border");
    expect(screen.getByRole("link", { name: "Open Held" })).toHaveClass("from-impact-green/15", "border-border");
    expect(screen.getByRole("link", { name: "Open Broke" })).toHaveClass("from-status-broke/15", "border-border");
    expect(screen.getByRole("link", { name: "Open Failed" })).toHaveClass("from-status-inconclusive/15", "border-border");
    expect(within(running).getByRole("progressbar", { name: "Completed turns" })).toHaveAttribute("aria-valuenow", "3");
  });

  it("shows a retryable error if account permissions cannot be determined", async () => {
    window.localStorage.setItem("nous.access_token", "tok");
    getMe.mockRejectedValueOnce(new ApiError(0, "offline"));
    listRuns.mockResolvedValue([run()]);
    render(<DashboardContent />);
    expect(await screen.findByText("Can't reach the server.")).toBeInTheDocument();
    expect(listRuns).not.toHaveBeenCalled();
    await userEvent.setup().click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Refund test")).toBeInTheDocument();
  });

  it("still offers Create new experiment when the user has no runs", async () => {
    window.localStorage.setItem("nous.access_token", "tok");
    listRuns.mockResolvedValue([]);
    render(<DashboardContent />);
    expect(await screen.findByText("Create new experiment")).toBeInTheDocument();
  });

  it("clears an expired token and sends the user to /login on a 401", async () => {
    window.localStorage.setItem("nous.access_token", "stale");
    listRuns.mockRejectedValue(new ApiError(401, "no"));
    render(<DashboardContent />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
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
