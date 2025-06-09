/**
 * @file MATHEMATICAL OPERATIONS MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Mathematical operations engine for The Great Calculator.
 * Provides comprehensive mathematical operations including basic arithmetic,
 * scientific functions, trigonometry, logarithms, and expression evaluation.
 * Features precision handling, error checking, and safe expression parsing.
 *
 * Features:
 * - Basic arithmetic operations with precision handling
 * - Scientific functions (sqrt, power, factorial)
 * - Trigonometric functions (sin, cos, tan) with degree/radian support
 * - Logarithmic functions (natural log, base-10 log)
 * - Safe expression evaluation with parentheses support
 * - Floating-point precision management
 * - Result formatting for display
 * - Mathematical constant support
 *
 * @requires JavaScript Math object, Function constructor
 */

// ------------ TYPE AND JSDOC DEFINITIONS

/**
 * @typedef {Object} OperationResult
 * @property {number} value - The calculated result value
 * @property {string} formattedValue - Formatted result for display
 * @property {boolean} isFinite - Whether the result is finite
 * @property {boolean} isValid - Whether the result is valid (not NaN)
 */

/**
 * @typedef {Object} ExpressionValidation
 * @property {boolean} isValid - Whether expression is valid
 * @property {boolean} isBalanced - Whether parentheses are balanced
 * @property {boolean} isSafe - Whether expression is safe to evaluate
 * @property {string} [error] - Error message if invalid
 */

/**
 * @typedef {Object} OperationsConfig
 * @property {number} precision - Number of decimal places for precision
 * @property {number} maxSafeInteger - Maximum safe integer value
 * @property {number} minSafeInteger - Minimum safe integer value
 */

// ------------ OPERATIONS ENGINE CLASS

/**
 * Operations Engine Class
 *
 * Provides comprehensive mathematical operations with precision handling,
 * error checking, and safe expression evaluation capabilities.
 *
 * @class OperationsEngine
 * @example
 * const operations = new OperationsEngine();
 *
 * // Basic arithmetic
 * const sum = operations.add(5, 3); // 8
 * const product = operations.multiply(4, 7); // 28
 *
 * // Scientific functions
 * const sqrt = operations.sqrt(16); // 4
 * const sine = operations.sin(30, true); // 0.5 (30 degrees)
 *
 * // Expression evaluation
 * const result = operations.evaluateExpression('2 + 3 * 4'); // 14
 */
class OperationsEngine {
    /**
     * Create operations engine instance
     *
     * Initializes the operations engine with default precision settings
     * and safe integer limits for mathematical calculations.
     *
     * @constructor
     * @example
     * const operations = new OperationsEngine();
     */
    constructor() {
        /** @type {number} Decimal precision for calculations */
        this.precision = 12;

        /** @type {number} Maximum safe integer value */
        this.maxSafeInteger = Number.MAX_SAFE_INTEGER;

        /** @type {number} Minimum safe integer value */
        this.minSafeInteger = Number.MIN_SAFE_INTEGER;

        /** @type {any} Error boundary instance for operation protection */
        this.errorBoundary = window.errorBoundary || null;
    }

    // ------------ BASIC ARITHMETIC OPERATIONS

    /**
     * Perform basic arithmetic operation
     *
     * Delegates to specific arithmetic methods based on the operator provided.
     * Supports addition, subtraction, multiplication, and division.
     *
     * @method basicOperation
     * @param {number} a - First operand
     * @param {number} b - Second operand
     * @param {string} operator - Mathematical operator: '+', '-', '*', '/'
     * @returns {number} Calculation result with precision handling
     *
     * @throws {Error} When operator is unknown or unsupported
     *
     * @example
     * const result = operations.basicOperation(10, 5, '+'); // 15
     * const quotient = operations.basicOperation(20, 4, '/'); // 5
     */
    basicOperation(a, b, operator) {
        switch (operator) {
            case '+':
                return this.add(a, b);
            case '-':
                return this.subtract(a, b);
            case '*':
                return this.multiply(a, b);
            case '/':
                return this.divide(a, b);
            default:
                throw new Error(`Unknown operator: ${operator}`);
        }
    }

