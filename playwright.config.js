/**
 * @file PLAYWRIGHT.CONFIG.JS
 * 
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 * 
 * @description
 * Playwright configuration for The Great Calculator project.
 * Ensures the quality and reliability of the codebase.
 * Includes end-to-end tests, performance tests, and accessibility tests.
 */

// ------------ IMPORTS
import { defineConfig, devices } from '@playwright/test';

// ------------ CONFIGURATION
export default defineConfig({
  // Test directory
  testDir: './tests/e2e',
  
  // Timeout settings
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }]
  ],
  
  // Global setup and teardown
  globalSetup: './tests/e2e/global-setup.js',
  globalTeardown: './tests/e2e/global-teardown.js',
  
  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:1000',
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // User agent
    userAgent: 'Playwright Calculator Tests',
    
    // Locale
    locale: 'en-US',
    
    // Timezone
    timezoneId: 'Portugal/Lisbon',
    
    // Permissions
    permissions: ['clipboard-read', 'clipboard-write'],
    
    // Color scheme
    colorScheme: 'dark'
  },
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Accessibility testing
    {
      name: 'accessibility',
      use: { 
        ...devices['Desktop Chrome'],
        // Force prefers-reduced-motion for accessibility tests
        reducedMotion: 'reduce'
      },
      testMatch: '**/accessibility/*.spec.js'
    },
    
    // Performance testing
    {
      name: 'performance',
      use: { 
        ...devices['Desktop Chrome'],
        // Throttle CPU for performance testing
        launchOptions: {
          args: ['--cpu-throttling-rate=4']
        }
      },
      testMatch: '**/performance/*.spec.js'
    }
  ],
  
  // Web server configuration
  webServer: {
    command: 'npm run dev',
    port: 1000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NODE_ENV: 'test'
    }
  },
  
  // Output directory
  outputDir: 'test-results/',
  
  // Test metadata
  metadata: {
    project: 'The Great Calculator',
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'test'
  }
});
