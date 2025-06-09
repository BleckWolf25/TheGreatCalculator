/**
 * @file CALCULATION COORDINATOR MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Calculation coordination module for The Great Calculator.
 * Orchestrates calculation flow between operations, state management, and display modules.
 * Provides comprehensive error handling, calculation history tracking, and result processing.
 *
 * Features:
 * - Centralized calculation execution and coordination
 * - Multi-type calculation support (basic, scientific, expression, memory)
 * - Comprehensive error handling and user-friendly error messages
 * - Calculation history tracking and statistics
 * - State and display synchronization
 * - Performance monitoring and execution timing
 * - Result formatting and expression building
 *
 * @requires Calculator modules: state, operations, display
 */

// ------------ TYPE AND JSDOC DEFINITIONS

/**
 * @typedef {Object} CalculatorModules
 * @property {any} state - State management module
 * @property {any} operations - Operations engine module
 * @property {any} display - Display management module
 */

/**
 * @typedef {Object} CalculationRequest
 * @property {string} type - Calculation type: 'basic', 'scientific', 'expression', 'memory'
 * @property {string} [operation] - Specific operation name
 * @property {number[]} [operands] - Array of operands for the calculation
 * @property {string} [expression] - Mathematical expression for evaluation
 */

/**
 * @typedef {Object} CalculationContext
 * @property {string} type - Calculation type
 * @property {string} [operation] - Operation name
 * @property {number[]} operands - Array of operands
 * @property {string} [expression] - Mathematical expression
 * @property {string} currentValue - Current calculator value
 * @property {string|null} previousValue - Previous calculator value
 * @property {string|null} operator - Current operator
 * @property {boolean} isDegree - Whether using degree mode
 * @property {number} memory - Memory value
 * @property {number} timestamp - Calculation timestamp
 */

/**
 * @typedef {Object} ProcessedResult
 * @property {number} value - Raw calculation result
 * @property {string} formattedValue - Formatted result string
 * @property {string} type - Calculation type
 * @property {string} [operation] - Operation name
 * @property {string} expression - Calculation expression for display
 * @property {CalculationContext} context - Original calculation context
 */

/**
 * @typedef {Object} CalculationResult
 * @property {boolean} success - Whether calculation succeeded
 * @property {ProcessedResult} [result] - Processed result (if successful)
 * @property {string} [error] - Error message (if failed)
 * @property {string} calculationId - Unique calculation identifier
 * @property {number} executionTime - Execution time in milliseconds
 */

/**
 * @typedef {Object} CalculationRecord
 * @property {string} id - Calculation identifier
 * @property {CalculationRequest} request - Original calculation request
 * @property {ProcessedResult|undefined} [result] - Calculation result (if successful)
 * @property {string} [error] - Error message (if failed)
 * @property {number} executionTime - Execution time in milliseconds
 * @property {number} timestamp - Record timestamp
 * @property {boolean} success - Whether calculation succeeded
 */

/**
 * @typedef {Object} CalculationStatistics
 * @property {boolean} isInitialized - Whether coordinator is initialized
 * @property {number} totalCalculations - Total number of calculations
 * @property {number} successfulCalculations - Number of successful calculations
 * @property {number} failedCalculations - Number of failed calculations
 * @property {number} averageExecutionTime - Average execution time in milliseconds
 * @property {number} maxHistorySize - Maximum history size
 */

// ------------ CALCULATION COORDINATOR CLASS

/**
 * Calculation Coordinator Class
 *
 * Orchestrates calculation execution across different calculator modules
 * with comprehensive error handling and result processing.
 *
 * @class CalculationCoordinator
 * @example
 * const coordinator = new CalculationCoordinator(modules);
 * coordinator.initialize();
 *
 * const result = await coordinator.executeCalculation({
 *   type: 'basic',
 *   operation: 'add'
 * });
 *
 * console.log('Result:', result.success ? result.result.value : result.error);
 */