    /**
     * Addition with precision handling
     *
     * Performs addition of two numbers with automatic precision correction
     * to handle floating-point arithmetic issues.
     *
     * @method add
     * @param {number} a - First number to add
     * @param {number} b - Second number to add
     * @returns {number} Sum with precision handling applied
     *
     * @example
     * const sum = operations.add(0.1, 0.2); // 0.3 (not 0.30000000000000004)
     * const total = operations.add(123.456, 789.012); // 912.468
     */
    add(a, b) {
        /** @type {number} */
        const result = a + b;
        return this.handlePrecision(result);
    }

    /**
     * Subtraction with precision handling
     *
     * Performs subtraction of two numbers with automatic precision correction
     * to handle floating-point arithmetic issues.
     *
     * @method subtract
     * @param {number} a - Number to subtract from (minuend)
     * @param {number} b - Number to subtract (subtrahend)
     * @returns {number} Difference with precision handling applied
     *
     * @example
     * const difference = operations.subtract(1.0, 0.9); // 0.1 (not 0.09999999999999998)
     * const result = operations.subtract(100, 25.5); // 74.5
     */
    subtract(a, b) {
        /** @type {number} */
        const result = a - b;
        return this.handlePrecision(result);
    }

    /**
     * Multiplication with precision handling
     *
     * Performs multiplication of two numbers with automatic precision correction
     * to handle floating-point arithmetic issues.
     *
     * @method multiply
     * @param {number} a - First factor
     * @param {number} b - Second factor
     * @returns {number} Product with precision handling applied
     *
     * @example
     * const product = operations.multiply(0.1, 3); // 0.3 (not 0.30000000000000004)
     * const area = operations.multiply(12.5, 8.4); // 105
     */
    multiply(a, b) {
        /** @type {number} */
        const result = a * b;
        return this.handlePrecision(result);
    }

    /**
     * Division with zero check and precision handling
     *
     * Performs division with automatic zero-division checking and precision
     * correction for floating-point arithmetic issues.
     *
     * @method divide
     * @param {number} a - Dividend (number to be divided)
     * @param {number} b - Divisor (number to divide by)
     * @returns {number} Quotient with precision handling applied
     *
     * @throws {Error} When attempting to divide by zero
     *
     * @example
     * const quotient = operations.divide(10, 3); // 3.333333333333
     * const half = operations.divide(1, 2); // 0.5
     *
     * // This will throw an error:
     * // operations.divide(5, 0); // Error: Division by zero
     */
    divide(a, b) {
        if (b === 0) {
            throw new Error('Division by zero');
        }
        /** @type {number} */
        const result = a / b;
        return this.handlePrecision(result);
    }

    // ------------ SCIENTIFIC OPERATIONS

    /**
     * Square root operation
     *
     * Calculates the square root of a number with validation for negative inputs
     * and precision handling for the result.
     *
     * @method sqrt
     * @param {number} x - Number to calculate square root of
     * @returns {number} Square root with precision handling
     *
     * @throws {Error} When attempting square root of negative number
     *
     * @example
     * const sqrt16 = operations.sqrt(16); // 4
     * const sqrt2 = operations.sqrt(2); // 1.414213562373
     *
     * // This will throw an error:
     * // operations.sqrt(-4); // Error: Square root of negative number
     */
    sqrt(x) {
        try {
            if (x < 0) {
                throw new Error('Square root of negative number');
            }

            return this.handlePrecision(Math.sqrt(x));
        } catch (error) {
            throw error; // Re-throw to be handled by caller
        }
    }

    /**
     * Power operation (exponentiation)
     *
     * Raises a base number to the power of an exponent with validation
     * for special cases and overflow protection.
     *
     * @method power
     * @param {number} base - Base number
     * @param {number} exponent - Exponent to raise base to
     * @returns {number} Result of base^exponent with precision handling
     *
     * @throws {Error} When result would be infinite or invalid
     *
     * @example
     * const square = operations.power(5, 2); // 25
     * const cube = operations.power(3, 3); // 27
     * const fraction = operations.power(8, 1/3); // 2 (cube root)
     *
     * // This will throw an error:
     * // operations.power(0, -1); // Error: Division by zero in power operation
     */
    power(base, exponent) {
        try {
            // Check for special cases
            if (base === 0 && exponent < 0) {
                throw new Error('Division by zero in power operation');
            }

            /** @type {number} */
            const result = base**exponent;

            if (!isFinite(result)) {
                throw new Error('Result is not finite');
            }

            return this.handlePrecision(result);
        } catch (error) {
            throw error; // Re-throw to be handled by caller
        }
    }

