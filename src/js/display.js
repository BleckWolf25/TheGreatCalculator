/**
 * @file LEGACY DISPLAY MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Legacy display module for fallback calculator functionality.
 * Provides basic display operations when the main modular system fails.
 */

// ------------ LEGACY DISPLAY FUNCTIONS

/**
 * Legacy display update function
 * @param {string} value - Value to display
 */
function updateDisplay(value) {
    const display = document.querySelector('.display-value') ||
                   document.querySelector('#calculator-display') ||
                   document.querySelector('.calculator-display');

    if (display) {
        display.textContent = value || '0';
        console.log('📺 Legacy display updated:', value);
    } else {
        console.warn('⚠️ Display element not found');
    }
}

/**
 * Clear display
 */
function clearDisplay() {
    updateDisplay('0');
}

/**
 * Append to display
 * @param {string} value - Value to append
 */
function appendToDisplay(value) {
    const display = document.querySelector('.display-value') ||
                   document.querySelector('#calculator-display') ||
                   document.querySelector('.calculator-display');

    if (display) {
        const currentValue = display.textContent || '0';
        const newValue = currentValue === '0' ? value : currentValue + value;
        updateDisplay(newValue);
    }
}

/**
 * Show error on display
 * @param {string} error - Error message
 */
function showError(error) {
    updateDisplay('Error');
    console.error('📺 Legacy display error:', error);
    setTimeout(() => {
        updateDisplay('0');
    }, 2000);
}

// ------------ GLOBAL EXPORTS

// Make functions globally available for legacy compatibility
if (typeof window !== 'undefined') {
    window.updateDisplay = updateDisplay;
    window.clearDisplay = clearDisplay;
    window.appendToDisplay = appendToDisplay;
    window.showError = showError;
}

console.log('📺 Legacy display module loaded');