class CalculationCoordinator {
    /**
     * Create calculation coordinator instance
     *
     * Initializes the coordinator with calculator modules and sets up
     * calculation history tracking with configurable limits.
     *
     * @constructor
     * @param {CalculatorModules} modules - Calculator modules collection
     * @example
     * const coordinator = new CalculationCoordinator({
     *   state: stateManager,
     *   operations: operationsEngine,
     *   display: displayManager
     * });
     */
    constructor(modules) {
        /** @type {CalculatorModules} Calculator modules collection */
        this.modules = modules;

        /** @type {boolean} Whether coordinator is initialized */
        this.isInitialized = false;

        /** @type {CalculationRecord[]} Calculation history records */
        this.calculationHistory = [];

        /** @type {number} Maximum number of history records to keep */
        this.maxHistorySize = 100;
    }

    // ------------ INITIALIZATION METHODS

    /**
     * Initialize the calculation coordinator
     *
     * Validates required modules and sets up the coordinator for
     * calculation execution. Must be called before executing calculations.
     *
     * @method initialize
     * @returns {boolean} True if initialization successful, false otherwise
     *
     * @example
     * const success = coordinator.initialize();
     * if (success) {
     *   console.log('Coordinator ready for calculations');
     * } else {
     *   console.error('Coordinator initialization failed');
     * }
     */
    initialize() {
        if (!this.modules.state || !this.modules.operations || !this.modules.display) {
            console.error('CalculationCoordinator: Required modules not available');
            return false;
        }

        this.isInitialized = true;
        console.log('CalculationCoordinator: Initialized successfully');
        return true;
    }

    // ------------ CALCULATION EXECUTION METHODS

    /**
     * Execute a calculation with full error handling and state management
     *
     * Main calculation execution method that orchestrates the entire calculation
     * flow including validation, execution, result processing, and state updates.
     *
     * @async
     * @method executeCalculation
     * @param {CalculationRequest} calculationRequest - Calculation request object
     * @returns {Promise<CalculationResult>} Calculation result with success status
     *
     * @throws {Error} When coordinator is not initialized
     *
     * @example
     * // Basic arithmetic calculation
     * const result = await coordinator.executeCalculation({
     *   type: 'basic',
     *   operation: 'add'
     * });
     *
     * // Scientific calculation
     * const result = await coordinator.executeCalculation({
     *   type: 'scientific',
     *   operation: 'sin'
     * });
     *
     * // Expression evaluation
     * const result = await coordinator.executeCalculation({
     *   type: 'expression',
     *   expression: '2 + 3 * 4'
     * });
     */
    async executeCalculation(calculationRequest) {
        if (!this.isInitialized) {
            throw new Error('CalculationCoordinator not initialized');
        }

        /** @type {number} */
        const startTime = performance.now();
        /** @type {string} */
        const calculationId = this.generateCalculationId();

        try {
            // Validate calculation request
            this.validateCalculationRequest(calculationRequest);

            // Prepare calculation context
            /** @type {CalculationContext} */
            const context = this.prepareCalculationContext(calculationRequest);

            // Execute the calculation
            /** @type {number} */
            const result = await this.performCalculation(context);

            // Process and format result
            /** @type {ProcessedResult} */
            const processedResult = this.processCalculationResult(result, context);

            // Update state and display
            await this.updateStateAndDisplay(processedResult, context);

            // Record calculation in history
            this.recordCalculation(calculationId, calculationRequest, processedResult, startTime);

            return {
                success: true,
                result: processedResult,
                calculationId,
                executionTime: performance.now() - startTime
            };

        } catch (error) {
            console.error('CalculationCoordinator: Calculation failed:', error);

            // Handle error display
            this.handleCalculationError(error, calculationRequest);

            // Record failed calculation
            this.recordFailedCalculation(calculationId, calculationRequest, error, startTime);

            return {
                success: false,
                error: error.message,
                calculationId,
                executionTime: performance.now() - startTime
            };
        }
    }

