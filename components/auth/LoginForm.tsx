"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, startGoogleLogin } from "../../lib/api";
import { login } from "../../lib/auth";
import { AuthBanner } from "./AuthBanner";
import { AuthButton } from "./AuthButton";
import { AuthCard } from "./AuthCard";
import { AuthField } from "./AuthField";

const AFTER_LOGIN_PATH = "/";
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
const REJECTED_STATUSES = new Set([400, 401, 403]);
const INVALID_EMAIL = "Enter a valid email address.";

type FieldErrors = { email?: string; password?: string };

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [rejected, setRejected] = useState(false);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: FieldErrors = {};
    if (!EMAIL_PATTERN.test(email.trim())) errors.email = INVALID_EMAIL;
    if (!password) errors.password = "Enter your password.";

    setFieldErrors(errors);
    setRejected(false);
    setNotice("");

    if (errors.email || errors.password) return;

    setSubmitting(true);

    try {
      await login(email.trim(), password);
      router.push(AFTER_LOGIN_PATH);
    } catch (error) {
      if (error instanceof ApiError && REJECTED_STATUSES.has(error.status)) {
        setRejected(true);
      } else if (error instanceof ApiError && error.status === 422) {
        setFieldErrors({ email: INVALID_EMAIL });
      } else if (error instanceof ApiError && error.status === 0) {
        setNotice("Can't reach the server. Check your connection and try again.");
      } else {
        setNotice("Something went wrong. Please try again.");
      }

      setSubmitting(false);
    }
  }

  return (
    <AuthCard heading="Welcome back." subtitle="Sign in to run and review experiments.">
      <AuthButton variant="secondary" onClick={startGoogleLogin}>
        Sign in with Google
      </AuthButton>

      <div className="flex items-center gap-4" role="separator">
        <div className="h-px flex-1 bg-graphite" />
        <span className="text-base text-smoke">or</span>
        <div className="h-px flex-1 bg-graphite" />
      </div>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-7">
        {rejected ? (
          <AuthBanner>
            That email and password don’t match. Try again or reset your password.
          </AuthBanner>
        ) : null}
        {notice ? <AuthBanner>{notice}</AuthBanner> : null}

        <AuthField
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          invalid={rejected}
          disabled={submitting}
        />

        <AuthField
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          invalid={rejected}
          disabled={submitting}
          labelAction={
            <Link
              href="/reset-password"
              className="text-[17px] font-medium text-signal-lime underline underline-offset-2 hover:text-impact-green"
            >
              Forgot password?
            </Link>
          }
        />

        <AuthButton type="submit" disabled={submitting} aria-busy={submitting}>
          {submitting ? "Logging in..." : "Log in"}
        </AuthButton>
      </form>
    </AuthCard>
  );
}
