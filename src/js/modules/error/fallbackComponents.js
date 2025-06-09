/**
 * @file FALLBACK COMPONENTS MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Fallback UI components for The Great Calculator.
 * Provides graceful degradation when main components fail,
 * ensuring the calculator remains functional even during errors.
 *
 * Features:
 * - Fallback calculator display
 * - Fallback button grid
 * - Fallback history panel
 * - Emergency calculator mode
 * - Accessible fallback interfaces
 */

// ------------ FALLBACK COMPONENT GENERATORS

/**
 * Fallback Components Class
 *
 * Provides fallback UI components that can replace failed components
 * to maintain basic calculator functionality during errors.
 *
 * @class FallbackComponents
 * @example
 * const fallbacks = new FallbackComponents();
 * const displayHTML = fallbacks.generateDisplay();
 */
class FallbackComponents {
    /**
     * Create fallback components instance
     *
     * Initializes the fallback component generator with default styling
     * and accessibility features.
     */
    constructor() {
        /** @type {Object} */
        this.styles = this.getDefaultStyles();

        console.log('🎨 Fallback Components initialized');
    }

    /**
     * Get default styles for fallback components
     *
     * Returns CSS styles that ensure fallback components are
     * visually consistent and accessible.
     *
     * @method getDefaultStyles
     * @returns {Object} Style definitions
     * @private
     */
    getDefaultStyles() {
        return {
            container: `
                background: #f8f9fa;
                border: 2px solid #dee2e6;
                border-radius: 8px;
                padding: 20px;
                margin: 10px;
                text-align: center;
                font-family: system-ui, -apple-system, sans-serif;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            `,
            display: `
                background: #ffffff;
                border: 1px solid #ced4da;
                border-radius: 4px;
                padding: 15px;
                font-size: 24px;
                font-family: 'Courier New', monospace;
                text-align: right;
                margin-bottom: 15px;
                min-height: 50px;
                display: flex;
                align-items: center;
                justify-content: flex-end;
            `,
            button: `
                background: #007bff;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 12px 16px;
                margin: 2px;
                cursor: pointer;
                font-size: 16px;
                min-width: 50px;
                transition: background-color 0.2s;
            `,
            buttonSecondary: `
                background: #6c757d;
                color: white;
                border: none;
                border-radius: 4px;
                padding: 12px 16px;
                margin: 2px;
                cursor: pointer;
                font-size: 16px;
                min-width: 50px;
                transition: background-color 0.2s;
            `,
            warning: `
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 15px;
                font-size: 14px;
            `
        };
    }

    /**
     * Generate fallback calculator display
     *
     * Creates a basic calculator display that can replace the main display
     * when errors occur.
     *
     * @method generateDisplay
     * @param {string} [value='0'] - Initial display value
     * @returns {string} HTML for fallback display
     *
     * @example
     * const displayHTML = fallbacks.generateDisplay('123');
     */
    generateDisplay(value = '0') {
        return `
            <div class="fallback-calculator-display" style="${this.styles.container}">
                <div style="${this.styles.warning}">
                    ⚠️ Display temporarily using fallback mode
                </div>
                <div id="fallback-display" style="${this.styles.display}" role="textbox" aria-label="Calculator display">
                    ${value}
                </div>
                <div style="color: #666; font-size: 12px;">
                    Basic display functionality active
                </div>
            </div>
        `;
    }

    /**
     * Generate fallback button grid
     *
     * Creates a basic calculator button grid with essential operations
     * when the main button system fails.
     *
     * @method generateButtons
     * @returns {string} HTML for fallback buttons
     *
     * @example
     * const buttonsHTML = fallbacks.generateButtons();
     */
    generateButtons() {
        const buttons = [
            { text: 'C', action: 'clear', type: 'secondary' },
            { text: '±', action: 'negate', type: 'secondary' },
            { text: '%', action: 'percent', type: 'secondary' },
            { text: '÷', action: 'divide', type: 'primary' },

            { text: '7', action: 'number', type: 'primary' },
            { text: '8', action: 'number', type: 'primary' },
            { text: '9', action: 'number', type: 'primary' },
            { text: '×', action: 'multiply', type: 'primary' },

            { text: '4', action: 'number', type: 'primary' },
            { text: '5', action: 'number', type: 'primary' },
            { text: '6', action: 'number', type: 'primary' },
            { text: '−', action: 'subtract', type: 'primary' },

            { text: '1', action: 'number', type: 'primary' },
            { text: '2', action: 'number', type: 'primary' },
            { text: '3', action: 'number', type: 'primary' },
            { text: '+', action: 'add', type: 'primary' },

            { text: '0', action: 'number', type: 'primary', colspan: 2 },
            { text: '.', action: 'decimal', type: 'primary' },
            { text: '=', action: 'equals', type: 'primary' }
        ];

        let buttonHTML = '';
        let currentRow = '';
        let buttonsInRow = 0;

        for (const [index, button] of buttons.entries()) {
            const style = button.type === 'secondary' ? this.styles.buttonSecondary : this.styles.button;
            const colspan = button.colspan || 1;
            const width = colspan > 1 ? `width: ${50 * colspan + (colspan - 1) * 4 + 32}px;` : '';

            currentRow += `
                <button
                    onclick="fallbackCalculator.handleButton('${button.action}', '${button.text}')"
                    style="${style} ${width}"
                    aria-label="${button.text}"
                >
                    ${button.text}
                </button>
            `;

            buttonsInRow += colspan;

            // Start new row after 4 buttons
            if (buttonsInRow >= 4 || index === buttons.length - 1) {
                buttonHTML += `<div style="margin-bottom: 5px;">${currentRow}</div>`;
                currentRow = '';
                buttonsInRow = 0;
            }
        }

        return `
            <div class="fallback-calculator-buttons" style="${this.styles.container}">
                <div style="${this.styles.warning}">
                    ⚠️ Buttons temporarily using fallback mode
                </div>
                <div style="display: inline-block;">
                    ${buttonHTML}
                </div>
                <div style="color: #666; font-size: 12px; margin-top: 10px;">
                    Basic calculator operations available
                </div>
            </div>
        `;
    }

