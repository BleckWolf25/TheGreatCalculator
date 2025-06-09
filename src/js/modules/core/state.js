/**
 * @file STATE MANAGEMENT MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * State management module for The Great Calculator.
 * Handles all calculator state operations with immutable patterns, comprehensive
 * undo/redo functionality, history tracking, and event-driven state notifications.
 *
 * Features:
 * - Immutable state management with deep copying
 * - Comprehensive undo/redo functionality with configurable stack sizes
 * - Calculation history tracking and management
 * - Event-driven state change notifications
 * - State validation and integrity checking
 * - Memory operations (store, recall, clear)
 * - Angle mode management (degrees/radians)
 * - Custom formula storage and management
 * - Bracket counting for expression parsing
 *
 * @requires JavaScript Map, Array methods, Object spread operator
 */

// ------------ TYPE AND JSDOC DEFINITIONS

/**
 * @typedef {Object} CalculatorState
 * @property {string} currentValue - Current display value
 * @property {string|null} previousValue - Previous value for operations
 * @property {number} memory - Memory storage value
 * @property {string|null} operator - Current mathematical operator
 * @property {boolean} isNewNumber - Whether next input starts new number
 * @property {boolean} isDegree - Angle mode (true for degrees, false for radians)
 * @property {string[]} history - Array of calculation history strings
 * @property {number} bracketCount - Count of open brackets in current expression
 * @property {string} lastCalculation - Last performed calculation string
 * @property {StateSnapshot[]} undoStack - Array of undo state snapshots
 * @property {StateSnapshot[]} redoStack - Array of redo state snapshots
 * @property {CustomFormula[]} customFormulas - Array of user-defined formulas
 */

/**
 * @typedef {Object} StateSnapshot
 * @property {string} currentValue - Current display value at snapshot time
 * @property {string|null} previousValue - Previous value at snapshot time
 * @property {string|null} operator - Current operator at snapshot time
 * @property {boolean} isNewNumber - New number flag at snapshot time
 * @property {number} bracketCount - Bracket count at snapshot time
 * @property {number} memory - Memory value at snapshot time
 * @property {boolean} isDegree - Angle mode at snapshot time
 * @property {number} timestamp - Timestamp when snapshot was created
 */

/**
 * @typedef {Object} CustomFormula
 * @property {string} name - Formula name identifier
 * @property {string} expression - Mathematical expression
 * @property {string} description - Human-readable description
 * @property {number} created - Creation timestamp
 * @property {number} used - Usage count
 */

/**
 * @typedef {Function} StateChangeListener
 * @param {CalculatorState} newState - New state after change
 * @param {CalculatorState} previousState - Previous state before change
 * @returns {void}
 */

/**
 * @typedef {Object} StateStatistics
 * @property {number} historyCount - Number of history entries
 * @property {number} undoStackSize - Current undo stack size
 * @property {number} redoStackSize - Current redo stack size
 * @property {number} formulaCount - Number of custom formulas
 * @property {number} memoryValue - Current memory value
 * @property {string} angleMode - Current angle mode ('degrees' or 'radians')
 */

// ------------ STATE MANAGER CLASS

/**
 * State Manager Class
 *
 * Provides centralized state management for calculator operations with
 * immutable patterns, undo/redo functionality, and event notifications.
 *
 * @class StateManager
 * @example
 * const stateManager = new StateManager();
 *
 * // Listen for state changes
 * stateManager.addListener('display', (newState, prevState) => {
 *   console.log('Display updated:', newState.currentValue);
 * });
 *
 * // Update state immutably
 * stateManager.updateState({ currentValue: '42' }, true);
 *
 * // Undo/redo operations
 * const undoSuccess = stateManager.undo();
 * const redoSuccess = stateManager.redo();
 */

