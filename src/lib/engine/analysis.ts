/**
 * @file analysis.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Numerical analysis methods for finding zeros and extrema.
 *
 * @description
 * Compiles mathematical expressions and applies numerical refinement techniques (bisection,
 * local gradient checks) to identify function roots and local minima/maxima within a viewport.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import * as math from 'mathjs';
import type { GraphViewport, AnalysisResult } from '../types';

// ---------- HELPER METHODS
function compileExpr(exprText: string): math.EvalFunction | null {
  try {
    const clean = exprText.replace(/^y\s*=\s*/i, '').trim();
    return math.compile(clean);
  } catch {
    return null;
  }
}

// ---------- ENGINE METHODS
export function findZeros(
  exprId: string,
  exprText: string,
  viewport: GraphViewport
): AnalysisResult[] {
  const fn = compileExpr(exprText);

  // ---------- GUARD (Verify expression compiles successfully)
  if (!fn) {
    return [];
  }

  const results: AnalysisResult[] = [];
  const samples = 200;
  const step = (viewport.xMax - viewport.xMin) / samples;

  for (let i = 0; i < samples; i++) {
    const x1 = viewport.xMin + i * step;
    const x2 = x1 + step;

    try {
      const y1 = Number(fn.evaluate({ x: x1 }));
      const y2 = Number(fn.evaluate({ x: x2 }));

      if (Number.isFinite(y1) && Number.isFinite(y2)) {
        // ---------- BISECTION ROOT FINDING (Refine intervals with sign changes)
        if (y1 * y2 <= 0) {
          let left = x1;
          let right = x2;

          for (let iter = 0; iter < 15; iter++) {
            const mid = (left + right) / 2;
            const yMid = Number(fn.evaluate({ x: mid }));

            if (y1 * yMid <= 0) {
              right = mid;
            } else {
              left = mid;
            }
          }

          const rootX = (left + right) / 2;
          const rootY = Number(fn.evaluate({ x: rootX }));

          // ---------- GUARD (Verify root value resolves close to zero and lies in bounds)
          if (Math.abs(rootY) < 0.1 && rootX >= viewport.xMin && rootX <= viewport.xMax) {
            // ---------- GUARD (Verify root is not a duplicate of a previously found root)
            if (!results.some((r) => Math.abs(r.point.x - rootX) < step * 0.5)) {
              results.push({
                type: 'zero',
                expressionId: exprId,
                point: { x: Number(rootX.toFixed(6)), y: 0 },
              });
            }
          }
        }
      }
    } catch {
      // Ignore evaluation errors gracefully
    }
  }

  return results;
}

export function findExtrema(
  exprId: string,
  exprText: string,
  viewport: GraphViewport
): AnalysisResult[] {
  const fn = compileExpr(exprText);

  // ---------- GUARD (Verify expression compiles successfully)
  if (!fn) {
    return [];
  }

  const results: AnalysisResult[] = [];
  const samples = 200;
  const step = (viewport.xMax - viewport.xMin) / samples;

  for (let i = 1; i < samples - 1; i++) {
    const xPrev = viewport.xMin + (i - 1) * step;
    const xCurr = viewport.xMin + i * step;
    const xNext = viewport.xMin + (i + 1) * step;

    try {
      const yPrev = Number(fn.evaluate({ x: xPrev }));
      const yCurr = Number(fn.evaluate({ x: xCurr }));
      const yNext = Number(fn.evaluate({ x: xNext }));

      if (Number.isFinite(yPrev) && Number.isFinite(yCurr) && Number.isFinite(yNext)) {
        // ---------- EXTREMA DETECTION (Compare adjacent points to determine local minima/maxima)
        if (yCurr < yPrev && yCurr < yNext) {
          results.push({
            type: 'minimum',
            expressionId: exprId,
            point: { x: Number(xCurr.toFixed(4)), y: Number(yCurr.toFixed(4)) },
          });
        } else if (yCurr > yPrev && yCurr > yNext) {
          results.push({
            type: 'maximum',
            expressionId: exprId,
            point: { x: Number(xCurr.toFixed(4)), y: Number(yCurr.toFixed(4)) },
          });
        }
      }
    } catch {
      // Ignore evaluation errors gracefully
    }
  }

  return results;
}

// ---------- METHOD: FIND INTERSECTIONS
export function findIntersections(
  expr1: { id: string; text: string },
  expr2: { id: string; text: string },
  viewport: GraphViewport
): AnalysisResult[] {
  const fn1 = compileExpr(expr1.text);
  const fn2 = compileExpr(expr2.text);

  // ---------- GUARD (Verify both expressions compile successfully)
  if (!fn1 || !fn2) {
    return [];
  }

  const results: AnalysisResult[] = [];
  const samples = 200;
  const step = (viewport.xMax - viewport.xMin) / samples;

  for (let i = 0; i < samples; i++) {
    const x1 = viewport.xMin + i * step;
    const x2 = x1 + step;

    try {
      const diff1 = Number(fn1.evaluate({ x: x1 })) - Number(fn2.evaluate({ x: x1 }));
      const diff2 = Number(fn1.evaluate({ x: x2 })) - Number(fn2.evaluate({ x: x2 }));

      if (Number.isFinite(diff1) && Number.isFinite(diff2)) {
        // ---------- BISECTION ROOT FINDING (Refine intervals where the difference function changes sign)
        if (diff1 * diff2 <= 0) {
          let left = x1;
          let right = x2;

          for (let iter = 0; iter < 15; iter++) {
            const mid = (left + right) / 2;
            const diffMid = Number(fn1.evaluate({ x: mid })) - Number(fn2.evaluate({ x: mid }));

            if (diff1 * diffMid <= 0) {
              right = mid;
            } else {
              left = mid;
            }
          }

          const rootX = (left + right) / 2;
          const diffY = Number(fn1.evaluate({ x: rootX })) - Number(fn2.evaluate({ x: rootX }));
          const rootY = Number(fn1.evaluate({ x: rootX }));

          // ---------- GUARD (Verify intersection difference is near zero and lies within bounds)
          if (
            Math.abs(diffY) < 0.1 &&
            rootX >= viewport.xMin &&
            rootX <= viewport.xMax &&
            Number.isFinite(rootY)
          ) {
            // ---------- GUARD (Verify intersection is unique within step radius)
            if (!results.some((r) => Math.abs(r.point.x - rootX) < step * 0.5)) {
              results.push({
                type: 'intersection',
                expressionIds: [expr1.id, expr2.id],
                point: { x: Number(rootX.toFixed(6)), y: Number(rootY.toFixed(6)) },
              });
            }
          }
        }
      }
    } catch {
      // Ignore evaluation errors gracefully
    }
  }

  return results;
}
