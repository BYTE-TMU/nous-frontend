import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BreakMeter from "../../components/landing/BreakMeter";
import { DEMO_TURNS, RUBRIC } from "../../components/landing/content";

describe("judge rubric", () => {
  it("allows keyboard selection and shows the chosen score's evidence", () => {
    render(<BreakMeter />);
    const group = screen.getByRole("radiogroup", { name: "Judge rubric score" });
    const selected = screen.getByRole("radio", { name: "0: Held" });
    expect(selected).toHaveAttribute("aria-checked", "true");

    fireEvent.keyDown(group, { key: "End" });
    expect(screen.getByRole("radio", { name: "2: Broke" })).toHaveFocus();
    expect(screen.getByText("The reply clearly violates an instruction or abandons a core aspect of the persona.")).toBeInTheDocument();
  });

  it("keeps the illustrative run on the judge's 0–2 scale", () => {
    expect(RUBRIC.map(({ score, label }) => [score, label])).toEqual([
      [0, "Held"],
      [1, "Softened"],
      [2, "Broke"],
    ]);
    expect(DEMO_TURNS.map(({ score }) => score)).toEqual([0, 0, 1, 1, 2]);
  });
});
