import { defineConfig, devices } from "@playwright/test";

/**
 * Local run config for the e2e suite.
 *
 * `playwright.config.ts` targets the browsers Playwright downloads, and on this
 * machine the cached build is older than the installed package while the
 * download CDN is unreachable. Chrome is installed, so this points the run at
 * it with `channel` — the suite itself is unchanged.
 *
 *   npx playwright test --config=playwright.local.config.ts
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    ...devices["Desktop Chrome"],
    channel: "chrome",
    baseURL: "http://127.0.0.1:3210",
  },
  webServer: {
    command: "npx next dev --port 3210",
    url: "http://127.0.0.1:3210",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
