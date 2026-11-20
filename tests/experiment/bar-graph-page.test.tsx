import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BarGraphPage from "../../components/graph/BarGraphPage";
import { ApiError, type RunJudgements, type RunMessage, type RunSummary } from "../../lib/api";

const replace = vi.fn();
const router = { replace };
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const getRun = vi.fn();
const listRuns = vi.fn();
const getRunTurns = vi.fn();
const getRunJudgements = vi.fn();
const getRunResults = vi.fn();
vi.mock("../../lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api")>()),
  getRun: (...args: unknown[]) => getRun(...args),
  listRuns: (...args: unknown[]) => listRuns(...args),
  getRunTurns: (...args: unknown[]) => getRunTurns(...args),
  getRunJudgements: (...args: unknown[]) => getRunJudgements(...args),
  getRunResults: (...args: unknown[]) => getRunResults(...args),
}));

function run(id: string, overrides: Partial<RunSummary> = {}): RunSummary {
  return {
    run_id: id, name: `Run ${id}`, description: null, state: "completed",
    attacker_model: "attacker-a", defender_model: "defender-a", turns_completed: 3,
    max_turns: 10, cost: { total_usd: 0.125, total_tokens: 123, breakdown: [] },
    created_at: "2026-01-01T00:00:00Z", defender_persona: null,
    defender_prompt: null, attacker_prompt: null, ...overrides,
  };
}

const results = {
  outcome: "broke", break_turn: 3, turns_completed: 3, judge_verdict: null,
  per_turn: [{ turn: 1, classification: 0 }, { turn: 2, classification: 1 }, { turn: 3, classification: 2 }],
  cost: { total_usd: 0, total_tokens: 0, breakdown: [] },
};

function message(turn_number: number, speaker: "attacker" | "defender"): RunMessage {
  return { turn_number, speaker, text: "text", input_tokens: null, output_tokens: null };
}

