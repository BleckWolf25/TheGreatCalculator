/**
 * Performance E2E Tests
 * Tests calculator performance and loading metrics
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load within acceptable time limits', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Measure performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              metrics.domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
              metrics.loadComplete = entry.loadEventEnd - entry.loadEventStart;
            }
            if (entry.entryType === 'paint') {
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
              }
            }
          });
          
          resolve(metrics);
        }).observe({ entryTypes: ['navigation', 'paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000);
      });
    });
    
    // First Contentful Paint should be under 1.8s (good threshold)
    if (metrics.fcp) {
      expect(metrics.fcp).toBeLessThan(1800);
    }
  });

  test('should handle rapid button clicks efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const startTime = Date.now();
    
    // Rapidly click buttons to test responsiveness
    for (let i = 0; i < 20; i++) {
      await page.click('button[aria-label="One"]');
      await page.click('button[aria-label="Add"]');
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should handle 40 clicks in under 2 seconds
    expect(totalTime).toBeLessThan(2000);
    
    // UI should remain responsive
    await expect(page.locator('#display')).toBeVisible();
  });

  test('should efficiently handle complex calculations', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Enable scientific mode
    await page.click('.scientific-toggle');
    
    const startTime = performance.now();
    
    // Perform complex calculation: sin(45) * cos(30) + sqrt(16)
    await page.click('button[aria-label="Sine"]');
    await page.click('button[aria-label="Four"]');
    await page.click('button[aria-label="Five"]');
    await page.click('button[aria-label="Multiply"]');
    await page.click('button[aria-label="Cosine"]');
    await page.click('button[aria-label="Three"]');
    await page.click('button[aria-label="Zero"]');
    await page.click('button[aria-label="Add"]');
    await page.click('button[aria-label="Square root"]');
    await page.click('button[aria-label="One"]');
    await page.click('button[aria-label="Six"]');
    await page.click('button[aria-label="Equals"]');
    
    const endTime = performance.now();
    const calculationTime = endTime - startTime;
    
    // Complex calculation should complete in under 500ms
    expect(calculationTime).toBeLessThan(500);
    
    // Result should be displayed
    const result = await page.locator('#display').inputValue();
    expect(result).toBeTruthy();
    expect(result).not.toBe('0');
  });

  test('should maintain performance with scientific mode toggle', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const startTime = performance.now();
    
    // Toggle scientific mode multiple times
    for (let i = 0; i < 10; i++) {
      await page.click('.scientific-toggle');
      await page.waitForTimeout(50); // Small delay to allow animation
    }
    
    const endTime = performance.now();
    const toggleTime = endTime - startTime;
    
    // 10 toggles should complete in under 2 seconds
    expect(toggleTime).toBeLessThan(2000);
    
    // UI should remain responsive
    await expect(page.locator('.calculator-grid')).toBeVisible();
  });

  test('should have minimal memory usage growth', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });
    
    // Perform many operations
    for (let i = 0; i < 100; i++) {
      await page.click('button[aria-label="One"]');
      await page.click('button[aria-label="Add"]');
      await page.click('button[aria-label="Two"]');
      await page.click('button[aria-label="Equals"]');
      await page.click('button[aria-label="Clear all"]');
    }
    
    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      if (performance.memory) {
        return performance.memory.usedJSHeapSize;
      }
      return 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryGrowth = finalMemory - initialMemory;
      const growthPercentage = (memoryGrowth / initialMemory) * 100;
      
      // Memory growth should be less than 50% after 100 operations
      expect(growthPercentage).toBeLessThan(50);
    }
  });

  test('should load resources efficiently', async ({ page }) => {
    // Monitor network requests
    const requests = [];
    page.on('request', request => {
      requests.push({
        url: request.url(),
        resourceType: request.resourceType(),
        size: 0
      });
    });
    
    page.on('response', response => {
      const request = requests.find(req => req.url === response.url());
      if (request) {
        request.size = response.headers()['content-length'] || 0;
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that we're not loading excessive resources
    const jsRequests = requests.filter(req => req.resourceType === 'script');
    const cssRequests = requests.filter(req => req.resourceType === 'stylesheet');
    
    // Should have reasonable number of JS and CSS files
    expect(jsRequests.length).toBeLessThan(10);
    expect(cssRequests.length).toBeLessThan(5);
  });

  test('should handle theme switching efficiently', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const startTime = performance.now();
    
    // Toggle theme multiple times
    for (let i = 0; i < 10; i++) {
      await page.click('#theme-toggle');
      await page.waitForTimeout(50);
    }
    
    const endTime = performance.now();
    const themeToggleTime = endTime - startTime;
    
    // Theme switching should be fast
    expect(themeToggleTime).toBeLessThan(1000);
    
    // UI should remain functional
    await page.click('button[aria-label="One"]');
    await expect(page.locator('#display')).toHaveValue('1');
  });
});