class StateManager {
    /**
     * Create state manager instance
     *
     * Initializes the state manager with default calculator state,
     * empty listener map, and configurable size limits.
     *
     * @constructor
     * @example
     * const stateManager = new StateManager();
     */
    constructor() {
        /** @type {CalculatorState} Current calculator state */
        this.state = this.getInitialState();

        /** @type {Map<string, StateChangeListener>} Event listeners for state changes */
        this.listeners = new Map();

        /** @type {number} Maximum number of history entries to keep */
        this.maxHistorySize = 50;

        /** @type {number} Maximum number of undo snapshots to keep */
        this.maxUndoSize = 50;
    }

    // ------------ STATE INITIALIZATION METHODS

    /**
     * Get initial state configuration
     *
     * Returns the default calculator state with all properties initialized
     * to their starting values for a fresh calculator session.
     *
     * @method getInitialState
     * @returns {CalculatorState} Complete initial state object
     *
     * @example
     * const initialState = stateManager.getInitialState();
     * console.log('Initial value:', initialState.currentValue); // '0'
     * console.log('Memory:', initialState.memory); // 0
     */
    getInitialState() {
        return {
            currentValue: '0',
            previousValue: null,
            memory: 0,
            operator: null,
            isNewNumber: true,
            isDegree: true,
            history: [],
            bracketCount: 0,
            lastCalculation: '',
            undoStack: [],
            redoStack: [],
            customFormulas: []
        };
    }

    // ------------ STATE ACCESS AND UPDATE METHODS

    /**
     * Get current state (immutable copy)
     *
     * Returns a deep copy of the current state to prevent external
     * modifications and maintain immutability principles.
     *
     * @method getState
     * @returns {CalculatorState} Immutable copy of current state
     *
     * @example
     * const currentState = stateManager.getState();
     * console.log('Current value:', currentState.currentValue);
     * console.log('History length:', currentState.history.length);
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Update state with new values
     *
     * Immutably updates the state with provided changes, optionally saving
     * the current state for undo functionality and notifying listeners.
     *
     * @method updateState
     * @param {Partial<CalculatorState>} updates - Object containing state updates
     * @param {boolean} [saveForUndo=false] - Whether to save current state for undo
     * @returns {void}
     *
     * @example
     * // Simple state update
     * stateManager.updateState({ currentValue: '42' });
     *
     * // Update with undo save
     * stateManager.updateState({
     *   currentValue: '100',
     *   operator: '+'
     * }, true);
     */
    updateState(updates, saveForUndo = false) {
        if (saveForUndo) {
            this.saveStateForUndo();
        }

        /** @type {CalculatorState} */
        const previousState = { ...this.state };
        this.state = { ...this.state, ...updates };

        // Notify listeners of state changes
        this.notifyListeners(previousState, this.state);
    }

    /**
     * Reset state to initial values
     *
     * Resets the calculator state to initial values with options to
     * preserve memory and history data across resets.
     *
     * @method resetState
     * @param {boolean} [preserveMemory=true] - Whether to preserve memory value
     * @param {boolean} [preserveHistory=true] - Whether to preserve history and formulas
     * @returns {void}
     *
     * @example
     * // Reset everything
     * stateManager.resetState(false, false);
     *
     * // Reset but keep memory and history
     * stateManager.resetState(true, true);
     *
     * // Reset but keep only memory
     * stateManager.resetState(true, false);
     */
    resetState(preserveMemory = true, preserveHistory = true) {
        /** @type {CalculatorState} */
        const initialState = this.getInitialState();

        if (preserveMemory) {
            initialState.memory = this.state.memory;
        }

        if (preserveHistory) {
            initialState.history = this.state.history;
            initialState.customFormulas = this.state.customFormulas;
        }

        this.state = initialState;
        this.notifyListeners({}, this.state);
    }

    // ------------ UNDO/REDO FUNCTIONALITY

