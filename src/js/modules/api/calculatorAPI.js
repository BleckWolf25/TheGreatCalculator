/**
 * @file CALCULATOR API MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Calculator API module for The Great Calculator.
 * Provides a comprehensive public API for calculator operations including
 * basic arithmetic, scientific functions, memory operations, and state management.
 * Acts as the main interface between the UI and calculator modules.
 *
 * Features:
 * - Complete basic arithmetic operations (add, subtract, multiply, divide)
 * - Scientific mathematical functions (trigonometry, logarithms, powers)
 * - Memory operations (store, recall, add, subtract, clear)
 * - Undo/redo functionality with state management
 * - Expression evaluation with parentheses support
 * - Error handling with user-friendly messages
 * - Haptic feedback integration
 * - Toast notifications and error display
 * - Calculator statistics and monitoring
 *
 * @requires Calculator modules: StateManager, OperationsEngine, DisplayManager
 */

// ------------ TYPE AND JSDOC DEFINITIONS

/**
 * @typedef {Object} CalculatorModules
 * @property {any} state - State manager instance
 * @property {any} operations - Operations engine instance
 * @property {any} display - Display manager instance
 */

/**
 * @typedef {Object} CalculatorStatistics
 * @property {boolean} isInitialized - Whether API is initialized
 * @property {string} currentValue - Current calculator display value
 * @property {Object} state - State manager statistics
 * @property {boolean} hasDisplay - Whether display module is available
 * @property {boolean} hasOperations - Whether operations module is available
 */

/**
 * @typedef {Object} MemoryOperation
 * @property {'store'|'recall'|'clear'|'add'|'subtract'} type - Memory operation type
 * @property {number} [value] - Value for memory operations
 * @property {string} message - User feedback message
 */

/**
 * @typedef {Object} ScientificOperation
 * @property {string} name - Operation name
 * @property {number} input - Input value
 * @property {number} result - Calculated result
 * @property {string} expression - Human-readable expression
 */

// ------------ CALCULATOR API CLASS

/**
 * Calculator API Class
 *
 * Provides a comprehensive public API for calculator operations with
 * error handling, state management, and user feedback integration.
 *
 * @class CalculatorAPI
 * @example
 * const api = new CalculatorAPI({
 *   state: stateManager,
 *   operations: operationsEngine,
 *   display: displayManager
 * });
 *
 * // Initialize the API
 * api.initialize();
 *
 * // Perform calculations
 * api.appendNumber(5);
 * api.setOperator('+');
 * api.appendNumber(3);
 * api.calculate(); // Result: 8
 *
 * // Scientific operations
 * api.appendNumber(30);
 * api.performScientificOperation('sin'); // sin(30°) = 0.5
 */
class CalculatorAPI {
    /**
     * Create calculator API instance
     *
     * Initializes the API with required calculator modules and sets up
     * the internal state for operation management.
     *
     * @constructor
     * @param {CalculatorModules} modules - Calculator modules collection
     * @example
     * const api = new CalculatorAPI({
     *   state: stateManager,
     *   operations: operationsEngine,
     *   display: displayManager
     * });
     */
    constructor(modules) {
        /** @type {CalculatorModules} Calculator modules collection */
        this.modules = modules;

        /** @type {boolean} Whether the API has been initialized */
        this.isInitialized = false;

        /** @type {any} Error boundary instance for operation protection */
        this.errorBoundary = window.errorBoundary || null;
    }

    // ------------ INITIALIZATION METHODS

    /**
     * Initialize the API
     *
     * Validates that all required modules are available and sets up
     * the API for calculator operations.
     *
     * @method initialize
     * @returns {boolean} True if initialization was successful
     *
     * @example
     * const success = api.initialize();
     * if (success) {
     *   console.log('Calculator API ready');
     * } else {
     *   console.error('Failed to initialize calculator API');
     * }
     */
    initialize() {
        if (!this.modules.state || !this.modules.operations || !this.modules.display) {
            console.error('CalculatorAPI: Required modules not available');
            return false;
        }

        this.isInitialized = true;
        console.log('CalculatorAPI: Initialized successfully');
        return true;
    }

    // ------------ BASIC INPUT METHODS