    /**
     * Factorial operation
     *
     * Calculates the factorial of a non-negative integer with validation
     * for input constraints and overflow protection.
     *
     * @method factorial
     * @param {number} n - Non-negative integer to calculate factorial of
     * @returns {number} Factorial of n (n!)
     *
     * @throws {Error} When input is negative, non-integer, or too large
     *
     * @example
     * const fact5 = operations.factorial(5); // 120
     * const fact0 = operations.factorial(0); // 1
     * const fact10 = operations.factorial(10); // 3628800
     *
     * // These will throw errors:
     * // operations.factorial(-1); // Error: Factorial requires non-negative integer
     * // operations.factorial(3.5); // Error: Factorial requires integer input
     * // operations.factorial(200); // Error: Factorial too large (max 170)
     */
    factorial(n) {
        try {
            if (n < 0) {
                throw new Error('Factorial requires non-negative integer');
            }

            if (!Number.isInteger(n)) {
                throw new Error('Factorial requires integer input');
            }

            if (n > 170) {
                throw new Error('Factorial too large (max 170)');
            }

            /** @type {number} */
            let result = 1;
            for (let i = 2; i <= n; i++) {
                result *= i;

                // Check for overflow during calculation
                if (!isFinite(result)) {
                    throw new Error('Factorial result too large');
                }
            }

            return result;
        } catch (error) {
            throw error; // Re-throw to be handled by caller
        }
    }

    // ------------ TRIGONOMETRIC FUNCTIONS

    /**
     * Sine function
     *
     * Calculates the sine of an angle with support for both degree and radian inputs.
     * Automatically converts degrees to radians when needed.
     *
     * @method sin
     * @param {number} x - Angle value
     * @param {boolean} [isDegree=true] - Whether input angle is in degrees
     * @returns {number} Sine value with precision handling
     *
     * @example
     * const sin30 = operations.sin(30, true); // 0.5 (30 degrees)
     * const sinPi2 = operations.sin(Math.PI/2, false); // 1 (π/2 radians)
     * const sin90 = operations.sin(90); // 1 (90 degrees, default)
     */
    sin(x, isDegree = true) {
        /** @type {number} */
        const angle = isDegree ? this.degreesToRadians(x) : x;
        return this.handlePrecision(Math.sin(angle));
    }

    /**
     * Cosine function
     *
     * Calculates the cosine of an angle with support for both degree and radian inputs.
     * Automatically converts degrees to radians when needed.
     *
     * @method cos
     * @param {number} x - Angle value
     * @param {boolean} [isDegree=true] - Whether input angle is in degrees
     * @returns {number} Cosine value with precision handling
     *
     * @example
     * const cos60 = operations.cos(60, true); // 0.5 (60 degrees)
     * const cosPi = operations.cos(Math.PI, false); // -1 (π radians)
     * const cos0 = operations.cos(0); // 1 (0 degrees, default)
     */
    cos(x, isDegree = true) {
        /** @type {number} */
        const angle = isDegree ? this.degreesToRadians(x) : x;
        return this.handlePrecision(Math.cos(angle));
    }

    /**
     * Tangent function
     *
     * Calculates the tangent of an angle with validation for undefined values
     * and support for both degree and radian inputs.
     *
     * @method tan
     * @param {number} x - Angle value
     * @param {boolean} [isDegree=true] - Whether input angle is in degrees
     * @returns {number} Tangent value with precision handling
     *
     * @throws {Error} When tangent is undefined (at 90°, 270°, etc.)
     *
     * @example
     * const tan45 = operations.tan(45, true); // 1 (45 degrees)
     * const tanPi4 = operations.tan(Math.PI/4, false); // 1 (π/4 radians)
     *
     * // This will throw an error:
     * // operations.tan(90, true); // Error: Tangent undefined at this angle
     */
    tan(x, isDegree = true) {
        /** @type {number} */
        const angle = isDegree ? this.degreesToRadians(x) : x;

        // Check for undefined values (90°, 270°, etc.)
        if (isDegree && (Math.abs(x % 180) === 90)) {
            throw new Error('Tangent undefined at this angle');
        }

        /** @type {number} */
        const result = Math.tan(angle);

        // Handle special cases where tan is undefined
        if (!isFinite(result)) {
            throw new Error('Tangent undefined at this angle');
        }

        return this.handlePrecision(result);
    }

