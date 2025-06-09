/**
 * Operations Engine Unit Tests
 * Tests for mathematical operations and calculations with ES modules
 */

// Import the OperationsEngine module directly
import OperationsEngine from '../../src/js/modules/core/operations.js';

describe('OperationsEngine', () => {
  let operations;

  beforeEach(() => {
    operations = new OperationsEngine();
  });

  describe('Basic Arithmetic Operations', () => {
    test('should add two numbers correctly', () => {
      expect(operations.add(2, 3)).toBe(5);
      expect(operations.add(-1, 1)).toBe(0);
      expect(operations.add(0.1, 0.2)).toBeCloseTo(0.3);
    });

    test('should subtract two numbers correctly', () => {
      expect(operations.subtract(5, 3)).toBe(2);
      expect(operations.subtract(0, 5)).toBe(-5);
      expect(operations.subtract(-2, -3)).toBe(1);
    });

    test('should multiply two numbers correctly', () => {
      expect(operations.multiply(3, 4)).toBe(12);
      expect(operations.multiply(-2, 3)).toBe(-6);
      expect(operations.multiply(0, 100)).toBe(0);
    });

    test('should divide two numbers correctly', () => {
      expect(operations.divide(10, 2)).toBe(5);
      expect(operations.divide(7, 2)).toBe(3.5);
      expect(operations.divide(-10, 2)).toBe(-5);
    });

    test('should handle division by zero', () => {
      expect(() => operations.divide(10, 0)).toThrow('Division by zero');
      expect(() => operations.divide(-5, 0)).toThrow('Division by zero');
    });

    test('should perform basic operations through basicOperation method', () => {
      expect(operations.basicOperation(2, 3, '+')).toBe(5);
      expect(operations.basicOperation(5, 2, '-')).toBe(3);
      expect(operations.basicOperation(3, 4, '*')).toBe(12);
      expect(operations.basicOperation(10, 2, '/')).toBe(5);
    });

    test('should throw error for unknown operator', () => {
      expect(() => operations.basicOperation(2, 3, '%')).toThrow('Unknown operator: %');
    });
  });

  describe('Scientific Operations', () => {
    test('should calculate square root correctly', () => {
      expect(operations.sqrt(9)).toBe(3);
      expect(operations.sqrt(16)).toBe(4);
      expect(operations.sqrt(2)).toBeCloseTo(1.414, 3);
    });

    test('should handle negative square root', () => {
      expect(() => operations.sqrt(-1)).toThrow('Square root of negative number');
    });

    test('should calculate power correctly', () => {
      expect(operations.power(2, 3)).toBe(8);
      expect(operations.power(5, 0)).toBe(1);
      expect(operations.power(10, 2)).toBe(100);
    });

    test('should calculate factorial correctly', () => {
      expect(operations.factorial(0)).toBe(1);
      expect(operations.factorial(1)).toBe(1);
      expect(operations.factorial(5)).toBe(120);
      expect(operations.factorial(3)).toBe(6);
    });

    test('should handle negative factorial', () => {
      expect(() => operations.factorial(-1)).toThrow('Factorial requires non-negative integer');
    });

    test('should calculate logarithms correctly', () => {
      expect(operations.log10(10)).toBeCloseTo(Math.log10(10));
      expect(operations.ln(Math.E)).toBeCloseTo(1);
    });
  });

  describe('Trigonometric Functions', () => {
    test('should calculate sine correctly', () => {
      expect(operations.sin(0, true)).toBeCloseTo(0, 10);
      expect(operations.sin(90, true)).toBeCloseTo(1, 10);
      expect(operations.sin(180, true)).toBeCloseTo(0, 10);
    });

    test('should calculate cosine correctly', () => {
      expect(operations.cos(0, true)).toBeCloseTo(1, 10);
      expect(operations.cos(90, true)).toBeCloseTo(0, 10);
      expect(operations.cos(180, true)).toBeCloseTo(-1, 10);
    });

    test('should calculate tangent correctly', () => {
      expect(operations.tan(0, true)).toBeCloseTo(0, 10);
      expect(operations.tan(45, true)).toBeCloseTo(1, 10);
    });

    test('should handle radians mode', () => {
      expect(operations.sin(0, false)).toBeCloseTo(0, 10);
      expect(operations.cos(0, false)).toBeCloseTo(1, 10);
      expect(operations.sin(Math.PI / 2, false)).toBeCloseTo(1, 10);
    });
  });

  describe('Expression Evaluation', () => {
    test('should evaluate simple expressions', () => {
      expect(operations.evaluateExpression('2+3')).toBe(5);
      expect(operations.evaluateExpression('10-4')).toBe(6);
      expect(operations.evaluateExpression('3*4')).toBe(12);
      expect(operations.evaluateExpression('15/3')).toBe(5);
    });

    test('should evaluate complex expressions with parentheses', () => {
      expect(operations.evaluateExpression('(2+3)*4')).toBe(20);
      expect(operations.evaluateExpression('2*(3+4)')).toBe(14);
      expect(operations.evaluateExpression('((1+2)*3)+4')).toBe(13);
    });

    test('should handle operator precedence', () => {
      expect(operations.evaluateExpression('2+3*4')).toBe(14);
      expect(operations.evaluateExpression('10-2*3')).toBe(4);
      expect(operations.evaluateExpression('8/2+3')).toBe(7);
    });

    test('should validate parentheses', () => {
      expect(operations.areParenthesesBalanced('(1+2)')).toBe(true);
      expect(operations.areParenthesesBalanced('((1+2)*3)')).toBe(true);
      expect(operations.areParenthesesBalanced('(1+2')).toBe(false);
      expect(operations.areParenthesesBalanced('1+2)')).toBe(false);
      expect(operations.areParenthesesBalanced('((1+2)')).toBe(false);
    });
  });

  describe('Number Formatting', () => {
    test('should format results correctly', () => {
      expect(operations.formatResult(123.456)).toBe('123.456');
      expect(operations.formatResult(1000)).toBe('1000');
      expect(operations.formatResult(0.5)).toBe('0.5');
    });

    test('should handle scientific notation for large numbers', () => {
      const largeNumber = 1000000000000;
      const result = operations.formatResult(largeNumber);
      expect(result).toMatch(/e/);
    });

    test('should handle scientific notation for small numbers', () => {
      const smallNumber = 0.000000001;
      const result = operations.formatResult(smallNumber);
      expect(result).toMatch(/e/);
    });
  });

  describe('Precision Handling', () => {
    test('should handle floating point precision', () => {
      const result = operations.add(0.1, 0.2);
      expect(result).toBeCloseTo(0.3);
    });

    test('should limit precision to avoid floating point errors', () => {
      const result = operations.divide(1, 3);
      expect(result.toString().length).toBeLessThan(20);
    });
  });
});
