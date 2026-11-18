import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LandingNav from "../../components/landing/LandingNav";

describe("landing navigation", () => {
  it("directs visitors requesting access to sign in", () => {
    render(<LandingNav />);

    expect(screen.getByRole("link", { name: "Request access" })).toHaveAttribute("href", "/login");
  });
});
