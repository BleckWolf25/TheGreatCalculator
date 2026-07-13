/**
 * @file calculator.test.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Robust unit tests for the scientific calculator math engine.
 *
 * @description
 * Verifies correctness of basic arithmetic, trigonometric calculations in degrees and radians,
 * combination and permutation helper evaluation, power operations, percentage processing,
 * divide-by-zero behaviors, invalid syntax handling, and custom previous answer (ans) tracking.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import { describe, it, expect } from 'vitest';
import { evaluateExpression, preprocessExpression } from '@/lib/engine/calculator';

// ---------- TESTS: SCIENTIFIC CALCULATOR
describe('Scientific Calculator Engine', () => {
  // ---------- TEST: ARITHMETIC
  it('evaluates basic arithmetic expressions correctly', () => {
    expect(evaluateExpression('2 + 3 * 4', { angleMode: 'RAD' })).toEqual({
      result: '14',
      error: null,
    });
    expect(evaluateExpression('(10 - 2) / 4', { angleMode: 'RAD' })).toEqual({
      result: '2',
      error: null,
    });
  });

  // ---------- TEST: TRIGONOMETRY DEG
  it('handles trigonometric functions in DEG mode', () => {
    const resSin = evaluateExpression('sin(30)', { angleMode: 'DEG' });
    expect(Number(resSin.result)).toBeCloseTo(0.5, 6);

    const resCos = evaluateExpression('cos(60)', { angleMode: 'DEG' });
    expect(Number(resCos.result)).toBeCloseTo(0.5, 6);

    // ---------- EDGE CASE (Verify tangent asymptote in degree mode evaluates to a very large value)
    const resTan = evaluateExpression('tan(90)', { angleMode: 'DEG' });
    expect(Number(resTan.result)).toBeGreaterThan(1e15);
  });

  // ---------- TEST: TRIGONOMETRY RAD
  it('handles trigonometric functions in RAD mode', () => {
    const resSin = evaluateExpression('sin(pi / 6)', { angleMode: 'RAD' });
    expect(Number(resSin.result)).toBeCloseTo(0.5, 6);

    // ---------- NESTED FUNCTIONS (Evaluate recursive trigonometric function evaluation)
    const resNested = evaluateExpression('sin(cos(0) * pi / 2)', { angleMode: 'RAD' });
    expect(Number(resNested.result)).toBeCloseTo(1.0, 6);
  });

  // ---------- TEST: COMBINATIONS & PERMUTATIONS
  it('evaluates combinations (nCr) and permutations (nPr)', () => {
    expect(evaluateExpression('nCr(5, 2)', { angleMode: 'RAD' })).toEqual({
      result: '10',
      error: null,
    });
    expect(evaluateExpression('nPr(5, 2)', { angleMode: 'RAD' })).toEqual({
      result: '20',
      error: null,
    });

    // ---------- BOUNDARY CASES (Verify 0 choices or equal choice counts evaluate correctly)
    expect(evaluateExpression('nCr(5, 0)', { angleMode: 'RAD' }).result).toBe('1');
    expect(evaluateExpression('nCr(5, 5)', { angleMode: 'RAD' }).result).toBe('1');
    expect(evaluateExpression('nPr(5, 0)', { angleMode: 'RAD' }).result).toBe('1');
  });

  // ---------- TEST: PERCENTAGES
  it('preprocesses percentage notations into correct divisions', () => {
    expect(preprocessExpression('50%')).toBe('(50/100)');
    expect(evaluateExpression('50%', { angleMode: 'RAD' }).result).toBe('0.5');
    expect(evaluateExpression('10% + 5%', { angleMode: 'RAD' }).result).toBe('0.15');
  });

  // ---------- TEST: CONSTANTS
  it('handles special mathematical constants like pi and e', () => {
    const resPi = evaluateExpression('pi', { angleMode: 'RAD' });
    expect(Number(resPi.result)).toBeCloseTo(3.14159265359, 6);

    const resE = evaluateExpression('e', { angleMode: 'RAD' });
    expect(Number(resE.result)).toBeCloseTo(2.71828182846, 6);
  });

  // ---------- TEST: DIVIDE BY ZERO
  it('returns appropriate boundaries on divide by zero errors', () => {
    const resDivZero = evaluateExpression('1 / 0', { angleMode: 'RAD' });
    expect(resDivZero.result).toBe('Infinity');
    expect(resDivZero.error).toBe('Overflow');

    const resNan = evaluateExpression('0 / 0', { angleMode: 'RAD' });
    expect(resNan.result).toBe('Error');
    expect(resNan.error).toBe('Undefined result');
  });

  // ---------- TEST: PREVIOUS RESULT KEYWORD
  it('replaces ANS and ans keywords with the previous result option parameter value', () => {
    expect(evaluateExpression('ans + 5', { angleMode: 'RAD', previousResult: '10' }).result).toBe(
      '15'
    );
    expect(evaluateExpression('ANS * 2', { angleMode: 'RAD', previousResult: '3' }).result).toBe(
      '6'
    );

    // ---------- DEFAULT VALUE (Verify keyword defaults to zero if no previous results exist)
    expect(evaluateExpression('ans', { angleMode: 'RAD' }).result).toBe('0');
  });

  // ---------- TEST: ERROR HANDLING
  it('returns appropriate error on syntax errors', () => {
    const res = evaluateExpression('2 + * 3', { angleMode: 'RAD' });
    expect(res.result).toBe('Error');
    expect(res.error).toBeTruthy();

    const resEmpty = evaluateExpression('   ', { angleMode: 'RAD' });
    expect(resEmpty.result).toBe('0');
    expect(resEmpty.error).toBeNull();
  });

  // ---------- TEST: EXACT CAS FRACTION OUTPUT
  it('formats decimals as fractions when exactCAS option is active', () => {
    // Verify decimal float converts to simplified fraction representation
    expect(evaluateExpression('3 / 4', { exactCAS: true }).result).toBe('3/4');
    expect(evaluateExpression('2 / 6', { exactCAS: true }).result).toBe('1/3');
  });
});
