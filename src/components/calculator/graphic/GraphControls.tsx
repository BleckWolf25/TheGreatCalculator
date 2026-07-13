/**
 * @file GraphControls.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Floating toolbar panel component containing zoom, recenter, and roots triggers.
 *
 * @description
 * Positions button icons for zooming in/out, re-focusing viewport coordinates,
 * resolving function zeros, and finding local extrema peak curves on the canvas.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import React from 'react';

// ---------- TYPES
interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRecenter: () => void;
  onFindZeros: () => void;
  onFindExtrema: () => void;
  onFindIntersections?: () => void;
}

// ---------- COMPONENT: GRAPH CONTROLS
export function GraphControls({
  onZoomIn,
  onZoomOut,
  onRecenter,
  onFindZeros,
  onFindExtrema,
  onFindIntersections,
}: GraphControlsProps) {
  return (
    <div
      className="absolute top-4 right-4 z-20 flex flex-col gap-1 rounded-lg border border-(--outline-variant) bg-(--surface) p-1.5 shadow-md dark:bg-(--surface-container)"
      role="toolbar"
      aria-label="Graph tools"
    >
      <button
        type="button"
        onClick={onZoomIn}
        className="flex h-9 w-9 items-center justify-center rounded text-(--on-surface) transition-colors hover:bg-(--surface-container-high)"
        aria-label="Zoom In"
        title="Zoom In"
      >
        <span className="material-symbols-outlined text-xl">add</span>
      </button>

      <button
        type="button"
        onClick={onZoomOut}
        className="flex h-9 w-9 items-center justify-center rounded text-(--on-surface) transition-colors hover:bg-(--surface-container-high)"
        aria-label="Zoom Out"
        title="Zoom Out"
      >
        <span className="material-symbols-outlined text-xl">remove</span>
      </button>

      <button
        type="button"
        onClick={onRecenter}
        className="flex h-9 w-9 items-center justify-center rounded text-(--on-surface) transition-colors hover:bg-(--surface-container-high)"
        aria-label="Recenter Graph"
        title="Recenter Origin"
      >
        <span className="material-symbols-outlined text-xl">my_location</span>
      </button>

      <div className="my-1 h-px bg-(--outline-variant)" />

      <button
        type="button"
        onClick={onFindZeros}
        className="flex h-9 w-9 items-center justify-center rounded text-(--primary) transition-colors hover:bg-(--surface-container-high)"
        aria-label="Find Zeros (Roots)"
        title="Find Zeros (Roots)"
      >
        <span className="material-symbols-outlined text-xl">functions</span>
      </button>

      <button
        type="button"
        onClick={onFindExtrema}
        className="flex h-9 w-9 items-center justify-center rounded text-(--tertiary) transition-colors hover:bg-(--surface-container-high)"
        aria-label="Find Extrema (Min/Max)"
        title="Find Extrema (Min/Max)"
      >
        <span className="material-symbols-outlined text-xl">timeline</span>
      </button>

      {onFindIntersections && (
        <button
          type="button"
          onClick={onFindIntersections}
          className="flex h-9 w-9 items-center justify-center rounded text-purple-600 transition-colors hover:bg-(--surface-container-high) dark:text-purple-400"
          aria-label="Find Intersections"
          title="Find Intersections"
        >
          <span className="material-symbols-outlined text-xl">hub</span>
        </button>
      )}
    </div>
  );
}
