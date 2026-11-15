"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError } from "../../lib/api";
import {
  NotAvailableError,
  requestPasswordReset,
  resetPassword,
  verifyResetCode,
} from "../../lib/auth";
import { AuthBanner } from "./AuthBanner";
import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthField } from "./AuthField";
import { AuthStepMarker } from "./AuthStepMarker";
import { CodeInput } from "./CodeInput";
import { PasswordStrength } from "./PasswordStrength";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const CODE_PATTERN = /^\d{6}$/;
// Client-side floor only; the backend has not published its password rules yet.
const MIN_PASSWORD_LENGTH = 8;

type Step = "email" | "code" | "password";
type FieldErrors = Partial<Record<"email" | "code" | "password" | "confirmation", string>>;

function describeFailure(error: unknown): string {
  if (error instanceof NotAvailableError) return `${error.feature} isn't available yet.`;
  if (error instanceof ApiError && error.status === 0) {
    return "Can't reach the server. Check your connection and try again.";
  }
  return "Something went wrong. Please try again.";
}

// Three screens on one route. The email and code live in component state only —
// never in the URL or in storage.
export function PasswordResetFlow() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [fieldError, setFieldError] = useState<FieldErrors>({});
  const [notice, setNotice] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function run(action: () => Promise<void>, onSuccess: () => void) {
    setSubmitting(true);
    setNotice("");
    setStatus("");
    try {
      await action();
      onSuccess();
    } catch (error) {
      setNotice(describeFailure(error));
    } finally {
      setSubmitting(false);
    }
  }

  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setFieldError({ email: "Enter a valid email address." });
      return;
    }
    setFieldError({});
    void run(
      () => requestPasswordReset(email.trim()),
      () => setStep("code"),
    );
  }

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!CODE_PATTERN.test(code)) {
      setFieldError({ code: "Enter the 6 digit code." });
      return;
    }
    setFieldError({});
    void run(
      () => verifyResetCode(email.trim(), code),
      () => setStep("password"),
    );
  }

  function requestNewCode() {
    void run(
      () => requestPasswordReset(email.trim()),
      () => setStatus("A new code is on its way."),
    );
  }

  function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const errors: FieldErrors = {};
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (confirmation !== newPassword) errors.confirmation = "Passwords don't match.";
    setFieldError(errors);
    if (Object.keys(errors).length > 0) return;
    void run(
      () => resetPassword(email.trim(), code, newPassword),
      () => router.push("/login"),
    );
  }

  const stepNumber = step === "email" ? 1 : step === "code" ? 2 : 3;
  const subtitle =
    step === "email"
      ? "Enter the email associated with your account and we’ll send you a code."
      : step === "code"
        ? `We sent a 6-digit code to ${email.trim()}.`
        : "All set! Choose a new password and you’re back up and running.";

  return (
    <AuthCard
      heading="Let’s get your password reset."
      subtitle={subtitle}
      eyebrow={<AuthStepMarker step={stepNumber} />}
    >
      {step === "email" ? (
        <form noValidate onSubmit={submitEmail} className="flex flex-col gap-7">
          <AuthField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldError.email}
            disabled={submitting}
          />
          <Feedback notice={notice} status={status} />
          <AuthButton type="submit" disabled={submitting} aria-busy={submitting}>
            Send code
          </AuthButton>
          <BackToLogin />
        </form>
      ) : null}

      {step === "code" ? (
        <form noValidate onSubmit={submitCode} className="flex flex-col gap-7">
          <CodeInput
            label="Verification code"
            value={code}
            onChange={(value) => setCode(value.replace(/\D/g, ""))}
            error={fieldError.code}
            disabled={submitting}
          />
          <p className="text-base text-smoke">
            Haven’t received it? Check your spam folder or{" "}
            <button
              type="button"
              onClick={requestNewCode}
              disabled={submitting}
              className="cursor-pointer font-medium text-signal-lime underline underline-offset-2 hover:text-impact-green disabled:opacity-50"
            >
              request a new one
            </button>
          </p>
          <Feedback notice={notice} status={status} />
          <AuthButton type="submit" disabled={submitting} aria-busy={submitting}>
            Next
          </AuthButton>
          <BackToLogin />
        </form>
      ) : null}

      {step === "password" ? (
        <form noValidate onSubmit={submitPassword} className="flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <AuthField
              label="New password"
              type="password"
              name="new-password"
              autoComplete="new-password"
              autoFocus
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              error={fieldError.password}
              disabled={submitting}
            />
            <PasswordStrength password={newPassword} />
          </div>
          <AuthField
            label="Confirm new password"
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            error={fieldError.confirmation}
            disabled={submitting}
          />
          <Feedback notice={notice} status={status} />
          <AuthButton type="submit" disabled={submitting} aria-busy={submitting}>
            Reset password
          </AuthButton>
          <BackToLogin />
        </form>
      ) : null}
    </AuthCard>
  );
}

function BackToLogin() {
  return (
    <Link
      href="/login"
      className="self-center text-[17px] font-medium text-ash underline underline-offset-2 hover:text-white"
    >
      Back to log in
    </Link>
  );
}

function Feedback({ notice, status }: { notice: string; status: string }) {
  if (notice) return <AuthBanner>{notice}</AuthBanner>;
  if (status) {
    return (
      <p role="status" className="text-center text-sm text-smoke">
        {status}
      </p>
    );
  }
  return null;
}
