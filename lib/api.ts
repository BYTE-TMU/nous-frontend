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

export type RunListItem = Schemas["RunListItem"];

/** The signed-in user's runs. Needs a token: the backend answers 401 without one. */
export async function listRuns(token: string | null): Promise<RunListItem[]> {
  const response = await request<Schemas["RunListResponse"]>("/runs", { method: "GET" }, token);
  return response.items;
}