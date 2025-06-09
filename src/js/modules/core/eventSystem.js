/**
 * @file EVENT SYSTEM MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Event system and inter-module communication module for The Great Calculator.
 * Provides centralized event management, keyboard input handling, module coordination,
 * and UI event delegation with comprehensive error handling and statistics.
 *
 * Features:
 * - Centralized event listener management
 * - Inter-module communication coordination
 * - Keyboard input handling and mapping
 * - UI event delegation and routing
 * - Event system statistics and monitoring
 * - Comprehensive error handling
 * - Module lifecycle management
 *
 * @requires Calculator modules, DOM APIs
 */

// ------------ TYPE AND JSDOC DEFINITIONS

/**
 * @typedef {Object} ModuleCollection
 * @property {any} state - State management module
 * @property {any} display - Display management module
 * @property {any} statePersistence - State persistence module
 * @property {any} [storage] - Storage management module
 */

/**
 * @typedef {Object} CalculatorAPI
 * @property {Function} appendNumber - Append number to current value
 * @property {Function} setOperator - Set mathematical operator
 * @property {Function} calculate - Perform calculation
 * @property {Function} clear - Clear calculator state
 * @property {Function} undo - Undo last operation
 * @property {Function} redo - Redo last undone operation
 */

/**
 * @typedef {Object} EventStatistics
 * @property {number} totalEvents - Total number of registered event types
 * @property {Record<string, number>} eventCounts - Count of listeners per event type
 * @property {boolean} hasModules - Whether modules are connected
 * @property {boolean} hasCalculatorAPI - Whether calculator API is connected
 */

/**
 * @typedef {Object} CalculatorState
 * @property {string} currentValue - Current display value
 * @property {string|null} previousValue - Previous value for operations
 * @property {string|null} operator - Current operator
 * @property {boolean} isNewNumber - Whether next input starts new number
 * @property {Array<string>} history - Calculation history
 */

/**
 * @typedef {Function} EventCallback
 * @param {...any} args - Event arguments
 * @returns {void}
 */

// ------------ EVENT SYSTEM CLASS

/**
 * Event System Class
 *
 * Provides centralized event management and inter-module communication
 * for the calculator application with keyboard support and error handling.
 *
 * @class EventSystem
 * @example
 * const eventSystem = new EventSystem();
 *
 * // Setup module communication
 * eventSystem.setupModuleCommunication(modules);
 *
 * // Setup UI event handlers
 * eventSystem.setupEventHandlers(calculatorAPI);
 *
 * // Listen for custom events
 * eventSystem.on('calculation-complete', (result) => {
 *   console.log('Calculation result:', result);
 * });
 */
class EventSystem {
    /**
     * Create event system instance
     *
     * Initializes the event system with empty listener maps and
     * null references for modules and calculator API.
     *
     * @constructor
     * @example
     * const eventSystem = new EventSystem();
     */
    constructor() {
        /** @type {Map<string, EventCallback[]>} Event listeners storage */
        this.eventListeners = new Map();

        /** @type {ModuleCollection|null} Connected calculator modules */
        this.modules = null;

        /** @type {CalculatorAPI|null} Calculator API instance */
        this.calculatorAPI = null;
    }

    // ------------ MODULE COMMUNICATION METHODS

    /**
     * Setup inter-module communication
     *
     * Establishes communication channels between calculator modules
     * including state change listeners and automatic persistence.
     *
     * @method setupModuleCommunication
     * @param {ModuleCollection} modules - Initialized calculator modules
     * @returns {void}
     *
     * @example
     * const modules = {
     *   state: stateManager,
     *   display: displayManager,
     *   statePersistence: persistenceManager
     * };
     * eventSystem.setupModuleCommunication(modules);
     */
    setupModuleCommunication(modules) {
        this.modules = modules;

        // Listen to state changes and update display
        this.modules.state.addListener('display', (newState, previousState) => {
            if (newState.currentValue !== previousState.currentValue) {
                this.modules.display.updateDisplay(newState.currentValue);
            }

            // Update history display
            /** @type {string} */
            const historyText = this.formatHistoryForDisplay(newState);
            this.modules.display.updateHistory(historyText);
        });

        // Auto-save state changes
        this.modules.state.addListener('storage', async (_newState) => {
            // Delegate to state persistence module if available
            if (this.modules.statePersistence) {
                await this.modules.statePersistence.saveCurrentState(this.modules);
            }
        });

        console.log('EventSystem: Inter-module communication setup complete');
    }

    // ------------ UI EVENT HANDLER METHODS