    // ------------ LOGARITHMIC FUNCTIONS

    /**
     * Natural logarithm (base e)
     *
     * Calculates the natural logarithm of a number with validation
     * for positive input values only.
     *
     * @method ln
     * @param {number} x - Positive number to calculate natural log of
     * @returns {number} Natural logarithm with precision handling
     *
     * @throws {Error} When input is zero, negative, or non-numeric
     *
     * @example
     * const lnE = operations.ln(Math.E); // 1 (ln(e) = 1)
     * const ln10 = operations.ln(10); // 2.302585092994
     * const ln1 = operations.ln(1); // 0 (ln(1) = 0)
     *
     * // This will throw an error:
     * // operations.ln(-5); // Error: Logarithm of non-positive number
     * // operations.ln(0); // Error: Logarithm of non-positive number
     */
    ln(x) {
        if (x <= 0) {
            throw new Error('Logarithm of non-positive number');
        }
        return this.handlePrecision(Math.log(x));
    }

    /**
     * Base-10 logarithm (common logarithm)
     *
     * Calculates the base-10 logarithm of a number with validation
     * for positive input values only.
     *
     * @method log10
     * @param {number} x - Positive number to calculate base-10 log of
     * @returns {number} Base-10 logarithm with precision handling
     *
     * @throws {Error} When input is zero, negative, or non-numeric
     *
     * @example
     * const log100 = operations.log10(100); // 2 (log₁₀(100) = 2)
     * const log1000 = operations.log10(1000); // 3 (log₁₀(1000) = 3)
     * const log1 = operations.log10(1); // 0 (log₁₀(1) = 0)
     *
     * // This will throw an error:
     * // operations.log10(-10); // Error: Logarithm of non-positive number
     * // operations.log10(0); // Error: Logarithm of non-positive number
     */
    log10(x) {
        if (x <= 0) {
            throw new Error('Logarithm of non-positive number');
        }
        return this.handlePrecision(Math.log10(x));
    }

    // ------------ EXPRESSION EVALUATION

    /**
     * Expression evaluation with parentheses support
     *
     * Safely evaluates mathematical expressions with comprehensive validation,
     * parentheses balancing, and security checks to prevent code injection.
     *
     * @method evaluateExpression
     * @param {string} expression - Mathematical expression to evaluate
     * @returns {number} Evaluation result with precision handling
     *
     * @throws {Error} When expression is invalid, unsafe, or malformed
     *
     * @example
     * const result1 = operations.evaluateExpression('2 + 3 * 4'); // 14
     * const result2 = operations.evaluateExpression('(5 + 3) * 2'); // 16
     * const result3 = operations.evaluateExpression('10 / (2 + 3)'); // 2
     *
     * // These will throw errors:
     * // operations.evaluateExpression('2 + (3 * 4'); // Error: Unbalanced parentheses
     * // operations.evaluateExpression('2 + ()'); // Error: Empty parentheses
     * // operations.evaluateExpression('eval(1)'); // Error: Invalid characters
     */
    evaluateExpression(expression) {
        try {
            // Clean the expression
            /** @type {string} */
            let cleanExpression = this.cleanExpression(expression);

            // Validate parentheses
            if (!this.areParenthesesBalanced(cleanExpression)) {
                throw new Error('Unbalanced parentheses in expression');
            }

            // Validate expression safety
            if (!this.isExpressionSafe(cleanExpression)) {
                throw new Error('Invalid characters in expression');
            }

            // Check for empty parentheses
            if (cleanExpression.includes('()')) {
                throw new Error('Empty parentheses in expression');
            }

            // Replace mathematical constants
            cleanExpression = this.replaceConstants(cleanExpression);

            // Use mathjs for safe evaluation
            if (typeof window !== 'undefined' && window.math && typeof window.math.evaluate === 'function') {
                /** @type {number} */
                const result = window.math.evaluate(cleanExpression);

                if (!isFinite(result)) {
                    throw new Error('Result is not finite');
                }

                if (isNaN(result)) {
                    throw new Error('Expression resulted in Not a Number');
                }

                return this.handlePrecision(result);
            } else {
                throw new Error('Math.js library is required for expression evaluation');
            }
        } catch (error) {
            // Provide more specific error messages
            if (error.message.includes('Unexpected token')) {
                throw new Error('Expression contains invalid syntax');
            } else if (error.message.includes('is not defined')) {
                throw new Error('Expression contains undefined variables');
            }

            throw new Error(`Expression evaluation failed: ${error.message}`);
        }
    }

