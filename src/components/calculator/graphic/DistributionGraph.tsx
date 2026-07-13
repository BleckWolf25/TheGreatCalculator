/**
 * @file DistributionGraph.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary A canvas-based React component for rendering probability distribution graphs.
 *
 * @description
 * Generates plot points and renders probability density/mass functions (PDF/PMF) or cumulative distribution functions (CDF) dynamically based on the current distribution parameters, query inputs, and dark mode styling.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import React, { useRef, useEffect, useCallback } from 'react';
import type { DistributionType, DistributionParams, ProbabilityQuery } from '@/lib/types';
import { generateDistributionPlotPoints } from '@/lib/engine/probability';

// ---------- TYPES
interface DistributionGraphProps {
  distributionType: DistributionType;
  params: DistributionParams;
  query: ProbabilityQuery;
  showCDF: boolean;
}

// ---------- COMPONENT: DISTRIBUTION GRAPH
export function DistributionGraph({
  distributionType,
  params,
  query,
  showCDF,
}: DistributionGraphProps) {
  // ---------- FIELDS
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ---------- METHOD: DRAW
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width === 0 || height === 0) return;

    // ---------- RETINA SCALING (Sync canvas buffer dimensions to device pixel ratio to prevent blur)
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    const isDark = document.documentElement.classList.contains('dark');
    ctx.fillStyle = isDark ? '#10141a' : '#f9f9fb';
    ctx.fillRect(0, 0, width, height);

    const points = generateDistributionPlotPoints(distributionType, params, showCDF, 300);
    if (points.length === 0) {
      ctx.restore();
      return;
    }

    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMax = Math.max(...ys, 0.1);

    const paddingX = 40;
    const paddingY = 30;
    const plotWidth = width - paddingX * 2;
    const plotHeight = height - paddingY * 2;

    const toSx = (x: number) => paddingX + ((x - xMin) / (xMax - xMin || 1)) * plotWidth;
    const toSy = (y: number) => height - paddingY - (y / yMax) * plotHeight;

    // ---------- AXES (Draw horizontal baseline)
    ctx.strokeStyle = isDark ? '#434656' : '#8d90a2';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(paddingX, height - paddingY);
    ctx.lineTo(width - paddingX, height - paddingY);
    ctx.stroke();

    const isDiscrete = distributionType === 'binomial' || distributionType === 'poisson';

    if (isDiscrete) {
      // ---------- DISCRETE BARS (Render vertical bar representations for binomial and poisson)
      const barSpan = plotWidth / Math.max(1, points.length);
      const barWidth = Math.max(4, barSpan * 0.7);

      points.forEach((pt) => {
        const sx = toSx(pt.x);
        const sy = toSy(pt.y);

        let isInQuery = false;
        if (query.mode === 'leq' && query.x !== undefined) isInQuery = pt.x <= query.x;
        else if (query.mode === 'geq' && query.x !== undefined) isInQuery = pt.x >= query.x;
        else if (query.mode === 'between' && query.a !== undefined && query.b !== undefined)
          isInQuery = pt.x >= query.a && pt.x <= query.b;

        ctx.fillStyle = isInQuery
          ? isDark
            ? '#0057ff'
            : '#0043c8'
          : isDark
            ? '#262a31'
            : '#e2e2e4';
        ctx.fillRect(sx - barWidth / 2, sy, barWidth, height - paddingY - sy);
      });
    } else {
      // ---------- SHADED PROBABILITY (Highlight the requested area matching the query range)
      ctx.fillStyle = isDark ? 'rgba(0, 87, 255, 0.3)' : 'rgba(0, 67, 200, 0.2)';
      ctx.beginPath();
      ctx.moveTo(toSx(points[0].x), height - paddingY);

      points.forEach((pt) => {
        let isInQuery = false;
        if (query.mode === 'leq' && query.x !== undefined) isInQuery = pt.x <= query.x;
        else if (query.mode === 'geq' && query.x !== undefined) isInQuery = pt.x >= query.x;
        else if (query.mode === 'between' && query.a !== undefined && query.b !== undefined)
          isInQuery = pt.x >= query.a && pt.x <= query.b;

        const sx = toSx(pt.x);
        const sy = isInQuery ? toSy(pt.y) : height - paddingY;
        ctx.lineTo(sx, sy);
      });

      ctx.lineTo(toSx(points[points.length - 1].x), height - paddingY);
      ctx.closePath();
      ctx.fill();

      // ---------- DENSITY CURVE (Draw the smooth continuous probability curve)
      ctx.strokeStyle = isDark ? '#b6c4ff' : '#0043c8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      points.forEach((pt, i) => {
        const sx = toSx(pt.x);
        const sy = toSy(pt.y);
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.stroke();
    }

    ctx.restore();
  }, [distributionType, params, query, showCDF]);

  // ---------- LIFECYCLE (Handle canvas animation frames for redrawing on dependency change)
  useEffect(() => {
    let frameId: number;
    const render = () => {
      draw();
      frameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(frameId);
  }, [draw]);

  // ---------- RENDER (Return the canvas element)
  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full select-none"
      aria-label="Distribution graph"
    />
  );
}
