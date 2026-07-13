/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @file formatter.test.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Robust unit tests for visual math and string formatting functions.
 *
 * @description
 * Verifies standard number output conversions, float precision limiters,
 * scientific notations, and basic display replacements for expressions.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import { describe, it, expect } from 'vitest';
import { formatResultDisplay, formatExpressionDisplay } from '@/lib/engine/formatter';

// ---------- TESTS: FORMATTER UTILITIES
describe('Formatter Utilities', () => {
  // ---------- TEST: RESULT DISPLAY
  it('formats display outputs with correct precision', () => {
    // ---------- NORMAL NUMBERS
    expect(formatResultDisplay(1.23456, 3)).toBe('1.235');
    expect(formatResultDisplay('0.0000000001')).toContain('e');
    expect(formatResultDisplay(12345678901234)).toContain('e');

    // ---------- PRECISION LIMITS
    expect(formatResultDisplay(1.23456789012345, 10)).toBe('1.2345678901');
    expect(formatResultDisplay(1.23456789012345, 5)).toBe('1.23457');

    // ---------- SCIENTIFIC BOUNDARIES (Verify very small float scales convert to exponential form)
    expect(formatResultDisplay(9.99e-10)).toBe('9.9900e-10');
    expect(formatResultDisplay(1.5e15)).toBe('1.5000e15');

    // ---------- SPECIAL KEYWORDS
    expect(formatResultDisplay('Infinity')).toBe('Infinity');
    expect(formatResultDisplay('-Infinity')).toBe('-Infinity');
    expect(formatResultDisplay('Error')).toBe('Error');
    expect(formatResultDisplay('NaN')).toBe('NaN');

    // ---------- INVALID INPUTS (Confirm non-numeric or missing arguments return default boundaries)
    expect(formatResultDisplay(null as any)).toBe('0');
    expect(formatResultDisplay(undefined as any)).toBe('0');
    expect(formatResultDisplay('not_a_number')).toBe('not_a_number');
  });

  // ---------- TEST: EXPRESSION DISPLAY
  it('formats math operator characters for display text output', () => {
    expect(formatExpressionDisplay('2*3/4-5')).toBe('2×3÷4−5');
    expect(formatExpressionDisplay('x*y-z')).toBe('x×y−z');
    expect(formatExpressionDisplay('')).toBe('');
    expect(formatExpressionDisplay(null as any)).toBe('');
  });
});
