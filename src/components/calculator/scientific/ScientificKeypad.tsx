/**
 * @file ScientificKeypad.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Layout panel component structuring scientific button grids.
 *
 * @description
 * Renders the scientific button array matrix configuration, translates shift modifiers,
 * dynamically handles DEG/RAD toggle text, and binds keypress clicks.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */

'use client';

// ---------- IMPORTS
import React from 'react';
import { SCIENTIFIC_KEYPAD } from '@/lib/constants';
import { KeypadButton } from './KeypadButton';
import type { AngleMode } from '@/lib/types';

// ---------- TYPES
interface ScientificKeypadProps {
  onButtonPress: (value: string) => void;
  isShiftActive: boolean;
  angleMode: AngleMode;
}

// ---------- COMPONENT: SCIENTIFIC KEYPAD
export function ScientificKeypad({
  onButtonPress,
  isShiftActive,
  angleMode,
}: ScientificKeypadProps) {
  return (
    <div
      className="grid min-h-0 flex-1 grid-cols-6 gap-1.5 overflow-y-auto bg-(--surface-container) p-2 md:gap-2 md:p-4 dark:bg-(--surface-container)"
      role="group"
      aria-label="Scientific keypad"
    >
      {SCIENTIFIC_KEYPAD.map((row, rowIndex) =>
        row.map((btn, colIndex) => {
          const effectiveValue = isShiftActive && btn.shiftValue ? btn.shiftValue : btn.value;

          // ---------- LABEL SELECTION (Swap toggle button text dynamically depending on active state)
          const label =
            btn.value === 'toggleAngle' ? (angleMode === 'DEG' ? 'RAD' : 'DEG') : btn.label;

          return (
            <KeypadButton
              key={`${rowIndex}-${colIndex}-${btn.label}`}
              label={label}
              shiftLabel={btn.shiftLabel}
              isShiftActive={isShiftActive}
              variant={btn.variant}
              aria-label={btn.ariaLabel || label}
              onClick={() => onButtonPress(effectiveValue)}
            />
          );
        })
      )}
    </div>
  );
}
