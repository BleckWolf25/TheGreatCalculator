/**
 * @file Display.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Output panel component displaying expressions, results, and state badges.
 *
 * @description
 * Renders active mode indicators (DEG/RAD, M, 2nd shift), previews the current formula
 * with operator formatting, and displays the main evaluation result or syntax error.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import React from 'react';
import type { AngleMode } from '@/lib/types';
import { formatExpressionDisplay } from '@/lib/engine/formatter';
import { MathView } from './MathView';

// ---------- TYPES
interface DisplayProps {
  expression: string;
  result: string;
  previousExpression?: string;
  angleMode: AngleMode;
  hasMemory: boolean;
  isShiftActive: boolean;
  error: string | null;
}

// ---------- COMPONENT: DISPLAY
export function Display({
  expression,
  result,
  angleMode,
  hasMemory,
  isShiftActive,
  error,
}: DisplayProps) {
  return (
    <div
      className="flex shrink-0 flex-col justify-between border-b border-(--outline-variant) bg-(--surface-container-lowest) px-4 py-4 select-text md:py-6 dark:border-(--outline) dark:bg-(--surface-container-lowest)"
      role="region"
      aria-label="Calculator display"
    >
      <div className="mb-2 flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <span
            className={`rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold ${
              angleMode === 'DEG'
                ? 'bg-(--primary-container) text-(--on-primary-container)'
                : 'bg-(--surface-container-high) text-(--on-surface-variant)'
            }`}
          >
            {angleMode}
          </span>
          {hasMemory && (
            <span className="rounded bg-(--tertiary-container) px-1.5 py-0.5 font-mono text-[11px] font-bold text-(--on-tertiary-container)">
              M
            </span>
          )}
          {isShiftActive && (
            <span className="rounded bg-(--tertiary) px-1.5 py-0.5 font-mono text-[11px] font-bold text-(--on-tertiary)">
              2nd
            </span>
          )}
        </div>
      </div>

      <div className="mb-2 w-full scrollbar-none overflow-x-auto text-right whitespace-nowrap">
        <MathView
          expression={expression ? formatExpressionDisplay(expression) : '0'}
          className="font-mono text-base tracking-wide text-(--on-surface-variant) md:text-xl"
        />
      </div>

      <div className="w-full scrollbar-none overflow-x-auto text-right whitespace-nowrap">
        <span
          className={`font-mono font-semibold tracking-tight ${
            error
              ? 'text-2xl text-(--error) md:text-3xl'
              : 'text-3xl text-(--on-surface) md:text-5xl'
          }`}
        >
          {error || result}
        </span>
      </div>
    </div>
  );
}
