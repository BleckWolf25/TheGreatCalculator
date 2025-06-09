/**
 * Calculator Integration Tests
 * Tests for complete calculator workflows and module interactions with ES modules
 */

// Import all required modules directly
import StateManager from '../../src/js/modules/core/state.js';
import OperationsEngine from '../../src/js/modules/core/operations.js';
import DisplayManager from '../../src/js/modules/ui/display.js';
import CalculatorAPI from '../../src/js/modules/api/calculatorAPI.js';
import StorageManager from '../../src/js/modules/storage/storageManager.js';
import ExportManager from '../../src/js/modules/export/exportManager.js';

describe('Calculator Integration Tests', () => {
  let modules;
  let calculatorAPI;
  let mockDisplayElement;
  let mockHistoryElement;

  beforeEach(async () => {
    // Setup mock DOM elements
    let addClassCalls = [];
    let removeClassCalls = [];

    mockDisplayElement = {
      value: '',
      style: {},
      setAttribute: () => {},
      classList: {
        add: (className) => { addClassCalls.push(className); },
        remove: (className) => { removeClassCalls.push(className); },
        _getAddCalls: () => addClassCalls,
        _getRemoveCalls: () => removeClassCalls
      }
    };

    mockHistoryElement = {
      textContent: '',
      style: {},
      setAttribute: () => {}
    };

    // Initialize all modules
    modules = {
      state: new StateManager(),
      operations: new OperationsEngine(),
      display: new DisplayManager(),
      storage: new StorageManager(),
      export: new ExportManager()
    };

    // Initialize display and storage
    modules.display.initialize(mockDisplayElement, mockHistoryElement);
    await modules.storage.initialize();

    // Initialize calculator API
    calculatorAPI = new CalculatorAPI(modules);
    calculatorAPI.initialize();
  });

  describe('Basic Calculator Workflow', () => {
    test('should perform complete calculation workflow', () => {
      // Input: 2 + 3 = 5
      calculatorAPI.appendNumber('2');
      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('3');
      calculatorAPI.calculate();

      const state = modules.state.getState();
      expect(state.currentValue).toBe('5');
      expect(state.history.length).toBeGreaterThan(0);
      expect(state.history[0]).toContain('2 + 3 = 5');
    });

    test('should handle chained operations', () => {
      // Input: 2 + 3 * 4 = 20 (should calculate 2+3=5 first, then 5*4=20)
      calculatorAPI.appendNumber('2');
      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('3');
      calculatorAPI.setOperator('*');
      calculatorAPI.appendNumber('4');
      calculatorAPI.calculate();

      const state = modules.state.getState();
      expect(state.currentValue).toBe('20');
    });

    test('should handle decimal calculations', () => {
      // Input: 1.5 + 2.3 = 3.8
      calculatorAPI.appendNumber('1');
      calculatorAPI.appendDecimal();
      calculatorAPI.appendNumber('5');
      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('2');
      calculatorAPI.appendDecimal();
      calculatorAPI.appendNumber('3');
      calculatorAPI.calculate();

      const state = modules.state.getState();
      expect(parseFloat(state.currentValue)).toBeCloseTo(3.8);
    });
  });

  describe('Scientific Calculator Workflow', () => {
    test('should perform scientific operations', () => {
      // Input: sqrt(16) = 4
      calculatorAPI.appendNumber('16');
      calculatorAPI.performScientificOperation('sqrt');

      const state = modules.state.getState();
      expect(state.currentValue).toBe('4');
      expect(state.history[0]).toContain('sqrt(16) = 4');
    });

    test('should handle trigonometric calculations', () => {
      // Input: sin(90°) = 1
      calculatorAPI.appendNumber('90');
      calculatorAPI.performScientificOperation('sin');

      const state = modules.state.getState();
      expect(parseFloat(state.currentValue)).toBeCloseTo(1, 10);
    });

    test('should switch between degree and radian modes', () => {
      // Test sin(π/2) in radians = 1
      calculatorAPI.toggleAngleMode(); // Switch to radians
      calculatorAPI.appendNumber('1.5708'); // π/2 approximation
      calculatorAPI.performScientificOperation('sin');

      const state = modules.state.getState();
      expect(parseFloat(state.currentValue)).toBeCloseTo(1, 3);
      expect(state.isDegree).toBe(false);
    });
  });

  describe('Memory Operations Workflow', () => {
    test('should perform complete memory workflow', () => {
      // Store 42 in memory
      calculatorAPI.appendNumber('42');
      calculatorAPI.memoryStore();

      // Perform calculation: 10 + 5 = 15
      calculatorAPI.appendNumber('10');
      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('5');
      calculatorAPI.calculate();

      // Add current result to memory: 42 + 15 = 57
      calculatorAPI.memoryAdd();

      // Recall memory
      calculatorAPI.memoryRecall();

      const state = modules.state.getState();
      expect(state.currentValue).toBe('57');
      expect(state.memory).toBe(57);
    });

    test('should handle memory subtract operations', () => {
      // Store 100 in memory
      calculatorAPI.appendNumber('100');
      calculatorAPI.memoryStore();

      // Calculate 25
      calculatorAPI.appendNumber('25');

      // Subtract from memory: 100 - 25 = 75
      calculatorAPI.memorySubtract();

      const state = modules.state.getState();
      expect(state.memory).toBe(75);
    });
  });

  describe('Error Handling Workflow', () => {
    test('should handle division by zero gracefully', () => {
      calculatorAPI.appendNumber('5');
      calculatorAPI.setOperator('/');
      calculatorAPI.appendNumber('0');

      // Division by zero should throw an error, but it should be caught and handled
      expect(() => {
        calculatorAPI.calculate();
      }).toThrow('Division by zero');

      // Should show error without crashing
      expect(mockDisplayElement.value).toContain('Error');
      const addCalls = mockDisplayElement.classList._getAddCalls();
      expect(addCalls).toContain('error-state');
    });

    test('should handle invalid scientific operations', () => {
      calculatorAPI.appendNumber('-1');
      calculatorAPI.performScientificOperation('sqrt');

      // Should show error for square root of negative number
      expect(mockDisplayElement.value).toContain('Error');
    });

    test('should recover from errors', () => {
      // Cause an error
      calculatorAPI.appendNumber('5');
      calculatorAPI.setOperator('/');
      calculatorAPI.appendNumber('0');

      // Division by zero should throw an error
      expect(() => {
        calculatorAPI.calculate();
      }).toThrow('Division by zero');

      // Clear and perform valid calculation
      calculatorAPI.clearAll();
      calculatorAPI.appendNumber('2');
      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('3');
      calculatorAPI.calculate();

      const state = modules.state.getState();
      expect(state.currentValue).toBe('5');
    });
  });

  describe('Undo/Redo Workflow', () => {
    test('should handle undo/redo operations', () => {
      // Perform calculations with undo saves
      calculatorAPI.appendNumber('10');
      modules.state.updateState({ currentValue: '10' }, true);

      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('5');
      calculatorAPI.calculate();
      modules.state.updateState({ currentValue: '15' }, true);

      // Undo last operation
      const undoSuccess = modules.state.undo();
      expect(undoSuccess).toBe(true);
      expect(modules.state.getState().currentValue).toBe('10');

      // Redo operation
      const redoSuccess = modules.state.redo();
      expect(redoSuccess).toBe(true);
      expect(modules.state.getState().currentValue).toBe('15');
    });
  });

  describe('Storage Integration', () => {
    test('should save and load calculator state', async () => {
      // Perform calculations to create state
      calculatorAPI.appendNumber('42');
      calculatorAPI.memoryStore();
      calculatorAPI.appendNumber('2');
      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('3');
      calculatorAPI.calculate();

      const currentState = modules.state.getState();

      // Save state
      await modules.storage.save('calculator_state', currentState);

      // Create new state manager and load saved state
      const savedState = await modules.storage.load('calculator_state');

      expect(savedState.memory).toBe(42);
      expect(savedState.history.length).toBeGreaterThan(0);
    });

    test('should persist history across sessions', async () => {
      // Add calculations to history
      calculatorAPI.appendNumber('1');
      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('1');
      calculatorAPI.calculate();

      calculatorAPI.appendNumber('2');
      calculatorAPI.setOperator('*');
      calculatorAPI.appendNumber('3');
      calculatorAPI.calculate();

      const history = modules.state.getState().history;

      // Save history
      await modules.storage.save('history', history);

      // Load history
      const savedHistory = await modules.storage.load('history');

      expect(savedHistory).toEqual(history);
      expect(savedHistory.length).toBe(2);
    });
  });

  describe('Export Integration', () => {
    test('should export calculation history', async () => {
      // Perform several calculations
      calculatorAPI.appendNumber('2');
      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('3');
      calculatorAPI.calculate();

      calculatorAPI.appendNumber('10');
      calculatorAPI.setOperator('-');
      calculatorAPI.appendNumber('4');
      calculatorAPI.calculate();

      const history = modules.state.getState().history;

      // Mock the downloadFile method to capture export content
      let csvContent = '';
      let jsonContent = '';

      const originalDownloadFile = modules.export.downloadFile;
      modules.export.downloadFile = (content, filename, mimeType) => {
        if (filename.includes('.csv')) {
          csvContent = content;
        } else if (filename.includes('.json')) {
          jsonContent = content;
        }
      };

      // Export to CSV
      await modules.export.exportHistory(history, 'csv');
      expect(csvContent).toContain('Index,Calculation,Result');
      expect(csvContent).toContain('"2 + 3"');
      expect(csvContent).toContain('"5"');

      // Export to JSON
      await modules.export.exportHistory(history, 'json');
      const parsed = JSON.parse(jsonContent);
      expect(parsed.calculations.length).toBe(2);

      // Restore original method
      modules.export.downloadFile = originalDownloadFile;
    });
  });

  describe('Display Integration', () => {
    test('should update display during calculations', () => {
      // Test display updates throughout calculation
      calculatorAPI.appendNumber('1');
      expect(mockDisplayElement.value).toBe('1');

      calculatorAPI.appendNumber('2');
      expect(mockDisplayElement.value).toBe('12');

      calculatorAPI.appendNumber('3');
      expect(mockDisplayElement.value).toBe('123');

      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('4');
      expect(mockDisplayElement.value).toBe('4');

      calculatorAPI.calculate();
      expect(mockDisplayElement.value).toBe('127');
    });

    test('should format large numbers in display', () => {
      calculatorAPI.appendNumber('1000000');

      expect(mockDisplayElement.value).toBe('1,000,000');
    });

    test('should show history in display', () => {
      calculatorAPI.appendNumber('5');
      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('5');
      calculatorAPI.calculate();

      // History should be updated
      expect(mockHistoryElement.textContent).toContain('5 + 5 = 10');
    });
  });

  describe('Complex Calculation Workflows', () => {
    test('should handle mixed arithmetic and scientific operations', () => {
      // Calculate: (sqrt(16) + 2) * 3 = 18
      calculatorAPI.appendNumber('16');
      calculatorAPI.performScientificOperation('sqrt'); // = 4

      calculatorAPI.setOperator('+');
      calculatorAPI.appendNumber('2');
      calculatorAPI.calculate(); // = 6

      calculatorAPI.setOperator('*');
      calculatorAPI.appendNumber('3');
      calculatorAPI.calculate(); // = 18

      const state = modules.state.getState();
      expect(state.currentValue).toBe('18');
    });

    test('should handle percentage calculations', () => {
      // Calculate 20% of 150 = 30
      calculatorAPI.appendNumber('150');
      calculatorAPI.setOperator('*');
      calculatorAPI.appendNumber('20');
      calculatorAPI.setOperator('%');

      const state = modules.state.getState();
      expect(parseFloat(state.currentValue)).toBeCloseTo(30);
    });
  });

  describe('State Consistency', () => {
    test('should maintain consistent state across operations', () => {
      // Perform multiple operations and verify state consistency
      calculatorAPI.appendNumber('5');
      let state = modules.state.getState();
      expect(state.currentValue).toBe('5');
      expect(state.isNewNumber).toBe(false);

      calculatorAPI.setOperator('+');
      state = modules.state.getState();
      expect(state.operator).toBe('+');
      expect(state.previousValue).toBe('5');
      expect(state.isNewNumber).toBe(true);

      calculatorAPI.appendNumber('3');
      state = modules.state.getState();
      expect(state.currentValue).toBe('3');
      expect(state.isNewNumber).toBe(false);

      calculatorAPI.calculate();
      state = modules.state.getState();
      expect(state.currentValue).toBe('8');
      expect(state.operator).toBeNull();
      expect(state.previousValue).toBeNull();
      expect(state.isNewNumber).toBe(true);
    });
  });
});