    /**
     * Append number to current value
     *
     * Adds a digit or decimal point to the current calculator display value
     * with validation for proper number formatting and state management.
     *
     * @method appendNumber
     * @param {string|number} number - Digit (0-9) or decimal point to append
     * @returns {void}
     *
     * @example
     * api.appendNumber(5);     // Display: "5"
     * api.appendNumber(3);     // Display: "53"
     * api.appendNumber('.');   // Display: "53."
     * api.appendNumber(7);     // Display: "53.7"
     */
    appendNumber(number) {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        /** @type {any} */
        const state = this.modules.state.getState();

        if (state.isNewNumber) {
            this.modules.state.updateState({
                currentValue: number.toString(),
                isNewNumber: false
            }, true);
        } else {
            // Prevent multiple leading zeros
            if (state.currentValue === '0' && number === 0) return;

            // Handle decimal point
            if (number === '.' && state.currentValue.includes('.')) return;

            /** @type {string} */
            const newValue = state.currentValue === '0' && number !== '.'
                ? number.toString()
                : state.currentValue + number.toString();

            this.modules.state.updateState({
                currentValue: newValue
            });
        }

        // Provide haptic feedback
        if (this.modules.display && this.modules.display.vibrate) {
            this.modules.display.vibrate(5);
        }
    }

    /**
     * Set operator for calculation
     *
     * Sets the mathematical operator for the next calculation, automatically
     * performing any pending calculation before setting the new operator.
     *
     * @method setOperator
     * @param {string} operator - Mathematical operator (+, -, *, /)
     * @returns {void}
     *
     * @example
     * api.appendNumber(5);
     * api.setOperator('+');    // Sets addition operator
     * api.appendNumber(3);
     * api.calculate();         // Result: 8
     */
    setOperator(operator) {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        /** @type {any} */
        const state = this.modules.state.getState();

        // If there's a pending calculation, perform it first
        if (state.previousValue !== null && !state.isNewNumber) {
            this.calculate();
        }

        this.modules.state.updateState({
            operator,
            previousValue: state.currentValue,
            isNewNumber: true
        }, true);

        // Provide haptic feedback
        if (this.modules.display && this.modules.display.vibrate) {
            this.modules.display.vibrate(10);
        }
    }

    // ------------ CALCULATION METHODS

    /**
     * Perform calculation
     *
     * Executes the pending calculation based on current state, handling both
     * simple arithmetic operations and complex expressions with parentheses.
     *
     * @method calculate
     * @returns {void}
     *
     * @example
     * // Simple calculation
     * api.appendNumber(10);
     * api.setOperator('/');
     * api.appendNumber(2);
     * api.calculate();         // Result: 5
     *
     * // Expression calculation
     * api.appendNumber('(5+3)*2');
     * api.calculate();         // Result: 16
     */
    async calculate() {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        // Wrap calculation in error boundary if available
        if (this.errorBoundary) {
            try {
                await this.errorBoundary.wrapOperation(
                    () => this.performCalculation(),
                    'calculation',
                    {
                        modules: this.modules,
                        api: this
                    }
                );
            } catch (error) {
                // Error boundary will handle display and recovery
                console.error('CalculatorAPI: Calculation failed with error boundary:', error);
            }
        } else {
            // Fallback to direct calculation without error boundary
            this.performCalculation();
        }
    }