    // ------------ EXPRESSION VALIDATION AND PROCESSING

    /**
     * Clean expression for evaluation
     *
     * Preprocesses a mathematical expression by removing whitespace,
     * normalizing operators, and validating character content.
     *
     * @method cleanExpression
     * @param {string} expression - Raw mathematical expression
     * @returns {string} Cleaned and normalized expression
     *
     * @throws {Error} When expression contains invalid characters
     *
     * @example
     * const cleaned = operations.cleanExpression(' 2 + 3 * 4 '); // '2+3*4'
     * const normalized = operations.cleanExpression('2++3'); // '2+3'
     */
    cleanExpression(expression) {
        try {
            // Remove whitespace
            /** @type {string} */
            let cleaned = expression.replace(/\s+/g, '');

            // Replace multiple operators with single operator
            cleaned = cleaned.replace(/([*+/\-])+/g, '$1');

            // Check for invalid characters
            if (/[^\d()*+./e\-]/.test(cleaned)) {
                throw new Error('Expression contains invalid characters');
            }

            return cleaned;
        } catch (error) {
            throw new Error(`Expression cleaning failed: ${error.message}`);
        }
    }

    /**
     * Check if parentheses are balanced
     *
     * Validates that all opening parentheses have corresponding closing
     * parentheses and are properly nested.
     *
     * @method areParenthesesBalanced
     * @param {string} expression - Expression to validate
     * @returns {boolean} True if parentheses are properly balanced
     *
     * @example
     * const balanced1 = operations.areParenthesesBalanced('(2+3)*4'); // true
     * const balanced2 = operations.areParenthesesBalanced('((1+2))'); // true
     * const unbalanced = operations.areParenthesesBalanced('(2+3'); // false
     */
    areParenthesesBalanced(expression) {
        /** @type {number} */
        let count = 0;
        for (const char of expression) {
            if (char === '(') count++;
            if (char === ')') count--;
            if (count < 0) return false;
        }
        return count === 0;
    }

    /**
     * Check if expression contains only safe characters
     *
     * Validates expression safety by checking for dangerous patterns
     * and ensuring only mathematical operations are allowed.
     *
     * @method isExpressionSafe
     * @param {string} expression - Expression to validate for safety
     * @returns {boolean} True if expression is safe to evaluate
     *
     * @throws {Error} When expression contains potentially unsafe code
     *
     * @example
     * const safe1 = operations.isExpressionSafe('2+3*4'); // true
     * const safe2 = operations.isExpressionSafe('(1+2)/3'); // true
     * const unsafe = operations.isExpressionSafe('eval(1)'); // false
     */
    isExpressionSafe(expression) {
        try {
            // Check for JavaScript code injection attempts
            /** @type {string[]} */
            const dangerousPatterns = [
                'eval', 'Function', 'setTimeout', 'setInterval',
                'document', 'window', 'alert', 'console'
            ];

            for (const pattern of dangerousPatterns) {
                if (expression.includes(pattern)) {
                    throw new Error('Expression contains potentially unsafe code');
                }
            }

            // Only allow safe mathematical expressions
            return /^[\d()*+./e\-]+$/.test(expression);
        } catch (error) {
            throw new Error(`Expression safety check failed: ${error.message}`);
        }
    }

    /**
     * Replace mathematical constants in expression
     *
     * Substitutes mathematical constants (π, e) with their numerical values
     * for proper evaluation in expressions.
     *
     * @method replaceConstants
     * @param {string} expression - Expression containing mathematical constants
     * @returns {string} Expression with constants replaced by numerical values
     *
     * @example
     * const withPi = operations.replaceConstants('2*π'); // '2*3.141592653589793'
     * const withE = operations.replaceConstants('e^2'); // '2.718281828459045^2'
     * const withBoth = operations.replaceConstants('π*e'); // '3.141592653589793*2.718281828459045'
     */
    replaceConstants(expression) {
        return expression
            .replace(/π|pi/g, Math.PI.toString())
            .replace(/\be\b/g, Math.E.toString());
    }