    // ------------ VALIDATION AND PREPARATION METHODS

    /**
     * Validate calculation request
     *
     * Validates the incoming calculation request to ensure it has all
     * required fields and valid calculation type.
     *
     * @method validateCalculationRequest
     * @param {CalculationRequest} request - Calculation request to validate
     * @returns {void}
     *
     * @throws {Error} When request is invalid or missing required fields
     *
     * @example
     * coordinator.validateCalculationRequest({
     *   type: 'basic',
     *   operation: 'add'
     * }); // Valid - no error thrown
     *
     * coordinator.validateCalculationRequest({
     *   type: 'invalid'
     * }); // Throws error for invalid type
     */
    validateCalculationRequest(request) {
        if (!request) {
            throw new Error('Calculation request is required');
        }

        if (!request.type) {
            throw new Error('Calculation type is required');
        }

        /** @type {string[]} */
        const validTypes = ['basic', 'scientific', 'expression', 'memory'];
        if (!validTypes.includes(request.type)) {
            throw new Error(`Invalid calculation type: ${request.type}`);
        }
    }

    /**
     * Prepare calculation context
     *
     * Creates a comprehensive calculation context by combining the request
     * with current calculator state for execution.
     *
     * @method prepareCalculationContext
     * @param {CalculationRequest} request - Calculation request
     * @returns {CalculationContext} Complete calculation context
     *
     * @example
     * const context = coordinator.prepareCalculationContext({
     *   type: 'scientific',
     *   operation: 'sin'
     * });
     * console.log('Context:', context.currentValue, context.isDegree);
     */
    prepareCalculationContext(request) {
        /** @type {any} */
        const state = this.modules.state.getState();

        return {
            type: request.type,
            operation: request.operation,
            operands: request.operands || [],
            expression: request.expression,
            currentValue: state.currentValue,
            previousValue: state.previousValue,
            operator: state.operator,
            isDegree: state.isDegree,
            memory: state.memory,
            timestamp: Date.now()
        };
    }

    // ------------ CALCULATION PERFORMANCE METHODS

    /**
     * Perform the actual calculation
     *
     * Delegates calculation execution to the appropriate specialized method
     * based on the calculation type specified in the context.
     *
     * @async
     * @method performCalculation
     * @param {CalculationContext} context - Calculation context with type and parameters
     * @returns {Promise<number>} Calculation result value
     *
     * @throws {Error} When calculation type is unsupported
     *
     * @example
     * const result = await coordinator.performCalculation({
     *   type: 'basic',
     *   operator: '+',
     *   previousValue: '5',
     *   currentValue: '3'
     * });
     * console.log('Result:', result); // 8
     */
    async performCalculation(context) {
        switch (context.type) {
            case 'basic': {
                return this.performBasicCalculation(context);
            }
            case 'scientific': {
                return this.performScientificCalculation(context);
            }
            case 'expression': {
                return this.performExpressionCalculation(context);
            }
            case 'memory': {
                return this.performMemoryCalculation(context);
            }
            default: {
                throw new Error(`Unsupported calculation type: ${context.type}`);
            }
        }
    }

    /**
     * Perform basic arithmetic calculation
     *
     * Executes basic arithmetic operations (addition, subtraction,
     * multiplication, division) using the operations engine.
     *
     * @method performBasicCalculation
     * @param {CalculationContext} context - Calculation context
     * @returns {number} Arithmetic calculation result
     *
     * @throws {Error} When calculation is incomplete or operands are invalid
     *
     * @example
     * const result = coordinator.performBasicCalculation({
     *   operator: '+',
     *   previousValue: '10',
     *   currentValue: '5'
     * });
     * console.log('Result:', result); // 15
     */
    performBasicCalculation(context) {
        if (!context.operator || context.previousValue === null) {
            throw new Error('Incomplete basic calculation');
        }

        /** @type {number} */
        const a = Number.parseFloat(context.previousValue);
        /** @type {number} */
        const b = Number.parseFloat(context.currentValue);

        if (isNaN(a) || isNaN(b)) {
            throw new TypeError('Invalid operands for basic calculation');
        }

        return this.modules.operations.basicOperation(a, b, context.operator);
    }

