import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { EMAIL, PASSWORD, SHOTS, apiToken, demoRunId, openRun, rgb } from "./helpers";

// Brand tokens from app/globals.css, as the browser reports them.
const FOX_RED = rgb(255, 107, 61);
const BLUE_FREEZE = rgb(127, 231, 224);
const SIGNAL_LIME = rgb(221, 252, 36);

let token: string;
const run = async (request: APIRequestContext, part: string) => demoRunId(request, token, part);

test.beforeAll(async ({ request }) => {
  token = await apiToken(request);
});

const shot = (page: Page, name: string) =>
  page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: true });

test("logs in through the login form and finds the demo runs on the dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page.getByText("[demo] Broke on turn 3")).toBeVisible({ timeout: 20_000 });
  await shot(page, "00-dashboard");
});

test("in progress: header, rule, tabs, bubbles, typing indicator and summary", async ({ page, request }) => {
  await openRun(page, token, await run(request, "In progress"));

  // Header: icon-only back button, name and models in the middle, status shown there too.
  const back = page.getByRole("link", { name: "All experiments" });
  await expect(back).toBeVisible();
  await expect(back).not.toHaveText(/\S/); // icon only
  await expect(page.getByRole("img", { name: "IN PROGRESS" }).first()).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("[demo] In progress, softened on turn 2");
  // Hover turns it neon green.
  await back.hover();
  await expect(back).toHaveCSS("background-color", SIGNAL_LIME);
  await page.mouse.move(700, 500);

  // Controls on the right while live; no "View Result" yet.
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
  await expect(page.getByRole("button", { name: "View Result" })).toHaveCount(0);

  // Rule pinned above the first turn.
  await expect(page.getByText("Rule under test:")).toBeVisible();
  await expect(page.getByText("3 TURNS SO FAR")).toBeVisible();

  // Tab switcher is tall enough (Figma: 72px at 2134 wide, about 48px here).
  const tabs = page.getByRole("tablist");
  const tabBox = await tabs.boundingBox();
  expect(tabBox!.height).toBeGreaterThanOrEqual(46);
  expect(tabBox!.height).toBeLessThanOrEqual(52);

  // Messages: solid red border for the attacker, solid blue for the defender. Never dashed.
  const attacker = page.getByText("Hi! I'm trying to learn about the planets.");
  const defender = page.getByText("Wonderful! Start with the eight planets");
  for (const [bubble, colour] of [[attacker, FOX_RED], [defender, BLUE_FREEZE]] as const) {
    await expect(bubble).toHaveCSS("border-top-style", "solid");
    await expect(bubble).toHaveCSS("border-top-color", colour);
  }
  // The softened reply (turn 2) is also solid, not dashed.
  await expect(page.getByText("I'm happy to hear what's got you curious")).toHaveCSS("border-top-style", "solid");

  // Three finished turns, the 4th is being written.
  await expect(page.getByRole("separator", { name: "Turn 4" })).toBeVisible();
  const typing = page.getByRole("status", { name: "Attacker is writing" });
  await expect(typing).toBeVisible();
  await expect(typing).toHaveCSS("background-color", rgb(138, 143, 138)); // Smoke: a grey bubble, not a dark one

  // Summary: "Turn 3 running", the softened moment, and "No break so far".
  await expect(page.getByText("running", { exact: true })).toBeVisible();
  const moments = page.getByRole("region", { name: "Key moments" });
  await expect(moments.getByText("Softened")).toBeVisible();
  await expect(moments.getByText("No break so far.")).toBeVisible();

  // Results panel for a live run.
  await expect(page.getByText("This conversation is still running.")).toBeVisible();
  await shot(page, "01-in-progress");
});

test("in progress: measurements match the Figma frame (scaled to a 1440px page)", async ({ page, request }) => {
  await openRun(page, token, await run(request, "In progress"));
  const box = async (text: string) => (await page.getByText(text, { exact: false }).first().boundingBox())!;

  const avatar = (await page.getByText("A", { exact: true }).first().boundingBox())!;
  expect(Math.round(avatar.width)).toBe(44); // 64px in Figma at 2134 wide
  expect(Math.round(avatar.height)).toBe(44);

  const rule = (await page.getByText("Rule under test:").locator("xpath=..").boundingBox())!;
  // 81px in Figma for one line (about 54 here); the demo rule wraps to two lines, the clamp's maximum.
  expect(rule.height).toBeGreaterThan(50);
  expect(rule.height).toBeLessThan(100);

  const bubble = await box("Hi! I'm trying to learn about the planets.");
  expect(bubble.height).toBeGreaterThan(54); // 81px, about 54
  expect(bubble.height).toBeLessThan(68);

  await expect(page.getByText("Hi! I'm trying to learn about the planets.")).toHaveCSS("border-top-left-radius", "4px");
  await expect(page.getByText("Hi! I'm trying to learn about the planets.")).toHaveCSS("border-bottom-right-radius", "13px");
  await expect(page.getByText("Rule under test:").locator("xpath=..")).toHaveCSS("border-top-style", "dashed");
  await expect(page.getByText("Rule under test:").locator("xpath=..")).toHaveCSS("border-top-left-radius", "13px");
});

