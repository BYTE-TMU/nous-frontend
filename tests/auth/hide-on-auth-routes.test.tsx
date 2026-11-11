import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HideOnAuthRoutes } from "../../components/auth/HideOnAuthRoutes";

const usePathname = vi.fn();
vi.mock("next/navigation", () => ({ usePathname: () => usePathname() }));

describe("HideOnAuthRoutes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["/login", "/reset-password"])("hides the header on %s", (path) => {
    usePathname.mockReturnValue(path);
    render(<HideOnAuthRoutes>header</HideOnAuthRoutes>);
    expect(screen.queryByText("header")).not.toBeInTheDocument();
  });

  it("shows the header everywhere else", () => {
    usePathname.mockReturnValue("/");
    render(<HideOnAuthRoutes>header</HideOnAuthRoutes>);
    expect(screen.getByText("header")).toBeInTheDocument();
  });
});
