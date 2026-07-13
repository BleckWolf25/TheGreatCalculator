/**
 * @file graph.worker.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Web Worker background thread for high-performance function sampling.
 *
 * @description
 * Offloads mathematical evaluation of function series from the main UI thread to prevent
 * frame drops or lag during intensive plotting across high-resolution viewports.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import { evaluateFunctionSeries } from './graph';
import type { GraphViewport, GraphPoint } from '../types';

// ---------- TYPES
export interface WorkerGraphRequest {
  id: number;
  expression: string;
  viewport: GraphViewport;
  numSamples: number;
}

export interface WorkerGraphResponse {
  id: number;
  points: (GraphPoint | null)[];
}

// ---------- WORKER MESSAGE LISTENER
self.onmessage = (event: MessageEvent<WorkerGraphRequest>) => {
  const { id, expression, viewport, numSamples } = event.data;

  try {
    const points = evaluateFunctionSeries(expression, viewport, numSamples);
    const response: WorkerGraphResponse = { id, points };
    self.postMessage(response);
  } catch {
    const response: WorkerGraphResponse = { id, points: [] };
    self.postMessage(response);
  }
};
