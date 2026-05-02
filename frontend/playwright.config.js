import process from "node:process";
import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [["html"], ["github"]] : [["list"], ["html"]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});