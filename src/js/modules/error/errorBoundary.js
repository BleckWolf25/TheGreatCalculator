/**
 * @file ERROR BOUNDARY MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Error boundary system for The Great Calculator.
 * Provides comprehensive error handling, recovery mechanisms, and fallback UI
 * to prevent application crashes and provide graceful error recovery.
 *
 * Features:
 * - Global error boundary with automatic recovery
 * - Component-level error boundaries for isolated failures
 * - Fallback UI components for graceful degradation
 * - Error reporting and logging system
 * - User-friendly error messages and recovery options
 * - Automatic retry mechanisms for transient errors
 * - Error analytics and monitoring
 */

// ------------ ERROR TYPES AND CONSTANTS

/**
 * Error severity levels
 * @readonly
 * @enum {string}
 */
const ERROR_SEVERITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

/**
 * Error categories for better classification
 * @readonly
 * @enum {string}
 */
const ERROR_CATEGORIES = {
    CALCULATION: 'calculation',
    UI: 'ui',
    STORAGE: 'storage',
    NETWORK: 'network',
    INITIALIZATION: 'initialization',
    VALIDATION: 'validation',
    UNKNOWN: 'unknown'
};

/**
 * Recovery strategies for different error types
 * @readonly
 * @enum {string}
 */
const RECOVERY_STRATEGIES = {
    RETRY: 'retry',
    FALLBACK: 'fallback',
    RESET: 'reset',
    RELOAD: 'reload',
    IGNORE: 'ignore'
};

// ------------ ERROR BOUNDARY CLASS

/**
 * Error Boundary Class
 *
 * Provides comprehensive error handling and recovery mechanisms
 * to prevent application crashes and ensure graceful degradation.
 *
 * @class ErrorBoundary
 * @example
 * const errorBoundary = new ErrorBoundary();
 * errorBoundary.initialize();
 *
 * // Wrap risky operations
 * errorBoundary.wrapOperation(() => {
 *   // Potentially failing code
 * }, 'calculation');
 */
class ErrorBoundary {
    /**
     * Create error boundary instance
     *
     * Initializes the error boundary with default configuration
     * and sets up error tracking mechanisms.
     */
    constructor() {
        /** @type {boolean} */
        this.isInitialized = false;

        /** @type {Array<ErrorReport>} */
        this.errorHistory = [];

        /** @type {Map<string, number>} */
        this.errorCounts = new Map();

        /** @type {Map<string, Function>} */
        this.fallbackComponents = new Map();

        /** @type {Map<string, Function>} */
        this.recoveryHandlers = new Map();

        /** @type {Array<Function>} */
        this.errorListeners = [];

        /** @type {HTMLElement|null} */
        this.errorContainer = null;

        /** @type {boolean} */
        this.isInErrorState = false;

        /** @type {number} */
        this.maxRetryAttempts = 3;

        /** @type {number} */
        this.retryDelay = 1000;

        /** @type {boolean} */
        this.enableErrorReporting = true;

        /** @type {boolean} */
        this.enableAutoRecovery = true;

        /** @type {Object|null} Last operation context for retry functionality */
        this.lastOperationContext = null;

        /** @type {Function|null} Last failed operation for retry */
        this.lastFailedOperation = null;

        /** @type {string} Last operation category for retry */
        this.lastOperationCategory = ERROR_CATEGORIES.UNKNOWN;

        console.log('🛡️ Error Boundary created');
    }

    /**
     * Initialize error boundary system
     *
     * Sets up global error handlers, creates error UI container,
     * and configures error recovery mechanisms.
     *
     * @method initialize
     * @returns {boolean} Success status
     *
     * @example
     * const success = errorBoundary.initialize();
     * if (success) {
     *   console.log('Error boundary ready');
     * }
     */
    initialize() {
        try {
            console.log('🛡️ Initializing Error Boundary...');

            // Set up global error handlers
            this.setupGlobalErrorHandlers();

            // Create error UI container
            this.createErrorContainer();

            // Register default fallback components
            this.registerDefaultFallbacks();

            // Register default recovery handlers
            this.registerDefaultRecoveryHandlers();

            this.isInitialized = true;
            console.log('✅ Error Boundary initialized successfully');
            return true;

        } catch (error) {
            console.error('❌ Error Boundary initialization failed:', error);
            return false;
        }
    }

