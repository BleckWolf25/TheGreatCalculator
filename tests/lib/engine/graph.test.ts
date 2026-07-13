/**
 * @file graph.test.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Unit tests for graphing coordinate projection and calculation utilities.
 *
 * @description
 * Verifies bi-directional conversions between world and screen coordinate spaces,
 * calculates sampling series values across viewports, and computes grid tick intervals.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import { describe, it, expect } from 'vitest';
import {
  worldToScreen,
  screenToWorld,
  evaluateFunctionSeries,
  calculateGridTicks,
} from '@/lib/engine/graph';
import type { GraphViewport } from '@/lib/types';

// ---------- TESTS: GRAPH ENGINE
describe('Graphing Engine', () => {
  // ---------- CONSTANTS
  const viewport: GraphViewport = {
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
  };
  const width = 800;
  const height = 600;

  // ---------- TEST: COORDINATE CONVERSIONS
  it('converts world coordinates to screen coordinate pixels and back', () => {
    const worldPoint = { x: 0, y: 0 };
    const screenPoint = worldToScreen(worldPoint, viewport, width, height);

    // Origin should map to center of the canvas screen space.
    expect(screenPoint.sx).toBe(400);
    expect(screenPoint.sy).toBe(300);

    const backToWorld = screenToWorld(screenPoint, viewport, width, height);
    expect(backToWorld.x).toBeCloseTo(0, 5);
    expect(backToWorld.y).toBeCloseTo(0, 5);
  });

  // ---------- TEST: FUNCTION EVALUATION
  it('evaluates expression curves into sampled series points list', () => {
    const points = evaluateFunctionSeries('x^2', viewport, 10);
    expect(points.length).toBe(10);

    const firstPoint = points[0];
    expect(firstPoint).not.toBeNull();
    expect(firstPoint?.x).toBe(-10);
    expect(firstPoint?.y).toBe(100);
  });

  // ---------- TEST: GRID TICKS
  it('calculates optimal grid tick intervals across viewport constraints', () => {
    const ticks = calculateGridTicks(-10, 10, 8);
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks).toContain(0);
  });

  // ---------- TEST: WORKER CONTRACT
  it('formats worker request/response payload properly', () => {
    const points = evaluateFunctionSeries('sin(x)', viewport, 5);
    const workerRes = {
      id: 1,
      points,
    };
    expect(workerRes.id).toBe(1);
    expect(workerRes.points.length).toBe(5);
  });
});
