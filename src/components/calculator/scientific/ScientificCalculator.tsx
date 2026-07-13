/**
 * @file ScientificCalculator.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Scientific calculator container coordinating input display and keypad.
 *
 * @description
 * Integrates custom useCalculator hooks with standard useKeyboard event handlers to
 * drive operations, display inputs/results, and render keypad action buttons.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */

'use client';

// ---------- IMPORTS
import React from 'react';
import { useCalculator } from '@/hooks/useCalculator';
import { useKeyboard } from '@/hooks/useKeyboard';
import { Display } from './Display';
import { ScientificKeypad } from './ScientificKeypad';

// ---------- TYPES
interface ScientificCalculatorProps {
  onHistoryAdd: (expr: string, res: string) => void;
  exactCAS?: boolean;
}

// ---------- COMPONENT: SCIENTIFIC CALCULATOR
export function ScientificCalculator({ onHistoryAdd, exactCAS }: ScientificCalculatorProps) {
  const calc = useCalculator({ onHistoryAdd, exactCAS });

  // ---------- KEYBOARD ATTACHMENT (Bind hotkeys to calculator handlers)
  useKeyboard({
    onInput: calc.handleButtonPress,
    onEvaluate: calc.handleEvaluate,
    onDelete: calc.handleDelete,
    onClear: calc.handleClear,
  });

  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-col border-x border-(--outline-variant) bg-(--surface) shadow-sm dark:border-(--outline) dark:bg-(--surface)">
      <Display
        expression={calc.expression}
        result={calc.result}
        angleMode={calc.angleMode}
        hasMemory={calc.memory.hasValue}
        isShiftActive={calc.isShiftActive}
        error={calc.error}
      />
      <ScientificKeypad
        onButtonPress={calc.handleButtonPress}
        isShiftActive={calc.isShiftActive}
        angleMode={calc.angleMode}
      />
    </div>
  );
}