    /**
     * Set up global error handlers
     *
     * Registers window-level error handlers to catch unhandled errors
     * and promise rejections throughout the application.
     *
     * @method setupGlobalErrorHandlers
     * @private
     */
    setupGlobalErrorHandlers() {
        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleGlobalError({
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error,
                type: 'javascript'
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError({
                message: event.reason?.message || 'Unhandled promise rejection',
                error: event.reason,
                type: 'promise'
            });
        });

        console.log('🔧 Global error handlers configured');
    }

    /**
     * Create error container UI
     *
     * Creates a dedicated container for displaying error messages
     * and recovery options to the user.
     *
     * @method createErrorContainer
     * @private
     */
    createErrorContainer() {
        this.errorContainer = document.createElement('div');
        this.errorContainer.id = 'error-boundary-container';
        this.errorContainer.className = 'error-boundary-container';
        this.errorContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
        `;

        document.body.append(this.errorContainer);
        console.log('🎨 Error container created');
    }

    /**
     * Register default fallback components
     *
     * Sets up default fallback UI components for common error scenarios
     * to ensure the application remains functional.
     *
     * @method registerDefaultFallbacks
     * @private
     */
    registerDefaultFallbacks() {
        // Calculator display fallback
        this.registerFallback('display', () => {
            return `
                <div class="fallback-display" style="
                    background: #f0f0f0;
                    border: 2px solid #ccc;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px;
                    margin: 10px;
                ">
                    <div style="font-size: 24px; margin-bottom: 10px;">0</div>
                    <div style="color: #666; font-size: 14px;">Display temporarily unavailable</div>
                </div>
            `;
        });

        // Calculator buttons fallback
        this.registerFallback('buttons', () => {
            return `
                <div class="fallback-buttons" style="
                    background: #f8f8f8;
                    border: 1px solid #ddd;
                    padding: 20px;
                    text-align: center;
                    border-radius: 8px;
                    margin: 10px;
                ">
                    <div style="margin-bottom: 15px; color: #666;">
                        Calculator buttons temporarily unavailable
                    </div>
                    <button onclick="location.reload()" style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Reload Calculator</button>
                </div>
            `;
        });

        console.log('🔧 Default fallback components registered');
    }

    /**
     * Register default recovery handlers
     *
     * Sets up default recovery strategies for common error types
     * to enable automatic error recovery.
     *
     * @method registerDefaultRecoveryHandlers
     * @private
     */
    registerDefaultRecoveryHandlers() {
        // Calculation error recovery
        this.registerRecoveryHandler('calculation', (error, context) => {
            console.log('🔄 Attempting calculation error recovery...');

            // Reset calculator state to safe values
            if (context.modules?.state) {
                context.modules.state.updateState({
                    currentValue: '0',
                    isNewNumber: true,
                    operator: null,
                    previousValue: null
                });
            }

            // Clear display error state
            if (context.modules?.display) {
                context.modules.display.updateDisplay('0');
            }

            return { success: true, message: 'Calculator reset to safe state' };
        });

        // UI error recovery
        this.registerRecoveryHandler('ui', (error, context) => {
            console.log('🔄 Attempting UI error recovery...');

            // Try to restore UI elements
            const fallbackUI = this.getFallback('display');
            if (fallbackUI && context.container) {
                context.container.innerHTML = fallbackUI;
                return { success: true, message: 'UI restored with fallback' };
            }

            return { success: false, message: 'UI recovery failed' };
        });

        console.log('🔧 Default recovery handlers registered');
    }

    // ------------ ERROR HANDLING METHODS

    /**
     * Handle global errors
     *
     * Processes global errors caught by window error handlers
     * and determines appropriate recovery strategies.
     *
     * @method handleGlobalError
     * @param {Object} errorInfo - Error information object
     * @private
     */
    handleGlobalError(errorInfo) {
        const errorReport = this.createErrorReport(errorInfo, ERROR_CATEGORIES.UNKNOWN, ERROR_SEVERITY.HIGH);

        console.error('🚨 Global error caught:', errorReport);

        // Record error
        this.recordError(errorReport);

        // Attempt recovery if enabled
        if (this.enableAutoRecovery && !this.isInErrorState) {
            void this.attemptRecovery(errorReport);
        } else {
            this.showErrorUI(errorReport);
        }
    }

    /**
     * Wrap operation with error boundary
     *
     * Wraps a potentially failing operation with error handling
     * and automatic recovery mechanisms.
     *
     * @method wrapOperation
     * @param {Function} operation - Operation to wrap
     * @param {string} category - Error category for classification
     * @param {Object} [context] - Additional context for recovery
     * @returns {Promise<any>} Operation result or error
     *
     * @example
     * const result = await errorBoundary.wrapOperation(
     *   () => calculator.performCalculation(),
     *   'calculation',
     *   { modules: calculator.modules }
     * );
     */
    async wrapOperation(operation, category = ERROR_CATEGORIES.UNKNOWN, context = {}) {
        try {
            // Store operation context for potential retry
            this.lastOperationContext = { ...context };
            this.lastFailedOperation = operation;
            this.lastOperationCategory = category;

            const result = await operation();

            // Clear retry context on success
            this.clearRetryContext();

            return result;
        } catch (error) {
            const errorReport = this.createErrorReport(
                { error, message: error.message },
                category,
                this.determineSeverity(error, category)
            );

            console.error(`🚨 Operation error in ${category}:`, errorReport);

            // Record error
            this.recordError(errorReport);

            // Store context for retry
            this.lastOperationContext = {
                ...context,
                operation,
                errorReport,
                timestamp: Date.now()
            };

            // Attempt recovery
            const recoveryResult = await this.attemptRecovery(errorReport, context);

            if (!recoveryResult.success) {
                // If recovery fails, show error UI
                this.showErrorUI(errorReport);
                throw error;
            }

            return recoveryResult.result;
        }
    }

    /**
     * Create error report
     *
     * Creates a standardized error report with all relevant information
     * for logging, recovery, and user display.
     *
     * @method createErrorReport
     * @param {Object} errorInfo - Raw error information
     * @param {string} category - Error category
     * @param {string} severity - Error severity level
     * @returns {ErrorReport} Formatted error report
     * @private
     */
    createErrorReport(errorInfo, category, severity) {
        return {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            message: errorInfo.message || 'Unknown error',
            category,
            severity,
            stack: errorInfo.error?.stack,
            filename: errorInfo.filename,
            lineno: errorInfo.lineno,
            colno: errorInfo.colno,
            userAgent: navigator.userAgent,
            url: window.location.href,
            type: errorInfo.type || 'unknown'
        };
    }

    /**
     * Determine error severity
     *
     * Analyzes error characteristics to determine appropriate severity level
     * for proper handling and recovery strategies.
     *
     * @method determineSeverity
     * @param {Error} error - Error object
     * @param {string} category - Error category
     * @returns {string} Severity level
     * @private
     */
    determineSeverity(error, category) {
        // Critical errors that require immediate attention
        if (error.message.includes('initialization') ||
            error.message.includes('module') ||
            category === ERROR_CATEGORIES.INITIALIZATION) {
            return ERROR_SEVERITY.CRITICAL;
        }

        // High severity for calculation errors that affect core functionality
        if (category === ERROR_CATEGORIES.CALCULATION &&
            (error.message.includes('division by zero') ||
             error.message.includes('invalid'))) {
            return ERROR_SEVERITY.HIGH;
        }

        // Medium severity for UI and storage errors
        if (category === ERROR_CATEGORIES.UI ||
            category === ERROR_CATEGORIES.STORAGE) {
            return ERROR_SEVERITY.MEDIUM;
        }

        // Default to low severity
        return ERROR_SEVERITY.LOW;
    }

    /**
     * Record error in history
     *
     * Stores error information for analytics and debugging purposes
     * while maintaining a reasonable history size.
     *
     * @method recordError
     * @param {ErrorReport} errorReport - Error report to record
     * @private
     */
    recordError(errorReport) {
        // Add to error history
        this.errorHistory.push(errorReport);

        // Maintain history size (keep last 100 errors)
        if (this.errorHistory.length > 100) {
            this.errorHistory.shift();
        }

        // Update error counts
        const key = `${errorReport.category}:${errorReport.message}`;
        this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);

        // Notify error listeners
        this.notifyErrorListeners(errorReport);

        // Log for debugging (avoid logging objects to prevent hook.js interference)
        if (this.enableErrorReporting) {
            console.warn(`📊 Error recorded: [${errorReport.severity}] ${errorReport.category}: ${errorReport.message} (ID: ${errorReport.id})`);
        }
    }

    /**
     * Attempt error recovery
     *
     * Tries to recover from errors using registered recovery handlers
     * and fallback strategies.
     *
     * @method attemptRecovery
     * @param {ErrorReport} errorReport - Error to recover from
     * @param {Object} [context] - Recovery context
     * @returns {Promise<Object>} Recovery result
     * @private
     */
    async attemptRecovery(errorReport, context = {}) {
        console.log(`🔄 Attempting recovery for ${errorReport.category} error...`);

        // Prevent recursive recovery attempts
        if (this.isInErrorState) {
            return { success: false, message: 'Already in error state' };
        }

        this.isInErrorState = true;

        try {
            // Try category-specific recovery handler
            const recoveryHandler = this.recoveryHandlers.get(errorReport.category);
            if (recoveryHandler) {
                const result = await recoveryHandler(errorReport, context);
                if (result.success) {
                    console.log('✅ Recovery successful:', result.message);
                    this.isInErrorState = false;
                    return result;
                }
            }

            // Try generic recovery strategies
            const genericResult = await this.tryGenericRecovery(errorReport, context);
            this.isInErrorState = false;
            return genericResult;

        } catch (recoveryError) {
            console.error('❌ Recovery attempt failed:', recoveryError);
            this.isInErrorState = false;
            return { success: false, message: 'Recovery failed', error: recoveryError };
        }
    }

    /**
     * Try generic recovery strategies
     *
     * Attempts common recovery strategies when specific handlers fail
     * or are not available.
     *
     * @method tryGenericRecovery
     * @param {ErrorReport} errorReport - Error to recover from
     * @param {Object} context - Recovery context
     * @returns {Promise<Object>} Recovery result
     * @private
     */
    async tryGenericRecovery(errorReport, context) {
        console.log('🔄 Trying generic recovery strategies...');

        // Strategy 1: Retry operation for transient errors
        if (this.isTransientError(errorReport)) {
            return this.retryOperation(errorReport, context);
        }

        // Strategy 2: Use fallback components
        if (this.fallbackComponents.has(errorReport.category)) {
            return this.useFallbackComponent(errorReport, context);
        }

        // Strategy 3: Reset to safe state
        if (errorReport.severity === ERROR_SEVERITY.HIGH ||
            errorReport.severity === ERROR_SEVERITY.CRITICAL) {
            return this.resetToSafeState(context);
        }

        // Strategy 4: Ignore low-severity errors
        if (errorReport.severity === ERROR_SEVERITY.LOW) {
            console.log('🔄 Ignoring low-severity error');
            return { success: true, message: 'Error ignored', strategy: 'ignore' };
        }

        return { success: false, message: 'No recovery strategy available' };
    }

    /**
     * Check if error is transient
     *
     * Determines if an error is likely to be temporary and worth retrying.
     *
     * @method isTransientError
     * @param {ErrorReport} errorReport - Error to check
     * @returns {boolean} True if error appears transient
     * @private
     */
    isTransientError(errorReport) {
        const transientPatterns = [
            'network',
            'timeout',
            'connection',
            'temporary',
            'unavailable'
        ];

        return transientPatterns.some(pattern =>
            errorReport.message.toLowerCase().includes(pattern)
        );
    }

    /**
     * Retry operation with exponential backoff
     *
     * Attempts to retry a failed operation with increasing delays
     * between attempts.
     *
     * @method retryOperation
     * @param {ErrorReport} errorReport - Original error
     * @param {Object} context - Operation context
     * @returns {Promise<Object>} Retry result
     * @private
     */
    async retryOperation(errorReport, context) {
        if (!context.operation) {
            return { success: false, message: 'No operation to retry' };
        }

        for (let attempt = 1; attempt <= this.maxRetryAttempts; attempt++) {
            console.log(`🔄 Retry attempt ${attempt}/${this.maxRetryAttempts}`);

            try {
                // Wait with exponential backoff
                if (attempt > 1) {
                    const delay = this.retryDelay * 2**(attempt - 2);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                const result = await context.operation();
                console.log('✅ Retry successful');
                return { success: true, result, strategy: 'retry', attempts: attempt };

            } catch (retryError) {
                console.warn(`❌ Retry attempt ${attempt} failed:`, retryError.message);

                if (attempt === this.maxRetryAttempts) {
                    return {
                        success: false,
                        message: `All ${this.maxRetryAttempts} retry attempts failed`,
                        lastError: retryError
                    };
                }
            }
        }

        // This should never be reached, but ensures consistent return
        return {
            success: false,
            message: 'Retry operation completed without result',
            attempts: this.maxRetryAttempts
        };
    }

    /**
     * Use fallback component
     *
     * Replaces failed component with a fallback version to maintain
     * basic functionality.
     *
     * @method useFallbackComponent
     * @param {ErrorReport} errorReport - Error that triggered fallback
     * @param {Object} context - Component context
     * @returns {Object} Fallback result
     * @private
     */
    useFallbackComponent(errorReport, context) {
        console.log(`🔄 Using fallback component for ${errorReport.category}`);

        try {
            const fallbackGenerator = this.fallbackComponents.get(errorReport.category);
            const fallbackHTML = fallbackGenerator();

            if (context.container) {
                context.container.innerHTML = fallbackHTML;
                console.log('✅ Fallback component rendered');
                return { success: true, message: 'Fallback component active', strategy: 'fallback' };
            }

            return { success: false, message: 'No container for fallback component' };

        } catch (fallbackError) {
            console.error('❌ Fallback component failed:', fallbackError);
            return { success: false, message: 'Fallback component failed', error: fallbackError };
        }
    }

    /**
     * Reset to safe state
     *
     * Resets the application to a known safe state to recover from
     * critical errors.
     *
     * @method resetToSafeState
     * @param {Object} context - Application context
     * @returns {Object} Reset result
     * @private
     */
    resetToSafeState(context) {
        console.log('🔄 Resetting to safe state...');

        try {
            // Reset calculator state if available
            if (context.modules?.state) {
                context.modules.state.reset(true); // Hard reset
                console.log('✅ Calculator state reset');
            }

            // Clear display if available
            if (context.modules?.display) {
                context.modules.display.clear();
                context.modules.display.updateDisplay('0');
                console.log('✅ Display cleared');
            }

            // Clear any error states
            this.clearErrorUI();

            return { success: true, message: 'Application reset to safe state', strategy: 'reset' };

        } catch (resetError) {
            console.error('❌ Safe state reset failed:', resetError);
            return { success: false, message: 'Safe state reset failed', error: resetError };
        }
    }

    // ------------ UI METHODS

    /**
     * Show error UI to user
     *
     * Displays a user-friendly error message with recovery options
     * when automatic recovery fails.
     *
     * @method showErrorUI
     * @param {ErrorReport} errorReport - Error to display
     */
    showErrorUI(errorReport) {
        if (!this.errorContainer) {
            console.error('❌ Error container not available');
            return;
        }

        const userMessage = this.getUserFriendlyMessage(errorReport);
        const recoveryOptions = this.getRecoveryOptions(errorReport);

        this.errorContainer.innerHTML = `
            <div style="
                background: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                margin: 20px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                text-align: center;
            ">
                <div style="
                    font-size: 48px;
                    margin-bottom: 20px;
                ">${this.getErrorIcon(errorReport.severity)}</div>

                <h2 style="
                    color: #333;
                    margin-bottom: 15px;
                    font-size: 24px;
                ">Oops! Something went wrong</h2>

                <p style="
                    color: #666;
                    margin-bottom: 25px;
                    line-height: 1.5;
                ">${userMessage}</p>

                <div style="margin-bottom: 20px;">
                    ${recoveryOptions}
                </div>

                <details style="
                    margin-top: 20px;
                    text-align: left;
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                ">
                    <summary style="cursor: pointer; font-weight: bold; color: #666;">
                        Technical Details
                    </summary>
                    <div style="margin-top: 10px; font-family: monospace; font-size: 12px; color: #666;">
                        <div><strong>Error ID:</strong> ${errorReport.id}</div>
                        <div><strong>Category:</strong> ${errorReport.category}</div>
                        <div><strong>Time:</strong> ${new Date(errorReport.timestamp).toLocaleString()}</div>
                        <div><strong>Message:</strong> ${errorReport.message}</div>
                    </div>
                </details>
            </div>
        `;

        this.errorContainer.style.display = 'flex';
        console.log('🎨 Error UI displayed');
    }

    /**
     * Get user-friendly error message
     *
     * Converts technical error messages into user-friendly explanations
     * that help users understand what happened.
     *
     * @method getUserFriendlyMessage
     * @param {ErrorReport} errorReport - Error to convert
     * @returns {string} User-friendly message
     * @private
     */
    getUserFriendlyMessage(errorReport) {
        const messageMap = {
            'Division by zero': 'Cannot divide by zero. Please try a different calculation.',
            'Square root of negative': 'Cannot calculate square root of negative numbers.',
            'Invalid expression': 'The calculation format is not valid. Please check your input.',
            'Network error': 'Connection problem detected. Please check your internet connection.',
            'Storage error': 'Unable to save your data. Please try again.',
            'Initialization failed': 'Calculator failed to start properly. Please reload the page.'
        };

        // Check for known error patterns
        for (const [pattern, message] of Object.entries(messageMap)) {
            if (errorReport.message.toLowerCase().includes(pattern.toLowerCase())) {
                return message;
            }
        }

        // Default message based on category
        switch (errorReport.category) {
            case ERROR_CATEGORIES.CALCULATION: {
                return 'A calculation error occurred. Please try a different operation.';
            }
            case ERROR_CATEGORIES.UI: {
                return 'The interface encountered an issue. Some features may be temporarily unavailable.';
            }
            case ERROR_CATEGORIES.STORAGE: {
                return 'Unable to save or load data. Your recent work may not be saved.';
            }
            case ERROR_CATEGORIES.NETWORK: {
                return 'Network connection issue. Some features may not work properly.';
            }
            default: {
                return 'An unexpected error occurred. The calculator should continue to work normally.';
            }
        }
    }

    /**
     * Get recovery options HTML
     *
     * Generates HTML for recovery action buttons based on error type
     * and available recovery strategies.
     *
     * @method getRecoveryOptions
     * @param {ErrorReport} errorReport - Error to create options for
     * @returns {string} HTML for recovery options
     * @private
     */
    getRecoveryOptions(errorReport) {
        const buttonStyle = `
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            margin: 5px;
            font-size: 14px;
            transition: background 0.2s;
        `;

        const secondaryButtonStyle = buttonStyle.replace('#007bff', '#6c757d');

        let options = '';

        // Always offer to try again
        options += `
            <button onclick="errorBoundary.retryLastOperation()" style="${buttonStyle}">
                Try Again
            </button>
        `;

        // Offer reset for calculation errors
        if (errorReport.category === ERROR_CATEGORIES.CALCULATION) {
            options += `
                <button onclick="errorBoundary.resetCalculator()" style="${secondaryButtonStyle}">
                    Reset Calculator
                </button>
            `;
        }

        // Always offer reload as last resort
        options += `
            <button onclick="location.reload()" style="${secondaryButtonStyle}">
                Reload Page
            </button>
        `;

        // Add dismiss button for non-critical errors
        if (errorReport.severity !== ERROR_SEVERITY.CRITICAL) {
            options += `
                <button onclick="errorBoundary.dismissError()" style="${secondaryButtonStyle}">
                    Dismiss
                </button>
            `;
        }

        return options;
    }

    /**
     * Get error icon based on severity
     *
     * Returns appropriate emoji icon for error severity level.
     *
     * @method getErrorIcon
     * @param {string} severity - Error severity level
     * @returns {string} Emoji icon
     * @private
     */
    getErrorIcon(severity) {
        switch (severity) {
            case ERROR_SEVERITY.CRITICAL: {
                return '🚨';
            }
            case ERROR_SEVERITY.HIGH: {
                return '⚠️';
            }
            case ERROR_SEVERITY.MEDIUM: {
                return '⚡';
            }
            case ERROR_SEVERITY.LOW: {
                return 'ℹ️';
            }
            default: {
                return '❓';
            }
        }
    }

    /**
     * Clear error UI
     *
     * Hides the error display and returns to normal operation.
     *
     * @method clearErrorUI
     */
    clearErrorUI() {
        if (this.errorContainer) {
            this.errorContainer.style.display = 'none';
            this.errorContainer.innerHTML = '';
        }
        this.isInErrorState = false;
        console.log('🎨 Error UI cleared');
    }

    // ------------ PUBLIC API METHODS

    /**
     * Register fallback component
     *
     * Registers a fallback component generator for a specific category
     * to provide graceful degradation when errors occur.
     *
     * @method registerFallback
     * @param {string} category - Error category
     * @param {Function} generator - Function that returns fallback HTML
     *
     * @example
     * errorBoundary.registerFallback('display', () => {
     *   return '<div>Fallback display</div>';
     * });
     */
    registerFallback(category, generator) {
        this.fallbackComponents.set(category, generator);
        console.log(`🔧 Fallback registered for ${category}`);
    }

    /**
     * Register recovery handler
     *
     * Registers a custom recovery handler for a specific error category
     * to enable automatic error recovery.
     *
     * @method registerRecoveryHandler
     * @param {string} category - Error category
     * @param {Function} handler - Recovery handler function
     *
     * @example
     * errorBoundary.registerRecoveryHandler('calculation', (error, context) => {
     *   // Custom recovery logic
     *   return { success: true, message: 'Recovered' };
     * });
     */
    registerRecoveryHandler(category, handler) {
        this.recoveryHandlers.set(category, handler);
        console.log(`🔧 Recovery handler registered for ${category}`);
    }

    /**
     * Add error listener
     *
     * Adds a listener function that will be called whenever an error occurs
     * for custom error handling and monitoring.
     *
     * @method addErrorListener
     * @param {Function} listener - Error listener function
     *
     * @example
     * errorBoundary.addErrorListener((errorReport) => {
     *   console.log('Error occurred:', errorReport);
     * });
     */
    addErrorListener(listener) {
        this.errorListeners.push(listener);
        console.log('🔧 Error listener added');
    }

    /**
     * Get fallback component
     *
     * Retrieves a registered fallback component for a category.
     *
     * @method getFallback
     * @param {string} category - Error category
     * @returns {string|null} Fallback HTML or null
     */
    getFallback(category) {
        const generator = this.fallbackComponents.get(category);
        return generator ? generator() : null;
    }

    /**
     * Retry last operation
     *
     * Public method to retry the last failed operation from the UI.
     * Called by recovery buttons in the error UI.
     *
     * @method retryLastOperation
     * @returns {Promise<void>}
     */
    async retryLastOperation() {
        console.log('🔄 User requested retry...');
        this.clearErrorUI();

        if (!this.lastFailedOperation || !this.lastOperationContext) {
            console.warn('⚠️ No operation available to retry');
            this.showRetryUnavailableMessage();
            return;
        }

        try {
            console.log(`🔄 Retrying ${this.lastOperationCategory} operation...`);

            // Attempt to retry the last failed operation
            const result = await this.wrapOperation(
                this.lastFailedOperation,
                this.lastOperationCategory,
                this.lastOperationContext
            );

            console.log('✅ Manual retry successful:', result);

            // Show success message
            this.showRetrySuccessMessage();

            // Clear retry context after successful retry
            this.clearRetryContext();

        } catch (error) {
            console.error('❌ Manual retry failed:', error);

            // Show retry failed message
            this.showRetryFailedMessage(error);
        }
    }

    /**
     * Reset calculator
     *
     * Public method to reset the calculator to a safe state.
     * Called by recovery buttons in the error UI.
     *
     * @method resetCalculator
     */
    resetCalculator() {
        console.log('🔄 User requested calculator reset...');

        // Dispatch reset event for calculator to handle
        window.dispatchEvent(new CustomEvent('calculator-reset', {
            detail: { source: 'error-boundary' }
        }));

        this.clearErrorUI();
    }

    /**
     * Dismiss error
     *
     * Public method to dismiss the current error display.
     * Called by dismiss buttons in the error UI.
     *
     * @method dismissError
     */
    dismissError() {
        console.log('🔄 User dismissed error');
        this.clearErrorUI();
    }

    // ------------ RETRY HELPER METHODS

    /**
     * Clear retry context
     *
     * Clears stored operation context and retry information.
     *
     * @method clearRetryContext
     * @private
     */
    clearRetryContext() {
        this.lastOperationContext = null;
        this.lastFailedOperation = null;
        this.lastOperationCategory = ERROR_CATEGORIES.UNKNOWN;
        console.log('🧹 Retry context cleared');
    }

    /**
     * Show retry unavailable message
     *
     * Displays a message when no operation is available to retry.
     *
     * @method showRetryUnavailableMessage
     * @private
     */
    showRetryUnavailableMessage() {
        if (this.errorContainer) {
            this.errorContainer.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    max-width: 400px;
                    margin: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 20px;">ℹ️</div>
                    <h3 style="color: #333; margin-bottom: 15px;">No Operation to Retry</h3>
                    <p style="color: #666; margin-bottom: 25px;">
                        There is no recent operation available to retry.
                    </p>
                    <button onclick="errorBoundary.dismissError()" style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">OK</button>
                </div>
            `;
            this.errorContainer.style.display = 'flex';
        }
    }

    /**
     * Show retry success message
     *
     * Displays a success message when retry operation succeeds.
     *
     * @method showRetrySuccessMessage
     * @private
     */
    showRetrySuccessMessage() {
        if (this.errorContainer) {
            this.errorContainer.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    max-width: 400px;
                    margin: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
                    <h3 style="color: #28a745; margin-bottom: 15px;">Retry Successful!</h3>
                    <p style="color: #666; margin-bottom: 25px;">
                        The operation completed successfully.
                    </p>
                    <button onclick="errorBoundary.dismissError()" style="
                        background: #28a745;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                    ">Continue</button>
                </div>
            `;
            this.errorContainer.style.display = 'flex';

            // Auto-dismiss after 2 seconds
            setTimeout(() => {
                this.dismissError();
            }, 2000);
        }
    }

    /**
     * Show retry failed message
     *
     * Displays a message when retry operation fails.
     *
     * @method showRetryFailedMessage
     * @param {Error} error - The retry error
     * @private
     */
    showRetryFailedMessage(error) {
        if (this.errorContainer) {
            this.errorContainer.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    max-width: 400px;
                    margin: 20px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    text-align: center;
                ">
                    <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                    <h3 style="color: #dc3545; margin-bottom: 15px;">Retry Failed</h3>
                    <p style="color: #666; margin-bottom: 25px;">
                        The retry operation failed. ${error.message}
                    </p>
                    <div>
                        <button onclick="errorBoundary.resetCalculator()" style="
                            background: #6c757d;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            cursor: pointer;
                            margin: 5px;
                            font-size: 14px;
                        ">Reset Calculator</button>
                        <button onclick="location.reload()" style="
                            background: #dc3545;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            cursor: pointer;
                            margin: 5px;
                            font-size: 14px;
                        ">Reload Page</button>
                    </div>
                </div>
            `;
            this.errorContainer.style.display = 'flex';
        }
    }

    // ------------ UTILITY METHODS

    /**
     * Generate unique error ID
     *
     * Creates a unique identifier for error tracking and debugging.
     *
     * @method generateErrorId
     * @returns {string} Unique error ID
     * @private
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }

    /**
     * Notify error listeners
     *
     * Calls all registered error listeners with the error report.
     *
     * @method notifyErrorListeners
     * @param {ErrorReport} errorReport - Error to notify about
     * @private
     */
    notifyErrorListeners(errorReport) {
        for (const listener of this.errorListeners) {
            try {
                listener(errorReport);
            } catch (listenerError) {
                console.error('Error in error listener:', listenerError);
            }
        }
    }

    /**
     * Get error statistics
     *
     * Returns comprehensive error statistics for monitoring and debugging.
     *
     * @method getErrorStats
     * @returns {Object} Error statistics
     *
     * @example
     * const stats = errorBoundary.getErrorStats();
     * console.log('Total errors:', stats.totalErrors);
     */
    getErrorStats() {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const recentErrors = this.errorHistory.filter(
            error => new Date(error.timestamp) > last24Hours
        );

        const errorsByCategory = {};
        const errorsBySeverity = {};

        for (const error of this.errorHistory) {
            errorsByCategory[error.category] = (errorsByCategory[error.category] || 0) + 1;
            errorsBySeverity[error.severity] = (errorsBySeverity[error.severity] || 0) + 1;
        }

        return {
            totalErrors: this.errorHistory.length,
            recentErrors: recentErrors.length,
            errorsByCategory,
            errorsBySeverity,
            mostCommonErrors: [...this.errorCounts.entries()]
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            isInErrorState: this.isInErrorState
        };
    }

    /**
     * Destroy error boundary
     *
     * Cleans up the error boundary and removes all listeners and UI elements.
     *
     * @method destroy
     */
    destroy() {
        console.log('🧹 Destroying Error Boundary...');

        // Remove global error handlers
        window.removeEventListener('error', this.handleGlobalError);
        window.removeEventListener('unhandledrejection', this.handleGlobalError);

        // Remove error container
        if (this.errorContainer && this.errorContainer.parentNode) {
            this.errorContainer.remove();
        }

        // Clear all data
        this.errorHistory = [];
        this.errorCounts.clear();
        this.fallbackComponents.clear();
        this.recoveryHandlers.clear();
        this.errorListeners = [];

        // Clear retry context
        this.clearRetryContext();

        this.isInitialized = false;
        console.log('✅ Error Boundary destroyed');
    }
}

// ------------ MODULE EXPORTS

// Export constants for external use
export { ERROR_SEVERITY, ERROR_CATEGORIES, RECOVERY_STRATEGIES };


export default ErrorBoundary;
