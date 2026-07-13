/**
 * @file probability.test.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Robust unit tests for the probability & statistical distribution engine.
 *
 * @description
 * Verifies probability density functions (PDF) and cumulative distribution functions (CDF)
 * for normal, binomial, uniform, poisson, and exponential distributions with various parameter queries.
 * Also tests coordinate generator routines for canvas plots.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import { describe, it, expect } from 'vitest';
import {
  calculateDistributionMetrics,
  getPDF,
  getCDF,
  generateDistributionPlotPoints,
} from '@/lib/engine/probability';
import type { DistributionParams, ProbabilityQuery } from '@/lib/types';

// ---------- TESTS: PROBABILITY DISTRIBUTIONS
describe('Probability & Distributions Engine', () => {
  // ---------- TEST: NORMAL DISTRIBUTION
  it('calculates normal distribution PDF and CDF correctly', () => {
    const params: DistributionParams = { type: 'normal', mu: 0, sigma: 1 };
    const pdfAtZero = getPDF('normal', params, 0);
    expect(pdfAtZero).toBeCloseTo(0.398942, 4);

    const cdfAtZero = getCDF('normal', params, 0);
    expect(cdfAtZero).toBeCloseTo(0.5, 4);
  });

  // ---------- TEST: BINOMIAL DISTRIBUTION
  it('calculates binomial distribution stats correctly', () => {
    const params: DistributionParams = { type: 'binomial', n: 10, p: 0.5 };
    const query: ProbabilityQuery = { mode: 'leq', x: 5 };
    const result = calculateDistributionMetrics('binomial', params, query);

    expect(result.mean).toBeCloseTo(5, 4);
    expect(result.variance).toBeCloseTo(2.5, 4);
    expect(result.stdDev).toBeCloseTo(Math.sqrt(2.5), 4);
  });

  // ---------- TEST: POISSON DISTRIBUTION
  it('calculates poisson distribution stats correctly', () => {
    const params: DistributionParams = { type: 'poisson', lambda: 4 };
    const query: ProbabilityQuery = { mode: 'leq', x: 4 };
    const result = calculateDistributionMetrics('poisson', params, query);

    expect(result.mean).toBeCloseTo(4, 4);
    expect(result.variance).toBeCloseTo(4, 4);
    expect(result.stdDev).toBeCloseTo(2, 4);
    expect(result.probability).toBeDefined();
    expect(result.probability!).toBeGreaterThan(0.5);
  });

  // ---------- TEST: EXPONENTIAL DISTRIBUTION
  it('calculates exponential distribution stats correctly', () => {
    const params: DistributionParams = { type: 'exponential', lambda: 2 };
    const query: ProbabilityQuery = { mode: 'geq', x: 1 };
    const result = calculateDistributionMetrics('exponential', params, query);

    expect(result.mean).toBeCloseTo(0.5, 4);
    expect(result.variance).toBeCloseTo(0.25, 4);
    expect(result.stdDev).toBeCloseTo(0.5, 4);
    expect(result.probability).toBeCloseTo(Math.exp(-2), 4);
  });

  // ---------- TEST: UNIFORM DISTRIBUTION
  it('calculates uniform distribution stats correctly', () => {
    const params: DistributionParams = { type: 'uniform', a: 2, b: 8 };
    const query: ProbabilityQuery = { mode: 'between', a: 3, b: 6 };
    const result = calculateDistributionMetrics('uniform', params, query);

    expect(result.mean).toBeCloseTo(5, 4);
    expect(result.variance).toBeCloseTo(3, 4);
    expect(result.probability).toBeCloseTo(0.5, 4);
  });

  // ---------- TEST: PLOT COORDINATES GENERATION
  it('generates coordinate lists for all distribution visual charts', () => {
    const normalParams: DistributionParams = { type: 'normal', mu: 0, sigma: 1 };
    const normalPoints = generateDistributionPlotPoints('normal', normalParams, false, 50);
    expect(normalPoints.length).toBe(50);
    expect(normalPoints[0].x).toBeLessThan(0);
    expect(normalPoints[0].y).toBeDefined();

    const binomialParams: DistributionParams = { type: 'binomial', n: 10, p: 0.5 };
    const binomialPoints = generateDistributionPlotPoints('binomial', binomialParams, false);
    // ---------- DISCRETE STEPS (Binomial distributions should produce exactly n+1 coordinate steps)
    expect(binomialPoints.length).toBe(11);
  });
});