    /**
     * Perform the actual calculation logic
     *
     * Internal method that contains the core calculation logic,
     * separated for error boundary wrapping.
     *
     * @method performCalculation
     * @private
     */
    performCalculation() {
        /** @type {any} */
        const state = this.modules.state.getState();

        try {
            /** @type {number} */
            let result;
            /** @type {string} */
            let calculation;

            // Handle complex expressions with parentheses
            if (state.currentValue.includes('(') || state.currentValue.includes(')')) {
                // Validate parentheses balance first
                if (!this.modules.operations.areParenthesesBalanced(state.currentValue)) {
                    throw new Error('Unbalanced parentheses in expression');
                }

                result = this.modules.operations.evaluateExpression(state.currentValue);
                calculation = `${state.currentValue} = ${this.modules.operations.formatResult(result)}`;
            } else if (state.operator && state.previousValue !== null) {
                // Simple two-operand calculation
                /** @type {number} */
                const a = parseFloat(state.previousValue);
                /** @type {number} */
                const b = parseFloat(state.currentValue);

                if (isNaN(a) || isNaN(b)) {
                    throw new Error('Invalid number format');
                }

                // Check for division by zero
                if (state.operator === '/' && b === 0) {
                    throw new Error('Division by zero');
                }

                result = this.modules.operations.basicOperation(a, b, state.operator);
                calculation = `${state.previousValue} ${state.operator} ${state.currentValue} = ${this.modules.operations.formatResult(result)}`;
            } else {
                return; // No operation to perform
            }

            // Update state with result
            this.modules.state.updateState({
                currentValue: this.modules.operations.formatResult(result),
                previousValue: null,
                operator: null,
                isNewNumber: true
            });

            // Add to history
            this.modules.state.addToHistory(calculation);

            // Provide haptic feedback
            if (this.modules.display && this.modules.display.vibrate) {
                this.modules.display.vibrate(15);
            }

        } catch (error) {
            this.showError(this.getDetailedErrorMessage(error));
            console.error('CalculatorAPI: Calculation error:', error);
            throw error; // Re-throw for error boundary to handle
        }
    }

    // ------------ ERROR HANDLING METHODS

    /**
     * Get detailed error message based on error type
     *
     * Converts technical error messages into user-friendly messages
     * that provide clear guidance about what went wrong.
     *
     * @method getDetailedErrorMessage
     * @param {Error} error - Original error object
     * @returns {string} User-friendly error message
     *
     * @example
     * const error = new Error('Division by zero');
     * const message = api.getDetailedErrorMessage(error);
     * console.log(message); // "Cannot divide by zero"
     */
    getDetailedErrorMessage(error) {
        // Check for specific error types
        if (error.message.includes('Division by zero')) {
            return 'Cannot divide by zero';
        } else if (error.message.includes('Unbalanced parentheses')) {
            return 'Unbalanced parentheses in expression';
        } else if (error.message.includes('Invalid number format')) {
            return 'Invalid number format';
        } else if (error.message.includes('Expression evaluation failed')) {
            return 'Invalid expression format';
        } else if (error.message.includes('Square root of negative')) {
            return 'Cannot calculate square root of negative number';
        } else if (error.message.includes('Logarithm of non-positive')) {
            return 'Logarithm requires positive numbers';
        } else if (error.message.includes('Tangent undefined')) {
            return 'Tangent undefined at this angle';
        } else if (error.message.includes('Factorial requires')) {
            return 'Factorial requires non-negative integer (max 170)';
        } else if (error.message.includes('Factorial too large')) {
            return 'Factorial too large (max 170)';
        } else if (error.message.includes('Result is not finite')) {
            return 'Result too large to display';
        } else if (error.message.includes('Expression contains invalid')) {
            return 'Expression contains invalid characters';
        } else if (error.message.includes('Unknown operation')) {
            return 'Unsupported operation';
        }

        // Return original message if no specific case matches
        return error.message;
    }

    // ------------ CLEAR AND RESET METHODS

    /**
     * Clear calculator
     *
     * Resets the calculator state to initial values with options to
     * preserve memory and history data.
     *
     * @method clear
     * @param {boolean} [clearMemory=false] - Whether to clear memory value
     * @returns {void}
     *
     * @example
     * api.clear();        // Clear but keep memory
     * api.clear(true);    // Clear including memory
     */
    clear(clearMemory = false) {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        this.modules.state.resetState(!clearMemory, true);

        // Provide haptic feedback
        if (this.modules.display && this.modules.display.vibrate) {
            this.modules.display.vibrate(15);
        }
    }

    /**
     * Clear all (alias for clear)
     *
     * Clears all calculator data including current calculation but preserves memory.
     *
     * @method clearAll
     * @returns {void}
     *
     * @example
     * api.clearAll(); // Same as api.clear(false)
     */
    clearAll() {
        this.clear(false);
    }

    /**
     * Clear current entry (alias for clear)
     *
     * Clears the current entry but preserves memory and history.
     *
     * @method clearEntry
     * @returns {void}
     *
     * @example
     * api.clearEntry(); // Same as api.clear(false)
     */
    clearEntry() {
        this.clear(false);
    }

