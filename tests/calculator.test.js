// Description: Tests for calculator functions.
describe('Calculator Tests', () => {
    beforeEach(() => {
        // Reset state before each test
        state = {
            currentValue: '0',
            previousValue: null,
            memory: 0,
            operator: null,
            isNewNumber: true,
            isDegree: true,
            history: []
        };
        // Mock DOM elements and functions
        global.document = {
            querySelector: jest.fn(() => ({ textContent: '' }))
        };
        global.updateDisplay = jest.fn();
        global.updateHistory = jest.fn();
    });

    // Description: Memory Operations Tests
    describe('Memory Operations', () => {
        test('memoryClear should reset memory to 0', () => {
            state.memory = 100;
            memoryClear();
            expect(state.memory).toBe(0);
        });

        test('memoryStore should store current value', () => {
            state.currentValue = '42';
            memoryStore();
            expect(state.memory).toBe(42);
        });
    });

    // Description: Basic Operations Tests
    describe('Basic Operations', () => {
        test('addition should work correctly', () => {
            state.currentValue = '5';
            state.previousValue = '3';
            state.operator = '+';
            calculate('equals');
            expect(state.currentValue).toBe('8');
        });

        test('division by zero should throw error', () => {
            state.currentValue = '0';
            state.previousValue = '10';
            state.operator = '/';
            calculate('equals');
            expect(state.currentValue).toBe('Error');
        });
    });

    // Description: Scientific Functions Tests
    describe('Scientific Functions', () => {
        test('sin in degree mode', () => {
            state.currentValue = '90';
            state.isDegree = true;
            calculate('sin');
            expect(parseFloat(state.currentValue)).toBeCloseTo(1);
        });

        test('factorial of positive integer', () => {
            state.currentValue = '5';
            calculate('factorial');
            expect(state.currentValue).toBe('120');
        });
    });

    // Description: Input Handling Tests
    describe('Input Handling', () => {
        test('appendNumber should handle new numbers', () => {
            appendNumber('5');
            expect(state.currentValue).toBe('5');
            expect(state.isNewNumber).toBe(false);
        });

        test('appendDecimal should add only one decimal point', () => {
            appendDecimal();
            appendDecimal();
            expect(state.currentValue).toBe('0.');
        });
    });

    // Description: Clear Functions Tests
    describe('Clear Functions', () => {
        test('clearAll should reset calculator state', () => {
            state.currentValue = '123';
            state.previousValue = '456';
            clearAll();
            expect(state.currentValue).toBe('0');
            expect(state.previousValue).toBe(null);
        });

        test('backspace should remove last digit', () => {
            state.currentValue = '123';
            backspace();
            expect(state.currentValue).toBe('12');
        });
    });

    // Description: Error Handling Tests
    describe('Error Handling', () => {
        test('invalid operations should display error', () => {
            calculate('invalidOperation');
            expect(state.currentValue).toBe('Error');
        });

        test('error should clear after timeout', () => {
            jest.useFakeTimers();
            displayError();
            expect(state.currentValue).toBe('Error');
            jest.runAllTimers();
            expect(state.currentValue).toBe('0');
        });
    });
});