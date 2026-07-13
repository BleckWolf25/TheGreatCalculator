/**
 * @file calculator.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Math evaluation engine using Math.js.
 *
 * @description
 * Parses and evaluates scientific calculator math expressions, handles percentage notation,
 * converts DEG/RAD angle modes for trigonometric expressions, and formats float results.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import * as math from 'mathjs';

// ---------- TYPES
export interface EvalOptions {
  angleMode?: 'DEG' | 'RAD';
  previousResult?: string;
  exactCAS?: boolean;
}

export interface EvalResult {
  result: string;
  error: string | null;
}

// ---------- ENGINE METHODS
export function preprocessExpression(expr: string, options: EvalOptions = {}): string {
  let processed = expr.trim();

  // ---------- GUARD (Ensure expression has content before preprocessing)
  if (!processed) {
    return '0';
  }

  // ---------- TRANSFORMATION (Map custom display characters to standard operators)
  processed = processed
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'pi')
    .replace(/\bANS\b/gi, options.previousResult || '0')
    .replace(/\bans\b/gi, options.previousResult || '0');

  // ---------- CONVERSION (Translate percentage values into fractions)
  processed = processed.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');

  // ---------- CONVERSION (Expand permutations nPr and combinations nCr functions)
  processed = processed.replace(
    /nPr\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/g,
    'combinations($1, $2) * factorial($2)'
  );
  processed = processed.replace(/nCr\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/g, 'combinations($1, $2)');

  // ---------- ANGLE ADJUSTMENTS (Inject radian scale factors into trig functions if DEG)
  if (options.angleMode === 'DEG') {
    processed = processed.replace(/\b(sin|cos|tan)\s*\(([^)]+)\)/g, (_match, func, arg) => {
      return `${func}((${arg}) * pi / 180)`;
    });

    processed = processed.replace(/\b(asin|acos|atan)\s*\(([^)]+)\)/g, (_match, func, arg) => {
      return `(${func}(${arg}) * 180 / pi)`;
    });
  }

  return processed;
}

export function evaluateExpression(expr: string, options: EvalOptions = {}): EvalResult {
  // ---------- GUARD (Ensure expression is not empty before processing evaluation)
  if (!expr || !expr.trim()) {
    return { result: '0', error: null };
  }

  try {
    const preprocessed = preprocessExpression(expr, options);
    const evaluated = math.evaluate(preprocessed);

    // ---------- GUARD (Verify parsed value is defined)
    if (evaluated === undefined || evaluated === null) {
      return { result: '0', error: null };
    }

    // ---------- GUARD (Reject incomplete functions or operators in output)
    if (typeof evaluated === 'function') {
      return { result: 'Error', error: 'Incomplete expression' };
    }

    // ---------- NUMERIC CHECKS (Verify finite boundaries for JS floats)
    if (typeof evaluated === 'number') {
      if (!Number.isFinite(evaluated)) {
        if (Number.isNaN(evaluated)) {
          return { result: 'Error', error: 'Undefined result' };
        }
        return { result: evaluated > 0 ? 'Infinity' : '-Infinity', error: 'Overflow' };
      }
    }

    // ---------- EXACT CAS CHECK (Return simplified fraction representation if exactCAS enabled)
    if (options.exactCAS && typeof evaluated === 'number' && Number.isFinite(evaluated)) {
      try {
        const frac = math.fraction(evaluated) as { n: number; d: number; s: number };
        if (frac && frac.d > 1 && frac.d <= 10000) {
          const signStr = frac.s < 0 ? '-' : '';
          return { result: `${signStr}${frac.n}/${frac.d}`, error: null };
        }
      } catch {
        // Fallback to standard decimal formatting if fraction conversion fails
      }
    }

    // ---------- FORMATTING (Format decimal layout layout to limit float errors)
    const formatted = math.format(evaluated, { precision: 12 });
    return { result: formatted, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Syntax error';
    return {
      result: 'Error',
      error: message,
    };
  }
}
