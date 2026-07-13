/**
 * @file MathKeypad.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Desktop/graphing calculator mathematical keypad component.
 *
 * @description
 * Renders the compact button grid for graphing formula inputs (variables, trig,
 * numbers, basic operator actions) and registers click event listeners.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import React from 'react';
import { GRAPH_KEYPAD } from '@/lib/constants';
import { KeypadButton } from '../scientific/KeypadButton';

// ---------- TYPES
interface MathKeypadProps {
  onButtonPress: (value: string) => void;
}

// ---------- COMPONENT: MATH KEYPAD
export function MathKeypad({ onButtonPress }: MathKeypadProps) {
  return (
    <div
      className="grid shrink-0 grid-cols-4 gap-1.5 border-t border-(--outline-variant) bg-(--surface-container) p-2 dark:bg-(--surface-container)"
      role="group"
      aria-label="Graphic math keypad"
    >
      {GRAPH_KEYPAD.map((row, rIdx) =>
        row.map((btn, cIdx) => (
          <KeypadButton
            key={`${rIdx}-${cIdx}-${btn.label}`}
            label={btn.label}
            variant={btn.variant}
            aria-label={btn.ariaLabel || btn.label}
            onClick={() => onButtonPress(btn.value)}
          />
        ))
      )}
    </div>
  );
}
