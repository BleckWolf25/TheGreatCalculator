/**
 * @file useCalculator.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Custom React hook to coordinate scientific calculator expressions and memory state.
 *
 * @description
 * Handles expression composition, evaluation results, delete tokens backspaces, and DEG/RAD
 * angle modes. State is read/saved from IndexedDB and history entries are updated accordingly.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import { useState, useCallback, useEffect } from 'react';
import type { AngleMode, MemoryState } from '@/lib/types';
import { evaluateExpression } from '@/lib/engine/calculator';
import { formatResultDisplay } from '@/lib/engine/formatter';
import { getValue, setValue } from '@/lib/db';

// ---------- TYPES
export interface UseCalculatorProps {
  onHistoryAdd?: (expr: string, res: string) => void;
  exactCAS?: boolean;
}

// ---------- HOOKS: USE CALCULATOR
export function useCalculator({ onHistoryAdd, exactCAS }: UseCalculatorProps = {}) {
  const [expression, setExpression] = useState<string>('');
  const [result, setResult] = useState<string>('0');
  const [previousResult, setPreviousResult] = useState<string>('0');
  const [error, setError] = useState<string | null>(null);
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [isShiftActive, setIsShiftActive] = useState<boolean>(false);
  const [memory, setMemory] = useState<MemoryState>({
    value: 0,
    hasValue: false,
  });
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // ---------- EFFECT (Load calculator state from IndexedDB)
  useEffect(() => {
    getValue<{
      expression: string;
      result: string;
      previousResult: string;
      angleMode: AngleMode;
      memory: MemoryState;
    }>('calculator').then((saved) => {
      // ---------- GUARD (Ensure saved state exists before assigning values)
      if (saved) {
        if (saved.expression !== undefined) setExpression(saved.expression);
        if (saved.result !== undefined) setResult(saved.result);
        if (saved.previousResult !== undefined) setPreviousResult(saved.previousResult);
        if (saved.angleMode !== undefined) setAngleMode(saved.angleMode);
        if (saved.memory !== undefined) setMemory(saved.memory);
      }
      setIsLoaded(true);
    });
  }, []);

  // ---------- EFFECT (Save calculator state to IndexedDB)
  useEffect(() => {
    // ---------- GUARD (Verify database hydration has completed)
    if (!isLoaded) {
      return;
    }

    setValue('calculator', {
      expression,
      result,
      previousResult,
      angleMode,
      memory,
    });
  }, [expression, result, previousResult, angleMode, memory, isLoaded]);

  // ---------- HANDLER: CLEAR
  const handleClear = useCallback(() => {
    setExpression('');
    setResult('0');
    setError(null);
  }, []);

  // ---------- HANDLER: DELETE
  const handleDelete = useCallback(() => {
    setError(null);
    setExpression((prev) => {
      // ---------- GUARD (Ensure expression is not empty before processing backspace)
      if (!prev) {
        return '';
      }

      const tokens = [
        'sin(',
        'cos(',
        'tan(',
        'asin(',
        'acos(',
        'atan(',
        'sinh(',
        'cosh(',
        'tanh(',
        'asinh(',
        'acosh(',
        'atanh(',
        'ln(',
        'log10(',
        'sqrt(',
        'cbrt(',
        'abs(',
        'nPr(',
        'nCr(',
      ];

      // ---------- TOKEN REMOVAL (Cleanly pop full mathematical function names)
      for (const token of tokens) {
        if (prev.endsWith(token)) {
          return prev.slice(0, -token.length);
        }
      }

      return prev.slice(0, -1);
    });
  }, []);

  // ---------- HANDLER: EVALUATE
  const handleEvaluate = useCallback(() => {
    // ---------- GUARD (Ensure expression has content)
    if (!expression.trim()) {
      return;
    }

    const { result: evalRes, error: evalErr } = evaluateExpression(expression, {
      angleMode,
      previousResult,
      exactCAS,
    });

    if (evalErr) {
      setError(evalErr);
      setResult('Error');
    } else {
      setError(null);
      setResult(evalRes);
      setPreviousResult(evalRes);

      if (onHistoryAdd) {
        onHistoryAdd(expression, evalRes);
      }
    }
  }, [expression, angleMode, previousResult, exactCAS, onHistoryAdd]);

  // ---------- HANDLER: BUTTON PRESS
  const handleButtonPress = useCallback(
    (val: string) => {
      setError(null);

      // ---------- SPECIAL ACTIONS (Intercept non-character button presses)
      if (val === 'clear') {
        handleClear();
        return;
      }
      if (val === 'delete') {
        handleDelete();
        return;
      }
      if (val === 'evaluate') {
        handleEvaluate();
        return;
      }
      if (val === 'shift') {
        setIsShiftActive((s) => !s);
        return;
      }
      if (val === 'toggleAngle') {
        setAngleMode((a) => (a === 'DEG' ? 'RAD' : 'DEG'));
        return;
      }
      if (val === 'mc') {
        setMemory({ value: 0, hasValue: false });
        return;
      }
      if (val === 'mr') {
        // ---------- GUARD (Verify memory holds a active value)
        if (memory.hasValue) {
          setExpression((prev) => prev + formatResultDisplay(memory.value));
        }
        return;
      }
      if (val === 'm+' || val === 'm-') {
        const currentVal = Number(result !== 'Error' ? result : '0');

        // ---------- GUARD (Verify target value is numeric)
        if (!Number.isNaN(currentVal)) {
          const delta = val === 'm+' ? currentVal : -currentVal;
          setMemory((m) => ({
            value: m.value + delta,
            hasValue: true,
          }));
        }
        return;
      }
      if (val === 'negate') {
        setExpression((prev) => {
          // ---------- GUARD (Ensure expression exists)
          if (!prev) {
            return '-';
          }
          if (prev.startsWith('-')) {
            return prev.slice(1);
          }
          return '-' + prev;
        });
        return;
      }

      setExpression((prev) => prev + val);

      // ---------- SHIFT RESET (Clear 2nd function keypress trigger)
      if (isShiftActive) {
        setIsShiftActive(false);
      }
    },
    [handleClear, handleDelete, handleEvaluate, isShiftActive, memory, result]
  );

  return {
    expression,
    setExpression,
    result,
    previousResult,
    error,
    angleMode,
    isShiftActive,
    memory,
    handleButtonPress,
    handleEvaluate,
    handleDelete,
    handleClear,
  };
}