    /**
     * Perform scientific calculation
     *
     * Executes scientific mathematical operations including trigonometric,
     * logarithmic, and advanced mathematical functions.
     *
     * @method performScientificCalculation
     * @param {CalculationContext} context - Calculation context with operation details
     * @returns {number} Scientific calculation result
     *
     * @throws {Error} When value is invalid or operation is unknown
     *
     * @example
     * const result = coordinator.performScientificCalculation({
     *   operation: 'sin',
     *   currentValue: '30',
     *   isDegree: true
     * });
     * console.log('sin(30°):', result); // 0.5
     */
    performScientificCalculation(context) {
        try {
            /** @type {number} */
            const value = Number.parseFloat(context.currentValue);

            if (isNaN(value)) {
                throw new TypeError('Invalid value for scientific calculation');
            }

            switch (context.operation) {
                case 'sin': {
                    return this.modules.operations.sin(value, context.isDegree);
                }
                case 'cos': {
                    return this.modules.operations.cos(value, context.isDegree);
                }
                case 'tan': {
                    return this.modules.operations.tan(value, context.isDegree);
                }
                case 'sqrt': {
                    return this.modules.operations.sqrt(value);
                }
                case 'ln': {
                    return this.modules.operations.ln(value);
                }
                case 'log10': {
                    return this.modules.operations.log10(value);
                }
                case 'factorial': {
                    return this.modules.operations.factorial(value);
                }
                case 'power': {
                    if (context.operands.length === 0) {
                        throw new Error('Power operation requires exponent');
                    }
                    return this.modules.operations.power(value, context.operands[0]);
                }
                default: {
                    throw new Error(`Unknown scientific operation: ${context.operation}`);
                }
            }
        } catch (error) {
            // Add context to the error
            throw new Error(`Scientific calculation error: ${error.message}`);
        }
    }

    /**
     * Perform expression calculation
     *
     * Evaluates complex mathematical expressions using the operations engine's
     * expression parser and evaluator.
     *
     * @method performExpressionCalculation
     * @param {CalculationContext} context - Calculation context with expression
     * @returns {number} Expression evaluation result
     *
     * @throws {Error} When expression is missing or invalid
     *
     * @example
     * const result = coordinator.performExpressionCalculation({
     *   expression: '2 + 3 * 4'
     * });
     * console.log('Result:', result); // 14
     */
    performExpressionCalculation(context) {
        if (!context.expression) {
            throw new Error('Expression is required for expression calculation');
        }

        return this.modules.operations.evaluateExpression(context.expression);
    }

    /**
     * Perform memory calculation
     *
     * Executes memory-related operations including store, recall, add,
     * subtract, and clear operations on calculator memory.
     *
     * @method performMemoryCalculation
     * @param {CalculationContext} context - Calculation context with memory operation
     * @returns {number} Memory operation result
     *
     * @throws {Error} When memory operation is unknown
     *
     * @example
     * // Store current value in memory
     * const result = coordinator.performMemoryCalculation({
     *   operation: 'store',
     *   currentValue: '42'
     * });
     * console.log('Stored:', result); // 42
     */
    performMemoryCalculation(context) {
        /** @type {number} */
        const currentValue = Number.parseFloat(context.currentValue);

        switch (context.operation) {
            case 'recall': {
                return context.memory;
            }
            case 'store': {
                return currentValue;
            } // Will be stored in memory
            case 'add': {
                return context.memory + currentValue;
            }
            case 'subtract': {
                return context.memory - currentValue;
            }
            case 'clear': {
                return 0;
            }
            default: {
                throw new Error(`Unknown memory operation: ${context.operation}`);
            }
        }
    }

    // ------------ RESULT PROCESSING METHODS

