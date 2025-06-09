/**
 * @file DISPLAY.JS
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Display Management Module that handles all display-related operations,
 * animations, accessibility features, and user interface feedback.
 *
 * Features:
 * - Dynamic display value formatting and presentation
 * - Smooth animations and transitions
 * - Accessibility support with screen reader announcements
 * - Error state management and user feedback
 * - Toast notifications and haptic feedback
 * - Responsive text sizing and special notation handling
 *
 * @module DisplayManager
 */

// ------------ TYPE DEFINITIONS

/**
 * @typedef {Object} DisplayOptions
 * @property {boolean} [animate=true] - Whether to animate the display update
 * @property {boolean} [announceToScreenReader=false] - Whether to announce to screen readers
 * @property {boolean} [formatValue=true] - Whether to format the display value
 */

/**
 * @typedef {Object} DisplayStatistics
 * @property {boolean} isInitialized - Whether the display manager is initialized
 * @property {string} currentValue - Current display value
 * @property {number} animationQueueLength - Number of queued animations
 * @property {boolean} isAnimating - Whether an animation is currently running
 */

/**
 * @typedef {Object} ToastOptions
 * @property {number} [duration=2000] - Display duration in milliseconds
 * @property {string} [type='info'] - Toast type ('info', 'success', 'warning', 'error')
 * @property {boolean} [persistent=false] - Whether the toast should persist until manually closed
 */

// ------------ DISPLAY MANAGER CLASS

/**
 * Display Manager Class
 *
 * Manages all aspects of the calculator's display including value presentation,
 * animations, accessibility features, and user feedback mechanisms.
 *
 * @class DisplayManager
 */
class DisplayManager {
    /**
     * Create a new DisplayManager instance
     *
     * @constructor
     *
     * @example
     * const displayManager = new DisplayManager();
     * displayManager.initialize(displayElement, historyElement);
     *

     */
    constructor() {
        /** @type {HTMLInputElement|null} Main display input element */
        this.displayElement = null;

        /** @type {HTMLElement|null} History display element */
        this.historyElement = null;

        /** @type {boolean} Initialization status */
        this.isInitialized = false;

        /** @type {string[]} Queue of pending display animations */
        this.animationQueue = [];

        /** @type {boolean} Whether an animation is currently running */
        this.isAnimating = false;

        /** @type {number|null} Error timeout reference */
        this.errorTimeout = null;

        /** @type {HTMLElement|null} Screen reader announcement element */
        this.screenReaderElement = null;

        /** @type {boolean} Whether vibration is enabled */
        this.vibrationEnabled = true;

        /** @type {Object|null} Reference to calculator modules */
        this.modules = null;
    }

    /**
     * Initialize display manager with DOM elements
     *
     * Sets up the display manager with the required DOM elements and
     * configures accessibility features and display properties.
     *
     * @method initialize
     * @param {HTMLInputElement} displayElement - Main display input element
     * @param {HTMLElement} historyElement - History display element
     *
     * @example
     * const display = document.getElementById('main-display');
     * const history = document.getElementById('history-display');
     * displayManager.initialize(display, history);
     *

     */
    initialize(displayElement, historyElement) {
        console.log('🖥️ Initializing Display Manager...');

        this.displayElement = displayElement;
        this.historyElement = historyElement;
        this.isInitialized = true;

        this.setupDisplayProperties();
        this.setupAccessibility();

        console.log('✅ Display Manager initialized successfully');
    }

    /**
     * Setup display element properties
     *
     * Configures the main display element with appropriate attributes
     * and styling for optimal user experience.
     *
     * @method setupDisplayProperties
     * @private

     */
    setupDisplayProperties() {
        if (!this.displayElement) {
            console.warn('⚠️ Display element not available for setup');
            return;
        }

        // Make display read-only to prevent direct editing
        this.displayElement.setAttribute('readonly', 'true');

        // Setup accessibility attributes
        this.displayElement.setAttribute('aria-live', 'polite');
        this.displayElement.setAttribute('aria-atomic', 'true');
        this.displayElement.setAttribute('aria-label', 'Calculator display');

        // Setup visual styling
        this.displayElement.style.textAlign = 'right';

        console.log('✅ Display properties configured');
    }

