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
    await expect(page.locator('header h1')).toHaveText('TheGreatCalculator');
  });

  // ---------- TEST: SCIENTIFIC ARITHMETIC & EVALUATION
  test('should perform basic arithmetic in scientific calculator mode', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: '7', exact: true }).first().click();
    await page.getByRole('button', { name: '+ (Add)', exact: true }).first().click();
    await page.getByRole('button', { name: '8', exact: true }).first().click();
    await page.getByRole('button', { name: '= (Equals)', exact: true }).first().click();

    const display = page.locator('[role="region"][aria-label="Calculator display"]');
    await expect(display).toContainText('15');
  });

  // ---------- TEST: ADVANCED SCIENTIFIC FUNCTIONS (LN, LOG, EXP, TRIG, POWERS)
  test('should evaluate scientific functions including natural log (ln), log10, and EXP', async ({
    page,
  }) => {
    await page.goto('/');

    // Clear display
    await page.getByRole('button', { name: 'AC (All clear)' }).first().click();

    // Test ln(e) = 1
    await page.getByRole('button', { name: 'ln (Natural log)' }).first().click();
    await page.getByRole('button', { name: 'e (Euler number)' }).first().click();
    await page.getByRole('button', { name: ') (Close parenthesis)' }).first().click();
    await page.getByRole('button', { name: '= (Equals)' }).first().click();

    const display = page.locator('[role="region"][aria-label="Calculator display"]');
    await expect(display).toContainText('1');

    // Clear and test log(100) = 2
    await page.getByRole('button', { name: 'AC (All clear)' }).first().click();
    await page.getByRole('button', { name: 'log (Log base 10)' }).first().click();
    await page.getByRole('button', { name: '1', exact: true }).first().click();
    await page.getByRole('button', { name: '0', exact: true }).first().click();
    await page.getByRole('button', { name: '0', exact: true }).first().click();
    await page.getByRole('button', { name: ') (Close parenthesis)' }).first().click();
    await page.getByRole('button', { name: '= (Equals)' }).first().click();

    await expect(display).toContainText('2');

    // Clear and test EXP: 5 EXP 3 = 5000
    await page.getByRole('button', { name: 'AC (All clear)' }).first().click();
    await page.getByRole('button', { name: '5', exact: true }).first().click();
    await page.getByRole('button', { name: 'EXP (Scientific notation)' }).first().click();
    await page.getByRole('button', { name: '3', exact: true }).first().click();
    await page.getByRole('button', { name: '= (Equals)' }).first().click();

    await expect(display).toContainText('5000');
  });

  // ---------- TEST: ANGLE MODES & SHIFT (2nd) TOGGLE
  test('should toggle angle modes (DEG/RAD) and shift second functions', async ({ page }) => {
    await page.goto('/');

    const angleBtn = page.getByRole('button', { name: /DEG|RAD/i }).first();
    await expect(angleBtn).toContainText('RAD');
    await angleBtn.click();
    await expect(angleBtn).toContainText('DEG');

    // Test 2nd shift function
    const shiftBtn = page.getByRole('button', { name: '2nd (Second function)' }).first();
    await shiftBtn.click();

    // Verify inverse sine button is displayed after shift
    const sinInverseBtn = page.locator('button:has-text("sin⁻¹")').first();
    await expect(sinInverseBtn).toBeVisible();
  });

  // ---------- TEST: MEMORY OPERATIONS (M+, MR, MC)
  test('should store, recall, and clear values using memory buttons', async ({ page }) => {
    await page.goto('/');

    // Evaluate 42
    await page.getByRole('button', { name: '4', exact: true }).first().click();
    await page.getByRole('button', { name: '2', exact: true }).first().click();
    await page.getByRole('button', { name: '= (Equals)' }).first().click();

    // Store in memory (M+)
    await page.getByRole('button', { name: 'M+ (Memory add)' }).first().click();

    // Clear current expression
    await page.getByRole('button', { name: 'AC (All clear)' }).first().click();

    // Recall memory (MR)
    await page.getByRole('button', { name: 'MR (Memory recall)' }).first().click();

    const display = page.locator('[role="region"][aria-label="Calculator display"]');
    await expect(display).toContainText('42');

    // Clear memory (MC)
    await page.getByRole('button', { name: 'MC (Memory clear)' }).first().click();
  });

  // ---------- TEST: MODE SWITCHING & GRAPHIC CALCULATOR
  test('should switch between scientific and graphic calculator modes', async ({ page }) => {
    await page.goto('/');

    // Switch to Graphic tab
    await page.locator('button:has-text("Graphic")').first().click();

    // Confirm active tab updates to graphic functions sidebar view
    const activeTab = page.locator('button[aria-selected="true"]');
    await expect(activeTab).toContainText('Functions');

    // Switch back to Scientific mode
    await page.locator('button:has-text("Scientific")').first().click();
    await expect(page.getByRole('button', { name: 'AC (All clear)' }).first()).toBeVisible();
  });
});
