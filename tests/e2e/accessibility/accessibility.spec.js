/**
 * Accessibility E2E Tests
 * Tests calculator accessibility features and compliance
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA labels on all buttons', async ({ page }) => {
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel.length).toBeGreaterThan(0);
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Focus should start on the display
    await page.keyboard.press('Tab');
    await expect(page.locator('#display')).toBeFocused();
    
    // Tab through calculator buttons
    await page.keyboard.press('Tab');
    const firstButton = page.locator('button[aria-label="Clear all"]');
    await expect(firstButton).toBeFocused();
    
    // Continue tabbing
    await page.keyboard.press('Tab');
    const secondButton = page.locator('button[aria-label="Toggle positive/negative"]');
    await expect(secondButton).toBeFocused();
  });

  test('should support keyboard shortcuts for operations', async ({ page }) => {
    // Focus the display
    await page.locator('#display').focus();
    
    // Test number input via keyboard
    await page.keyboard.type('2');
    await expect(page.locator('#display')).toHaveValue('2');
    
    // Test operator input
    await page.keyboard.press('+');
    await page.keyboard.type('3');
    await page.keyboard.press('Enter');
    
    // Check result
    await expect(page.locator('#display')).toHaveValue('5');
  });

  test('should have proper focus management in scientific mode', async ({ page }) => {
    // Open scientific mode
    await page.click('.scientific-toggle');
    
    // Scientific buttons should be focusable
    const scientificButtons = page.locator('#scientific-panel button');
    const firstScientificButton = scientificButtons.first();
    
    await firstScientificButton.focus();
    await expect(firstScientificButton).toBeFocused();
    
    // Close scientific mode
    await page.click('.scientific-toggle');
    
    // Scientific buttons should not be focusable when hidden
    await page.keyboard.press('Tab');
    // Focus should skip over hidden scientific buttons
    await expect(firstScientificButton).not.toBeFocused();
  });

  test('should announce calculation results to screen readers', async ({ page }) => {
    // Check that display has proper ARIA attributes
    const display = page.locator('#display');
    await expect(display).toHaveAttribute('aria-label', 'Calculator display showing current calculation');
    
    // Check that history has live region
    const history = page.locator('#history');
    await expect(history).toHaveAttribute('aria-live', 'polite');
    await expect(history).toHaveAttribute('role', 'status');
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toHaveText('The Great Calculator');
    
    // Check that h1 is visually hidden but accessible to screen readers
    await expect(h1).toHaveClass(/visually-hidden/);
  });

  test('should support high contrast mode', async ({ page }) => {
    // Test with forced-colors media query
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    
    // Check that buttons are still visible and functional
    const button = page.locator('button[aria-label="One"]');
    await expect(button).toBeVisible();
    
    // Test button interaction
    await button.click();
    await expect(page.locator('#display')).toHaveValue('1');
  });

  test('should respect reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Test that animations are disabled or reduced
    const button = page.locator('button[aria-label="One"]');
    await button.click();
    
    // Check that button press animation is minimal or disabled
    const animationDuration = await button.evaluate(el => {
      const style = window.getComputedStyle(el);
      return style.animationDuration;
    });
    
    // Animation should be very short or none when reduced motion is preferred
    expect(animationDuration === 'none' || animationDuration === '0s').toBeTruthy();
  });

  test('should have proper color contrast', async ({ page }) => {
    // Run axe with color contrast rules specifically
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    // Filter for color contrast violations
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(colorContrastViolations).toEqual([]);
  });

  test('should support voice control patterns', async ({ page }) => {
    // Test that buttons have clear, unique labels for voice control
    const buttonLabels = await page.locator('button').evaluateAll(buttons => 
      buttons.map(button => button.getAttribute('aria-label'))
    );
    
    // Check for unique labels
    const uniqueLabels = new Set(buttonLabels);
    expect(uniqueLabels.size).toBe(buttonLabels.length);
    
    // Check that labels are descriptive
    buttonLabels.forEach(label => {
      expect(label).toBeTruthy();
      expect(label.length).toBeGreaterThan(2);
    });
  });
});