    /**
     * Append decimal point
     *
     * Adds a decimal point to the current number input.
     *
     * @method appendDecimal
     * @returns {void}
     *
     * @example
     * api.appendNumber(5);
     * api.appendDecimal();  // Display: "5."
     * api.appendNumber(3);  // Display: "5.3"
     */
    appendDecimal() {
        this.appendNumber('.');
    }

    // ------------ MEMORY OPERATIONS METHODS

    /**
     * Store value in memory
     *
     * Stores the current display value in calculator memory for later recall.
     *
     * @method memoryStore
     * @returns {void}
     *
     * @example
     * api.appendNumber(42);
     * api.memoryStore();    // Stores 42 in memory
     */
    memoryStore() {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        /** @type {any} */
        const state = this.modules.state.getState();
        /** @type {number} */
        const value = parseFloat(state.currentValue);

        if (!isNaN(value)) {
            this.modules.state.updateState({
                memory: value
            }, true);
            this.showToast('Memory stored');
        }
    }

    /**
     * Recall value from memory
     *
     * Retrieves the stored value from calculator memory and displays it.
     *
     * @method memoryRecall
     * @returns {void}
     *
     * @example
     * api.memoryRecall();   // Displays stored memory value
     */
    memoryRecall() {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        /** @type {any} */
        const state = this.modules.state.getState();
        if (state.memory !== null) {
            this.modules.state.updateState({
                currentValue: state.memory.toString(),
                isNewNumber: true
            });
        }
    }

    /**
     * Clear memory
     *
     * Clears the stored value from calculator memory.
     *
     * @method memoryClear
     * @returns {void}
     *
     * @example
     * api.memoryClear();    // Clears memory storage
     */
    memoryClear() {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        this.modules.state.updateState({
            memory: null
        }, true);
        this.showToast('Memory cleared');
    }

    /**
     * Add to memory
     *
     * Adds the current display value to the value stored in memory.
     *
     * @method memoryAdd
     * @returns {void}
     *
     * @example
     * api.memoryStore();    // Store current value: 10
     * api.appendNumber(5);
     * api.memoryAdd();      // Memory now contains: 15
     */
    memoryAdd() {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        /** @type {any} */
        const state = this.modules.state.getState();
        /** @type {number} */
        const currentValue = parseFloat(state.currentValue);

        if (!isNaN(currentValue)) {
            /** @type {number} */
            const newMemoryValue = (state.memory || 0) + currentValue;
            this.modules.state.updateState({
                memory: newMemoryValue
            }, true);
            this.showToast('Added to memory');
        }
    }

    /**
     * Subtract from memory
     *
     * Subtracts the current display value from the value stored in memory.
     *
     * @method memorySubtract
     * @returns {void}
     *
     * @example
     * api.memoryStore();    // Store current value: 10
     * api.appendNumber(3);
     * api.memorySubtract(); // Memory now contains: 7
     */
    memorySubtract() {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        /** @type {any} */
        const state = this.modules.state.getState();
        /** @type {number} */
        const currentValue = parseFloat(state.currentValue);

        if (!isNaN(currentValue)) {
            /** @type {number} */
            const newMemoryValue = (state.memory || 0) - currentValue;
            this.modules.state.updateState({
                memory: newMemoryValue
            }, true);
            this.showToast('Subtracted from memory');
        }
    }

    // ------------ UNDO/REDO METHODS

    /**
     * Undo last operation
     *
     * Reverts the calculator to the previous state if undo history is available.
     *
     * @method undo
     * @returns {void}
     *
     * @example
     * api.appendNumber(5);
     * api.setOperator('+');
     * api.undo();           // Reverts to before operator was set
     */
    undo() {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        /** @type {boolean} */
        const success = this.modules.state.undo();
        if (success) {
            this.showToast('Undone');
            if (this.modules.display && this.modules.display.vibrate) {
                this.modules.display.vibrate(10);
            }
        } else {
            this.showToast('Nothing to undo');
        }
    }

