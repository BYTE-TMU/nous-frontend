
"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function WaitlistContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") ?? "pending";

  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border p-8 text-center">
        <h1 className="mb-3 text-2xl font-semibold">
          {isApproved
            ? "You're approved!"
            : isRejected
              ? "Access not approved"
              : "You're on the waitlist"}
        </h1>

        <p className="mb-6 text-sm text-muted-foreground">
          {isApproved
            ? "Your email has been approved. You can now sign in with Google."
            : isRejected
              ? "Your access request was not approved. Please contact the Nous team if you have questions."
              : "Thanks for your interest in Nous. Your email has been submitted for review. You'll be able to access your account once an administrator approves your request."}
        </p>

        <Link href="/login" className="underline">
          Return to login
        </Link>
      </div>
    </main>
  );
}

export default function WaitlistPage() {
  return (
    <Suspense fallback={null}>
      <WaitlistContent />
    </Suspense>
  );
}
