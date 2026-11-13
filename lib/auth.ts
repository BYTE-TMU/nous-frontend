// Token storage and attachment.
//
// Screens call this module and never touch the token or the backend directly.
// Email + password login is real (lib/api.ts). The backend has no password-reset
// endpoints yet, so those steps throw NotAvailableError (blocked-backend) unless
// NEXT_PUBLIC_MOCK_PASSWORD_RESET=true swaps in lib/mock-auth.ts.
import * as api from "./api";
import * as mock from "./mock-auth";

const TOKEN_KEY = "nous.access_token";

const isResetMocked = () => process.env.NEXT_PUBLIC_MOCK_PASSWORD_RESET === "true";

export class NotAvailableError extends Error {
  constructor(readonly feature: string) {
    super(`${feature} is not available yet`);
    this.name = "NotAvailableError";
  }
}

// Storage can be missing or throw (private windows, blocked site data).
export function getToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // The session only lasts until the page closes.
  }
}

export function clearToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to clear.
  }
}

export async function login(email: string, password: string): Promise<void> {
  const { access_token } = await api.login({ email, password });
  setToken(access_token);
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (!isResetMocked()) throw new NotAvailableError("Password reset");
  await mock.requestPasswordReset(email);
}

export async function verifyResetCode(email: string, code: string): Promise<void> {
  if (!isResetMocked()) throw new NotAvailableError("Password reset");
  await mock.verifyResetCode(email, code);
}

export async function resetPassword(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  if (!isResetMocked()) throw new NotAvailableError("Password reset");
  await mock.resetPassword(email, code, newPassword);
}

export async function completeGoogleLogin(code: string): Promise<void> {
  const { access_token } = await api.exchangeGoogleCode(code);
  setToken(access_token);
}