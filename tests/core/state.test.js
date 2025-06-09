/**
 * State Manager Unit Tests
 * Tests for calculator state management with ES modules
 */

// Import the StateManager module directly
import StateManager from '../../src/js/modules/core/state.js';

describe('StateManager', () => {
  let stateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  describe('Initialization', () => {
    test('should initialize with default state', () => {
      const state = stateManager.getState();

      expect(state.currentValue).toBe('0');
      expect(state.previousValue).toBeNull();
      expect(state.memory).toBe(0);
      expect(state.operator).toBeNull();
      expect(state.isNewNumber).toBe(true);
      expect(state.isDegree).toBe(true);
      expect(state.history).toEqual([]);
      expect(state.bracketCount).toBe(0);
      expect(state.undoStack).toEqual([]);
      expect(state.redoStack).toEqual([]);
      expect(state.customFormulas).toEqual([]);
    });

    test('should return immutable state copy', () => {
      const state1 = stateManager.getState();
      const state2 = stateManager.getState();

      expect(state1).not.toBe(state2); // Different objects
      expect(state1).toEqual(state2); // Same content
    });
  });

  describe('State Updates', () => {
    test('should update state correctly', () => {
      stateManager.updateState({ currentValue: '123' });

      const state = stateManager.getState();
      expect(state.currentValue).toBe('123');
    });

    test('should update multiple properties', () => {
      stateManager.updateState({
        currentValue: '456',
        operator: '+',
        isNewNumber: false
      });

      const state = stateManager.getState();
      expect(state.currentValue).toBe('456');
      expect(state.operator).toBe('+');
      expect(state.isNewNumber).toBe(false);
    });

    test('should preserve unchanged properties', () => {
      stateManager.updateState({ currentValue: '789' });

      const state = stateManager.getState();
      expect(state.currentValue).toBe('789');
      expect(state.memory).toBe(0); // Should remain unchanged
      expect(state.isDegree).toBe(true); // Should remain unchanged
    });
  });

  describe('History Management', () => {
    test('should add calculations to history', () => {
      stateManager.addToHistory('2 + 3 = 5');
      stateManager.addToHistory('10 - 4 = 6');

      const state = stateManager.getState();
      expect(state.history).toContain('2 + 3 = 5');
      expect(state.history).toContain('10 - 4 = 6');
      expect(state.history.length).toBe(2);
    });

    test('should limit history size', () => {
      // Add more than max history size (50)
      for (let i = 0; i < 55; i++) {
        stateManager.addToHistory(`${i} + 1 = ${i + 1}`);
      }

      const state = stateManager.getState();
      expect(state.history.length).toBe(50);
      expect(state.history[0]).toBe('5 + 1 = 6'); // First 5 should be removed
    });

    test('should clear history', () => {
      stateManager.addToHistory('1 + 1 = 2');
      stateManager.addToHistory('2 + 2 = 4');
      stateManager.clearHistory();

      const state = stateManager.getState();
      expect(state.history).toEqual([]);
    });

    test('should get history as array', () => {
      stateManager.addToHistory('3 + 3 = 6');
      stateManager.addToHistory('4 + 4 = 8');

      const state = stateManager.getState();
      expect(Array.isArray(state.history)).toBe(true);
      expect(state.history.length).toBe(2);
      expect(state.history).toContain('3 + 3 = 6');
    });
  });

  describe('Undo/Redo Operations', () => {
    test('should save state for undo', () => {
      stateManager.updateState({ currentValue: '100' }, true);
      stateManager.updateState({ currentValue: '200' }, true);

      const state = stateManager.getState();
      expect(state.undoStack.length).toBe(2);
    });

    test('should perform undo operation', () => {
      stateManager.updateState({ currentValue: '100' }, true);
      stateManager.updateState({ currentValue: '200' }, true);

      const undoSuccess = stateManager.undo();
      expect(undoSuccess).toBe(true);

      const state = stateManager.getState();
      expect(state.currentValue).toBe('100');
    });

    test('should perform redo operation', () => {
      stateManager.updateState({ currentValue: '100' }, true);
      stateManager.updateState({ currentValue: '200' }, true);

      stateManager.undo();
      const redoSuccess = stateManager.redo();
      expect(redoSuccess).toBe(true);

      const state = stateManager.getState();
      expect(state.currentValue).toBe('200');
    });

    test('should return false when no undo available', () => {
      const undoSuccess = stateManager.undo();
      expect(undoSuccess).toBe(false);
    });

    test('should return false when no redo available', () => {
      const redoSuccess = stateManager.redo();
      expect(redoSuccess).toBe(false);
    });

    test('should limit undo stack size', () => {
      // Add more than max undo size (50)
      for (let i = 0; i < 55; i++) {
        stateManager.updateState({ currentValue: i.toString() }, true);
      }

      const state = stateManager.getState();
      expect(state.undoStack.length).toBe(50);
    });

    test('should clear redo stack on new state change', () => {
      stateManager.updateState({ currentValue: '100' }, true);
      stateManager.updateState({ currentValue: '200' }, true);
      stateManager.undo();

      // This should clear redo stack
      stateManager.updateState({ currentValue: '300' }, true);

      const state = stateManager.getState();
      expect(state.redoStack.length).toBe(0);
    });
  });

  describe('Memory Operations', () => {
    test('should store value in memory', () => {
      stateManager.updateState({ memory: 42 });

      const state = stateManager.getState();
      expect(state.memory).toBe(42);
    });

    test('should recall memory value', () => {
      stateManager.updateState({ memory: 123 });

      const state = stateManager.getState();
      expect(state.memory).toBe(123);
    });

    test('should clear memory', () => {
      stateManager.updateState({ memory: 456 });
      stateManager.updateState({ memory: 0 });

      const state = stateManager.getState();
      expect(state.memory).toBe(0);
    });
  });

  describe('State Listeners', () => {
    test('should add and notify listeners', () => {
      let callCount = 0;
      let lastNewState = null;
      let lastPrevState = null;
      const mockListener = (newState, prevState) => {
        callCount++;
        lastNewState = newState;
        lastPrevState = prevState;
      };

      stateManager.addListener('test', mockListener);
      stateManager.updateState({ currentValue: '456' });

      expect(callCount).toBe(1);
      expect(lastNewState).toEqual(
        expect.objectContaining({ currentValue: '456' })
      );
      expect(lastPrevState).toEqual(
        expect.objectContaining({ currentValue: '0' })
      );
    });

    test('should remove listeners', () => {
      let callCount = 0;
      const mockListener = () => { callCount++; };

      stateManager.addListener('test', mockListener);
      stateManager.removeListener('test');

      stateManager.updateState({ currentValue: '789' });

      expect(callCount).toBe(0);
    });

    test('should handle multiple listeners', () => {
      let call1Count = 0;
      let call2Count = 0;
      const listener1 = () => { call1Count++; };
      const listener2 = () => { call2Count++; };

      stateManager.addListener('test1', listener1);
      stateManager.addListener('test2', listener2);

      stateManager.updateState({ currentValue: '999' });

      expect(call1Count).toBe(1);
      expect(call2Count).toBe(1);
    });
  });

  describe('State Reset', () => {
    test('should reset to initial state', () => {
      stateManager.updateState({
        currentValue: '123',
        operator: '+',
        memory: 456
      });

      stateManager.resetState(false, false); // Don't preserve memory or history

      const state = stateManager.getState();
      expect(state.currentValue).toBe('0');
      expect(state.operator).toBeNull();
      expect(state.memory).toBe(0);
    });

    test('should preserve history on soft reset', () => {
      stateManager.addToHistory('1 + 1 = 2');
      stateManager.updateState({ currentValue: '123' });

      stateManager.resetState(true, true); // preserve memory and history

      const state = stateManager.getState();
      expect(state.currentValue).toBe('0');
      expect(state.history.length).toBe(1);
    });

    test('should clear history on hard reset', () => {
      stateManager.addToHistory('1 + 1 = 2');
      stateManager.updateState({ currentValue: '123' });

      stateManager.resetState(false, false); // clear memory and history

      const state = stateManager.getState();
      expect(state.currentValue).toBe('0');
      expect(state.history.length).toBe(0);
    });
  });

  describe('State Statistics', () => {
    test('should provide state statistics', () => {
      stateManager.addToHistory('1 + 1 = 2');
      stateManager.updateState({ memory: 42 }, true);

      const stats = stateManager.getStatistics();

      expect(stats.historyCount).toBe(1);
      expect(stats.undoStackSize).toBe(1);
      expect(stats.redoStackSize).toBe(0);
      expect(stats.memoryValue).toBe(42);
      expect(stats.angleMode).toBe('degrees');
    });
  });
});
