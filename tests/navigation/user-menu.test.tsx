import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserMenu } from "../../components/navigation/UserMenu";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const clearToken = vi.fn();
vi.mock("../../lib/auth", () => ({ clearToken: () => clearToken() }));

describe("UserMenu", () => {
  beforeEach(() => vi.clearAllMocks());

  it("opens from the avatar and shows Log out", async () => {
    render(<UserMenu />);
    expect(screen.queryByRole("menuitem", { name: "Log out" })).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Account menu" }));
    expect(await screen.findByRole("menuitem", { name: "Log out" })).toBeInTheDocument();
  });

  it("clears the token and goes to the login screen", async () => {
    render(<UserMenu />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Account menu" }));
    await user.click(await screen.findByRole("menuitem", { name: "Log out" }));
    expect(clearToken).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/login");
  });
});
