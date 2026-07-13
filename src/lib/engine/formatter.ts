/**
 * @file formatter.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Utility functions for visual math formatting.
 *
 * @description
 * Implements clean output formatting for numbers (truncating float artifacts, enforcing
 * display boundaries, exponential notations) and formats input operators with display symbols.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
// ---------- ENGINE METHODS
export function formatResultDisplay(value: string | number, precision = 10): string {
  // ---------- GUARD (Ensure value is defined before formatting)
  if (value === null || value === undefined) {
    return '0';
  }

  const str = String(value);

  // ---------- GUARD (Return non-numeric system keywords immediately)
  if (str === 'Error' || str === 'Infinity' || str === '-Infinity' || str === 'NaN') {
    return str;
  }

  const num = Number(str);

  // ---------- GUARD (Return non-parsable strings immediately)
  if (Number.isNaN(num)) {
    return str;
  }

  // ---------- SCIENTIFIC FORMATTING (Use standard exponential notation for extreme float scale limits)
  if (num !== 0 && (Math.abs(num) >= 1e12 || Math.abs(num) < 1e-9)) {
    return num.toExponential(4).replace('+', '');
  }

  const factor = Math.pow(10, precision);
  const rounded = Math.round((num + Number.EPSILON) * factor) / factor;

  return String(rounded);
}

export function formatExpressionDisplay(expr: string): string {
  // ---------- GUARD (Ensure expression is not empty before formatting symbols)
  if (!expr) {
    return '';
  }

  return expr.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−');
}