describe("BarGraphPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem("nous.access_token", "tok");
    getRun.mockResolvedValue(run("old"));
    getRunResults.mockResolvedValue(results);
  });

  it("shows real 0–2 scores and the recorded run cost", async () => {
    render(<BarGraphPage runId="old" />);
    const bar = await screen.findByRole("button", { name: /Run old, turn 1: Held, turn 2: Softened, turn 3: Broke/ });
    expect(within(bar).getByTitle("Turn 1: Held")).toHaveStyle("background: linear-gradient(to top, var(--color-impact-green), var(--color-index-3))");
    expect(within(bar).getByTitle("Turn 2: Softened")).toHaveStyle("background: linear-gradient(to top, var(--color-index-3), var(--color-index-6))");
    expect(within(bar).getByTitle("Turn 3: Broke")).toHaveStyle("background: linear-gradient(to top, var(--color-index-6), var(--color-index-6))");
    expect(bar).toHaveStyle("height: 15%");
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("$0.125 · 123 tokens")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Show colour index" }));
    expect(screen.getByRole("dialog", { name: "Colour Index" })).toHaveTextContent("Grey indicates turns without a completed judgement");
  });

  it("keeps live unjudged turns grey and does not invent an outcome", async () => {
    getRun.mockResolvedValue(run("old", { state: "running", turns_completed: 3 }));
    getRunTurns.mockResolvedValue([
      message(1, "attacker"), message(2, "defender"),
      message(3, "attacker"), message(4, "defender"),
      message(5, "attacker"), message(6, "defender"), message(7, "attacker"),
    ]);
    const judgements: RunJudgements = {
      run_id: "old", broke: false, break_turn_number: null,
      judgements: [{
        turn_id: "a", turn_number: 2, status: "completed", score: 0, explanation: null,
        evidence: null, judge_model: "judge", input_tokens: null, output_tokens: null,
        cost: null, judged_at: null,
      }, {
        turn_id: "b", turn_number: 4, status: "failed", score: null, explanation: null,
        evidence: null, judge_model: "judge", input_tokens: null, output_tokens: null,
        cost: null, judged_at: null,
      }],
    };
    getRunJudgements.mockResolvedValue(judgements);
    render(<BarGraphPage runId="old" />);
    const bar = await screen.findByRole("button", { name: /turn 1: Held, turn 2: unjudged/ });
    expect(within(bar).getByTitle("Turn 2: Unjudged")).toHaveStyle("background: linear-gradient(to top, var(--color-smoke), var(--color-smoke))");
    expect(within(bar).getByTitle("Turn 3: Unjudged")).toHaveStyle("background: linear-gradient(to top, var(--color-smoke), var(--color-smoke))");
    expect(within(bar).queryByTitle(/Turn 4/)).not.toBeInTheDocument();
    expect(screen.getByText("in progress")).toBeInTheDocument();
    expect(getRunResults).not.toHaveBeenCalled();
  });

  it("caps the chart at 20 turns and identifies older runs with more turns", async () => {
    getRun.mockResolvedValue(run("old", { max_turns: 30, turns_completed: 25 }));
    getRunResults.mockResolvedValue({
      ...results,
      per_turn: Array.from({ length: 25 }, (_, index) => ({ turn: index + 1, classification: 0 })),
    });
    render(<BarGraphPage runId="old" />);
    const bar = await screen.findByRole("button", { name: /Run old, turn 1: Held/ });
    expect(bar).toHaveStyle("height: 100%");
    expect(within(bar).getByTitle("Turn 20: Held")).toBeInTheDocument();
    expect(within(bar).queryByTitle("Turn 21: Held")).not.toBeInTheDocument();
    expect(screen.getByText("Only the first 20 turns are shown.")).toBeInTheDocument();
  });

  it("filters by multiple users before applying the last-ten limit", async () => {
    const runs = Array.from({ length: 22 }, (_, index) => ({
      ...run(`id-${index + 1}`),
      owner_email: index % 2 === 0 ? "alice@example.com" : "bob@example.com",
    }));
    listRuns.mockResolvedValue(runs);
    render(<BarGraphPage allUsers />);
    await screen.findByRole("button", { name: /Run id-22, turn 1/ });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Runs to display" }));
    expect(screen.getByRole("menuitemcheckbox", { name: "All runs" })).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Last 10 runs" }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: "alice@example.com" }));
    await user.keyboard("{Escape}");
    expect(await screen.findByRole("button", { name: /Run id-19, turn 1/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Run id-21, turn 1/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Run id-2, turn 1/ })).not.toBeInTheDocument();
    expect(screen.getByText("Showing the 10 most recent runs from selected users.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Runs to display" }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: "bob@example.com" }));
    await user.keyboard("{Escape}");
    expect(await screen.findByRole("button", { name: /Run id-10, turn 1/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Run id-11, turn 1/ })).not.toBeInTheDocument();
  });

  it("shows the ten latest runs, filters them, and selects a different overview", async () => {
    const runs = Array.from({ length: 11 }, (_, i) =>
      run(`id-${i + 1}`, { attacker_model: i === 1 ? "attacker-b" : "attacker-a", defender_model: i === 1 ? "defender-b" : "defender-a" }),
    );
    listRuns.mockResolvedValue(runs);
    getRunResults.mockImplementation((id: string) => Promise.resolve({
      ...results, outcome: id === "id-2" ? "held" : "broke",
    }));
    render(<BarGraphPage runId="old" />);
    await screen.findByRole("button", { name: /Run old, turn 1/ });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Runs to display" }));
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Last 10 runs" }));
    await user.keyboard("{Escape}");
    await screen.findByRole("button", { name: /Run id-10, turn 1/ });
    expect(screen.queryByRole("button", { name: /Run id-11, turn 1/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Run old, turn 1/ })).not.toBeInTheDocument();
    await user.click(screen.getByText("Filter ▾"));
    await user.selectOptions(screen.getByLabelText("Outcome"), "held");
    await user.selectOptions(screen.getByLabelText("Attacker model"), "attacker-b");
    await user.selectOptions(screen.getByLabelText("Defender model"), "defender-b");
    expect(screen.getAllByRole("button", { name: /Run id-.*turn 1/ })).toHaveLength(1);
    expect(screen.getByRole("button", { name: /Run id-2, turn 1/ })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await user.click(screen.getByRole("button", { name: /Run id-3, turn 1/ }));
    expect(screen.getByRole("button", { name: /Run id-3, turn 1/ })).toHaveAttribute("aria-pressed", "true");
    expect(within(screen.getByLabelText("Experiment overview")).getByRole("link", { name: "View transcript" })).toHaveAttribute("href", "/experiment/id-3");
  });

  it("shows a retryable error instead of a fabricated graph", async () => {
    getRunResults.mockRejectedValueOnce(new ApiError(500, "server error"));
    render(<BarGraphPage runId="old" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't load graph data");
    expect(screen.queryByRole("button", { name: /Run old, turn/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("button", { name: /Run old, turn 1/ })).toBeInTheDocument();
  });

  it("reports unsupported judge scores instead of assigning them a colour", async () => {
    getRunResults.mockResolvedValue({ ...results, per_turn: [{ turn: 1, classification: 5 }] });
    render(<BarGraphPage runId="old" />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Unsupported judge score: 5");
    expect(screen.queryByRole("button", { name: /Run old, turn/ })).not.toBeInTheDocument();
  });
});
