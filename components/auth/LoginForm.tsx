
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ApiError, startGoogleLogin } from "../../lib/api";
import { login } from "../../lib/auth";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { AuthCard } from "./AuthCard";

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
    <AuthCard heading={rejected ? "Incorrect login." : "Welcome back."}>
      <div className="flex flex-col gap-5">
        <Button
          type="button"
          variant="outline"
          onClick={startGoogleLogin}
          className="w-full"
        >
          Continue with Google
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground">
            or continue with email
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-4"
        >
          <TextField
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
            disabled={submitting}
          />

          <TextField
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
            disabled={submitting}
          />

          {notice ? (
            <p role="alert" className="text-center text-sm">
              {notice}
            </p>
          ) : null}

          <Button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="mt-2"
          >
            {submitting ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <Link href="/reset-password" className="text-center underline">
          Forgot your password?
        </Link>
      </div>
    </AuthCard>
  );
}
