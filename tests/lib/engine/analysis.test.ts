/**
 * @file analysis.test.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Unit tests for the numerical analysis engine.
 *
 * @description
 * Tests root finding (zeros) and local extrema calculations (minima/maxima)
 * on mathematical functions within a viewport.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import { describe, it, expect } from 'vitest';
import { findZeros, findExtrema, findIntersections } from '@/lib/engine/analysis';
import type { GraphViewport } from '@/lib/types';

// ---------- TESTS: NUMERICAL ANALYSIS
describe('Numerical Analysis Engine', () => {
  // ---------- CONSTANTS
  const defaultViewport: GraphViewport = {
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
  };

  // ---------- TEST: ROOT FINDING
  it('finds zeros (roots) of a quadratic function x^2 - 4', () => {
    const zeros = findZeros('expr-1', 'x^2 - 4', defaultViewport);
    expect(zeros.length).toBeGreaterThanOrEqual(2);

    const xValues = zeros.map((z) => z.point.x).sort((a, b) => a - b);
    expect(xValues[0]).toBeCloseTo(-2, 1);
    expect(xValues[xValues.length - 1]).toBeCloseTo(2, 1);
  });

  it('finds zeros (roots) of a cubic function x^3 - 3*x', () => {
    const zeros = findZeros('expr-2', 'x^3 - 3*x', defaultViewport);
    expect(zeros.length).toBeGreaterThanOrEqual(3);

    const xValues = zeros.map((z) => z.point.x).sort((a, b) => a - b);
    expect(xValues[0]).toBeCloseTo(-1.732, 2);
    expect(xValues[1]).toBeCloseTo(0, 2);
    expect(xValues[xValues.length - 1]).toBeCloseTo(1.732, 2);
  });

  // ---------- TEST: LOCAL EXTREMA
  it('finds local extrema of a parabola -x^2 + 4', () => {
    const extrema = findExtrema('expr-3', '-x^2 + 4', defaultViewport);
    expect(extrema.length).toBeGreaterThanOrEqual(1);

    const maxResult = extrema.find((e) => e.type === 'maximum');
    expect(maxResult).toBeDefined();
    expect(maxResult?.point.x).toBeCloseTo(0, 1);
    expect(maxResult?.point.y).toBeCloseTo(4, 1);
  });

  it('finds local extrema of a cubic function x^3 - 3*x', () => {
    const extrema = findExtrema('expr-4', 'x^3 - 3*x', defaultViewport);
    expect(extrema.length).toBeGreaterThanOrEqual(2);

    const maxResult = extrema.find((e) => e.type === 'maximum');
    expect(maxResult).toBeDefined();
    expect(maxResult?.point.x).toBeCloseTo(-1, 1);
    expect(maxResult?.point.y).toBeCloseTo(2, 1);

    const minResult = extrema.find((e) => e.type === 'minimum');
    expect(minResult).toBeDefined();
    expect(minResult?.point.x).toBeCloseTo(1, 1);
    expect(minResult?.point.y).toBeCloseTo(-2, 1);
  });

  // ---------- TEST: INVALID PARSING
  it('handles invalid function text inputs gracefully without throwing', () => {
    const zeros = findZeros('expr-5', 'x + * 2', defaultViewport);
    expect(zeros).toEqual([]);

    const extrema = findExtrema('expr-5', 'x + * 2', defaultViewport);
    expect(extrema).toEqual([]);
  });

  // ---------- TEST: EDGE VIEWPORTS
  it('handles boundary and degenerate viewports correctly', () => {
    // ---------- DEGENERATE VIEWPORT (Verify zero span coordinates return empty root lists)
    const zeroSpanViewport: GraphViewport = {
      xMin: 0,
      xMax: 0,
      yMin: -10,
      yMax: 10,
    };
    const zeros = findZeros('expr-6', 'x^2 - 4', zeroSpanViewport);
    expect(zeros).toEqual([]);
  });

  // ---------- TEST: FUNCTION INTERSECTIONS
  it('finds intersection points between two functions x and x^2', () => {
    const inters = findIntersections(
      { id: 'f1', text: 'x' },
      { id: 'f2', text: 'x^2' },
      defaultViewport
    );
    expect(inters.length).toBeGreaterThanOrEqual(2);

    const xCoords = inters.map((pt) => pt.point.x).sort((a, b) => a - b);
    expect(xCoords[0]).toBeCloseTo(0, 1);
    expect(xCoords[xCoords.length - 1]).toBeCloseTo(1, 1);
  });
});
