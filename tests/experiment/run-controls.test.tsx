import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RunControls, { availableActions } from "../../components/experiment/RunControls";
import ExperimentResults from "../../components/experiment/ExperimentResults";
import { ExperimentStatusEnum } from "../../components/experiment/ExperimentStatus";
import { ApiError } from "../../lib/api";

const pauseRun = vi.fn();
const resumeRun = vi.fn();
const stopRun = vi.fn();
vi.mock("../../lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/api")>()),
  pauseRun: (...args: unknown[]) => pauseRun(...args),
  resumeRun: (...args: unknown[]) => resumeRun(...args),
  stopRun: (...args: unknown[]) => stopRun(...args),
}));

describe("availableActions", () => {
  it("only offers what the backend accepts in each state", () => {
    expect(availableActions("running")).toEqual({ pause: true, resume: false, stop: true });
    expect(availableActions("judging")).toEqual({ pause: true, resume: false, stop: true });
    expect(availableActions("paused")).toEqual({ pause: false, resume: true, stop: true });
    expect(availableActions("pending")).toEqual({ pause: false, resume: false, stop: true });
    expect(availableActions("awaiting_judgement")).toEqual({ pause: false, resume: false, stop: true });
    expect(availableActions("pausing")).toEqual({ pause: false, resume: false, stop: true });
    expect(availableActions("stopping")).toEqual({ pause: false, resume: false, stop: false });
    expect(availableActions("completed")).toEqual({ pause: false, resume: false, stop: false });
  });
});

describe("RunControls", () => {
  const onChanged = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem("nous.access_token", "tok");
    pauseRun.mockResolvedValue({});
    resumeRun.mockResolvedValue({});
    stopRun.mockResolvedValue({});
  });

  it("pauses a running run and refreshes", async () => {
    const user = userEvent.setup();
    render(<RunControls runId="r1" state="running" onChanged={onChanged} />);
    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(pauseRun).toHaveBeenCalledWith("r1", "tok");
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("offers Resume, not Pause, for a paused run", async () => {
    const user = userEvent.setup();
    render(<RunControls runId="r1" state="paused" onChanged={onChanged} />);
    expect(screen.queryByRole("button", { name: "Pause" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Resume" }));
    expect(resumeRun).toHaveBeenCalledWith("r1", "tok");
  });

  it("makes Stop a two-step action so it can't be hit by accident", async () => {
    const user = userEvent.setup();
    render(<RunControls runId="r1" state="running" onChanged={onChanged} />);
    await user.click(screen.getByRole("button", { name: "Stop" }));
    expect(stopRun).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("button", { name: "Stop" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Stop" }));
    await user.click(screen.getByRole("button", { name: "Confirm stop" }));
    expect(stopRun).toHaveBeenCalledWith("r1", "tok");
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it("disables Pause while pausing, and everything once stopping", () => {
    const { rerender } = render(<RunControls runId="r1" state="pausing" onChanged={onChanged} />);
    expect(screen.getByRole("button", { name: "Pausing…" })).toBeDisabled();
    rerender(<RunControls runId="r1" state="stopping" onChanged={onChanged} />);
    expect(screen.getByRole("button", { name: "Stopping…" })).toBeDisabled();
  });

  it("renders nothing once the run has ended", () => {
    const { container } = render(<RunControls runId="r1" state="completed" onChanged={onChanged} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("explains a 409 and still refreshes to the real state", async () => {
    pauseRun.mockRejectedValue(new ApiError(409, "conflict"));
    const user = userEvent.setup();
    render(<RunControls runId="r1" state="running" onChanged={onChanged} />);
    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/isn't possible/);
    expect(onChanged).toHaveBeenCalledTimes(1);
  });
});

describe("ExperimentResults", () => {
  it("shows the judge's verdict, evidence and total cost", () => {
    render(
      <ExperimentResults
        status={ExperimentStatusEnum.BROKE}
        state="completed"
        verdict={{ turn: 3, explanation: "It revealed the code.", excerpt: "the code is 1234" }}
        costUsd={0.234}
      />,
    );
    expect(screen.getByText(/Judge, turn 3:/)).toBeInTheDocument();
    expect(screen.getByText("the code is 1234")).toBeInTheDocument();
    expect(screen.getByText("Total cost: $0.23")).toBeInTheDocument();
  });

  it("says a failed run has no result, and labels cost so far while running", () => {
    const { rerender } = render(
      <ExperimentResults status={ExperimentStatusEnum.INCONCLUSIVE} state="failed" costUsd={0} />,
    );
    expect(screen.getByText("This run failed before it finished.")).toBeInTheDocument();
    rerender(<ExperimentResults status={ExperimentStatusEnum.IN_PROGRESS} state="running" costUsd={0.5} />);
    expect(screen.getByText("Cost so far: $0.50")).toBeInTheDocument();
  });
});
