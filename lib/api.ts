// The ONLY place backend is called from.
// Request and response shapes are written by hand; they mirror nous-backend's
// app/schemas/auth.py and app/schemas/runs.py.
export type LoginRequest = { email: string; password: string };
export type TokenResponse = { access_token: string; token_type: string };

export type RunCreateRequest = {
  name: string;
  attacker_model: string;
  defender_model: string;
  /** A preset persona name, e.g. "maya-2". */
  defender_persona?: string | null;
  /** Custom prompt text. The backend uses it instead of `defender_persona`. */
  defender_persona_prompt?: string | null;
  max_turns?: number;
};

export type RunStatus =
  | "pending"
  | "running"
  | "pausing"
  | "paused"
  | "stopping"
  | "completed"
  | "failed";

export type RunOut = {
  run_id: string;
  name: string;
  status: RunStatus;
  attacker_model: string;
  defender_model: string;
  attacker_prompt: string | null;
  defender_persona: string | null;
  defender_persona_prompt: string | null;
  max_turns: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// nous-backend mounts its routers without an /api prefix (app/main.py), so login
// is served at /auth/login. contracts/openapi.yaml still documents /api/auth/*,
// which 404s against the running backend — the contract is wrong, not this path.
// Revisit when the backend fixes its contract or adds the prefix.
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

async function request<T>(path: string, init: RequestInit, token?: string | null): Promise<T> {
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

/** Creates a run. The backend answers 201 with the new run, or 401 without a valid token. */
export function createRun(body: RunCreateRequest, token: string | null): Promise<RunOut> {
  return request<RunOut>("/runs", { method: "POST", body: JSON.stringify(body) }, token);
}