    /**
     * Setup accessibility features
     *
     * Configures accessibility features including ARIA attributes,
     * screen reader support, and keyboard navigation.
     *
     * @method setupAccessibility
     * @private

     */
    setupAccessibility() {
        // Setup history element accessibility
        if (this.historyElement) {
            this.historyElement.setAttribute('aria-live', 'polite');
            this.historyElement.setAttribute('role', 'status');
            this.historyElement.setAttribute('aria-label', 'Calculation history');
        }

        // Create screen reader announcement element
        this.createScreenReaderElement();

        console.log('✅ Accessibility features configured');
    }

    /**
     * Create screen reader announcement element
     *
     * Creates a hidden element for making announcements to screen readers.
     *
     * @method createScreenReaderElement
     * @private

     */
    createScreenReaderElement() {
        if (!this.screenReaderElement) {
            this.screenReaderElement = document.createElement('div');
            this.screenReaderElement.id = 'display-sr-announcements';
            this.screenReaderElement.setAttribute('aria-live', 'polite');
            this.screenReaderElement.setAttribute('aria-atomic', 'true');
            this.screenReaderElement.className = 'visually-hidden';
            this.screenReaderElement.style.cssText = `
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            `;
            document.body.appendChild(this.screenReaderElement);
        }
    }

    /**
     * Update main display with animation and formatting
     *
     * Updates the calculator's main display with the provided value,
     * applying formatting, animations, and accessibility features as needed.
     *
     * @method updateDisplay
     * @param {string|number} value - Value to display
     * @param {DisplayOptions} [options={}] - Display configuration options
     *
     * @example
     * // Simple display update
     * displayManager.updateDisplay('123.45');
     *
     * // Update with custom options
     * displayManager.updateDisplay('Error', {
     *   animate: false,
     *   announceToScreenReader: true,
     *   formatValue: false
     * });
     *

     */
    updateDisplay(value, options = {}) {
        if (!this.isInitialized || !this.displayElement) {
            console.warn('⚠️ Display manager not initialized or display element missing');
            return;
        }

        // Extract options with defaults
        const {
            animate = true,
            announceToScreenReader = false,
            formatValue = true
        } = options;

        // Format the value if requested
        /** @type {string} */
        const formattedValue = formatValue ? this.formatDisplayValue(value) : String(value);

        // Update display with or without animation
        if (animate) {
            this.animateDisplayUpdate(formattedValue);
        } else {
            this.setDisplayValue(formattedValue);
        }

        // Apply responsive text sizing
        this.adjustDisplayTextSize(formattedValue);

        // Handle special notations and styling
        this.handleSpecialNotations(formattedValue);

        // Announce to screen readers if requested
        if (announceToScreenReader) {
            this.announceToScreenReader(`Display shows ${formattedValue}`);
        }

        console.log(`📱 Display updated: ${formattedValue}`);
    }

    /**
     * Animate display update with smooth transitions
     *
     * Applies a smooth scale and fade animation when updating the display.
     * Queues animations if one is already in progress.
     *
     * @method animateDisplayUpdate
     * @param {string} value - New value to display
     * @private

     */
    animateDisplayUpdate(value) {
        // Queue animation if one is already running
        if (this.isAnimating) {
            this.animationQueue.push(value);
            return;
        }

        this.isAnimating = true;

        // Apply scale and fade animation
        if (this.displayElement) {
            this.displayElement.style.transition = 'transform 50ms ease-out, opacity 50ms ease-out';
            this.displayElement.style.transform = 'scale(1.02)';
            this.displayElement.style.opacity = '0.9';

            setTimeout(() => {
                // Update the value
                this.setDisplayValue(value);

                // Reset animation styles
                this.displayElement.style.transform = 'scale(1)';
                this.displayElement.style.opacity = '1';

                this.isAnimating = false;

                // Process queued animations
                if (this.animationQueue.length > 0) {
                    /** @type {string} */
                    const nextValue = this.animationQueue.shift();
                    this.animateDisplayUpdate(nextValue);
                }
            }, 50);
        } else {
            this.isAnimating = false;
        }
    }

