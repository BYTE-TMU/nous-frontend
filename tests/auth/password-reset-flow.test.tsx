import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PasswordResetFlow } from "../../components/auth/PasswordResetFlow";
import { ApiError } from "../../lib/api";
import { NotAvailableError } from "../../lib/auth";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const requestPasswordReset = vi.fn();
const verifyResetCode = vi.fn();
const resetPassword = vi.fn();
vi.mock("../../lib/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/auth")>()),
  requestPasswordReset: (...args: unknown[]) => requestPasswordReset(...args),
  verifyResetCode: (...args: unknown[]) => verifyResetCode(...args),
  resetPassword: (...args: unknown[]) => resetPassword(...args),
}));

const heading = () => screen.getByRole("heading", { name: "Let’s get your password reset." });

async function advanceToCodeStep() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), "me@nous.dev");
  await user.click(screen.getByRole("button", { name: "Next" }));
  await screen.findByText("You have been sent a 6 digit verification code.");
  return user;
}

async function advanceToPasswordStep() {
  const user = await advanceToCodeStep();
  await user.type(screen.getByLabelText("Verification code"), "123456");
  await user.click(screen.getByRole("button", { name: "Next" }));
  await screen.findByText("All set! Let’s get you back up and running.");
  return user;
}

describe("PasswordResetFlow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestPasswordReset.mockResolvedValue(undefined);
    verifyResetCode.mockResolvedValue(undefined);
    resetPassword.mockResolvedValue(undefined);
  });

  it("starts by asking for the account email", () => {
    render(<PasswordResetFlow />);
    expect(heading()).toBeInTheDocument();
    expect(screen.getByText("Please enter the email associated with your account.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
  });

  it("rejects an invalid email before calling the backend", async () => {
    render(<PasswordResetFlow />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "nope");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });

  it("sends the code, then verifies it", async () => {
    render(<PasswordResetFlow />);
    await advanceToPasswordStep();
    expect(requestPasswordReset).toHaveBeenCalledWith("me@nous.dev");
    expect(verifyResetCode).toHaveBeenCalledWith("me@nous.dev", "123456");
  });

  it("keeps digits only and requires all six", async () => {
    render(<PasswordResetFlow />);
    const user = await advanceToCodeStep();
    await user.type(screen.getByLabelText("Verification code"), "12ab3");
    expect(screen.getByLabelText("Verification code")).toHaveValue("123");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Enter the 6 digit code.")).toBeInTheDocument();
    expect(verifyResetCode).not.toHaveBeenCalled();
  });

  it("stays on the code step when the code is wrong", async () => {
    verifyResetCode.mockRejectedValue(new ApiError(400, "bad code"));
    render(<PasswordResetFlow />);
    const user = await advanceToCodeStep();
    await user.type(screen.getByLabelText("Verification code"), "000000");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByLabelText("Verification code")).toBeInTheDocument();
  });

  it("requests a new code on demand", async () => {
    render(<PasswordResetFlow />);
    const user = await advanceToCodeStep();
    await user.click(screen.getByRole("button", { name: "request a new one" }));
    expect(requestPasswordReset).toHaveBeenCalledTimes(2);
    expect(await screen.findByRole("status")).toHaveTextContent("A new code is on its way.");
  });

  it("validates the new password before submitting", async () => {
    render(<PasswordResetFlow />);
    const user = await advanceToPasswordStep();
    await user.type(screen.getByLabelText("New password"), "short");
    await user.type(screen.getByLabelText("Confirm new password"), "different");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText("Use at least 8 characters.")).toBeInTheDocument();
    expect(screen.getByText("Passwords don't match.")).toBeInTheDocument();
    expect(resetPassword).not.toHaveBeenCalled();
  });

  it("resets the password and returns to login", async () => {
    render(<PasswordResetFlow />);
    const user = await advanceToPasswordStep();
    await user.type(screen.getByLabelText("New password"), "a-new-password");
    await user.type(screen.getByLabelText("Confirm new password"), "a-new-password");
    await user.click(screen.getByRole("button", { name: "Reset" }));
    expect(resetPassword).toHaveBeenCalledWith("me@nous.dev", "123456", "a-new-password");
    expect(push).toHaveBeenCalledWith("/login");
  });

  it("says so when password reset is not available yet", async () => {
    requestPasswordReset.mockRejectedValue(new NotAvailableError("Password reset"));
    render(<PasswordResetFlow />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Email"), "me@nous.dev");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Password reset isn't available yet.");
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
