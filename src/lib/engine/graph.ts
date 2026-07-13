/**
 * @file graph.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Math graphing coordinate projection and calculation engine.
 *
 * @description
 * Implements linear projection math between world coordinates and pixel canvas screen boundaries,
 * evaluates continuous function series arrays with discontinuity filters, and calculates tick intervals.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import * as math from 'mathjs';
import type { GraphViewport, GraphPoint, ScreenPoint } from '../types';

// ---------- ENGINE METHODS
export function worldToScreen(
  point: GraphPoint,
  viewport: GraphViewport,
  canvasWidth: number,
  canvasHeight: number
): ScreenPoint {
  const sx = ((point.x - viewport.xMin) / (viewport.xMax - viewport.xMin)) * canvasWidth;
  const sy = ((viewport.yMax - point.y) / (viewport.yMax - viewport.yMin)) * canvasHeight;

  return { sx, sy };
}

export function screenToWorld(
  screen: ScreenPoint,
  viewport: GraphViewport,
  canvasWidth: number,
  canvasHeight: number
): GraphPoint {
  const x = (screen.sx / canvasWidth) * (viewport.xMax - viewport.xMin) + viewport.xMin;
  const y = viewport.yMax - (screen.sy / canvasHeight) * (viewport.yMax - viewport.yMin);

  return { x, y };
}

export function evaluateFunctionSeries(
  exprText: string,
  viewport: GraphViewport,
  numSamples = 400
): (GraphPoint | null)[] {
  // ---------- GUARD (Ensure formula text is not empty before parsing)
  if (!exprText || !exprText.trim()) {
    return [];
  }

  let compiled: math.EvalFunction;

  try {
    const cleanExpr = exprText.replace(/^y\s*=\s*/i, '').trim();
    compiled = math.compile(cleanExpr);
  } catch {
    return [];
  }

  const points: (GraphPoint | null)[] = [];
  const step = (viewport.xMax - viewport.xMin) / Math.max(1, numSamples - 1);

  // ---------- EVALUATION (Sample function outputs across the viewport width)
  for (let i = 0; i < numSamples; i++) {
    const x = viewport.xMin + i * step;

    try {
      const y = compiled.evaluate({ x, e: Math.E, pi: Math.PI });

      if (typeof y === 'number' && Number.isFinite(y)) {
        points.push({ x, y });
      } else {
        points.push(null);
      }
    } catch {
      points.push(null);
    }
  }

  return points;
}

export function calculateGridTicks(min: number, max: number, targetTicks = 8): number[] {
  const span = max - min;

  // ---------- GUARD (Ensure viewport span has positive non-zero range)
  if (span <= 0) {
    return [0];
  }

  const rawStep = span / targetTicks;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;

  let step = magnitude;

  if (residual > 5) {
    step = 10 * magnitude;
  } else if (residual > 2) {
    step = 5 * magnitude;
  } else if (residual > 1) {
    step = 2 * magnitude;
  }

  const firstTick = Math.ceil(min / step) * step;
  const ticks: number[] = [];

  for (let t = firstTick; t <= max; t += step) {
    ticks.push(Number(t.toFixed(10)));
  }

  return ticks;
}
