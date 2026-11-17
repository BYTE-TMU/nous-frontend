import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, listRuns } from "../../lib/api";

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
  window.localStorage.clear();
});

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status });

describe("listRuns search and sort params", () => {
  it("sends a plain GET /runs when no params are given", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { items: [] }));

    const result = await listRuns("tok");

    expect(result).toEqual([]);
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/runs$/);
  });

  it("appends ?q= when search query is provided", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { items: [] }));

    await listRuns("tok", { q: "pressure test" });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("q=pressure");
  });

  it("appends ?sort= when sort is provided", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { items: [] }));

    await listRuns("tok", { sort: "-created_at" });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("sort=-created_at");
  });

  it("appends both q and sort when both are provided", async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { items: [] }));

    await listRuns("tok", { q: "test", sort: "name" });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("q=test");
    expect(url).toContain("sort=name");
  });

  it("throws ApiError with status on 500", async () => {
    fetchMock.mockResolvedValue(jsonResponse(500, { detail: "Internal error" }));

    const err = await listRuns("tok").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(500);
  });

  it("throws ApiError with status 0 on network failure", async () => {
    fetchMock.mockRejectedValue(new TypeError("failed to fetch"));

    const err = await listRuns("tok").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).status).toBe(0);
  });
});
