/**
 * @file useGraph.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Custom React hook to manage graphing equations, viewports, and trace states.
 *
 * @description
 * Handles zooming/pan viewport transformations, adding/removing expression formulas,
 * toggling line visibility, coordinates tracing, and computing local zeros/extrema roots.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import { useState, useCallback, useEffect } from 'react';
import type {
  GraphViewport,
  Expression,
  GraphPoint,
  TraceState,
  AnalysisResult,
} from '@/lib/types';
import { DEFAULT_VIEWPORT, GRAPH_COLORS } from '@/lib/constants';
import { generateId } from '@/lib/utils';
import { findZeros, findExtrema, findIntersections } from '@/lib/engine/analysis';
import { getValue, setValue } from '@/lib/db';

// ---------- HOOKS: GRAPH
export function useGraph() {
  const [viewport, setViewport] = useState<GraphViewport>(DEFAULT_VIEWPORT);
  const [expressions, setExpressions] = useState<Expression[]>([
    {
      id: '1',
      text: 'sin(x)',
      color: GRAPH_COLORS[0],
      visible: true,
    },
    {
      id: '2',
      text: '0.5 * x',
      color: GRAPH_COLORS[1],
      visible: true,
    },
  ]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [crosshair, setCrosshair] = useState<GraphPoint | null>(null);
  const [traceState, setTraceState] = useState<TraceState>({
    active: false,
    expressionId: null,
    point: null,
  });
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

  // ---------- EFFECT (Load graphing inputs from IndexedDB)
  useEffect(() => {
    getValue<{
      expressions: Expression[];
      viewport: GraphViewport;
    }>('graph').then((saved) => {
      // ---------- GUARD (Ensure loaded parameters are populated)
      if (saved) {
        if (saved.expressions) setExpressions(saved.expressions);
        if (saved.viewport) setViewport(saved.viewport);
      }
      setIsLoaded(true);
    });
  }, []);

  // ---------- EFFECT (Save graphing inputs to IndexedDB)
  useEffect(() => {
    // ---------- GUARD (Ensure data hydration has taken place)
    if (!isLoaded) {
      return;
    }

    setValue('graph', {
      expressions,
      viewport,
    });
  }, [expressions, viewport, isLoaded]);

  // ---------- HANDLER: ADD EXPRESSION
  const addExpression = useCallback(() => {
    setExpressions((prev) => {
      // ---------- GUARD (Cap maximum user expressions to prevent performance lag)
      if (prev.length >= 10) {
        return prev;
      }

      const nextColor = GRAPH_COLORS[prev.length % GRAPH_COLORS.length];
      return [
        ...prev,
        {
          id: generateId(),
          text: '',
          color: nextColor,
          visible: true,
        },
      ];
    });
  }, []);

  // ---------- HANDLER: UPDATE EXPRESSION
  const updateExpression = useCallback((id: string, text: string) => {
    setExpressions((prev) => prev.map((e) => (e.id === id ? { ...e, text } : e)));
  }, []);

  // ---------- HANDLER: DELETE EXPRESSION
  const deleteExpression = useCallback((id: string) => {
    setExpressions((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ---------- HANDLER: TOGGLE VISIBILITY
  const toggleVisibility = useCallback((id: string) => {
    setExpressions((prev) => prev.map((e) => (e.id === id ? { ...e, visible: !e.visible } : e)));
  }, []);

  // ---------- HANDLER: ZOOM IN
  const zoomIn = useCallback(() => {
    setViewport((v) => {
      const cx = (v.xMin + v.xMax) / 2;
      const cy = (v.yMin + v.yMax) / 2;
      const rx = (v.xMax - v.xMin) / 2.4;
      const ry = (v.yMax - v.yMin) / 2.4;

      return { xMin: cx - rx, xMax: cx + rx, yMin: cy - ry, yMax: cy + ry };
    });
  }, []);

  // ---------- HANDLER: ZOOM OUT
  const zoomOut = useCallback(() => {
    setViewport((v) => {
      const cx = (v.xMin + v.xMax) / 2;
      const cy = (v.yMin + v.yMax) / 2;
      const rx = ((v.xMax - v.xMin) / 2) * 1.2;
      const ry = ((v.yMax - v.yMin) / 2) * 1.2;

      return { xMin: cx - rx, xMax: cx + rx, yMin: cy - ry, yMax: cy + ry };
    });
  }, []);

  // ---------- HANDLER: RECENTER
  const recenter = useCallback(() => {
    setViewport(DEFAULT_VIEWPORT);
    setAnalysisResults([]);
  }, []);

  // ---------- HANDLER: RUN FIND ZEROS
  const runFindZeros = useCallback(() => {
    const results: AnalysisResult[] = [];

    expressions.forEach((expr) => {
      // ---------- GUARD (Ensure expression line is visible and text exists)
      if (!expr.visible || !expr.text.trim()) {
        return;
      }

      const found = findZeros(expr.id, expr.text, viewport);
      results.push(...found);
    });

    setAnalysisResults(results);
  }, [expressions, viewport]);

  // ---------- HANDLER: RUN FIND EXTREMA
  const runFindExtrema = useCallback(() => {
    const results: AnalysisResult[] = [];

    expressions.forEach((expr) => {
      // ---------- GUARD (Ensure expression line is visible and text exists)
      if (!expr.visible || !expr.text.trim()) {
        return;
      }

      const found = findExtrema(expr.id, expr.text, viewport);
      results.push(...found);
    });

    setAnalysisResults(results);
  }, [expressions, viewport]);

  // ---------- HANDLER: RUN FIND INTERSECTIONS
  const runFindIntersections = useCallback(() => {
    const results: AnalysisResult[] = [];
    const visibleExprs = expressions.filter((e) => e.visible && e.text.trim());

    for (let i = 0; i < visibleExprs.length; i++) {
      for (let j = i + 1; j < visibleExprs.length; j++) {
        const found = findIntersections(visibleExprs[i]!, visibleExprs[j]!, viewport);
        results.push(...found);
      }
    }

    setAnalysisResults(results);
  }, [expressions, viewport]);

  return {
    viewport,
    setViewport,
    expressions,
    addExpression,
    updateExpression,
    deleteExpression,
    toggleVisibility,
    crosshair,
    setCrosshair,
    traceState,
    setTraceState,
    analysisResults,
    zoomIn,
    zoomOut,
    recenter,
    runFindZeros,
    runFindExtrema,
    runFindIntersections,
  };
}