    /**
     * Redo last undone operation
     *
     * Restores a previously undone state if redo history is available.
     *
     * @method redo
     * @returns {void}
     *
     * @example
     * api.undo();           // Undo an operation
     * api.redo();           // Redo the undone operation
     */
    redo() {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        /** @type {boolean} */
        const success = this.modules.state.redo();
        if (success) {
            this.showToast('Redone');
            if (this.modules.display && this.modules.display.vibrate) {
                this.modules.display.vibrate(10);
            }
        } else {
            this.showToast('Nothing to redo');
        }
    }

    // ------------ UTILITY OPERATIONS METHODS

    /**
     * Handle backspace operation
     *
     * Removes the last character from the current display value,
     * resetting to '0' if all characters are removed.
     *
     * @method backspace
     * @returns {void}
     *
     * @example
     * api.appendNumber(123);
     * api.backspace();      // Display: "12"
     * api.backspace();      // Display: "1"
     * api.backspace();      // Display: "0"
     */
    backspace() {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        /** @type {any} */
        const state = this.modules.state.getState();
        /** @type {string} */
        let newValue = state.currentValue;

        if (newValue.length > 1) {
            newValue = newValue.slice(0, -1);
        } else {
            newValue = '0';
        }

        this.modules.state.updateState({
            currentValue: newValue,
            isNewNumber: false
        });

        // Provide haptic feedback
        if (this.modules.display && this.modules.display.vibrate) {
            this.modules.display.vibrate(5);
        }
    }

    /**
     * Toggle sign of current value
     *
     * Changes the sign of the current display value from positive to negative
     * or vice versa.
     *
     * @method toggleSign
     * @returns {void}
     *
     * @example
     * api.appendNumber(42);
     * api.toggleSign();     // Display: "-42"
     * api.toggleSign();     // Display: "42"
     */
    toggleSign() {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        /** @type {any} */
        const state = this.modules.state.getState();
        /** @type {number} */
        let currentValue = parseFloat(state.currentValue);

        if (!isNaN(currentValue)) {
            currentValue = -currentValue;
            this.modules.state.updateState({
                currentValue: currentValue.toString(),
                isNewNumber: false
            });
        }
    }

    /**
     * Convert current value to percentage
     *
     * Converts the current display value to its percentage equivalent
     * by dividing by 100.
     *
     * @method percentage
     * @returns {void}
     *
     * @example
     * api.appendNumber(50);
     * api.percentage();     // Display: "0.5" (50% as decimal)
     */
    percentage() {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        /** @type {any} */
        const state = this.modules.state.getState();
        /** @type {number} */
        let currentValue = parseFloat(state.currentValue);

        if (!isNaN(currentValue)) {
            currentValue = currentValue / 100;
            this.modules.state.updateState({
                currentValue: this.modules.operations.formatResult(currentValue),
                isNewNumber: false
            });
        }
    }

    /**
     * Toggle angle mode (degrees/radians)
     *
     * Switches between degree and radian modes for trigonometric calculations.
     *
     * @method toggleAngleMode
     * @returns {void}
     *
     * @example
     * api.toggleAngleMode(); // Switch to radians mode
     * api.appendNumber(Math.PI/2);
     * api.performScientificOperation('sin'); // sin(π/2) = 1
     */
    toggleAngleMode() {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        /** @type {any} */
        const state = this.modules.state.getState();
        /** @type {boolean} */
        const newMode = !state.isDegree;

        this.modules.state.updateState({
            isDegree: newMode
        }, true);

        this.showToast(newMode ? 'Degrees mode' : 'Radians mode');
    }

    // ------------ SCIENTIFIC OPERATIONS METHODS

