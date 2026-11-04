import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, login as apiLogin } from "../../lib/api";
import {
  NotAvailableError,
  clearToken,
  getToken,
  login,
  requestPasswordReset,
  resetPassword,
  verifyResetCode,
} from "../../lib/auth";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  fetchMock.mockReset();
});

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status });

describe("api.login", () => {
  it("posts the credentials to the backend's /auth/login endpoint", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { access_token: "abc", token_type: "bearer" }));
    const result = await apiLogin({ email: "me@nous.dev", password: "pw" });
    expect(result.access_token).toBe("abc");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    // The running backend has no /api prefix, whatever openapi.yaml says.
    expect(url).toMatch(/^https?:\/\/[^/]+\/auth\/login$/);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({ email: "me@nous.dev", password: "pw" });
  });

  it("throws an ApiError carrying the status", async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { detail: "Invalid email or password" }));
    await expect(apiLogin({ email: "a@b.co", password: "x" })).rejects.toMatchObject({ status: 401 });
  });

  it("throws status 0 when the server is unreachable", async () => {
    fetchMock.mockRejectedValue(new TypeError("failed to fetch"));
    const error = await apiLogin({ email: "a@b.co", password: "x" }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(0);
  });
});

describe("auth", () => {
  it("stores the access token after a successful login and can clear it", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { access_token: "abc", token_type: "bearer" }));
    await login("me@nous.dev", "pw");
    expect(getToken()).toBe("abc");
    clearToken();
    expect(getToken()).toBeNull();
  });

  it("does not store a token when login fails", async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, {}));
    await expect(login("me@nous.dev", "bad")).rejects.toBeInstanceOf(ApiError);
    expect(getToken()).toBeNull();
  });

  it("never mocks login, even when the reset mock is on", async () => {
    vi.stubEnv("NEXT_PUBLIC_MOCK_PASSWORD_RESET", "true");
    fetchMock.mockResolvedValue(jsonResponse(401, {}));
    await expect(login("me@nous.dev", "password123")).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getToken()).toBeNull();
  });

  it("survives storage that throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(getToken()).toBeNull();
    vi.restoreAllMocks();
  });

  it("reports password reset as unavailable without the mock flag", async () => {
    await expect(requestPasswordReset("me@nous.dev")).rejects.toBeInstanceOf(NotAvailableError);
    await expect(verifyResetCode("me@nous.dev", "123456")).rejects.toBeInstanceOf(NotAvailableError);
    await expect(resetPassword("me@nous.dev", "123456", "a-new-password")).rejects.toBeInstanceOf(
      NotAvailableError,
    );
  });

  it("uses the mock reset only when NEXT_PUBLIC_MOCK_PASSWORD_RESET is true", async () => {
    vi.stubEnv("NEXT_PUBLIC_MOCK_PASSWORD_RESET", "true");
    await expect(requestPasswordReset("me@nous.dev")).resolves.toBeUndefined();
    await expect(verifyResetCode("me@nous.dev", "123456")).resolves.toBeUndefined();
    await expect(verifyResetCode("me@nous.dev", "000000")).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
