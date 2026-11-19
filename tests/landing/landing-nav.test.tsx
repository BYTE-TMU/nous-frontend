import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LandingNav from "../../components/landing/LandingNav";

describe("landing navigation", () => {
  it("directs visitors requesting access to sign in", () => {
    render(<LandingNav />);

    expect(screen.getByRole("link", { name: "Request access" })).toHaveAttribute("href", "/login");
    expect(screen.queryByRole("link", { name: "Personas" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sample" })).toHaveAttribute("href", "#run");
    expect(screen.getByRole("link", { name: "Judgement" })).toHaveAttribute("href", "#judge");
    expect(screen.getByRole("link", { name: "Workflow" })).toHaveAttribute("href", "#how");
    expect(screen.getByRole("link", { name: "Records" })).toHaveAttribute("href", "#principles");
  });

  it("offers signed-in visitors a dashboard link on mobile too", () => {
    window.localStorage.setItem("nous.access_token", "token");
    render(<LandingNav />);

    expect(screen.getByRole("link", { name: "Open dashboard" })).toHaveAttribute("href", "/dashboard");
  });
});
