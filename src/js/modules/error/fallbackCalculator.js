/**
 * @file FALLBACK CALCULATOR MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Emergency fallback calculator for The Great Calculator.
 * Provides basic calculator functionality when the main calculator fails,
 * ensuring users can still perform calculations during error states.
 *
 * Features:
 * - Basic arithmetic operations
 * - Simple state management
 * - Error handling for calculations
 * - History tracking
 * - Accessible interface
 */

// ------------ FALLBACK CALCULATOR CLASS

/**
 * Fallback Calculator Class
 *
 * Provides a minimal but functional calculator implementation
 * that can operate independently when the main calculator fails.
 *
 * @class FallbackCalculator
 * @example
 * const fallback = new FallbackCalculator();
 * fallback.initialize();
 */
class FallbackCalculator {
    /**
     * Create fallback calculator instance
     *
     * Initializes the fallback calculator with basic state
     * and operation handlers.
     */
    constructor() {
        /** @type {string} */
        this.display = '0';

        /** @type {number|null} */
        this.previousValue = null;

        /** @type {string|null} */
        this.operator = null;

        /** @type {boolean} */
        this.isNewNumber = true;

        /** @type {Array<string>} */
        this.history = [];

        /** @type {boolean} */
        this.isInitialized = false;

        console.log('🔧 Fallback Calculator created');
    }

    /**
     * Initialize fallback calculator
     *
     * Sets up the fallback calculator and makes it available globally
     * for use by fallback UI components.
     *
     * @method initialize
     * @returns {boolean} Success status
     */
    initialize() {
        try {
            // Make globally available for fallback UI
            window.fallbackCalculator = this;

            this.isInitialized = true;
            console.log('✅ Fallback Calculator initialized');
            return true;

        } catch (error) {
            console.error('❌ Fallback Calculator initialization failed:', error);
            return false;
        }
    }

    /**
     * Handle button press
     *
     * Processes button presses from the fallback UI and updates
     * the calculator state accordingly.
     *
     * @method handleButton
     * @param {string} action - Button action type
     * @param {string} value - Button value
     */
    handleButton(action, value) {
        try {
            switch (action) {
                case 'number':
                    this.inputNumber(value);
                    break;
                case 'decimal':
                    this.inputDecimal();
                    break;
                case 'add':
                case 'subtract':
                case 'multiply':
                case 'divide':
                    this.setOperator(action);
                    break;
                case 'equals':
                    this.calculate();
                    break;
                case 'clear':
                    this.clear();
                    break;
                case 'negate':
                    this.negate();
                    break;
                case 'percent':
                    this.percent();
                    break;
                default:
                    console.warn('Unknown action:', action);
            }

            this.updateDisplay();

        } catch (error) {
            console.error('Fallback calculator error:', error);
            this.showError('Calculation error');
        }
    }

    /**
     * Input number digit
     *
     * Handles number input and builds up the current number.
     *
     * @method inputNumber
     * @param {string} digit - Number digit to input
     * @private
     */
    inputNumber(digit) {
        if (this.isNewNumber) {
            this.display = digit;
            this.isNewNumber = false;
        } else {
            if (this.display.length < 10) { // Limit display length
                this.display = this.display === '0' ? digit : this.display + digit;
            }
        }
    }

    /**
     * Input decimal point
     *
     * Adds a decimal point to the current number if not already present.
     *
     * @method inputDecimal
     * @private
     */
    inputDecimal() {
        if (this.isNewNumber) {
            this.display = '0.';
            this.isNewNumber = false;
        } else if (!this.display.includes('.')) {
            this.display += '.';
        }
    }

    /**
     * Set operator
     *
     * Sets the current operator and prepares for the next operand.
     *
     * @method setOperator
     * @param {string} op - Operator to set
     * @private
     */
    setOperator(op) {
        if (this.previousValue !== null && !this.isNewNumber) {
            this.calculate();
        }

        this.previousValue = parseFloat(this.display);
        this.operator = op;
        this.isNewNumber = true;
    }

    /**
     * Perform calculation
     *
     * Executes the current operation and updates the display.
     *
     * @method calculate
     * @private
     */
    calculate() {
        if (this.previousValue === null || this.operator === null) {
            return;
        }

        const current = parseFloat(this.display);
        let result;

        try {
            switch (this.operator) {
                case 'add':
                    result = this.previousValue + current;
                    break;
                case 'subtract':
                    result = this.previousValue - current;
                    break;
                case 'multiply':
                    result = this.previousValue * current;
                    break;
                case 'divide':
                    if (current === 0) {
                        throw new Error('Division by zero');
                    }
                    result = this.previousValue / current;
                    break;
                default:
                    return;
            }

            // Check for invalid results
            if (!isFinite(result)) {
                throw new Error('Result is not finite');
            }

            // Format result
            result = this.formatResult(result);

            // Add to history
            const calculation = `${this.previousValue} ${this.getOperatorSymbol(this.operator)} ${current} = ${result}`;
            this.addToHistory(calculation);

            this.display = result.toString();
            this.previousValue = null;
            this.operator = null;
            this.isNewNumber = true;

        } catch (error) {
            this.showError(error.message);
            this.clear();
        }
    }

