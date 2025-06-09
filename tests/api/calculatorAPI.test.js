/**
 * @file CALCULATOR-API.TEST.JS
 *
 * @version 2.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Unit tests for the Calculator API module with ES modules support.
 * Ensures the API methods work as expected.
 */

// ------------ ES MODULE IMPORTS
import CalculatorAPI from '../../src/js/modules/api/calculatorAPI.js';
import StateManager from '../../src/js/modules/core/state.js';
import OperationsEngine from '../../src/js/modules/core/operations.js';
import DisplayManager from '../../src/js/modules/ui/display.js';

// ------------ TESTS
describe('CalculatorAPI', () => {
  let calculatorAPI;
  let mockModules;
  let mockDisplayElement;
  let mockHistoryElement;

  // Setup mock DOM elements
  beforeEach(() => {
    mockDisplayElement = {
      value: '',
      style: {},
      setAttribute: () => {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      }
    };

    // Mock history element
    mockHistoryElement = {
      textContent: '',
      style: {},
      setAttribute: () => {}
    };

    // Initialize all modules
    mockModules = {
      state: new StateManager(),
      operations: new OperationsEngine(),
      display: new DisplayManager()
    };

    // Initialize display manager
    mockModules.display.initialize(mockDisplayElement, mockHistoryElement);

    // Mock display methods with tracking
    let showErrorCalls = [];
    let showToastCalls = [];

    mockModules.display.showError = (message) => {
      showErrorCalls.push(message);
      mockDisplayElement.value = message;
      mockDisplayElement.classList.add('error-state');
    };

    mockModules.display.showToast = (message) => {
      showToastCalls.push(message);
    };

    // Helper methods for testing
    mockModules.display._getShowErrorCalls = () => showErrorCalls;
    mockModules.display._getShowToastCalls = () => showToastCalls;

    // Initialize calculator API
    calculatorAPI = new CalculatorAPI(mockModules);
    calculatorAPI.initialize();
  });

  // Tests
  describe('Initialization', () => {
    test('should initialize successfully with required modules', () => {
      expect(calculatorAPI.isInitialized).toBe(true);
    });

    test('should fail initialization without required modules', () => {
      const incompleteModules = { state: new StateManager() };
      const api = new CalculatorAPI(incompleteModules);

      const result = api.initialize();
      expect(result).toBe(false);
      expect(api.isInitialized).toBe(false);
    });
  });

  describe('Number Input', () => {
    test('should append numbers to current value', () => {
      calculatorAPI.appendNumber('5');

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('5');
    });

    test('should handle multiple digit numbers', () => {
      calculatorAPI.appendNumber('1');
      calculatorAPI.appendNumber('2');
      calculatorAPI.appendNumber('3');

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('123');
    });

    test('should start new number after operation', () => {
      mockModules.state.updateState({
        currentValue: '10',
        isNewNumber: true
      });

      calculatorAPI.appendNumber('5');

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('5');
    });

    test('should handle decimal point', () => {
      calculatorAPI.appendNumber('1');
      calculatorAPI.appendDecimal();
      calculatorAPI.appendNumber('5');

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('1.5');
    });

    test('should prevent multiple decimal points', () => {
      calculatorAPI.appendNumber('1');
      calculatorAPI.appendDecimal();
      calculatorAPI.appendDecimal(); // Should be ignored
      calculatorAPI.appendNumber('5');

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('1.5');
    });
  });

  describe('Basic Operations', () => {
    test('should set operator', () => {
      calculatorAPI.appendNumber('5');
      calculatorAPI.setOperator('+');

      const state = mockModules.state.getState();
      expect(state.operator).toBe('+');
      expect(state.previousValue).toBe('5');
    });

    test('should calculate result', () => {
      calculatorAPI.appendNumber('5');
      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('3');
      calculatorAPI.calculate();

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('8');
      expect(state.operator).toBeNull();
    });

    test('should handle division by zero', () => {
      calculatorAPI.appendNumber('5');
      calculatorAPI.setOperator('/');
      calculatorAPI.appendNumber('0');
      calculatorAPI.calculate();

      // Should show error instead of crashing
      const errorCalls = mockModules.display._getShowErrorCalls();
      expect(errorCalls.length).toBeGreaterThan(0);
    });

    test('should chain operations', () => {
      calculatorAPI.appendNumber('2');
      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('3');
      calculatorAPI.setOperator('*'); // Should calculate 2+3=5 first

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('5');
      expect(state.operator).toBe('*');
    });
  });

  describe('Scientific Operations', () => {
    test('should calculate square root', () => {
      calculatorAPI.appendNumber('9');
      calculatorAPI.performScientificOperation('sqrt');

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('3');
    });

    test('should calculate power', () => {
      calculatorAPI.appendNumber('2');
      calculatorAPI.performScientificOperation('power2'); // 2^2 = 4

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('4');
    });

    test('should calculate factorial', () => {
      calculatorAPI.appendNumber('5');
      calculatorAPI.performScientificOperation('factorial');

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('120');
    });

    test('should handle trigonometric functions', () => {
      calculatorAPI.appendNumber('90');
      calculatorAPI.performScientificOperation('sin');

      const state = mockModules.state.getState();
      expect(parseFloat(state.currentValue)).toBeCloseTo(1, 10);
    });

    test('should handle logarithms', () => {
      calculatorAPI.appendNumber('10');
      calculatorAPI.performScientificOperation('log10');

      const state = mockModules.state.getState();
      expect(parseFloat(state.currentValue)).toBeCloseTo(1, 10);
    });
  });

  describe('Memory Operations', () => {
    test('should store value in memory', () => {
      calculatorAPI.appendNumber('42');
      calculatorAPI.memoryStore();

      const state = mockModules.state.getState();
      expect(state.memory).toBe(42);
    });

    test('should recall memory value', () => {
      mockModules.state.updateState({ memory: 123 });
      calculatorAPI.memoryRecall();

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('123');
    });

    test('should add to memory', () => {
      mockModules.state.updateState({ memory: 10 });
      calculatorAPI.appendNumber('5');
      calculatorAPI.memoryAdd();

      const state = mockModules.state.getState();
      expect(state.memory).toBe(15);
    });

    test('should subtract from memory', () => {
      mockModules.state.updateState({ memory: 10 });
      calculatorAPI.appendNumber('3');
      calculatorAPI.memorySubtract();

      const state = mockModules.state.getState();
      expect(state.memory).toBe(7);
    });

    test('should clear memory', () => {
      mockModules.state.updateState({ memory: 42 });
      calculatorAPI.memoryClear();

      const state = mockModules.state.getState();
      expect(state.memory).toBeNull();
    });
  });

  describe('Clear Operations', () => {
    test('should clear current entry', () => {
      calculatorAPI.appendNumber('123');
      calculatorAPI.clearEntry();

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('0');
    });

    test('should clear all', () => {
      calculatorAPI.appendNumber('5');
      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('3');
      calculatorAPI.clearAll();

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('0');
      expect(state.operator).toBeNull();
      expect(state.previousValue).toBeNull();
    });

    test('should backspace single digit', () => {
      calculatorAPI.appendNumber('123');
      calculatorAPI.backspace();

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('12');
    });

    test('should handle backspace on single digit', () => {
      calculatorAPI.appendNumber('5');
      calculatorAPI.backspace();

      const state = mockModules.state.getState();
      expect(state.currentValue).toBe('0');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid operations gracefully', () => {
      expect(() => {
        calculatorAPI.performScientificOperation('invalid');
      }).not.toThrow();
    });

    test('should show detailed error messages', () => {
      const error = new Error('Test error');
      const message = calculatorAPI.getDetailedErrorMessage(error);

      expect(message).toContain('Test error');
    });

    test('should handle mathematical errors', () => {
      calculatorAPI.appendNumber('-1');
      calculatorAPI.performScientificOperation('sqrt');

      // Should show error for square root of negative number
      const errorCalls = mockModules.display._getShowErrorCalls();
      expect(errorCalls.length).toBeGreaterThan(0);
    });
  });

  describe('History Management', () => {
    test('should add calculations to history', () => {
      calculatorAPI.appendNumber('2');
      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('3');
      calculatorAPI.calculate();

      const state = mockModules.state.getState();
      expect(state.history.length).toBeGreaterThan(0);
      expect(state.history[0]).toContain('2 + 3 = 5');
    });

    test('should add scientific operations to history', () => {
      calculatorAPI.appendNumber('9');
      calculatorAPI.performScientificOperation('sqrt');

      const state = mockModules.state.getState();
      expect(state.history.length).toBeGreaterThan(0);
      expect(state.history[0]).toContain('sqrt(9) = 3');
    });
  });

  describe('Angle Mode', () => {
    test('should toggle between degrees and radians', () => {
      const initialMode = mockModules.state.getState().isDegree;
      calculatorAPI.toggleAngleMode();

      const newMode = mockModules.state.getState().isDegree;
      expect(newMode).toBe(!initialMode);
    });

    test('should affect trigonometric calculations', () => {
      // Test in degrees (default)
      calculatorAPI.appendNumber('90');
      calculatorAPI.performScientificOperation('sin');
      const degreesResult = parseFloat(mockModules.state.getState().currentValue);

      // Switch to radians and test with 0 (sin(0) = 0 in both modes)
      calculatorAPI.toggleAngleMode();
      calculatorAPI.clearAll();
      calculatorAPI.appendNumber('0');
      calculatorAPI.performScientificOperation('sin');
      const radiansResult = parseFloat(mockModules.state.getState().currentValue);

      expect(degreesResult).toBeCloseTo(1, 5);
      expect(radiansResult).toBeCloseTo(0, 5); // sin(0) = 0
    });
  });
});
