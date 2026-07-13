/* eslint-disable no-console */
/**
 * @file lighthouse.spec.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Lighthouse performance and accessibility audit spec.
 *
 * @description
 * Programmatically spawns chromium with a debugging port, runs a lighthouse audit,
 * and asserts threshold minimum scores for accessibility, performance, and best practices.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import { test, expect, chromium } from '@playwright/test';
import lighthouse from 'lighthouse';

// ---------- TESTS: LIGHTHOUSE AUDIT
test.describe('Lighthouse Audits', () => {
  // ---------- TEST: CORE METRICS
  test('performance and accessibility should meet thresholds', async () => {
    // ---------- BROWSER SETUP (Launch chromium with active remote debugging port)
    const port = 9222;
    const browser = await chromium.launch({
      args: [`--remote-debugging-port=${port}`],
    });

    // ---------- RUN AUDIT (Trigger lighthouse against the base URL)
    const result = await lighthouse('http://localhost:3007', {
      port,
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });

    // ---------- ASSERTS (Verify audit scores exceed minimum target thresholds)
    const scores = result?.lhr?.categories;
    const perfScore = (scores?.performance?.score || 0) * 100;
    const accScore = (scores?.accessibility?.score || 0) * 100;
    const bpScore = (scores?.['best-practices']?.score || 0) * 100;
    const seoScore = (scores?.seo?.score || 0) * 100;

    console.log(`Lighthouse Performance: ${perfScore}`);
    console.log(`Lighthouse Accessibility: ${accScore}`);
    console.log(`Lighthouse Best Practices: ${bpScore}`);
    console.log(`Lighthouse SEO: ${seoScore}`);

    expect(perfScore).toBeGreaterThanOrEqual(80);
    expect(accScore).toBeGreaterThanOrEqual(80);

    // ---------- CLEANUP (Close chromium connection)
    await browser.close();
  });
});
