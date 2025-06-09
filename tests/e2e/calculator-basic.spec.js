/**
 * Basic Calculator E2E Tests
 * Tests core calculator functionality through user interactions
 */

import { test, expect } from '@playwright/test';

test.describe('Basic Calculator Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load calculator interface', async ({ page }) => {
    // Check if main elements are visible
    await expect(page.locator('#calculator-main')).toBeVisible();
    await expect(page.locator('#display')).toBeVisible();
    await expect(page.locator('.calculator-grid')).toBeVisible();
    
    // Check initial display value
    await expect(page.locator('#display')).toHaveValue('0');
  });

  test('should perform basic addition', async ({ page }) => {
    // Click 2 + 3 = 
    await page.click('button[aria-label="Two"]');
    await page.click('button[aria-label="Add"]');
    await page.click('button[aria-label="Three"]');
    await page.click('button[aria-label="Equals"]');
    
    // Check result
    await expect(page.locator('#display')).toHaveValue('5');
  });

  test('should perform basic subtraction', async ({ page }) => {
    // Click 8 - 3 =
    await page.click('button[aria-label="Eight"]');
    await page.click('button[aria-label="Subtract"]');
    await page.click('button[aria-label="Three"]');
    await page.click('button[aria-label="Equals"]');
    
    // Check result
    await expect(page.locator('#display')).toHaveValue('5');
  });

  test('should perform basic multiplication', async ({ page }) => {
    // Click 4 × 3 =
    await page.click('button[aria-label="Four"]');
    await page.click('button[aria-label="Multiply"]');
    await page.click('button[aria-label="Three"]');
    await page.click('button[aria-label="Equals"]');
    
    // Check result
    await expect(page.locator('#display')).toHaveValue('12');
  });

  test('should perform basic division', async ({ page }) => {
    // Click 15 ÷ 3 =
    await page.click('button[aria-label="One"]');
    await page.click('button[aria-label="Five"]');
    await page.click('button[aria-label="Divide"]');
    await page.click('button[aria-label="Three"]');
    await page.click('button[aria-label="Equals"]');
    
    // Check result
    await expect(page.locator('#display')).toHaveValue('5');
  });

  test('should handle decimal numbers', async ({ page }) => {
    // Click 2.5 + 1.5 =
    await page.click('button[aria-label="Two"]');
    await page.click('button[aria-label="Decimal point"]');
    await page.click('button[aria-label="Five"]');
    await page.click('button[aria-label="Add"]');
    await page.click('button[aria-label="One"]');
    await page.click('button[aria-label="Decimal point"]');
    await page.click('button[aria-label="Five"]');
    await page.click('button[aria-label="Equals"]');
    
    // Check result
    await expect(page.locator('#display')).toHaveValue('4');
  });

  test('should clear display with AC button', async ({ page }) => {
    // Enter some numbers
    await page.click('button[aria-label="One"]');
    await page.click('button[aria-label="Two"]');
    await page.click('button[aria-label="Three"]');
    
    // Verify numbers are displayed
    await expect(page.locator('#display')).toHaveValue('123');
    
    // Click AC
    await page.click('button[aria-label="Clear all"]');
    
    // Check display is cleared
    await expect(page.locator('#display')).toHaveValue('0');
  });

  test('should toggle sign with ± button', async ({ page }) => {
    // Enter a number
    await page.click('button[aria-label="Five"]');
    await expect(page.locator('#display')).toHaveValue('5');
    
    // Toggle sign
    await page.click('button[aria-label="Toggle positive/negative"]');
    await expect(page.locator('#display')).toHaveValue('-5');
    
    // Toggle back
    await page.click('button[aria-label="Toggle positive/negative"]');
    await expect(page.locator('#display')).toHaveValue('5');
  });

  test('should handle percentage calculations', async ({ page }) => {
    // Enter 50 and click percentage
    await page.click('button[aria-label="Five"]');
    await page.click('button[aria-label="Zero"]');
    await page.click('button[aria-label="Percentage"]');
    
    // Check result (50% = 0.5)
    await expect(page.locator('#display')).toHaveValue('0.5');
  });

  test('should handle chained operations', async ({ page }) => {
    // Perform 2 + 3 × 4 (should be 14 due to operator precedence)
    await page.click('button[aria-label="Two"]');
    await page.click('button[aria-label="Add"]');
    await page.click('button[aria-label="Three"]');
    await page.click('button[aria-label="Multiply"]');
    await page.click('button[aria-label="Four"]');
    await page.click('button[aria-label="Equals"]');
    
    // Check result
    await expect(page.locator('#display')).toHaveValue('14');
  });
});
