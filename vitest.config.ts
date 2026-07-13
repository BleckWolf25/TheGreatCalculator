/**
 * @file vitest.config.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Vitest framework configuration and path mapping.
 *
 * @description
 * Sets up the Vitest testing runner environments, specifies files inclusion matching,
 * configures code coverage reporting limits, and registers tsconfig module aliases.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */

// ---------- IMPORTS
import { defineConfig } from 'vitest/config';
import path from 'path';

// ---------- CONFIGURATION
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    testTimeout: 10000,

    // ---------- COVERAGE CONFIGURATION (Define output report formats and thresholds)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
      exclude: ['next.config.ts', 'vitest.config.ts', 'playwright.config.ts', 'tests/**', 'e2e/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