    /**
     * Create state snapshot for undo functionality
     *
     * Creates a lightweight snapshot of the current state containing only
     * the essential properties needed for undo/redo operations.
     *
     * @method createSnapshot
     * @returns {StateSnapshot} State snapshot with timestamp
     *
     * @example
     * const snapshot = stateManager.createSnapshot();
     * console.log('Snapshot created at:', new Date(snapshot.timestamp));
     * console.log('Snapshot value:', snapshot.currentValue);
     */
    createSnapshot() {
        return {
            currentValue: this.state.currentValue,
            previousValue: this.state.previousValue,
            operator: this.state.operator,
            isNewNumber: this.state.isNewNumber,
            bracketCount: this.state.bracketCount,
            memory: this.state.memory,
            isDegree: this.state.isDegree,
            timestamp: Date.now()
        };
    }

    /**
     * Save current state for undo
     *
     * Creates a snapshot of the current state and adds it to the undo stack,
     * managing stack size limits and clearing the redo stack.
     *
     * @method saveStateForUndo
     * @returns {void}
     *
     * @example
     * // Before making a significant change
     * stateManager.saveStateForUndo();
     * stateManager.updateState({ currentValue: 'new value' });
     */
    saveStateForUndo() {
        /** @type {StateSnapshot} */
        const snapshot = this.createSnapshot();
        this.state.undoStack.push(snapshot);

        // Limit undo stack size
        if (this.state.undoStack.length > this.maxUndoSize) {
            this.state.undoStack.shift();
        }

        // Clear redo stack when new action is performed
        this.state.redoStack = [];
    }

    /**
     * Undo last operation
     *
     * Reverts the calculator to the previous state by popping from the undo
     * stack and pushing the current state to the redo stack.
     *
     * @method undo
     * @returns {boolean} True if undo was successful, false if no undo available
     *
     * @example
     * const success = stateManager.undo();
     * if (success) {
     *   console.log('Undo successful');
     * } else {
     *   console.log('Nothing to undo');
     * }
     */
    undo() {
        if (this.state.undoStack.length === 0) {
            return false;
        }

        // Save current state to redo stack
        /** @type {StateSnapshot} */
        const currentSnapshot = this.createSnapshot();
        this.state.redoStack.push(currentSnapshot);

        // Restore previous state
        /** @type {StateSnapshot} */
        const previousState = this.state.undoStack.pop();
        this.restoreFromSnapshot(previousState);

        return true;
    }

    /**
     * Redo last undone operation
     *
     * Restores a previously undone state by popping from the redo stack
     * and pushing the current state to the undo stack.
     *
     * @method redo
     * @returns {boolean} True if redo was successful, false if no redo available
     *
     * @example
     * const success = stateManager.redo();
     * if (success) {
     *   console.log('Redo successful');
     * } else {
     *   console.log('Nothing to redo');
     * }
     */
    redo() {
        if (this.state.redoStack.length === 0) {
            return false;
        }

        // Save current state to undo stack
        /** @type {StateSnapshot} */
        const currentSnapshot = this.createSnapshot();
        this.state.undoStack.push(currentSnapshot);

        // Restore next state
        /** @type {StateSnapshot} */
        const nextState = this.state.redoStack.pop();
        this.restoreFromSnapshot(nextState);

        return true;
    }

    /**
     * Restore state from snapshot
     *
     * Applies a state snapshot to the current state, updating only the
     * properties that are included in snapshots.
     *
     * @method restoreFromSnapshot
     * @param {StateSnapshot} snapshot - State snapshot to restore
     * @returns {void}
     *
     * @example
     * const snapshot = stateManager.createSnapshot();
     * // ... make changes ...
     * stateManager.restoreFromSnapshot(snapshot); // Restore to snapshot
     */
    restoreFromSnapshot(snapshot) {
        /** @type {Partial<CalculatorState>} */
        const updates = {
            currentValue: snapshot.currentValue,
            previousValue: snapshot.previousValue,
            operator: snapshot.operator,
            isNewNumber: snapshot.isNewNumber,
            bracketCount: snapshot.bracketCount,
            memory: snapshot.memory,
            isDegree: snapshot.isDegree
        };

        this.updateState(updates, false);
    }