    /**
     * Generate fallback history panel
     *
     * Creates a basic history display when the main history system fails.
     *
     * @method generateHistory
     * @param {Array} [history=[]] - History items to display
     * @returns {string} HTML for fallback history
     *
     * @example
     * const historyHTML = fallbacks.generateHistory(['1+1=2', '2+2=4']);
     */
    generateHistory(history = []) {
        const historyItems = history.length > 0
            ? history.map(item => `<div style="padding: 5px; border-bottom: 1px solid #eee;">${item}</div>`).join('')
            : '<div style="color: #999; padding: 20px;">No history available</div>';

        return `
            <div class="fallback-calculator-history" style="${this.styles.container}">
                <div style="${this.styles.warning}">
                    ⚠️ History temporarily using fallback mode
                </div>
                <h3 style="margin-top: 0; color: #333;">Calculation History</h3>
                <div style="
                    max-height: 200px;
                    overflow-y: auto;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background: white;
                ">
                    ${historyItems}
                </div>
                <button
                    onclick="fallbackCalculator.clearHistory()"
                    style="${this.styles.buttonSecondary} margin-top: 10px;"
                >
                    Clear History
                </button>
            </div>
        `;
    }

    /**
     * Generate emergency calculator
     *
     * Creates a complete emergency calculator interface when
     * the main calculator completely fails.
     *
     * @method generateEmergencyCalculator
     * @returns {string} HTML for emergency calculator
     *
     * @example
     * const calculatorHTML = fallbacks.generateEmergencyCalculator();
     */
    generateEmergencyCalculator() {
        return `
            <div class="emergency-calculator" style="
                max-width: 400px;
                margin: 20px auto;
                padding: 20px;
                background: #f8f9fa;
                border: 2px solid #dc3545;
                border-radius: 12px;
                text-align: center;
                font-family: system-ui, sans-serif;
            ">
                <div style="
                    background: #f8d7da;
                    color: #721c24;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                ">
                    <h2 style="margin: 0 0 10px 0;">🚨 Emergency Calculator Mode</h2>
                    <p style="margin: 0; font-size: 14px;">
                        The main calculator encountered an error. This emergency mode provides basic functionality.
                    </p>
                </div>

                ${this.generateDisplay()}
                ${this.generateButtons()}

                <div style="margin-top: 20px; padding: 15px; background: #d1ecf1; border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; color: #0c5460;">Recovery Options</h4>
                    <button onclick="location.reload()" style="${this.styles.button} margin: 5px;">
                        Reload Calculator
                    </button>
                    <button onclick="fallbackCalculator.reportIssue()" style="${this.styles.buttonSecondary} margin: 5px;">
                        Report Issue
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Generate error message component
     *
     * Creates a user-friendly error message display.
     *
     * @method generateErrorMessage
     * @param {string} message - Error message to display
     * @param {string} [severity='medium'] - Error severity level
     * @returns {string} HTML for error message
     *
     * @example
     * const errorHTML = fallbacks.generateErrorMessage('Calculation failed', 'high');
     */
    generateErrorMessage(message, severity = 'medium') {
        const severityStyles = {
            low: { bg: '#d4edda', border: '#c3e6cb', color: '#155724', icon: 'ℹ️' },
            medium: { bg: '#fff3cd', border: '#ffeaa7', color: '#856404', icon: '⚠️' },
            high: { bg: '#f8d7da', border: '#f5c6cb', color: '#721c24', icon: '❌' },
            critical: { bg: '#f8d7da', border: '#f5c6cb', color: '#721c24', icon: '🚨' }
        };

        const style = severityStyles[severity] || severityStyles.medium;

        return `
            <div class="fallback-error-message" style="
                background: ${style.bg};
                border: 1px solid ${style.border};
                color: ${style.color};
                padding: 15px;
                border-radius: 8px;
                margin: 10px;
                text-align: center;
            ">
                <div style="font-size: 24px; margin-bottom: 10px;">${style.icon}</div>
                <div style="font-weight: bold; margin-bottom: 5px;">Error Occurred</div>
                <div>${message}</div>
                <button
                    onclick="this.parentElement.style.display='none'"
                    style="${this.styles.buttonSecondary} margin-top: 10px; font-size: 12px; padding: 8px 12px;"
                >
                    Dismiss
                </button>
            </div>
        `;
    }
}

// ------------ MODULE EXPORTS


export default FallbackComponents;
