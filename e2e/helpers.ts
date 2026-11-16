import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const API = process.env.E2E_API_URL ?? "http://localhost:8000";
export const EMAIL = process.env.NOUS_CLI_EMAIL ?? "nous-cli@gmail.com";
export const PASSWORD = process.env.NOUS_CLI_PASSWORD ?? "nous-cli-password";
export const SHOTS = "e2e/screenshots";

export async function apiToken(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${API}/auth/login`, { data: { email: EMAIL, password: PASSWORD } });
  expect(res.ok(), "log in as the CLI account; run `python -m app.cli` once if this fails").toBeTruthy();
  return (await res.json()).access_token;
}

/** Id of the seeded demo run whose name contains `part` (see scripts/seed_demo_runs.py). */
export async function demoRunId(request: APIRequestContext, token: string, part: string) {
  const res = await request.get(`${API}/runs`, { headers: { Authorization: `Bearer ${token}` } });
  const items: { run_id: string; name: string }[] = (await res.json()).items;
  const run = items.find((r) => r.name.startsWith("[demo]") && r.name.includes(part));
  expect(run, `demo run "${part}" not found: run scripts/seed_demo_runs.py`).toBeTruthy();
  return run!.run_id;
}

/** Signs the page in by storing the token before any script runs, then opens the run. */
export async function openRun(page: Page, token: string, runId: string) {
  await page.addInitScript((t) => window.localStorage.setItem("nous.access_token", t), token);
  await page.goto(`/experiment/${runId}`);
  // Next's dev-mode "N" badge is not part of the UI.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({ timeout: 20_000 });
}

export const rgb = (r: number, g: number, b: number) => `rgb(${r}, ${g}, ${b})`;
