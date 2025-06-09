/**
 * Scientific Calculator E2E Tests
 * Tests advanced calculator functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Scientific Calculator Operations', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Enable scientific mode
    await page.click('.scientific-toggle');
    await expect(page.locator('#scientific-panel')).toBeVisible();
  });

  test('should toggle scientific mode', async ({ page }) => {
    // Scientific panel should be visible after clicking toggle
    await expect(page.locator('#scientific-panel')).toBeVisible();
    await expect(page.locator('.scientific-toggle')).toHaveAttribute('aria-expanded', 'true');
    
    // Toggle off
    await page.click('.scientific-toggle');
    await expect(page.locator('#scientific-panel')).toBeHidden();
    await expect(page.locator('.scientific-toggle')).toHaveAttribute('aria-expanded', 'false');
  });

  test('should calculate square root', async ({ page }) => {
    // Enter 9 and click square root
    await page.click('button[aria-label="Nine"]');
    await page.click('button[aria-label="Square root"]');
    
    // Check result
    await expect(page.locator('#display')).toHaveValue('3');
  });

  test('should calculate square (x²)', async ({ page }) => {
    // Enter 5 and click square
    await page.click('button[aria-label="Five"]');
    await page.click('button[aria-label="Square"]');
    
    // Check result
    await expect(page.locator('#display')).toHaveValue('25');
  });

  test('should calculate factorial', async ({ page }) => {
    // Enter 5 and click factorial
    await page.click('button[aria-label="Five"]');
    await page.click('button[aria-label="Factorial"]');
    
    // Check result (5! = 120)
    await expect(page.locator('#display')).toHaveValue('120');
  });

  test('should calculate natural logarithm', async ({ page }) => {
    // Enter e (approximately 2.718) and calculate ln
    await page.click('button[aria-label="Two"]');
    await page.click('button[aria-label="Decimal point"]');
    await page.click('button[aria-label="Seven"]');
    await page.click('button[aria-label="One"]');
    await page.click('button[aria-label="Eight"]');
    await page.click('button[aria-label="Natural logarithm"]');
    
    // Result should be approximately 1
    const displayValue = await page.locator('#display').inputValue();
    expect(Math.abs(parseFloat(displayValue) - 1)).toBeLessThan(0.1);
  });

  test('should calculate base 10 logarithm', async ({ page }) => {
    // Enter 100 and calculate log
    await page.click('button[aria-label="One"]');
    await page.click('button[aria-label="Zero"]');
    await page.click('button[aria-label="Zero"]');
    await page.click('button[aria-label="Base 10 logarithm"]');
    
    // Check result (log10(100) = 2)
    await expect(page.locator('#display')).toHaveValue('2');
  });

  test('should handle parentheses in calculations', async ({ page }) => {
    // Calculate (2 + 3) × 4 = 20
    await page.click('button[aria-label="Open parenthesis"]');
    await page.click('button[aria-label="Two"]');
    await page.click('button[aria-label="Add"]');
    await page.click('button[aria-label="Three"]');
    await page.click('button[aria-label="Close parenthesis"]');
    await page.click('button[aria-label="Multiply"]');
    await page.click('button[aria-label="Four"]');
    await page.click('button[aria-label="Equals"]');
    
    // Check result
    await expect(page.locator('#display')).toHaveValue('20');
  });

  test('should toggle between degrees and radians', async ({ page }) => {
    const degRadButton = page.locator('button[aria-label="Toggle degrees/radians"]');
    
    // Should start in degrees mode
    await expect(degRadButton).toHaveText('DEG');
    
    // Toggle to radians
    await degRadButton.click();
    await expect(degRadButton).toHaveText('RAD');
    
    // Toggle back to degrees
    await degRadButton.click();
    await expect(degRadButton).toHaveText('DEG');
  });

  test('should calculate trigonometric functions', async ({ page }) => {
    // Calculate sin(90°) = 1
    await page.click('button[aria-label="Nine"]');
    await page.click('button[aria-label="Zero"]');
    await page.click('button[aria-label="Sine"]');
    
    // Result should be approximately 1
    const displayValue = await page.locator('#display').inputValue();
    expect(Math.abs(parseFloat(displayValue) - 1)).toBeLessThan(0.01);
  });

  test('should use Pi constant', async ({ page }) => {
    // Click Pi button
    await page.click('button[aria-label="Pi constant"]');
    
    // Result should be approximately 3.14159
    const displayValue = await page.locator('#display').inputValue();
    expect(Math.abs(parseFloat(displayValue) - Math.PI)).toBeLessThan(0.01);
  });

  test('should handle memory operations', async ({ page }) => {
    // Store 42 in memory
    await page.click('button[aria-label="Four"]');
    await page.click('button[aria-label="Two"]');
    await page.click('button[aria-label="Memory store"]');
    
    // Clear display
    await page.click('button[aria-label="Clear all"]');
    await expect(page.locator('#display')).toHaveValue('0');
    
    // Recall from memory
    await page.click('button[aria-label="Memory recall"]');
    await expect(page.locator('#display')).toHaveValue('42');
    
    // Clear memory
    await page.click('button[aria-label="Memory clear"]');
    await page.click('button[aria-label="Clear all"]');
    await page.click('button[aria-label="Memory recall"]');
    await expect(page.locator('#display')).toHaveValue('0');
  });
});