    /**
     * Process calculation result
     *
     * Formats the raw calculation result and creates a comprehensive
     * result object with display information and context.
     *
     * @method processCalculationResult
     * @param {number} result - Raw numerical calculation result
     * @param {CalculationContext} context - Original calculation context
     * @returns {ProcessedResult} Processed result with formatting and expression
     *
     * @example
     * const processed = coordinator.processCalculationResult(8, {
     *   type: 'basic',
     *   operator: '+',
     *   previousValue: '5',
     *   currentValue: '3'
     * });
     * console.log('Expression:', processed.expression); // "5 + 3 = 8"
     */
    processCalculationResult(result, context) {
        /** @type {string} */
        const formattedResult = this.modules.operations.formatResult(result);

        return {
            value: result,
            formattedValue: formattedResult,
            type: context.type,
            operation: context.operation,
            expression: this.buildCalculationExpression(context, formattedResult),
            context
        };
    }

    /**
     * Build calculation expression for display
     *
     * Creates a human-readable expression string showing the calculation
     * that was performed, formatted appropriately for each calculation type.
     *
     * @method buildCalculationExpression
     * @param {CalculationContext} context - Calculation context
     * @param {string} formattedResult - Formatted result string
     * @returns {string} Human-readable calculation expression
     *
     * @example
     * const expression = coordinator.buildCalculationExpression({
     *   type: 'scientific',
     *   operation: 'sin',
     *   currentValue: '30'
     * }, '0.5');
     * console.log(expression); // "sin(30) = 0.5"
     */
    buildCalculationExpression(context, formattedResult) {
        switch (context.type) {
            case 'basic': {
                return `${context.previousValue} ${context.operator} ${context.currentValue} = ${formattedResult}`;
            }
            case 'scientific': {
                return `${context.operation}(${context.currentValue}) = ${formattedResult}`;
            }
            case 'expression': {
                return `${context.expression} = ${formattedResult}`;
            }
            case 'memory': {
                return `M${context.operation} = ${formattedResult}`;
            }
            default: {
                return `${formattedResult}`;
            }
        }
    }

    // ------------ STATE AND DISPLAY UPDATE METHODS

    /**
     * Update state and display with calculation result
     *
     * Updates the calculator state and display with the processed calculation
     * result, handling type-specific state changes and display animations.
     *
     * @async
     * @method updateStateAndDisplay
     * @param {ProcessedResult} processedResult - Processed calculation result
     * @param {CalculationContext} context - Original calculation context
     * @returns {Promise<void>} Resolves when updates are complete
     *
     * @example
     * await coordinator.updateStateAndDisplay({
     *   formattedValue: '8',
     *   value: 8,
     *   expression: '5 + 3 = 8'
     * }, { type: 'basic' });
     */
    async updateStateAndDisplay(processedResult, context) {
        // Update calculator state
        /** @type {Object} */
        const stateUpdates = {
            currentValue: processedResult.formattedValue,
            isNewNumber: true
        };

        // Handle specific state updates based on calculation type
        if (context.type === 'basic') {
            stateUpdates.previousValue = null;
            stateUpdates.operator = null;
        }

        if (context.type === 'memory') {
            /** @type {string[]} */
            const memoryOperations = ['store', 'add', 'subtract', 'clear'];
            if (memoryOperations.includes(context.operation)) {
                stateUpdates.memory = processedResult.value;
            }
        }

        this.modules.state.updateState(stateUpdates);

        // Add to history
        this.modules.state.addToHistory(processedResult.expression);

        // Update display with animation
        if (this.modules.display.updateDisplay) {
            this.modules.display.updateDisplay(processedResult.formattedValue, {
                animate: true,
                announceToScreenReader: true
            });
        }
    }

    // ------------ ERROR HANDLING METHODS