    /**
     * Setup UI event handlers
     *
     * Configures event handlers that delegate UI events to the calculator API
     * including number input, operators, and special operations.
     *
     * @method setupEventHandlers
     * @param {CalculatorAPI} calculatorAPI - Calculator API instance
     * @returns {void}
     *
     * @example
     * const calculatorAPI = {
     *   appendNumber: (num) => console.log('Number:', num),
     *   setOperator: (op) => console.log('Operator:', op),
     *   calculate: () => console.log('Calculate'),
     *   clear: () => console.log('Clear')
     * };
     * eventSystem.setupEventHandlers(calculatorAPI);
     */
    setupEventHandlers(calculatorAPI) {
        this.calculatorAPI = calculatorAPI;

        // Number input
        this.on('number', (number) => {
            if (this.calculatorAPI && this.calculatorAPI.appendNumber) {
                this.calculatorAPI.appendNumber(number);
            }
        });

        // Operator input
        this.on('operator', (operator) => {
            if (this.calculatorAPI && this.calculatorAPI.setOperator) {
                this.calculatorAPI.setOperator(operator);
            }
        });

        // Special operations
        this.on('equals', () => {
            if (this.calculatorAPI && this.calculatorAPI.calculate) {
                this.calculatorAPI.calculate();
            }
        });

        this.on('clear', () => {
            if (this.calculatorAPI && this.calculatorAPI.clear) {
                this.calculatorAPI.clear();
            }
        });

        this.on('undo', () => {
            if (this.calculatorAPI && this.calculatorAPI.undo) {
                this.calculatorAPI.undo();
            }
        });

        this.on('redo', () => {
            if (this.calculatorAPI && this.calculatorAPI.redo) {
                this.calculatorAPI.redo();
            }
        });

        console.log('EventSystem: UI event handlers setup complete');
    }

    // ------------ CORE EVENT MANAGEMENT METHODS

