import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HowItWorks from "../../components/landing/HowItWorks";

describe("workflow diagram", () => {
  it("presents the steps in order with connecting arrows", () => {
    render(<HowItWorks />);
    const workflow = screen.getByRole("list", { name: "Experiment workflow" });
    const steps = within(workflow).getAllByRole("listitem");
    expect(steps.map((step) => within(step).getByRole("heading").textContent)).toEqual([
      "Set a boundary",
      "Run the exchange",
      "Examine the result",
    ]);
    expect(workflow.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2);
  });
});