test("setup tab lists persona, rule, strategy and both models", async ({ page, request }) => {
  await openRun(page, token, await run(request, "In progress"));
  await page.getByRole("tab", { name: "Setup" }).click();
  await page.waitForTimeout(400); // let the tab transition finish before the screenshot
  await expect(page.getByText("Locked when the conversation started.")).toBeVisible();
  for (const label of ["Defender persona", "Rule", "Attack strategy", "Attacker model", "Defender model"]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(page.getByText("nora-2")).toBeVisible();
  await shot(page, "02-setup-tab");
});

test("broke: summary shows only Broke | Turn 3, View Result scrolls to the results", async ({ page, request }) => {
  await openRun(page, token, await run(request, "Broke on turn 3"));

  await expect(page.getByRole("img", { name: "BROKE" }).first()).toBeVisible();
  const summary = page.getByRole("tabpanel", { name: "Summary" });
  await expect(summary.getByText("Broke", { exact: true })).toBeVisible();
  await expect(summary.getByText("Turn 3", { exact: true })).toBeVisible();
  await expect(page.getByText("KEY MOMENTS")).toHaveCount(0);
  await expect(page.getByText("No break")).toHaveCount(0);

  // Run ended: no pause/stop, "View Result" instead.
  await expect(page.getByRole("button", { name: "Pause" })).toHaveCount(0);
  const view = page.getByRole("button", { name: "View Result" });
  await expect(view).toBeVisible();
  await shot(page, "03-broke");

  // Short viewport, so the results really are below the fold before the click.
  await page.setViewportSize({ width: 1440, height: 500 });
  await expect(page.locator("#results")).not.toBeInViewport();
  await view.click();
  await expect(page.locator("#results")).toBeInViewport({ ratio: 0.9, timeout: 5000 });
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await expect(page.getByText("The Defender broke its rule.")).toBeInViewport();
  await shot(page, "04-broke-after-view-result");
});

test("held: HELD status, summary and results copy follow the backend outcome", async ({ page, request }) => {
  await openRun(page, token, await run(request, "Held, all 4"));
  await expect(page.getByRole("img", { name: "HELD" }).first()).toBeVisible();
  await expect(page.getByText("held", { exact: true })).toBeVisible();
  await expect(page.getByText("No break.", { exact: true })).toBeVisible();
  await expect(page.getByText("The Defender held its rule.").first()).toBeVisible();
  // The softened reply is still flagged.
  await expect(page.getByRole("region", { name: "Key moments" }).getByText("Softened")).toBeVisible();
  await shot(page, "05-held");
});

test("paused: shows Resume", async ({ page, request }) => {
  await openRun(page, token, await run(request, "Paused"));
  await expect(page.getByRole("button", { name: "Resume" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Stop" })).toBeVisible();
  await expect(page.getByText("paused", { exact: true })).toBeVisible();
  await expect(page.getByText("This conversation is paused.")).toBeVisible();
  await shot(page, "06-paused");
});

test("failed: View Result is offered and the results panel says it failed", async ({ page, request }) => {
  await openRun(page, token, await run(request, "Failed run"));
  await expect(page.getByRole("img", { name: "INCONCLUSIVE" }).first()).toBeVisible();
  await expect(page.getByText("This run failed before it finished.")).toBeVisible();
  await expect(page.getByText("No break")).toHaveCount(0); // no verdict, so no claim
  await expect(page.getByRole("button", { name: "View Result" })).toBeVisible();
  await shot(page, "07-failed");
});

test("long messages wrap, the rule banner clamps, nothing overflows sideways", async ({ page, request }) => {
  await openRun(page, token, await run(request, "Long messages"));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  const rule = (await page.getByText("Rule under test:").locator("xpath=..").boundingBox())!;
  expect(rule.height).toBeLessThan(90); // two lines at most
  await shot(page, "08-long-messages");
});

test("a signed-out visitor gets the log-in prompt, not a broken page", async ({ page, request }) => {
  await page.goto(`/experiment/${await run(request, "Broke on turn 3")}`);
  await expect(page.getByText("Log in to see this experiment.")).toBeVisible();
});
