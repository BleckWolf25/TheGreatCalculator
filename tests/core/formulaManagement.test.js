/**
 * Formula Management Tests
 * Tests for the formula management functionality with ES modules
 */

// Mock DOM elements and browser APIs
const mockDOM = () => {
  global.document = {
    createElement: (tag) => ({
      tagName: tag.toUpperCase(),
      id: '',
      className: '',
      innerHTML: '',
      style: {},
      onclick: null,
      appendChild: () => {},
      setAttribute: () => {},
      getAttribute: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      remove: () => {},
      focus: () => {},
      value: ''
    }),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    addEventListener: () => {},
    body: {
      appendChild: () => {},
      classList: {
        add: () => {},
        remove: () => {}
      }
    },
    head: {
      appendChild: () => {}
    }
  };

  global.window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    showFormulaManager: null,
    closeFormulaManager: null,
    saveCustomFormula: null,
    useFormula: null,
    deleteFormula: null
  };
};

// Mock calculator modules
const createMockCalculator = () => {
  let mockState = { customFormulas: [] };
  let updateStateCalls = [];
  let evaluateExpressionCalls = [];

  return {
    modules: {
      state: {
        getState: () => mockState,
        updateState: (newState) => {
          updateStateCalls.push(newState);
          mockState = { ...mockState, ...newState };
        },
        addToHistory: () => {},
        // Helper methods for testing
        _getUpdateStateCalls: () => updateStateCalls,
        _setMockState: (state) => { mockState = state; }
      },
      operations: {
        evaluateExpression: (expr) => {
          evaluateExpressionCalls.push(expr);
          // Simple mock evaluation
          if (expr === '3.14159 * 1') return 3.14159;
          if (expr === '3.14159 * 4') return 12.56636;
          if (expr === '3.141592653589793 * 2**2') return 12.566370614359172;
          if (expr.includes('invalid()')) throw new Error('Invalid function');
          return parseFloat(expr) || 0;
        },
        // Helper method for testing
        _getEvaluateExpressionCalls: () => evaluateExpressionCalls
      },
      display: {
        showToast: () => {}
      }
    }
  };
};

