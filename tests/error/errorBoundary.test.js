/**
 * Error Boundary Unit Tests
 * Tests for error handling, recovery mechanisms, and fallback UI
 */

// Import the ErrorBoundary module directly
import ErrorBoundary, { ERROR_CATEGORIES, ERROR_SEVERITY, RECOVERY_STRATEGIES } from '../../src/js/modules/error/errorBoundary.js';
import FallbackComponents from '../../src/js/modules/error/fallbackComponents.js';
import FallbackCalculator from '../../src/js/modules/error/fallbackCalculator.js';

// Setup global environment
beforeAll(() => {
    // Mock DOM environment
    global.document = {
        createElement: () => ({
            id: '',
            className: '',
            style: { cssText: '' },
            innerHTML: '',
            textContent: '',
            appendChild: () => {},
            removeChild: () => {},
            parentNode: null
        }),
        body: {
            appendChild: () => {},
            removeChild: () => {}
        },
        getElementById: () => null
    };

    global.window = {
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {},
        location: { href: 'http://localhost' },
        errorBoundary: null
    };

    global.navigator = {
        userAgent: 'Test Browser'
    };
});

describe('ErrorBoundary', () => {
    let errorBoundary;

    beforeEach(() => {
        errorBoundary = new ErrorBoundary();
    });

    afterEach(() => {
        if (errorBoundary) {
            errorBoundary.destroy();
        }
    });

    describe('Initialization', () => {
        test('should create error boundary instance', () => {
            expect(errorBoundary).toBeInstanceOf(ErrorBoundary);
            expect(errorBoundary.isInitialized).toBe(false);
        });

        test('should initialize successfully', () => {
            const success = errorBoundary.initialize();
            expect(success).toBe(true);
            expect(errorBoundary.isInitialized).toBe(true);
        });

        test('should set up error history and tracking', () => {
            errorBoundary.initialize();
            expect(errorBoundary.errorHistory).toEqual([]);
            expect(errorBoundary.errorCounts).toBeInstanceOf(Map);
            expect(errorBoundary.fallbackComponents).toBeInstanceOf(Map);
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            errorBoundary.initialize();
        });

        test('should wrap operations with error boundary', async () => {
            const mockOperation = () => 'success';
            const result = await errorBoundary.wrapOperation(mockOperation, ERROR_CATEGORIES.CALCULATION);
            expect(result).toBe('success');
        });

        test('should catch and handle operation errors', async () => {
            const mockOperation = () => {
                throw new Error('Test error');
            };

            try {
                await errorBoundary.wrapOperation(mockOperation, ERROR_CATEGORIES.CALCULATION);
            } catch (error) {
                expect(error.message).toBe('Test error');
            }

            expect(errorBoundary.errorHistory.length).toBe(1);
        });

        test('should create error reports', () => {
            const errorInfo = {
                message: 'Test error',
                error: new Error('Test error')
            };

            const report = errorBoundary.createErrorReport(errorInfo, ERROR_CATEGORIES.CALCULATION, ERROR_SEVERITY.HIGH);

            expect(report.message).toBe('Test error');
            expect(report.category).toBe(ERROR_CATEGORIES.CALCULATION);
            expect(report.severity).toBe(ERROR_SEVERITY.HIGH);
            expect(report.id).toBeDefined();
            expect(report.timestamp).toBeDefined();
        });

        test('should determine error severity correctly', () => {
            const initError = new Error('initialization failed');
            const calcError = new Error('division by zero');
            const uiError = new Error('display error');

            expect(errorBoundary.determineSeverity(initError, ERROR_CATEGORIES.INITIALIZATION)).toBe(ERROR_SEVERITY.CRITICAL);
            expect(errorBoundary.determineSeverity(calcError, ERROR_CATEGORIES.CALCULATION)).toBe(ERROR_SEVERITY.HIGH);
            expect(errorBoundary.determineSeverity(uiError, ERROR_CATEGORIES.UI)).toBe(ERROR_SEVERITY.MEDIUM);
        });
    });

    describe('Fallback Components', () => {
        beforeEach(() => {
            errorBoundary.initialize();
        });

        test('should register fallback components', () => {
            const fallbackGenerator = () => '<div>Fallback</div>';
            errorBoundary.registerFallback('test', fallbackGenerator);

            expect(errorBoundary.fallbackComponents.has('test')).toBe(true);
        });

        test('should retrieve fallback components', () => {
            const fallbackHTML = '<div>Test Fallback</div>';
            const fallbackGenerator = () => fallbackHTML;
            errorBoundary.registerFallback('test', fallbackGenerator);

            const result = errorBoundary.getFallback('test');
            expect(result).toBe(fallbackHTML);
        });

        test('should return null for non-existent fallbacks', () => {
            const result = errorBoundary.getFallback('nonexistent');
            expect(result).toBeNull();
        });
    });

    describe('Recovery Handlers', () => {
        beforeEach(() => {
            errorBoundary.initialize();
        });

        test('should register recovery handlers', () => {
            const recoveryHandler = () => ({ success: true });
            errorBoundary.registerRecoveryHandler('test', recoveryHandler);

            expect(errorBoundary.recoveryHandlers.has('test')).toBe(true);
        });

        test('should attempt recovery with registered handlers', async () => {
            const recoveryHandler = () => ({ success: true, message: 'Recovered' });
            errorBoundary.registerRecoveryHandler(ERROR_CATEGORIES.CALCULATION, recoveryHandler);

            const errorReport = {
                category: ERROR_CATEGORIES.CALCULATION,
                severity: ERROR_SEVERITY.MEDIUM
            };

            const result = await errorBoundary.attemptRecovery(errorReport);
            expect(result.success).toBe(true);
            expect(result.message).toBe('Recovered');
        });

        test('should handle recovery failures', async () => {
            const recoveryHandler = () => ({ success: false, message: 'Failed' });
            errorBoundary.registerRecoveryHandler(ERROR_CATEGORIES.CALCULATION, recoveryHandler);

            const errorReport = {
                category: ERROR_CATEGORIES.CALCULATION,
                severity: ERROR_SEVERITY.MEDIUM
            };

            const result = await errorBoundary.attemptRecovery(errorReport);
            expect(result.success).toBe(false);
        });
    });

    describe('Error Statistics', () => {
        beforeEach(() => {
            errorBoundary.initialize();
        });

        test('should track error statistics', () => {
            const errorReport1 = {
                id: 'test1',
                timestamp: new Date().toISOString(),
                category: ERROR_CATEGORIES.CALCULATION,
                severity: ERROR_SEVERITY.HIGH,
                message: 'Test error 1'
            };

            const errorReport2 = {
                id: 'test2',
                timestamp: new Date().toISOString(),
                category: ERROR_CATEGORIES.UI,
                severity: ERROR_SEVERITY.MEDIUM,
                message: 'Test error 2'
            };

            errorBoundary.recordError(errorReport1);
            errorBoundary.recordError(errorReport2);

            const stats = errorBoundary.getErrorStats();
            expect(stats.totalErrors).toBe(2);
            expect(stats.errorsByCategory[ERROR_CATEGORIES.CALCULATION]).toBe(1);
            expect(stats.errorsByCategory[ERROR_CATEGORIES.UI]).toBe(1);
        });

        test('should limit error history size', () => {
            // Add more than 100 errors
            for (let i = 0; i < 105; i++) {
                const errorReport = {
                    id: `test${i}`,
                    timestamp: new Date().toISOString(),
                    category: ERROR_CATEGORIES.CALCULATION,
                    severity: ERROR_SEVERITY.LOW,
                    message: `Test error ${i}`
                };
                errorBoundary.recordError(errorReport);
            }

            expect(errorBoundary.errorHistory.length).toBe(100);
        });
    });

    describe('Error Listeners', () => {
        beforeEach(() => {
            errorBoundary.initialize();
        });

        test('should add and notify error listeners', () => {
            let notifiedError = null;
            const listener = (errorReport) => {
                notifiedError = errorReport;
            };

            errorBoundary.addErrorListener(listener);

            const errorReport = {
                id: 'test',
                timestamp: new Date().toISOString(),
                category: ERROR_CATEGORIES.CALCULATION,
                severity: ERROR_SEVERITY.HIGH,
                message: 'Test error'
            };

            errorBoundary.recordError(errorReport);

            expect(notifiedError).toEqual(errorReport);
        });
    });

    describe('Cleanup', () => {
        test('should destroy error boundary cleanly', () => {
            errorBoundary.initialize();
            errorBoundary.destroy();

            expect(errorBoundary.isInitialized).toBe(false);
            expect(errorBoundary.errorHistory).toEqual([]);
            expect(errorBoundary.errorCounts.size).toBe(0);
        });
    });
});

