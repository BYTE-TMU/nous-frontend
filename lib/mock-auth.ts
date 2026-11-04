// Stand-in for the password-reset endpoints the backend does not have yet, so the
// three reset screens can be reviewed end to end. Enabled only by
// NEXT_PUBLIC_MOCK_PASSWORD_RESET=true — see .env.example. Login is NOT mocked.
// Delete this file once the backend ships password reset.
import { ApiError } from "./api";

const MOCK_RESET_CODE = "123456";

const delay = (ms = 400) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function requestPasswordReset(_email: string): Promise<void> {
  await delay();
}

export async function verifyResetCode(_email: string, code: string): Promise<void> {
  await delay();
  if (code !== MOCK_RESET_CODE) throw new ApiError(400, "Invalid code");
}

export async function resetPassword(
  _email: string,
  _code: string,
  _newPassword: string,
): Promise<void> {
  await delay();
}
