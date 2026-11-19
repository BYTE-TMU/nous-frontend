// The ONLY place backend is called from.
// Request and response types come from lib/types.ts, generated from
// nous-backend/contracts/openapi.yaml (`npm run generate:types`). That file is the
// source of truth for the API contract; never hand-edit the generated types.
import type { components } from "./types";

type Schemas = components["schemas"];

export type LoginRequest = Schemas["LoginRequest"];
export type TokenResponse = Schemas["TokenResponse"];

/** The schema marks defaulted fields as required; on the wire they are optional. */
export type RunCreateRequest = Omit<Schemas["RunCreateRequest"], "max_turns" | "judge_type"> &
  Partial<Pick<Schemas["RunCreateRequest"], "max_turns" | "judge_type">>;

export type RunOut = Schemas["RunOut"];
export type ModelInfo = Schemas["ModelInfo"];
export type PromptCatalog = Schemas["PromptCatalog"];
export type RunStatus = RunOut["status"];

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// nous-backend mounts its routers without an /api prefix (app/main.py), and
// contracts/openapi.yaml documents the same paths, so login is served at /auth/login.
const AUTH_PATH = "/auth";

/** `status` is 0 when the request never reached the backend. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  init: RequestInit,
  token?: string | null,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(0, "Could not reach the server");
  }
  if (!response.ok) {
    throw new ApiError(response.status, `Request failed with status ${response.status}`);
  }
  // 204 No Content (e.g. delete) has no body to parse.
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function login(body: LoginRequest): Promise<TokenResponse> {
  return request<TokenResponse>(`${AUTH_PATH}/login`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function exchangeGoogleCode(code: string): Promise<TokenResponse> {
  return request<TokenResponse>(`${AUTH_PATH}/google/exchange`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}

export function startGoogleLogin(): void {
  window.location.assign(`${API_URL}${AUTH_PATH}/google`);
}

export type WaitlistRequest = {
  id: string;
  email: string;
  status: string;
  requested_at: string;
};

async function adminRequest<T>(
  path: string,
  token: string,
  method = "GET",
): Promise<T> {
  return request<T>(`${AUTH_PATH}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getWaitlist(token: string): Promise<WaitlistRequest[]> {
  return adminRequest<WaitlistRequest[]>("/admin/waitlist", token);
}

export function approveWaitlistRequest(
  id: string,
  token: string,
): Promise<{ message: string; email: string }> {
  return adminRequest(`/admin/waitlist/${encodeURIComponent(id)}/approve`, token, "POST");
}

export function rejectWaitlistRequest(
  id: string,
  token: string,
): Promise<{ message: string; email: string }> {
  return adminRequest(`/admin/waitlist/${encodeURIComponent(id)}/reject`, token, "POST");
}

/** Creates a run. The backend answers 201 with the new run, or 401 without a valid token. */
export function createRun(body: RunCreateRequest, token: string | null): Promise<RunOut> {
  return request<RunOut>("/runs", { method: "POST", body: JSON.stringify(body) }, token);
}

/** Models nous-ai offers, via the backend. */
export function getModels(token: string | null): Promise<ModelInfo[]> {
  return request<ModelInfo[]>("/models", { method: "GET" }, token);
}

/** Preset defender prompts and the default attacker prompt, via the backend. */
export function getPrompts(token: string | null): Promise<PromptCatalog> {
  return request<PromptCatalog>("/prompts", { method: "GET" }, token);
}

export type RunListItem = Schemas["RunListItem"];

/** The signed-in user's runs. Needs a token: the backend answers 401 without one.
 *  `all` is admin-only (403 otherwise) and lists every user's runs. */
export async function listRuns(
  token: string | null,
  options?: { all?: boolean; q?: string; sort?: string },
): Promise<RunListItem[]> {
  const searchParams = new URLSearchParams();
  if (options?.all) searchParams.set("all", "true");
  if (options?.q) searchParams.set("q", options.q);
  if (options?.sort) searchParams.set("sort", options.sort);
  const query = searchParams.toString();
  const path = `/runs${query ? `?${query}` : ""}`;
  const response = await request<Schemas["RunListResponse"]>(path, { method: "GET" }, token);
  return response.items;
}

export type CurrentUser = Schemas["UserResponse"];

export function getMe(token: string | null): Promise<CurrentUser> {
  return request<CurrentUser>("/auth/me", { method: "GET" }, token);
}
export type RunSummary = Schemas["RunSummary"];
export type RunMessage = Schemas["MessageOut"];
export type RunJudgements = Schemas["RunJudgementsOut"];

const runPath = (runId: string) => `/runs/${encodeURIComponent(runId)}`;

export function getRun(runId: string, token: string | null): Promise<RunSummary> {
  return request<RunSummary>(runPath(runId), { method: "GET" }, token);
}

/** Attacker and defender messages in order; both messages of a turn share its number. */
export function getRunTurns(runId: string, token: string | null): Promise<RunMessage[]> {
  return request<RunMessage[]>(`${runPath(runId)}/turns`, { method: "GET" }, token);
}

export function getRunJudgements(runId: string, token: string | null): Promise<RunJudgements> {
  return request<RunJudgements>(`${runPath(runId)}/judgements`, { method: "GET" }, token);
}

export type RunResults = Schemas["RunResultsOut"];

/** Only available once the run is `completed`; any other state answers 409. */
export function getRunResults(runId: string, token: string | null): Promise<RunResults> {
  return request<RunResults>(`${runPath(runId)}/results`, { method: "GET" }, token);
}

/** Pause, resume and stop answer with the run's new state, or 409 if it can't change. */
export function pauseRun(runId: string, token: string | null): Promise<RunSummary> {
  return request<RunSummary>(`${runPath(runId)}/pause`, { method: "POST" }, token);
}

export function resumeRun(runId: string, token: string | null): Promise<RunSummary> {
  return request<RunSummary>(`${runPath(runId)}/resume`, { method: "POST" }, token);
}

export function stopRun(runId: string, token: string | null): Promise<RunSummary> {
  return request<RunSummary>(`${runPath(runId)}/stop`, { method: "POST" }, token);
}

/** Admin-only (403 otherwise). */
export function renameRun(runId: string, name: string, token: string | null): Promise<RunSummary> {
  return request<RunSummary>(runPath(runId), { method: "PATCH", body: JSON.stringify({ name }) }, token);
}

/** States the backend lets you delete; anything else answers 409. */
export const DELETABLE_STATES: RunSummary["state"][] = ["paused", "completed", "failed"];

/** Admin-only with can_delete_runs perms (403 otherwise). Only paused, completed or failed runs (409 otherwise). */
export function deleteRun(runId: string, token: string | null): Promise<void> {
  return request<void>(runPath(runId), { method: "DELETE" }, token);
}