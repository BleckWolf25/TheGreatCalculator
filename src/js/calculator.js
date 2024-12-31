// Initialize calculator state
let state = {
    currentValue: '0',
    previousValue: null,
    memory: 0,
    operator: null,
    isNewNumber: true,
    isDegree: true,
    history: []
};

// Memory Functions
const memoryClear = () => state.memory = 0;
const memoryRecall = () => updateDisplay(state.memory.toString());
const memoryAdd = () => state.memory += parseFloat(state.currentValue);
const memorySubtract = () => state.memory -= parseFloat(state.currentValue);
const memoryStore = () => state.memory = parseFloat(state.currentValue);

// Set the current operator and prepare for the next input
const setOperator = (op) => {
    if (state.previousValue !== null) calculate('equals');
    state.operator = op;
    state.previousValue = state.currentValue;
    state.isNewNumber = true;
    updateHistory();
};

// Append a number to the current value
const appendNumber = (num) => {
    if (state.isNewNumber) {
        state.currentValue = num.toString();
        state.isNewNumber = false;
    } else {
        state.currentValue += num.toString();
    }
    updateDisplay(state.currentValue);
};

// Append a decimal point to the current value
const appendDecimal = () => {
    if (!state.currentValue.includes('.')) {
        state.currentValue += '.';
        updateDisplay(state.currentValue);
    }
};

// Perform calculations based on the operation type
const calculate = (operation) => {
    let result;
    const current = parseFloat(state.currentValue);

    try {
        switch (operation) {
            case 'equals':
                if (state.operator && state.previousValue !== null) {
                    result = evaluateOperation(parseFloat(state.previousValue), current, state.operator);
                }
                break;
            case 'sin':
                result = state.isDegree ? Math.sin(current * Math.PI / 180) : Math.sin(current);
                break;
            case 'cos':
                result = state.isDegree ? Math.cos(current * Math.PI / 180) : Math.cos(current);
                break;
            case 'tan':
                result = state.isDegree ? Math.tan(current * Math.PI / 180) : Math.tan(current);
                break;
            case 'log':
                result = Math.log10(current);
                break;
            case 'ln':
                result = Math.log(current);
                break;
            case 'sqrt':
                result = Math.sqrt(current);
                break;
            case 'pow':
                result = Math.pow(current, 2);
                break;
            case 'factorial':
                result = factorial(current);
                break;
            default:
                throwError('Invalid Operation');
        }

        if (result !== undefined) {
            state.currentValue = formatResult(result);
            state.previousValue = null;
            state.operator = null;
            state.isNewNumber = true;
            updateDisplay(state.currentValue);
            updateHistory();
        }
    } catch (error) {
        displayError();
    }
};

// Helper function to evaluate operations
const evaluateOperation = (a, b, operator) => {
    switch (operator) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return b !== 0 ? a / b : throwError('Division by zero');
        default: return b;
    }
};

// Helper function to calculate factorial
const factorial = (n) => {
    if (n < 0) return throwError('Invalid input');
    if (n === 0) return 1;
    return n * factorial(n - 1);
};

// Format the result to limit decimal places and handle large numbers
const formatResult = (num) => {
    return Number.isInteger(num) ? num.toString() : num.toFixed(8).replace(/\.?0+$/, '');
};

// Toggle between degree and radian modes
const toggleDegRad = () => {
    state.isDegree = !state.isDegree;
    document.querySelector('[onclick="toggleDegRad()"]').textContent = state.isDegree ? 'DEG' : 'RAD';
};

// Clear all state and reset the display
const clearAll = () => {
    state = {
        currentValue: '0',
        previousValue: null,
        operator: null,
        isNewNumber: true,
        history: []
    };
    updateDisplay('0');
    updateHistory();
};

// Clear the current entry (CE)
const clearEntry = () => {
    state.currentValue = '0';
    updateDisplay('0');
};

// Remove the last digit from the current value
const backspace = () => {
    state.currentValue = state.currentValue.length > 1 ? state.currentValue.slice(0, -1) : '0';
    updateDisplay(state.currentValue);
};

// Handle errors
const throwError = (message) => {
    throw new Error(message);
};

const displayError = () => {
    state.currentValue = 'Error';
    updateDisplay('Error');
    setTimeout(() => {
        clearAll();
    }, 2000);
};
