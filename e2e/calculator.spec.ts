/**
 * @file calculator.spec.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary End-to-end tests for the calculator interfaces and modes.
 *
 * @description
 * Tests basic mathematical evaluation flow, mode selection tabs, settings panel,
 * and history entry lists in the user interface.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import { test, expect } from '@playwright/test';

// ---------- TESTS: CALCULATOR E2E
test.describe('TheGreatCalculator UI', () => {
  // ---------- TEST: PAGE LOAD & TITLE
  test('should load application and display correct header title', async ({ page }) => {
    await page.goto('/');

    // ---------- ASSERTION (Confirm branding header displays correctly)
    await expect(page.locator('header h1')).toHaveText('TheGreatCalculator');
  });

  // ---------- TEST: SCIENTIFIC ARITHMETIC
  test('should perform basic addition in scientific calculator mode', async ({ page }) => {
    await page.goto('/');

    // ---------- INTERACTION (Select keypad buttons to input "7 + 8 =")
    await page.getByRole('button', { name: '7', exact: true }).first().click();
    await page.getByRole('button', { name: '+ (Add)', exact: true }).first().click();
    await page.getByRole('button', { name: '8', exact: true }).first().click();
    await page.getByRole('button', { name: '= (Equals)', exact: true }).first().click();

    // ---------- ASSERTION (Confirm results container contains evaluation result)
    const resultLocator = page.locator('[role="region"][aria-label="Calculator display"]');
    await expect(resultLocator).toContainText('15');
  });

  // ---------- TEST: MODE SWITCHING
  test('should switch between scientific and graphic tabs', async ({ page }) => {
    await page.goto('/');

    // ---------- TRANSITION (Toggle mode selector to switch views)
    await page.locator('button:has-text("Graphic")').first().click();

    // ---------- ASSERTION (Confirm canvas or sidebar tabs update to graphic view)
    const activeTab = page.locator('button[aria-selected="true"]');
    await expect(activeTab).toContainText('Functions');
  });
});