    /**
     * Handle calculation error
     *
     * Processes calculation errors by generating user-friendly error messages
     * and updating the display with appropriate error information.
     *
     * @method handleCalculationError
     * @param {Error} error - Calculation error that occurred
     * @param {CalculationRequest} request - Original calculation request
     * @returns {void}
     *
     * @example
     * coordinator.handleCalculationError(
     *   new Error('Division by zero'),
     *   { type: 'basic', operation: 'divide' }
     * );
     */
    handleCalculationError(error, request) {
        // Get more specific error message based on error type
        /** @type {string} */
        const errorMessage = this.getDetailedErrorMessage(error, request);

        if (this.modules.display?.showError) {
            this.modules.display.showError(errorMessage);
        }

        // Log error for debugging
        console.error('Calculation error details:', {
            error: error.message,
            detailedMessage: errorMessage,
            request,
            stack: error.stack
        });
    }

    /**
     * Get detailed error message based on error type
     *
     * Converts technical error messages into user-friendly messages
     * that provide clear guidance about what went wrong.
     *
     * @method getDetailedErrorMessage
     * @param {Error} error - Original error object
     * @param {CalculationRequest} request - Original calculation request
     * @returns {string} User-friendly error message
     *
     * @example
     * const message = coordinator.getDetailedErrorMessage(
     *   new Error('Division by zero'),
     *   { type: 'basic' }
     * );
     * console.log(message); // "Cannot divide by zero"
     */
    // eslint-disable-next-line complexity
    getDetailedErrorMessage(error, _request) {
        // Check for specific error types
        if (error.message.includes('Division by zero')) {
            return 'Cannot divide by zero';
        } if (error.message.includes('Logarithm of non-positive')) {
            return 'Logarithm requires positive numbers';
        } if (error.message.includes('Square root of negative')) {
            return 'Cannot calculate square root of negative number';
        } if (error.message.includes('Tangent undefined')) {
            return 'Tangent undefined at this angle';
        } if (error.message.includes('Factorial requires')) {
            return 'Factorial requires non-negative integer (max 170)';
        } if (error.message.includes('Factorial too large')) {
            return 'Factorial too large (max 170)';
        } if (error.message.includes('Factorial result too large')) {
            return 'Result too large to display';
        } if (error.message.includes('Result is not finite')) {
            return 'Result too large to display';
        } if (error.message.includes('Invalid operands')) {
            return 'Invalid number format';
        } if (error.message.includes('Expression evaluation failed')) {
            return 'Invalid expression format';
        } if (error.message.includes('Expression contains invalid')) {
            return 'Expression contains invalid characters';
        } else if (error.message.includes('Expression contains potentially unsafe')) {
            return 'Expression contains unsafe code';
        } else if (error.message.includes('Unbalanced parentheses')) {
            return 'Unbalanced parentheses in expression';
        } else if (error.message.includes('Empty parentheses')) {
            return 'Empty parentheses in expression';
        } else if (error.message.includes('Power operation requires')) {
            return 'Power operation missing exponent';
        }

        // Return original message if no specific case matches
        return error.message;
    }

    // ------------ UTILITY METHODS

