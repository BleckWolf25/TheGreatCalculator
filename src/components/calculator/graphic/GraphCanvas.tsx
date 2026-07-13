/**
 * @file GraphCanvas.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Renders a 2D mathematical graph on an HTML5 canvas with zoom, pan, and interactive tracing.
 *
 * @description
 * This component provides an interactive canvas-based viewport for rendering mathematical expressions,
 * drawing coordinate grid systems with ticks, supporting user viewport navigation via mouse drag and wheel,
 * displaying key graph points like zeros and extrema, and tracking cursor position with a crosshair tool.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import React, { useRef, useEffect, useCallback } from 'react';
import type { GraphViewport, Expression, GraphPoint, AnalysisResult } from '@/lib/types';
import {
  worldToScreen,
  screenToWorld,
  evaluateFunctionSeries,
  calculateGridTicks,
} from '@/lib/engine/graph';

// ---------- TYPES
interface GraphCanvasProps {
  expressions: Expression[];
  viewport: GraphViewport;
  onViewportChange: (updater: (prev: GraphViewport) => GraphViewport) => void;
  crosshair: GraphPoint | null;
  onCrosshairChange: (pt: GraphPoint | null) => void;
  analysisResults: AnalysisResult[];
}

// ---------- COMPONENT: GRAPH CANVAS
export function GraphCanvas({
  expressions,
  viewport,
  onViewportChange,
  crosshair,
  onCrosshairChange,
  analysisResults,
}: GraphCanvasProps) {
  // ---------- FIELDS
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pointsCacheRef = useRef<Record<string, (GraphPoint | null)[]>>({});

  // ---------- EFFECT (Initialize Web Worker for off-main-thread function evaluation)
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined') {
      try {
        workerRef.current = new Worker(
          new URL('../../../lib/engine/graph.worker.ts', import.meta.url)
        );
        workerRef.current.onmessage = (event) => {
          const { id, points } = event.data;
          pointsCacheRef.current[String(id)] = points;
        };
      } catch {
        workerRef.current = null;
      }
    }
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  // ---------- METHOD: HANDLE MOUSE DOWN
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  // ---------- METHOD: HANDLE MOUSE UP
  const handleMouseUp = () => {
    isDraggingRef.current = false;
    lastMousePosRef.current = null;
  };

  // ---------- METHOD: HANDLE WHEEL
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15;

    // ---------- ZOOM (Scale viewport bounds proportionally around the focal center)
    onViewportChange((prev) => {
      const cx = (prev.xMin + prev.xMax) / 2;
      const cy = (prev.yMin + prev.yMax) / 2;
      const rx = ((prev.xMax - prev.xMin) / 2) * factor;
      const ry = ((prev.yMax - prev.yMin) / 2) * factor;
      return {
        xMin: cx - rx,
        xMax: cx + rx,
        yMin: cy - ry,
        yMax: cy + ry,
      };
    });
  };

  // ---------- METHOD: HANDLE MOUSE MOVE
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // ---------- PAN OR TRACE (Pan viewport when dragging, otherwise update crosshair position)
    if (isDraggingRef.current && lastMousePosRef.current) {
      const dxScreen = e.clientX - lastMousePosRef.current.x;
      const dyScreen = e.clientY - lastMousePosRef.current.y;

      const dxWorld = (dxScreen / rect.width) * (viewport.xMax - viewport.xMin);
      const dyWorld = (dyScreen / rect.height) * (viewport.yMax - viewport.yMin);

      onViewportChange((prev) => ({
        xMin: prev.xMin - dxWorld,
        xMax: prev.xMax - dxWorld,
        yMin: prev.yMin + dyWorld,
        yMax: prev.yMax + dyWorld,
      }));

      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    } else {
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const pt = screenToWorld({ sx, sy }, viewport, rect.width, rect.height);
      onCrosshairChange(pt);
    }
  };

  // ---------- METHOD: DRAW
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;

    // ---------- RESIZING (Update canvas buffer dimensions when client layout dimensions change)
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // ---------- BACKGROUND (Draw context background matching the color theme)
    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? '#10141a' : '#f9f9fb';
    ctx.fillRect(0, 0, width, height);

    // ---------- GRID (Calculate and draw vertical/horizontal grid lines and labels)
    const gridColor = isDark ? '#1e2228' : '#e8e8ea';
    const axisColor = isDark ? '#5f6472' : '#8d90a2';
    const textColor = isDark ? '#8d90a2' : '#5f5e5e';

    const xTicks = calculateGridTicks(viewport.xMin, viewport.xMax, 8);
    const yTicks = calculateGridTicks(viewport.yMin, viewport.yMax, 8);

    ctx.lineWidth = 1;
    ctx.font = '11px "JetBrains Mono", monospace';

    xTicks.forEach((x) => {
      const { sx } = worldToScreen({ x, y: 0 }, viewport, width, height);
      ctx.strokeStyle = gridColor;
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.stroke();

      // ---------- X TICK LABEL (Show X value near the axis, clamped to canvas edge)
      if (x !== 0) {
        const yAxisScreen = worldToScreen({ x: 0, y: 0 }, viewport, width, height).sy;
        const labelY =
          yAxisScreen >= 0 && yAxisScreen <= height - 15 ? yAxisScreen + 14 : height - 6;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(String(x), sx, labelY);
      }
    });

    yTicks.forEach((y) => {
      const { sy } = worldToScreen({ x: 0, y }, viewport, width, height);
      ctx.strokeStyle = gridColor;
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.stroke();

      // ---------- Y TICK LABEL (Show Y value near the axis, clamped to canvas edge)
      if (y !== 0) {
        const xAxisScreen = worldToScreen({ x: 0, y: 0 }, viewport, width, height).sx;
        const labelX = xAxisScreen >= 25 && xAxisScreen <= width ? xAxisScreen - 6 : 28;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'right';
        ctx.fillText(String(y), labelX, sy + 3);
      }
    });

    // ---------- AXES (Draw the primary horizontal and vertical reference lines)
    const originScreen = worldToScreen({ x: 0, y: 0 }, viewport, width, height);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;

    if (originScreen.sx >= 0 && originScreen.sx <= width) {
      ctx.beginPath();
      ctx.moveTo(originScreen.sx, 0);
      ctx.lineTo(originScreen.sx, height);
      ctx.stroke();
    }

    if (originScreen.sy >= 0 && originScreen.sy <= height) {
      ctx.beginPath();
      ctx.moveTo(0, originScreen.sy);
      ctx.lineTo(width, originScreen.sy);
      ctx.stroke();
    }

    // ---------- PLOTTING (Plot active function expressions onto the coordinate space)
    expressions.forEach((expr) => {
      if (!expr.visible || !expr.text.trim()) return;

      if (workerRef.current) {
        workerRef.current.postMessage({
          id: expr.id,
          expression: expr.text,
          viewport,
          numSamples: Math.floor(width),
        });
      }

      const points =
        pointsCacheRef.current[expr.id] ||
        evaluateFunctionSeries(expr.text, viewport, Math.floor(width));
      ctx.strokeStyle = expr.color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.beginPath();

      let isPathOpen = false;

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        if (pt === null) {
          isPathOpen = false;
          continue;
        }

        const sc = worldToScreen(pt, viewport, width, height);

        // ---------- ASYMPTOTE BREAK (Discard segment if vertical jump exceeds 1.5× canvas to avoid spike artifacts)
        if (isPathOpen && i > 0 && points[i - 1]) {
          const prevSc = worldToScreen(points[i - 1]!, viewport, width, height);
          if (Math.abs(sc.sy - prevSc.sy) > height * 1.5) {
            isPathOpen = false;
          }
        }

        if (!isPathOpen) {
          ctx.moveTo(sc.sx, sc.sy);
          isPathOpen = true;
        } else {
          ctx.lineTo(sc.sx, sc.sy);
        }
      }
      ctx.stroke();
    });

    // ---------- ANALYSES (Draw indicators for computed roots, intersections, and extrema points)
    analysisResults.forEach((res) => {
      const sc = worldToScreen(res.point, viewport, width, height);
      ctx.fillStyle =
        res.type === 'zero' ? '#16a34a' : res.type === 'intersection' ? '#9333ea' : '#d97706';
      ctx.beginPath();
      ctx.arc(sc.sx, sc.sy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    });

    // ---------- CROSSHAIR (Draw projection lines and coordinates bubble under the cursor)
    if (crosshair) {
      const sc = worldToScreen(crosshair, viewport, width, height);
      ctx.strokeStyle = isDark ? '#b6c4ff' : '#0057ff';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      ctx.beginPath();
      ctx.moveTo(sc.sx, 0);
      ctx.lineTo(sc.sx, height);
      ctx.moveTo(0, sc.sy);
      ctx.lineTo(width, sc.sy);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isDark ? '#b6c4ff' : '#0057ff';
      ctx.beginPath();
      ctx.arc(sc.sx, sc.sy, 4, 0, Math.PI * 2);
      ctx.fill();

      // ---------- TOOLTIP BOUNDS (Offset label box left or up if it would overflow the canvas edge)
      const label = `(${crosshair.x.toFixed(3)}, ${crosshair.y.toFixed(3)})`;
      const labelWidth = ctx.measureText(label).width + 12;
      const tooltipX = sc.sx + labelWidth + 15 > width ? sc.sx - labelWidth - 10 : sc.sx + 10;
      const tooltipY = sc.sy - 28 < 5 ? sc.sy + 15 : sc.sy - 28;

      ctx.fillStyle = isDark ? '#1c2026' : '#ffffff';
      ctx.strokeStyle = axisColor;
      ctx.lineWidth = 1;
      ctx.fillRect(tooltipX, tooltipY, labelWidth, 22);
      ctx.strokeRect(tooltipX, tooltipY, labelWidth, 22);

      ctx.fillStyle = isDark ? '#dfe2eb' : '#1a1c1d';
      ctx.textAlign = 'left';
      ctx.fillText(label, tooltipX + 6, tooltipY + 15);
    }

    ctx.restore();
  }, [expressions, viewport, analysisResults, crosshair]);

  // ---------- METHOD: REDRAW EFFECT
  useEffect(() => {
    let frameId: number;
    // ---------- ANIMATION LOOP (Drive continuous redrawing via requestAnimationFrame)
    const render = () => {
      draw();
      frameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frameId);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className="block h-full w-full cursor-crosshair select-none"
      aria-label="Graph canvas"
    />
  );
}