    /**
     * Set display value without animation
     *
     * Directly sets the display value without any animation effects.
     *
     * @method setDisplayValue
     * @param {string} value - Value to set in the display
     * @private

     */
    setDisplayValue(value) {
        if (this.displayElement) {
            this.displayElement.value = value;
        }
    }

    /**
     * Update history display
     *
     * Updates the history display element with the provided text and
     * adjusts opacity based on content availability.
     *
     * @method updateHistory
     * @param {string} historyText - History text to display
     *
     * @example
     * displayManager.updateHistory('5 + 3 =');
     * displayManager.updateHistory(''); // Clear history
     *

     */
    updateHistory(historyText) {
        if (!this.historyElement) {
            console.warn('⚠️ History element not available');
            return;
        }

        this.historyElement.textContent = historyText;
        this.historyElement.style.opacity = historyText ? '1' : '0.6';

        // Announce history updates to screen readers for important changes
        if (historyText && this.screenReaderElement) {
            this.screenReaderElement.textContent = `History: ${historyText}`;
        }
    }

    /**
     * Format display value for presentation
     *
     * Formats numerical values for optimal display including locale-specific
     * formatting, scientific notation for large/small numbers, and special
     * handling for expressions and error states.
     *
     * @method formatDisplayValue
     * @param {string|number} value - Raw value to format
     * @returns {string} Formatted value ready for display
     *
     * @example
     * formatDisplayValue(1234567.89);     // "1,234,567.89"
     * formatDisplayValue(1e15);           // "1.00000000e+15"
     * formatDisplayValue('Error');        // "Error"
     * formatDisplayValue('5 + (3 * 2)');  // "5 + (3 * 2)"
     *

     */
    formatDisplayValue(value) {
        if (this.isErrorOrSpecialValue(value)) {
            return String(value);
        }

        if (this.isExpressionString(value)) {
            return value;
        }

        /** @type {number} */
        const num = parseFloat(value);
        if (isNaN(num)) return '0';

        if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-8 && num !== 0)) {
            return num.toExponential(8);
        }

        if (Number.isInteger(num)) {
            return num.toLocaleString();
        } else {
            return parseFloat(num.toPrecision(12)).toLocaleString();
        }
    }

    /**
     * Check if value is an error or special value
     * @private
     * @param {string|number} value
     * @returns {boolean}
     */
    isErrorOrSpecialValue(value) {
        return (
            value === 'Error' ||
            value === 'Infinity' ||
            value === '-Infinity' ||
            value === 'NaN'
        );
    }

    /**
     * Check if value is an expression string
     * @private
     * @param {string|number} value
     * @returns {boolean}
     */
    isExpressionString(value) {
        if (typeof value !== 'string') return false;
        return (
            value.includes('(') ||
            value.includes(')') ||
            value.includes('+') ||
            value.includes('-') ||
            value.includes('*') ||
            value.includes('/')
        );
    }

    /**
     * Adjust display text size based on content length
     *
     * Dynamically adjusts the font size of the display to ensure all content
     * remains visible and readable regardless of the value length.
     *
     * @method adjustDisplayTextSize
     * @param {string} value - Display value to measure
     * @private

     */
    adjustDisplayTextSize(value) {
        if (!this.displayElement) {
            console.warn('⚠️ Display element not available for text sizing');
            return;
        }

        /** @type {number} */
        const length = value.length;
        /** @type {string} */
        let fontSize = '2.5rem'; // Default size

        // Responsive font sizing based on content length
        if (length > 20) {
            fontSize = '1.5rem';
        } else if (length > 15) {
            fontSize = '1.8rem';
        } else if (length > 12) {
            fontSize = '2rem';
        } else if (length > 8) {
            fontSize = '2.2rem';
        }

        this.displayElement.style.fontSize = fontSize;
    }

    /**
     * Handle special notations and styling
     *
     * Applies appropriate CSS classes and styling for special display states
     * such as scientific notation, error states, and mathematical expressions.
     *
     * @method handleSpecialNotations
     * @param {string} value - Display value to analyze
     * @private

     */
    handleSpecialNotations(value) {
        if (!this.displayElement) {
            console.warn('⚠️ Display element not available for special notation handling');
            return;
        }

        // Handle scientific notation styling
        if (value.includes('e') || value.includes('E')) {
            this.displayElement.classList.add('scientific-notation');
        } else {
            this.displayElement.classList.remove('scientific-notation');
        }

        // Handle error state styling
        if (value === 'Error' || value === 'Infinity' || value === '-Infinity' || value === 'NaN') {
            this.displayElement.classList.add('error-state');
        } else {
            this.displayElement.classList.remove('error-state');
        }

        // Handle expression styling (for complex expressions)
        if (value.includes('(') || value.includes(')')) {
            this.displayElement.classList.add('expression-mode');
        } else {
            this.displayElement.classList.remove('expression-mode');
        }

        // Handle decimal styling
        if (value.includes('.')) {
            this.displayElement.classList.add('has-decimal');
        } else {
            this.displayElement.classList.remove('has-decimal');
        }
    }

    /**
     * Show error message with user feedback
     *
     * Displays an error message in the calculator with visual feedback,
     * haptic feedback, screen reader announcements, and automatic recovery.
     *
     * @method showError
     * @param {string} message - Error message to display
     * @param {number} [duration=3000] - Display duration in milliseconds
     *
     * @example
     * displayManager.showError('Division by zero');
     * displayManager.showError('Invalid operation', 5000);
     *

     */
    showError(message, duration = 3000) {
        try {
            // Format error message for display
            const displayMessage = message.length > 30 ?
                `${message.substring(0, 27)  }...` : message;

            this.updateDisplay(displayMessage, { animate: true, formatValue: false });
            this.displayElement?.classList.add('error-state');

            // Vibrate for error feedback if supported
            if (this.vibrationEnabled && navigator.vibrate) {
                navigator.vibrate([100, 50, 100]); // Error pattern
            }

            // Announce error to screen reader for accessibility
            if (this.screenReaderElement) {
                this.screenReaderElement.textContent = `Error: ${message}`;
                this.screenReaderElement.setAttribute('aria-live', 'assertive');
            }

            // Set timeout to clear error state
            this.errorTimeout = setTimeout(() => {
                this.displayElement?.classList.remove('error-state');

                // Restore previous value if available
                const state = this.modules?.state?.getState();
                if (state && state.currentValue) {
                    this.updateDisplay(state.currentValue, { animate: false });
                }

                // Reset screen reader
                if (this.screenReaderElement) {
                    this.screenReaderElement.setAttribute('aria-live', 'polite');
                }
            }, duration);

            // Log error for debugging
            console.warn('Calculator display error:', message);

        } catch (error) {
            // Fallback error handling if display error handler itself fails
            console.error('Error in error display handler:', error);
        }
    }

    /**
     * Clear display and history
     *
     * Resets both the main display and history display to their initial states.
     *
     * @method clear
     *
     * @example
     * displayManager.clear(); // Resets to "0" and clears history
     *

     */
    clear() {
        this.updateDisplay('0', { animate: true });
        this.updateHistory('');
        console.log('🧹 Display cleared');
    }

    /**
     * Get current display value
     *
     * Returns the current value shown in the calculator display.
     *
     * @method getCurrentValue
     * @returns {string} Current display value
     *
     * @example
     * const value = displayManager.getCurrentValue();
     * console.log('Current display:', value);
     *

     */
    getCurrentValue() {
        return this.displayElement?.value || '0';
    }

    /**
     * Announce message to screen readers
     *
     * Makes announcements to screen readers using ARIA live regions
     * for improved accessibility.
     *
     * @method announceToScreenReader
     * @param {string} message - Message to announce
     *
     * @example
     * displayManager.announceToScreenReader('Calculation complete');
     * displayManager.announceToScreenReader('Error: Division by zero');
     *

     */
    announceToScreenReader(message) {
        // Use the dedicated screen reader element if available
        if (this.screenReaderElement) {
            this.screenReaderElement.textContent = message;

            // Clear after announcement to avoid repetition
            setTimeout(() => {
                if (this.screenReaderElement) {
                    this.screenReaderElement.textContent = '';
                }
            }, 1000);
            return;
        }

        // Fallback: Create or update global live region
        /** @type {HTMLElement|null} */
        let liveRegion = document.getElementById('sr-announcements');

        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'sr-announcements';
            liveRegion.setAttribute('aria-live', 'assertive');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'visually-hidden';
            liveRegion.style.cssText = `
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            `;
            document.body.appendChild(liveRegion);
        }

        liveRegion.textContent = message;

        // Clear after announcement
        setTimeout(() => {
            if (liveRegion) {
                liveRegion.textContent = '';
            }
        }, 1000);
    }

    /**
     * Add visual feedback for button press
     * @param {HTMLElement} button - Button element
     */
    animateButton(button) {
        if (!button) return;

        button.classList.add('pressed');

        // Create ripple effect
        const ripple = button.querySelector('.ripple');
        if (ripple) {
            ripple.style.animation = 'none';
            const _ = ripple.offsetHeight; // Trigger reflow
            ripple.style.animation = 'ripple 0.6s ease-out';
        }

        setTimeout(() => {
            button.classList.remove('pressed');
        }, 150);
    }

    /**
     * Show toast notification
     *
     * Displays a temporary toast notification with the provided message.
     * Automatically removes existing toasts and provides accessibility support.
     *
     * @method showToast
     * @param {string} message - Toast message to display
     * @param {number} [duration=2000] - Display duration in milliseconds
     *
     * @example
     * displayManager.showToast('Calculation saved');
     * displayManager.showToast('Error occurred', 5000);
     *

     */
    showToast(message, duration = 2000) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);

        // Animate out and remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Trigger haptic feedback (if supported)
     *
     * Provides tactile feedback through device vibration when supported.
     * Respects user preferences and device capabilities.
     *
     * @method vibrate
     * @param {number} [duration=10] - Vibration duration in milliseconds
     *
     * @example
     * displayManager.vibrate();     // Short vibration
     * displayManager.vibrate(50);   // Longer vibration
     *

     */
    vibrate(duration = 10) {
        if (this.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }

    /**
     * Get comprehensive display statistics
     *
     * Returns detailed information about the display manager's current state
     * and performance metrics.
     *
     * @method getStatistics
     * @returns {DisplayStatistics} Display manager statistics
     *
     * @example
     * const stats = displayManager.getStatistics();
     * console.log('Display initialized:', stats.isInitialized);
     * console.log('Animation queue length:', stats.animationQueueLength);
     *

     */
    getStatistics() {
        return {
            isInitialized: this.isInitialized,
            currentValue: this.getCurrentValue(),
            animationQueueLength: this.animationQueue.length,
            isAnimating: this.isAnimating
        };
    }

    /**
     * Cleanup and destroy display manager
     *
     * Performs complete cleanup of the display manager, clearing all
     * references, timers, and DOM elements.
     *
     * @method destroy
     *
     * @example
     * displayManager.destroy(); // Clean shutdown
     *

     */
    destroy() {
        console.log('🧹 Destroying Display Manager...');

        // Clear animation queue and state
        this.animationQueue = [];
        this.isAnimating = false;

        // Clear any pending timeouts
        if (this.errorTimeout) {
            clearTimeout(this.errorTimeout);
            this.errorTimeout = null;
        }

        // Remove screen reader element
        if (this.screenReaderElement && this.screenReaderElement.parentNode) {
            this.screenReaderElement.parentNode.removeChild(this.screenReaderElement);
            this.screenReaderElement = null;
        }

        // Reset all references
        this.isInitialized = false;
        this.displayElement = null;
        this.historyElement = null;
        this.modules = null;

        console.log('✅ Display Manager destroyed successfully');
    }
}

// ------------ MODULE EXPORTS


export default DisplayManager;
