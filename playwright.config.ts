/**
 * @file playwright.config.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Playwright E2E testing configuration file.
 *
 * @description
 * Sets up the base URL, test runner timeout thresholds, project configurations for Chromium,
 * and launches a local production build web server automatically before executing test suites.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */

// ---------- IMPORTS
import { defineConfig, devices } from '@playwright/test';

// ---------- CONFIGURATION
export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3007',
    trace: 'on-first-retry',
  },

  // ---------- PROJECTS
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // ---------- WEBSERVER
  webServer: {
    command: 'pnpm exec serve out -l 3007',
    url: 'http://localhost:3007',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
