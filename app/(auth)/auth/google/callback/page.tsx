
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { completeGoogleLogin } from "@/lib/auth";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function finishLogin() {
      const code = new URLSearchParams(window.location.search).get("code");

      if (!code) {
        setError("No authentication code was received.");
        return;
      }

      try {
        await completeGoogleLogin(code);
        router.replace("/dashboard");
      } catch {
        setError("Google sign-in failed or the authentication code expired. Please try again.");
      }
    }

    void finishLogin();
  }, [router]);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p role="alert" className="text-center">
          {error}
        </p>
        <Link href="/login" className="underline">
          Return to login
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <p>Signing you in with Google...</p>
    </main>
  );
}