    /**
     * Add event listener
     *
     * Registers a callback function to be called when the specified event is emitted.
     * Multiple listeners can be registered for the same event.
     *
     * @method on
     * @param {string} event - Event name to listen for
     * @param {EventCallback} callback - Function to call when event is emitted
     * @returns {void}
     *
     * @example
     * eventSystem.on('number', (number) => {
     *   console.log('Number pressed:', number);
     * });
     *
     * eventSystem.on('calculation-complete', (result) => {
     *   console.log('Result:', result);
     * });
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        /** @type {EventCallback[]} */
        const listeners = this.eventListeners.get(event);
        listeners.push(callback);
    }

    /**
     * Remove event listener
     *
     * Removes a specific callback function from the event listeners.
     * Only removes the first matching callback if multiple identical callbacks exist.
     *
     * @method off
     * @param {string} event - Event name to remove listener from
     * @param {EventCallback} callback - Specific callback function to remove
     * @returns {void}
     *
     * @example
     * const numberHandler = (number) => console.log(number);
     * eventSystem.on('number', numberHandler);
     * eventSystem.off('number', numberHandler); // Remove specific handler
     */
    off(event, callback) {
        /** @type {EventCallback[]|undefined} */
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            /** @type {number} */
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Emit event
     *
     * Triggers all registered listeners for the specified event with the provided arguments.
     * Includes error handling to prevent one failing listener from affecting others.
     *
     * @method emit
     * @param {string} event - Event name to emit
     * @param {...any} args - Arguments to pass to event listeners
     * @returns {void}
     *
     * @example
     * eventSystem.emit('number', '5');
     * eventSystem.emit('calculation-complete', { result: 42, expression: '6*7' });
     */
    emit(event, ...args) {
        /** @type {EventCallback[]|undefined} */
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`EventSystem: Event listener error for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Remove all listeners for an event
     *
     * Removes all callback functions registered for the specified event.
     * The event type itself is removed from the listeners map.
     *
     * @method removeAllListeners
     * @param {string} event - Event name to clear all listeners for
     * @returns {void}
     *
     * @example
     * eventSystem.removeAllListeners('number'); // Remove all number event listeners
     */
    removeAllListeners(event) {
        this.eventListeners.delete(event);
    }

    /**
     * Clear all event listeners
     *
     * Removes all event listeners for all events. This effectively
     * resets the event system to its initial state.
     *
     * @method clearAllListeners
     * @returns {void}
     *
     * @example
     * eventSystem.clearAllListeners(); // Remove all event listeners
     */
    clearAllListeners() {
        this.eventListeners.clear();
    }

    // ------------ UTILITY METHODS

    /**
     * Format history for display
     *
     * Creates a formatted string representation of the current calculation
     * state for display in the history area.
     *
     * @method formatHistoryForDisplay
     * @param {CalculatorState} state - Current calculator state
     * @returns {string} Formatted history string
     *
     * @example
     * const state = { previousValue: '10', operator: '+', currentValue: '5' };
     * const history = eventSystem.formatHistoryForDisplay(state);
     * console.log(history); // "10 +"
     */
    formatHistoryForDisplay(state) {
        if (state.operator && state.previousValue) {
            return `${state.previousValue} ${state.operator}`;
        }
        return '';
    }

    /**
     * Get event system statistics
     *
     * Returns comprehensive statistics about the current state of the event system
     * including listener counts and module connection status.
     *
     * @method getStatistics
     * @returns {EventStatistics} Event system statistics
     *
     * @example
     * const stats = eventSystem.getStatistics();
     * console.log('Total events:', stats.totalEvents);
     * console.log('Number listeners:', stats.eventCounts.number);
     * console.log('Modules connected:', stats.hasModules);
     */
    getStatistics() {
        /** @type {Record<string, number>} */
        const eventCounts = {};
        this.eventListeners.forEach((listeners, event) => {
            eventCounts[event] = listeners.length;
        });

        return {
            totalEvents: this.eventListeners.size,
            eventCounts,
            hasModules: !!this.modules,
            hasCalculatorAPI: !!this.calculatorAPI
        };
    }

    // ------------ KEYBOARD EVENT HANDLING METHODS

    /**
     * Setup keyboard event handlers
     *
     * Configures keyboard event listeners on the specified target element
     * to enable keyboard input for calculator operations.
     *
     * @method setupKeyboardEvents
     * @param {HTMLElement} [targetElement=document] - Element to attach keyboard events to
     * @returns {void}
     *
     * @example
     * // Setup on document (default)
     * eventSystem.setupKeyboardEvents();
     *
     * // Setup on specific element
     * const calculatorElement = document.getElementById('calculator');
     * eventSystem.setupKeyboardEvents(calculatorElement);
     */
    setupKeyboardEvents(targetElement = document) {
        targetElement.addEventListener('keydown', (event) => {
            this.handleKeyboardInput(event);
        });

        console.log('EventSystem: Keyboard events setup complete');
    }

    /**
     * Handle keyboard input
     *
     * Processes keyboard events and maps them to appropriate calculator events.
     * Includes support for numbers, operators, special keys, and keyboard shortcuts.
     *
     * @method handleKeyboardInput
     * @param {KeyboardEvent} event - Keyboard event to process
     * @returns {void}
     *
     * @example
     * // This method is typically called automatically by keyboard event listeners
     * // but can be called manually for testing:
     * const mockEvent = { key: '5', preventDefault: () => {} };
     * eventSystem.handleKeyboardInput(mockEvent);
     */
    handleKeyboardInput(event) {
        /** @type {string} */
        const key = event.key;

        // Prevent default for calculator keys
        if (this.isCalculatorKey(key)) {
            event.preventDefault();
        }

        // Number keys
        if (/^\d$/.test(key)) {
            this.emit('number', key);
        }
        // Decimal point
        else if (key === '.') {
            this.emit('number', '.');
        }
        // Operators
        else if (['+', '-', '*', '/'].includes(key)) {
            this.emit('operator', key);
        }
        // Enter or equals
        else if (key === 'Enter' || key === '=') {
            this.emit('equals');
        }
        // Escape or clear
        else if (key === 'Escape' || key === 'c' || key === 'C') {
            this.emit('clear');
        }
        // Backspace
        else if (key === 'Backspace') {
            this.emit('backspace');
        }
        // Undo (Ctrl+Z)
        else if (event.ctrlKey && key === 'z') {
            this.emit('undo');
        }
        // Redo (Ctrl+Y)
        else if (event.ctrlKey && key === 'y') {
            this.emit('redo');
        }
    }

    /**
     * Check if key is a calculator key
     *
     * Determines whether a keyboard key should be handled by the calculator
     * and have its default browser behavior prevented.
     *
     * @method isCalculatorKey
     * @param {string} key - Key string to check
     * @returns {boolean} True if key is calculator-related
     *
     * @example
     * console.log(eventSystem.isCalculatorKey('5')); // true
     * console.log(eventSystem.isCalculatorKey('+')); // true
     * console.log(eventSystem.isCalculatorKey('a')); // false
     */
    isCalculatorKey(key) {
        /** @type {string[]} */
        const calculatorKeys = [
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            '+', '-', '*', '/', '=', '.', 'Enter', 'Escape', 'Backspace'
        ];
        return calculatorKeys.includes(key);
    }

    // ------------ CLEANUP METHODS

    /**
     * Cleanup event system
     *
     * Performs complete cleanup of the event system including clearing all
     * listeners and resetting module references. Should be called when
     * the calculator is being destroyed or reset.
     *
     * @method cleanup
     * @returns {void}
     *
     * @example
     * // Cleanup when calculator is destroyed
     * eventSystem.cleanup();
     */
    cleanup() {
        this.clearAllListeners();
        this.modules = null;
        this.calculatorAPI = null;
        console.log('EventSystem: Cleaned up');
    }
}

// ------------ MODULE EXPORTS AND GLOBAL REGISTRATION

/**
 * Export for ES6 module systems (modern bundlers, native ES modules)
 * Enables tree-shaking and modern import/export syntax.
 *
 * @default EventSystem
 */
export default EventSystem;
