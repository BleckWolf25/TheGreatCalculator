/**
 * @file LEGACY CALCULATOR MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Legacy calculator module for fallback functionality.
 * Provides basic calculator operations when the main modular system fails.
 */

// ------------ LEGACY CALCULATOR CLASS

/**
 * Legacy Calculator Class
 * Simple calculator implementation for fallback scenarios
 */
class LegacyCalculator {
    constructor() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        
        console.log('🧮 Legacy calculator initialized');
    }

    /**
     * Input a number
     * @param {string} num - Number to input
     */
    inputNumber(num) {
        if (this.waitingForOperand) {
            this.currentValue = num;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
        this.updateDisplay();
    }

    /**
     * Input decimal point
     */
    inputDecimal() {
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
        }
        this.updateDisplay();
    }

    /**
     * Clear calculator
     */
    clear() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.updateDisplay();
    }

    /**
     * Perform operation
     * @param {string} nextOperation - Operation to perform
     */
    performOperation(nextOperation) {
        const inputValue = parseFloat(this.currentValue);

        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operation) {
            const currentValue = this.previousValue || 0;
            const newValue = this.calculate(currentValue, inputValue, this.operation);

            this.currentValue = String(newValue);
            this.previousValue = newValue;
        }

        this.waitingForOperand = true;
        this.operation = nextOperation;
        this.updateDisplay();
    }

    /**
     * Calculate result
     * @param {number} firstValue - First operand
     * @param {number} secondValue - Second operand
     * @param {string} operation - Operation to perform
     * @returns {number} Result
     */
    calculate(firstValue, secondValue, operation) {
        switch (operation) {
            case '+':
                return firstValue + secondValue;
            case '-':
                return firstValue - secondValue;
            case '*':
                return firstValue * secondValue;
            case '/':
                return secondValue !== 0 ? firstValue / secondValue : 0;
            default:
                return secondValue;
        }
    }

    /**
     * Calculate final result
     */
    equals() {
        const inputValue = parseFloat(this.currentValue);

        if (this.previousValue !== null && this.operation) {
            const newValue = this.calculate(this.previousValue, inputValue, this.operation);
            this.currentValue = String(newValue);
            this.previousValue = null;
            this.operation = null;
            this.waitingForOperand = true;
        }

        this.updateDisplay();
    }

    /**
     * Update display
     */
    updateDisplay() {
        if (typeof window.updateDisplay === 'function') {
            window.updateDisplay(this.currentValue);
        } else {
            const display = document.querySelector('.display-value') || 
                           document.querySelector('#calculator-display') ||
                           document.querySelector('.calculator-display');
            
            if (display) {
                display.textContent = this.currentValue;
            }
        }
    }
}

// ------------ GLOBAL CALCULATOR INSTANCE

let legacyCalculator = null;

/**
 * Initialize legacy calculator
 */
function initLegacyCalculator() {
    legacyCalculator = new LegacyCalculator();
    
    // Setup button event listeners
    setupLegacyEventListeners();
    
    console.log('🧮 Legacy calculator system initialized');
    return legacyCalculator;
}

/**
 * Setup event listeners for legacy calculator
 */
function setupLegacyEventListeners() {
    // Number buttons
    document.querySelectorAll('[data-action="number"]').forEach(button => {
        button.addEventListener('click', (e) => {
            const value = e.target.getAttribute('data-value') || e.target.textContent;
            legacyCalculator.inputNumber(value);
        });
    });

    // Operation buttons
    document.querySelectorAll('[data-action="operator"]').forEach(button => {
        button.addEventListener('click', (e) => {
            const operation = e.target.getAttribute('data-value') || e.target.textContent;
            legacyCalculator.performOperation(operation);
        });
    });

    // Equals button
    document.querySelectorAll('[data-action="equals"]').forEach(button => {
        button.addEventListener('click', () => {
            legacyCalculator.equals();
        });
    });

    // Clear button
    document.querySelectorAll('[data-action="clear"]').forEach(button => {
        button.addEventListener('click', () => {
            legacyCalculator.clear();
        });
    });

    // Decimal button
    document.querySelectorAll('[data-action="decimal"]').forEach(button => {
        button.addEventListener('click', () => {
            legacyCalculator.inputDecimal();
        });
    });

    console.log('🎯 Legacy event listeners setup complete');
}

// ------------ GLOBAL EXPORTS

// Make functions globally available
if (typeof window !== 'undefined') {
    window.LegacyCalculator = LegacyCalculator;
    window.initLegacyCalculator = initLegacyCalculator;
    window.legacyCalculator = legacyCalculator;
}

console.log('🧮 Legacy calculator module loaded');