    /**
     * Perform scientific operation
     *
     * Executes scientific mathematical operations on the current display value
     * including trigonometric, logarithmic, and power functions.
     *
     * @method performScientificOperation
     * @param {string} operation - Scientific operation name
     * @returns {void}
     *
     * @example
     * api.appendNumber(30);
     * api.performScientificOperation('sin');    // sin(30°) = 0.5
     *
     * api.appendNumber(16);
     * api.performScientificOperation('sqrt');   // √16 = 4
     *
     * api.appendNumber(5);
     * api.performScientificOperation('factorial'); // 5! = 120
     */
    performScientificOperation(operation) {
        if (!this.isInitialized) {
            console.warn('CalculatorAPI: Not initialized');
            return;
        }

        /** @type {any} */
        const state = this.modules.state.getState();
        /** @type {number} */
        const currentValue = parseFloat(state.currentValue);

        if (isNaN(currentValue)) {
            this.showError('Invalid number format');
            return;
        }

        try {
            /** @type {number} */
            let result;

            switch (operation) {
                case 'sin':
                    result = this.modules.operations.sin(currentValue, state.isDegree);
                    break;
                case 'cos':
                    result = this.modules.operations.cos(currentValue, state.isDegree);
                    break;
                case 'tan':
                    result = this.modules.operations.tan(currentValue, state.isDegree);
                    break;
                case 'sqrt':
                    result = this.modules.operations.sqrt(currentValue);
                    break;
                case 'ln':
                    result = this.modules.operations.ln(currentValue);
                    break;
                case 'log10':
                    result = this.modules.operations.log10(currentValue);
                    break;
                case 'factorial':
                    result = this.modules.operations.factorial(currentValue);
                    break;
                case 'power2':
                    result = this.modules.operations.power(currentValue, 2);
                    break;
                case 'power3':
                    result = this.modules.operations.power(currentValue, 3);
                    break;
                case 'exp':
                    result = this.modules.operations.power(Math.E, currentValue);
                    break;
                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }

            /** @type {string} */
            const formattedResult = this.modules.operations.formatResult(result);
            /** @type {string} */
            const calculation = `${operation}(${state.currentValue}) = ${formattedResult}`;

            this.modules.state.updateState({
                currentValue: formattedResult,
                isNewNumber: true
            });

            this.modules.state.addToHistory(calculation);

        } catch (error) {
            this.showError(this.getDetailedErrorMessage(error));
            console.error('CalculatorAPI: Scientific operation error:', error);
        }
    }

    // ------------ USER FEEDBACK METHODS

    /**
     * Show error message
     *
     * Displays an error message to the user through the display module.
     *
     * @method showError
     * @param {string} message - Error message to display
     * @returns {void}
     *
     * @example
     * api.showError('Cannot divide by zero');
     */
    showError(message) {
        if (this.modules.display && this.modules.display.showError) {
            this.modules.display.showError(message);
        }
    }

    /**
     * Show toast notification
     *
     * Displays a brief notification message to the user.
     *
     * @method showToast
     * @param {string} message - Toast message to display
     * @returns {void}
     *
     * @example
     * api.showToast('Memory stored');
     */
    showToast(message) {
        if (this.modules.display && this.modules.display.showToast) {
            this.modules.display.showToast(message);
        }
    }

    // ------------ GETTER METHODS

    /**
     * Get current calculator value
     *
     * Returns the current display value of the calculator.
     *
     * @method getCurrentValue
     * @returns {string} Current calculator display value
     *
     * @example
     * const value = api.getCurrentValue();
     * console.log('Current value:', value);
     */
    getCurrentValue() {
        if (!this.isInitialized) return '0';
        return this.modules.state.getState().currentValue;
    }

    // ------------ STATISTICS AND MONITORING METHODS

    /**
     * Get calculator statistics
     *
     * Returns comprehensive statistics about the calculator's current state
     * and available modules for monitoring and debugging purposes.
     *
     * @method getStatistics
     * @returns {CalculatorStatistics} Calculator statistics object
     *
     * @example
     * const stats = api.getStatistics();
     * console.log('Initialized:', stats.isInitialized);
     * console.log('Current value:', stats.currentValue);
     * console.log('Has display:', stats.hasDisplay);
     */
    getStatistics() {
        if (!this.isInitialized) {
            return { error: 'Not initialized' };
        }

        return {
            isInitialized: this.isInitialized,
            currentValue: this.getCurrentValue(),
            state: this.modules.state.getStatistics(),
            hasDisplay: !!this.modules.display,
            hasOperations: !!this.modules.operations
        };
    }
}

// ------------ MODULE EXPORTS AND GLOBAL REGISTRATION

/**
 * Export for ES6 module systems (modern bundlers, native ES modules)
 * Enables tree-shaking and modern import/export syntax.
 *
 * @default CalculatorAPI
 */
export default CalculatorAPI;
