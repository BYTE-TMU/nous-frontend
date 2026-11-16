import { defineConfig } from "@playwright/test";

/**
 * End-to-end tests run against the real stack: the Next dev server (started here if it is not
 * already up) and nous-backend on :8000 with demo data from scripts/seed_demo_runs.py.
 * They drive the installed Google Chrome, so no browser download is needed.
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/.results",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    channel: "chrome",
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000/login",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
