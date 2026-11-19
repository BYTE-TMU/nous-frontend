import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NeuralOpening from "../../components/landing/NeuralOpening";

describe("neural opening", () => {
  it("reveals the branded wordmark while hovered and returns to Greek", () => {
    render(<NeuralOpening />);
    const opening = screen.getByRole("region", { name: "Nous" });
    const reveal = within(opening).getByRole("button", { name: /reveal the nous wordmark/i });

    expect(within(opening).getByText("νοῦς")).toBeInTheDocument();
    expect(reveal.querySelector("img")).toHaveAttribute("src", "/brand/nous-wordmark.svg");
    expect(within(opening).queryByText(/mind/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(reveal).toHaveAttribute("data-active", "false");

    fireEvent.mouseEnter(reveal);
    expect(reveal).toHaveAttribute("data-active", "true");
    fireEvent.mouseLeave(reveal);
    expect(reveal).toHaveAttribute("data-active", "false");
  });

  it("can toggle the reveal without hover", () => {
    render(<NeuralOpening />);
    const reveal = screen.getByRole("button", { name: /reveal the nous wordmark/i });
    fireEvent.click(reveal);
    expect(reveal).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(reveal);
    expect(reveal).toHaveAttribute("aria-pressed", "false");
  });
});