describe('FallbackComponents', () => {
    let fallbackComponents;

    beforeEach(() => {
        fallbackComponents = new FallbackComponents();
    });

    test('should create fallback components instance', () => {
        expect(fallbackComponents).toBeInstanceOf(FallbackComponents);
    });

    test('should generate fallback display', () => {
        const displayHTML = fallbackComponents.generateDisplay('123');
        expect(displayHTML).toContain('123');
        expect(displayHTML).toContain('fallback-calculator-display');
    });

    test('should generate fallback buttons', () => {
        const buttonsHTML = fallbackComponents.generateButtons();
        expect(buttonsHTML).toContain('fallback-calculator-buttons');
        expect(buttonsHTML).toContain('fallbackCalculator.handleButton');
    });

    test('should generate emergency calculator', () => {
        const calculatorHTML = fallbackComponents.generateEmergencyCalculator();
        expect(calculatorHTML).toContain('emergency-calculator');
        expect(calculatorHTML).toContain('Emergency Calculator Mode');
    });
});

describe('FallbackCalculator', () => {
    let fallbackCalculator;

    beforeEach(() => {
        fallbackCalculator = new FallbackCalculator();
        fallbackCalculator.initialize();
    });

    test('should create fallback calculator instance', () => {
        expect(fallbackCalculator).toBeInstanceOf(FallbackCalculator);
        expect(fallbackCalculator.isInitialized).toBe(true);
    });

    test('should handle number input', () => {
        fallbackCalculator.handleButton('number', '5');
        expect(fallbackCalculator.display).toBe('5');
    });

    test('should handle basic operations', () => {
        fallbackCalculator.handleButton('number', '5');
        fallbackCalculator.handleButton('add', '+');
        fallbackCalculator.handleButton('number', '3');
        fallbackCalculator.handleButton('equals', '=');
        expect(fallbackCalculator.display).toBe('8');
    });

    test('should handle clear operation', () => {
        fallbackCalculator.handleButton('number', '123');
        fallbackCalculator.handleButton('clear', 'C');
        expect(fallbackCalculator.display).toBe('0');
    });

    test('should track calculation history', () => {
        fallbackCalculator.handleButton('number', '5');
        fallbackCalculator.handleButton('add', '+');
        fallbackCalculator.handleButton('number', '3');
        fallbackCalculator.handleButton('equals', '=');
        
        expect(fallbackCalculator.history.length).toBe(1);
        expect(fallbackCalculator.history[0]).toContain('5 + 3 = 8');
    });

    test('should get current state', () => {
        fallbackCalculator.handleButton('number', '42');
        const state = fallbackCalculator.getState();
        
        expect(state.display).toBe('42');
        expect(state.isNewNumber).toBe(false);
    });
});