    /**
     * Generate unique calculation ID
     *
     * Creates a unique identifier for each calculation to enable
     * tracking and debugging of calculation history.
     *
     * @method generateCalculationId
     * @returns {string} Unique calculation identifier
     *
     * @example
     * const id = coordinator.generateCalculationId();
     * console.log(id); // "calc_1642123456789_abc123def"
     */
    generateCalculationId() {
        return `calc_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }

    // ------------ HISTORY MANAGEMENT METHODS

    /**
     * Record successful calculation in history
     *
     * Adds a successful calculation record to the history with timing
     * and execution details for performance monitoring.
     *
     * @method recordCalculation
     * @param {string} id - Unique calculation identifier
     * @param {CalculationRequest} request - Original calculation request
     * @param {ProcessedResult} result - Processed calculation result
     * @param {number} startTime - Calculation start time
     * @returns {void}
     *
     * @example
     * coordinator.recordCalculation('calc_123', request, result, startTime);
     */
    recordCalculation(id, request, result, startTime) {
        /** @type {CalculationRecord} */
        const record = {
            id,
            request,
            result,
            executionTime: performance.now() - startTime,
            timestamp: Date.now(),
            success: true
        };

        this.calculationHistory.push(record);
        this.trimCalculationHistory();
    }

    /**
     * Record failed calculation in history
     *
     * Adds a failed calculation record to the history with error details
     * for debugging and error analysis.
     *
     * @method recordFailedCalculation
     * @param {string} id - Unique calculation identifier
     * @param {CalculationRequest} request - Original calculation request
     * @param {Error} error - Error that occurred during calculation
     * @param {number} startTime - Calculation start time
     * @returns {void}
     *
     * @example
     * coordinator.recordFailedCalculation('calc_123', request, error, startTime);
     */
    recordFailedCalculation(id, request, error, startTime) {
        /** @type {CalculationRecord} */
        const record = {
            id,
            request,
            error: error.message,
            executionTime: performance.now() - startTime,
            timestamp: Date.now(),
            success: false
        };

        this.calculationHistory.push(record);
        this.trimCalculationHistory();
    }

    /**
     * Trim calculation history to max size
     *
     * Maintains the calculation history within the configured size limit
     * by removing the oldest records when the limit is exceeded.
     *
     * @method trimCalculationHistory
     * @returns {void}
     *
     * @example
     * coordinator.trimCalculationHistory(); // Automatically called after recording
     */
    trimCalculationHistory() {
        if (this.calculationHistory.length > this.maxHistorySize) {
            this.calculationHistory = this.calculationHistory.slice(-this.maxHistorySize);
        }
    }

    // ------------ STATISTICS AND MONITORING METHODS

    /**
     * Get calculation statistics
     *
     * Returns comprehensive statistics about calculation performance
     * including success rates, execution times, and history information.
     *
     * @method getStatistics
     * @returns {CalculationStatistics} Calculation performance statistics
     *
     * @example
     * const stats = coordinator.getStatistics();
     * console.log('Success rate:', stats.successfulCalculations / stats.totalCalculations);
     * console.log('Average time:', stats.averageExecutionTime + 'ms');
     */
    getStatistics() {
        /** @type {CalculationRecord[]} */
        const successful = this.calculationHistory.filter(calc => calc.success);
        /** @type {CalculationRecord[]} */
        const failed = this.calculationHistory.filter(calc => !calc.success);

        return {
            isInitialized: this.isInitialized,
            totalCalculations: this.calculationHistory.length,
            successfulCalculations: successful.length,
            failedCalculations: failed.length,
            averageExecutionTime: successful.length > 0
                ? successful.reduce((sum, calc) => sum + calc.executionTime, 0) / successful.length
                : 0,
            maxHistorySize: this.maxHistorySize
        };
    }

    // ------------ CLEANUP METHODS

    /**
     * Clear calculation history
     *
     * Removes all calculation records from the history while
     * maintaining the coordinator's initialized state.
     *
     * @method clearHistory
     * @returns {void}
     *
     * @example
     * coordinator.clearHistory();
     * console.log('History cleared');
     */
    clearHistory() {
        this.calculationHistory = [];
        console.log('CalculationCoordinator: History cleared');
    }

    /**
     * Cleanup calculation coordinator
     *
     * Performs complete cleanup of the coordinator including clearing
     * history and resetting initialization state.
     *
     * @method cleanup
     * @returns {void}
     *
     * @example
     * coordinator.cleanup();
     * console.log('Coordinator cleaned up');
     */
    cleanup() {
        this.calculationHistory = [];
        this.isInitialized = false;
        console.log('CalculationCoordinator: Cleaned up');
    }
}

// ------------ MODULE EXPORTS AND GLOBAL REGISTRATION

/**
 * Export for ES6 module systems (modern bundlers, native ES modules)
 * Enables tree-shaking and modern import/export syntax.
 *
 * @default CalculationCoordinator
 */
export default CalculationCoordinator;