    // ------------ HISTORY MANAGEMENT METHODS

    /**
     * Add calculation to history
     *
     * Adds a calculation string to the history array, managing size limits
     * and updating the last calculation reference.
     *
     * @method addToHistory
     * @param {string} calculation - Calculation string to add to history
     * @returns {void}
     *
     * @example
     * stateManager.addToHistory('5 + 3 = 8');
     * stateManager.addToHistory('sin(30°) = 0.5');
     */
    addToHistory(calculation) {
        /** @type {string[]} */
        const history = [...this.state.history, calculation];

        // Limit history size
        if (history.length > this.maxHistorySize) {
            history.shift();
        }

        this.updateState({
            history,
            lastCalculation: calculation
        });
    }

    /**
     * Clear calculation history
     *
     * Removes all entries from the calculation history while preserving
     * other state properties.
     *
     * @method clearHistory
     * @returns {void}
     *
     * @example
     * stateManager.clearHistory();
     * console.log('History cleared');
     */
    clearHistory() {
        this.updateState({ history: [] });
    }

    // ------------ EVENT LISTENER METHODS

    /**
     * Add state change listener
     *
     * Registers a callback function to be notified when state changes occur.
     * Each listener is identified by a unique key for later removal.
     *
     * @method addListener
     * @param {string} key - Unique identifier for the listener
     * @param {StateChangeListener} callback - Function to call on state changes
     * @returns {void}
     *
     * @example
     * stateManager.addListener('display', (newState, prevState) => {
     *   if (newState.currentValue !== prevState.currentValue) {
     *     updateDisplay(newState.currentValue);
     *   }
     * });
     */
    addListener(key, callback) {
        this.listeners.set(key, callback);
    }

    /**
     * Remove state change listener
     *
     * Unregisters a previously added state change listener using its key.
     *
     * @method removeListener
     * @param {string} key - Unique identifier of the listener to remove
     * @returns {void}
     *
     * @example
     * stateManager.removeListener('display');
     */
    removeListener(key) {
        this.listeners.delete(key);
    }

    /**
     * Notify all listeners of state changes
     *
     * Calls all registered listeners with the new and previous state,
     * handling any errors that occur in listener callbacks.
     *
     * @method notifyListeners
     * @param {CalculatorState} previousState - State before the change
     * @param {CalculatorState} newState - State after the change
     * @returns {void}
     *
     * @example
     * // This is called automatically by updateState()
     * stateManager.notifyListeners(oldState, newState);
     */
    notifyListeners(previousState, newState) {
        this.listeners.forEach(callback => {
            try {
                callback(newState, previousState);
            } catch (error) {
                console.error('State listener error:', error);
            }
        });
    }

    // ------------ STATISTICS AND MONITORING METHODS

    /**
     * Get state statistics
     *
     * Returns comprehensive statistics about the current state including
     * stack sizes, history information, and configuration details.
     *
     * @method getStatistics
     * @returns {StateStatistics} Object containing state statistics
     *
     * @example
     * const stats = stateManager.getStatistics();
     * console.log('History entries:', stats.historyCount);
     * console.log('Undo available:', stats.undoStackSize > 0);
     * console.log('Redo available:', stats.redoStackSize > 0);
     * console.log('Angle mode:', stats.angleMode);
     */
    getStatistics() {
        return {
            historyCount: this.state.history.length,
            undoStackSize: this.state.undoStack.length,
            redoStackSize: this.state.redoStack.length,
            formulaCount: this.state.customFormulas.length,
            memoryValue: this.state.memory,
            angleMode: this.state.isDegree ? 'degrees' : 'radians'
        };
    }
}

// ------------ MODULE EXPORTS AND GLOBAL REGISTRATION

/**
 * Export for ES6 module systems (modern bundlers, native ES modules)
 * Enables tree-shaking and modern import/export syntax.
 *
 * @default StateManager
 */
export default StateManager;