    /**
     * Clear calculator
     *
     * Resets the calculator to its initial state.
     *
     * @method clear
     * @private
     */
    clear() {
        this.display = '0';
        this.previousValue = null;
        this.operator = null;
        this.isNewNumber = true;
    }

    /**
     * Negate current number
     *
     * Changes the sign of the current number.
     *
     * @method negate
     * @private
     */
    negate() {
        if (this.display !== '0') {
            this.display = this.display.startsWith('-')
                ? this.display.substring(1)
                : `-${  this.display}`;
        }
    }

    /**
     * Convert to percentage
     *
     * Divides the current number by 100.
     *
     * @method percent
     * @private
     */
    percent() {
        const value = parseFloat(this.display);
        this.display = (value / 100).toString();
        this.isNewNumber = true;
    }

    /**
     * Format calculation result
     *
     * Formats the result to avoid floating point precision issues
     * and ensure reasonable display length.
     *
     * @method formatResult
     * @param {number} result - Result to format
     * @returns {number} Formatted result
     * @private
     */
    formatResult(result) {
        // Handle very large or very small numbers
        if (Math.abs(result) >= 1e10 || (Math.abs(result) < 1e-6 && result !== 0)) {
            return parseFloat(result.toExponential(6));
        }

        // Round to avoid floating point precision issues
        return Math.round(result * 1e10) / 1e10;
    }

    /**
     * Get operator symbol
     *
     * Converts operator action to display symbol.
     *
     * @method getOperatorSymbol
     * @param {string} operator - Operator action
     * @returns {string} Display symbol
     * @private
     */
    getOperatorSymbol(operator) {
        const symbols = {
            add: '+',
            subtract: '−',
            multiply: '×',
            divide: '÷'
        };
        return symbols[operator] || operator;
    }

    /**
     * Add calculation to history
     *
     * Adds a calculation to the history list with size management.
     *
     * @method addToHistory
     * @param {string} calculation - Calculation string to add
     * @private
     */
    addToHistory(calculation) {
        this.history.unshift(calculation);

        // Limit history size
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
    }

    /**
     * Update display
     *
     * Updates the fallback display element with the current value.
     *
     * @method updateDisplay
     * @private
     */
    updateDisplay() {
        const displayElement = document.getElementById('fallback-display');
        if (displayElement) {
            displayElement.textContent = this.display;
        }
    }

    /**
     * Show error message
     *
     * Displays an error message to the user.
     *
     * @method showError
     * @param {string} message - Error message to show
     * @private
     */
    showError(message) {
        console.error('Fallback calculator error:', message);

        // Show error in display temporarily
        const displayElement = document.getElementById('fallback-display');
        if (displayElement) {
            const originalValue = displayElement.textContent;
            displayElement.textContent = 'Error';
            displayElement.style.color = '#dc3545';

            setTimeout(() => {
                displayElement.textContent = originalValue;
                displayElement.style.color = '';
            }, 2000);
        }
    }

    // ------------ PUBLIC API METHODS

    /**
     * Clear history
     *
     * Clears the calculation history.
     *
     * @method clearHistory
     */
    clearHistory() {
        this.history = [];
        console.log('📝 Fallback calculator history cleared');
    }

    /**
     * Get current state
     *
     * Returns the current state of the fallback calculator.
     *
     * @method getState
     * @returns {Object} Current calculator state
     */
    getState() {
        return {
            display: this.display,
            previousValue: this.previousValue,
            operator: this.operator,
            isNewNumber: this.isNewNumber,
            history: [...this.history]
        };
    }

    /**
     * Report issue
     *
     * Provides a way for users to report issues with the calculator.
     *
     * @method reportIssue
     */
    reportIssue() {
        const userAgent = navigator.userAgent;
        const timestamp = new Date().toISOString();

        const reportData = {
            timestamp,
            userAgent,
            calculatorState: this.getState(),
            url: window.location.href
        };

        console.log('📋 Issue report generated:', reportData);

        // In a real application, this would send the report to a server
        alert('Issue report generated. Please check the browser console for details.');
    }
}

// ------------ MODULE EXPORTS


export default FallbackCalculator;
