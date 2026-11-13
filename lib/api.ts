// The ONLY place backend is called from.
// Request and response shapes are written by hand; they mirror nous-backend's
// app/schemas/auth.py.
export type LoginRequest = { email: string; password: string };
export type TokenResponse = { access_token: string; token_type: string };

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

async function request<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init.headers },
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