    // ------------ UTILITY FUNCTIONS

    /**
     * Convert degrees to radians
     *
     * Converts an angle measurement from degrees to radians for use
     * in trigonometric functions that expect radian input.
     *
     * @method degreesToRadians
     * @param {number} degrees - Angle measurement in degrees
     * @returns {number} Equivalent angle in radians
     *
     * @example
     * const radians90 = operations.degreesToRadians(90); // π/2 ≈ 1.5708
     * const radians180 = operations.degreesToRadians(180); // π ≈ 3.1416
     * const radians360 = operations.degreesToRadians(360); // 2π ≈ 6.2832
     */
    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    /**
     * Convert radians to degrees
     *
     * Converts an angle measurement from radians to degrees for display
     * or when degree output is preferred.
     *
     * @method radiansToDegrees
     * @param {number} radians - Angle measurement in radians
     * @returns {number} Equivalent angle in degrees
     *
     * @example
     * const degrees90 = operations.radiansToDegrees(Math.PI/2); // 90
     * const degrees180 = operations.radiansToDegrees(Math.PI); // 180
     * const degrees360 = operations.radiansToDegrees(2*Math.PI); // 360
     */
    radiansToDegrees(radians) {
        return radians * (180 / Math.PI);
    }

    /**
     * Handle floating point precision issues
     *
     * Rounds numbers to the specified precision to eliminate floating-point
     * arithmetic errors that can occur in JavaScript calculations.
     *
     * @method handlePrecision
     * @param {number} value - Number to apply precision handling to
     * @returns {number} Number rounded to specified precision
     *
     * @example
     * const precise = operations.handlePrecision(0.1 + 0.2); // 0.3 (not 0.30000000000000004)
     * const rounded = operations.handlePrecision(1.23456789012345); // 1.23456789012 (12 decimal places)
     */
    handlePrecision(value) {
        if (!isFinite(value)) {
            return value;
        }

        // Round to specified precision to avoid floating point errors
        return Math.round(value * 10**this.precision) / 10**this.precision;
    }

    /**
     * Format result for display
     *
     * Formats numerical results for user-friendly display with appropriate
     * handling of very large, very small, and normal-range numbers.
     *
     * @method formatResult
     * @param {number} value - Number to format for display
     * @returns {string} Formatted number string
     *
     * @example
     * const normal = operations.formatResult(123.456); // "123.456"
     * const large = operations.formatResult(1.23e15); // "1.23000000e+15"
     * const small = operations.formatResult(1.23e-10); // "1.23000000e-10"
     * const integer = operations.formatResult(42.0); // "42"
     */
    formatResult(value) {
        if (!isFinite(value)) {
            return value.toString();
        }

        // Handle very large or very small numbers
        if (Math.abs(value) >= 1e12 || (Math.abs(value) < 1e-8 && value !== 0)) {
            return value.toExponential(8);
        }

        // Remove trailing zeros
        return parseFloat(value.toPrecision(this.precision)).toString();
    }

    /**
     * Percentage calculation
     *
     * Converts a number to its percentage equivalent by dividing by 100
     * with precision handling for accurate results.
     *
     * @method percentage
     * @param {number} value - Value to convert to percentage (e.g., 50 becomes 0.5)
     * @returns {number} Percentage value with precision handling
     *
     * @example
     * const half = operations.percentage(50); // 0.5 (50% as decimal)
     * const quarter = operations.percentage(25); // 0.25 (25% as decimal)
     * const whole = operations.percentage(100); // 1 (100% as decimal)
     */
    percentage(value) {
        return this.handlePrecision(value / 100);
    }
}

// ------------ MODULE EXPORTS AND GLOBAL REGISTRATION

/**
 * Export for ES6 module systems (modern bundlers, native ES modules)
 * Enables tree-shaking and modern import/export syntax.
 *
 * @default OperationsEngine
 */
export default OperationsEngine;