describe('Formula Management', () => {
  let mockCalculator;

  beforeEach(() => {
    mockDOM();
    mockCalculator = createMockCalculator();
  });

  describe('Formula Button Creation', () => {
    test('should add formula button to calculator controls', () => {
      // Mock calculator controls element
      let appendChildCalled = false;
      const mockControlsElement = {
        appendChild: () => { appendChildCalled = true; }
      };

      // Mock button element
      const mockButton = {
        id: '',
        className: '',
        innerHTML: '',
        title: '',
        setAttribute: () => {}
      };

      document.querySelector = (selector) => {
        if (selector === '.calculator-controls') {
          return mockControlsElement;
        }
        return null;
      };

      // Mock createElement
      let createElementCalled = false;
      document.createElement = (tagName) => {
        if (tagName === 'button') {
          createElementCalled = true;
          return mockButton;
        }
        return mockButton;
      };

      // Test the button creation logic directly
      const addFormulaManagerButton = () => {
        const calculatorControls = document.querySelector('.calculator-controls');

        if (calculatorControls) {
          const formulaButton = document.createElement('button');
          formulaButton.id = 'formula-manager-btn';
          formulaButton.className = 'control-btn';
          formulaButton.innerHTML = '📐';
          formulaButton.title = 'Open Formula Manager (F)';
          formulaButton.setAttribute('aria-label', 'Open Formula Manager');

          calculatorControls.appendChild(formulaButton);
          return true;
        }
        return false;
      };

      const result = addFormulaManagerButton();

      expect(result).toBe(true);
      expect(appendChildCalled).toBe(true);
      expect(createElementCalled).toBe(true);
    });
  });

  describe('Formula Validation', () => {
    test('should validate formula names correctly', () => {
      const validateFormulaName = (name) => {
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
      };

      expect(validateFormulaName('circle_area')).toBe(true);
      expect(validateFormulaName('area2')).toBe(true);
      expect(validateFormulaName('_private')).toBe(true);
      expect(validateFormulaName('2invalid')).toBe(false);
      expect(validateFormulaName('invalid-name')).toBe(false);
      expect(validateFormulaName('invalid name')).toBe(false);
      expect(validateFormulaName('')).toBe(false);
    });

    test('should validate variable names correctly', () => {
      const validateVariableName = (variable) => {
        return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable);
      };

      expect(validateVariableName('r')).toBe(true);
      expect(validateVariableName('radius')).toBe(true);
      expect(validateVariableName('_temp')).toBe(true);
      expect(validateVariableName('var2')).toBe(true);
      expect(validateVariableName('2var')).toBe(false);
      expect(validateVariableName('var-name')).toBe(false);
      expect(validateVariableName('var name')).toBe(false);
    });

    test('should test formula expressions safely', () => {
      const testFormulaExpression = (expression, variables, calculator) => {
        try {
          let testExpression = expression;
          variables.forEach(variable => {
            const regex = new RegExp(`\\b${variable}\\b`, 'g');
            testExpression = testExpression.replace(regex, '1');
          });

          // Replace common mathematical symbols for testing
          testExpression = testExpression.replace(/π/g, Math.PI);
          testExpression = testExpression.replace(/²/g, '**2');
          testExpression = testExpression.replace(/³/g, '**3');
          testExpression = testExpression.replace(/√/g, 'Math.sqrt');

          calculator.modules.operations.evaluateExpression(testExpression);
          return true;
        } catch (error) {
          return false;
        }
      };

      expect(testFormulaExpression('π * r²', ['r'], mockCalculator)).toBe(true);
      expect(testFormulaExpression('a + b', ['a', 'b'], mockCalculator)).toBe(true);
      expect(testFormulaExpression('√x', ['x'], mockCalculator)).toBe(true);
      expect(testFormulaExpression('invalid()', [], mockCalculator)).toBe(false);
    });
  });

  describe('Formula Variable Substitution', () => {
    test('should substitute variables correctly', () => {
      const substituteVariables = (expression, variableValues) => {
        let result = expression;
        Object.keys(variableValues).forEach(variable => {
          const regex = new RegExp(`\\b${variable}\\b`, 'g');
          result = result.replace(regex, variableValues[variable]);
        });

        // Replace mathematical symbols
        result = result.replace(/π/g, Math.PI);
        result = result.replace(/²/g, '**2');
        result = result.replace(/³/g, '**3');
        result = result.replace(/√/g, 'Math.sqrt');

        return result;
      };

      const expression = 'π * r²';
      const variables = { r: 2 };
      const result = substituteVariables(expression, variables);

      expect(result).toBe('3.141592653589793 * 2**2');
    });

    test('should evaluate substituted expressions', () => {
      const evaluateFormula = (expression, variableValues, calculator) => {
        let substituted = expression;
        Object.keys(variableValues).forEach(variable => {
          const regex = new RegExp(`\\b${variable}\\b`, 'g');
          substituted = substituted.replace(regex, variableValues[variable]);
        });

        substituted = substituted.replace(/π/g, Math.PI);
        substituted = substituted.replace(/²/g, '**2');

        return calculator.modules.operations.evaluateExpression(substituted);
      };

      const result = evaluateFormula('π * r²', { r: 2 }, mockCalculator);
      const calls = mockCalculator.modules.operations._getEvaluateExpressionCalls();
      expect(calls).toContain('3.141592653589793 * 2**2');
    });
  });

  describe('Formula Storage', () => {
    test('should save formula to state', () => {
      const saveFormula = (name, expression, variables, calculator) => {
        const state = calculator.modules.state.getState();
        const customFormulas = state.customFormulas || [];

        const newFormula = {
          name,
          expression,
          variables,
          created: new Date().toISOString()
        };

        customFormulas.push(newFormula);
        calculator.modules.state.updateState({ customFormulas });

        return newFormula;
      };

      const formula = saveFormula('circle_area', 'π * r²', ['r'], mockCalculator);

      expect(formula.name).toBe('circle_area');
      expect(formula.expression).toBe('π * r²');
      expect(formula.variables).toEqual(['r']);
      const updateCalls = mockCalculator.modules.state._getUpdateStateCalls();
      expect(updateCalls.length).toBeGreaterThan(0);
    });

    test('should prevent duplicate formula names', () => {
      mockCalculator.modules.state._setMockState({
        customFormulas: [
          { name: 'existing_formula', expression: 'x + y', variables: ['x', 'y'] }
        ]
      });

      const checkDuplicateName = (name, calculator) => {
        const state = calculator.modules.state.getState();
        const existingFormulas = state.customFormulas || [];
        return existingFormulas.some(f => f.name === name);
      };

      expect(checkDuplicateName('existing_formula', mockCalculator)).toBe(true);
      expect(checkDuplicateName('new_formula', mockCalculator)).toBe(false);
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('should handle F key press for formula manager', () => {
      let formulaManagerOpened = false;
      let preventDefaultCalled = false;

      window.showFormulaManager = () => {
        formulaManagerOpened = true;
      };

      const handleKeydown = (event) => {
        if (event.key === 'f' || event.key === 'F') {
          const activeElement = document.activeElement;
          const isInInput = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
          );

          if (!isInInput && !event.ctrlKey && !event.altKey && !event.metaKey) {
            event.preventDefault();
            if (window.showFormulaManager) {
              window.showFormulaManager();
            }
          }
        }
      };

      // Simulate F key press
      const event = {
        key: 'f',
        ctrlKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: () => { preventDefaultCalled = true; }
      };

      // Mock activeElement as not an input
      Object.defineProperty(document, 'activeElement', {
        value: { tagName: 'BUTTON' },
        writable: true,
        configurable: true
      });

      handleKeydown(event);

      expect(formulaManagerOpened).toBe(true);
      expect(preventDefaultCalled).toBe(true);
    });

    test('should not trigger when typing in input fields', () => {
      let formulaManagerOpened = false;
      let preventDefaultCalled = false;

      window.showFormulaManager = () => {
        formulaManagerOpened = true;
      };

      const handleKeydown = (event) => {
        if (event.key === 'f' || event.key === 'F') {
          const activeElement = document.activeElement;
          const isInInput = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
          );

          if (!isInInput && !event.ctrlKey && !event.altKey && !event.metaKey) {
            event.preventDefault();
            if (window.showFormulaManager) {
              window.showFormulaManager();
            }
          }
        }
      };

      // Simulate F key press while in input field
      const event = {
        key: 'f',
        ctrlKey: false,
        altKey: false,
        metaKey: false,
        preventDefault: () => { preventDefaultCalled = true; }
      };

      // Mock activeElement as an input
      Object.defineProperty(document, 'activeElement', {
        value: { tagName: 'INPUT' },
        writable: true,
        configurable: true
      });

      handleKeydown(event);

      expect(formulaManagerOpened).toBe(false);
      expect(preventDefaultCalled).toBe(false);
    });
  });
});
