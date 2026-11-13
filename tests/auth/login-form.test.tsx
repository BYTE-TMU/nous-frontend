import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "../../components/auth/LoginForm";
import { ApiError } from "../../lib/api";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const login = vi.fn();
vi.mock("../../lib/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../lib/auth")>()),
  login: (...args: unknown[]) => login(...args),
}));

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  if (email) await user.type(screen.getByLabelText("Email"), email);
  if (password) await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Log in" }));
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the welcome state with every control from the design", () => {
    render(<LoginForm />);
    expect(screen.getByRole("heading", { name: "Welcome back." })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Forgot your password?" })).toHaveAttribute(
      "href",
      "/reset-password",
    );
  });

it("offers Google sign-in", () => {
  render(<LoginForm />);
  expect(
    screen.getByRole("button", { name: "Continue with Google" }),
  ).toBeInTheDocument();
});

  it("logs in with the trimmed email and goes to the dashboard", async () => {
    login.mockResolvedValue(undefined);
    render(<LoginForm />);
    await fillAndSubmit("  me@nous.dev ", "hunter2hunter2");
    expect(login).toHaveBeenCalledWith("me@nous.dev", "hunter2hunter2");
    expect(push).toHaveBeenCalledWith("/");
  });

  it("rejects bad input with field errors and does not call the backend", async () => {
    render(<LoginForm />);
    await fillAndSubmit("not-an-email", "");
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Enter your password.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
    expect(login).not.toHaveBeenCalled();
  });

  it("switches to the incorrect-login state when credentials are rejected", async () => {
    login.mockRejectedValue(new ApiError(401, "nope"));
    render(<LoginForm />);
    await fillAndSubmit("me@nous.dev", "wrong-password");
    expect(await screen.findByRole("heading", { name: "Incorrect login." })).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    // Recoverable: the form is usable again and a retry can succeed.
    login.mockResolvedValue(undefined);
    await userEvent.setup().click(screen.getByRole("button", { name: "Log in" }));
    expect(push).toHaveBeenCalledWith("/");
  });

  it("points at the email field when the backend rejects the address format", async () => {
    login.mockRejectedValue(new ApiError(422, "validation"));
    render(<LoginForm />);
    await fillAndSubmit("me@nous.local", "hunter2hunter2");
    expect(await screen.findByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Welcome back." })).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("reports an unreachable server without claiming the login was wrong", async () => {
    login.mockRejectedValue(new ApiError(0, "offline"));
    render(<LoginForm />);
    await fillAndSubmit("me@nous.dev", "hunter2hunter2");
    expect(await screen.findByRole("alert")).toHaveTextContent("Can't reach the server");
    expect(screen.getByRole("heading", { name: "Welcome back." })).toBeInTheDocument();
  });

  it("reports an unexpected server error generically", async () => {
    login.mockRejectedValue(new ApiError(500, "boom"));
    render(<LoginForm />);
    await fillAndSubmit("me@nous.dev", "hunter2hunter2");
    expect(await screen.findByRole("alert")).toHaveTextContent("Something went wrong");
    expect(screen.getByRole("heading", { name: "Welcome back." })).toBeInTheDocument();
  });

  it("disables the form while the request is in flight", async () => {
    login.mockReturnValue(new Promise(() => undefined));
    render(<LoginForm />);
    await fillAndSubmit("me@nous.dev", "hunter2hunter2");
    expect(screen.getByRole("button", { name: "Logging in..." })).toBeDisabled();
    expect(screen.getByLabelText("Email")).toBeDisabled();
  });
});
