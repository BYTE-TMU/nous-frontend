
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  approveWaitlistRequest,
  getWaitlist,
  rejectWaitlistRequest,
  type WaitlistRequest,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";

export default function AdminWaitlistPage() {
  const [requests, setRequests] = useState<WaitlistRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("Please sign in with an administrator account.");
      setLoading(false);
      return;
    }

    try {
      const data = await getWaitlist(token);
      setRequests(data);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load waitlist."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  async function reviewRequest(id: string, action: "approve" | "reject") {
    const token = getToken();
    if (!token) {
      setError("Please sign in again.");
      return;
    }

    setProcessing(id);
    setError("");

    try {
      if (action === "approve") {
        await approveWaitlistRequest(id, token);
      } else {
        await rejectWaitlistRequest(id, token);
      }

      setRequests((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to review request."
      );
    } finally {
      setProcessing(null);
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Waitlist Management</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review and manage access requests.
            </p>
          </div>

          <Link href="/" className="text-sm underline">
            Back to dashboard
          </Link>
        </div>

        {error && (
          <p role="alert" className="mb-4 text-sm text-red-500">
            {error}
          </p>
        )}

        {loading ? (
          <p>Loading requests...</p>
        ) : requests.length === 0 ? (
          <div className="rounded-lg border p-8 text-center">
            <h2 className="font-medium">No pending requests</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              New access requests will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {requests.length} pending request(s)
            </p>

            {requests.map((request) => (
              <div
                key={request.id}
                className="flex flex-col justify-between gap-4 rounded-lg border p-5 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium">{request.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Requested:{" "}
                    {new Date(request.requested_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={processing !== null}
                    onClick={() => reviewRequest(request.id, "approve")}
                    className="rounded-md bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                  >
                    {processing === request.id ? "Processing..." : "Approve"}
                  </button>

                  <button
                    type="button"
                    disabled={processing !== null}
                    onClick={() => reviewRequest(request.id, "reject")}
                    className="rounded-md bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
