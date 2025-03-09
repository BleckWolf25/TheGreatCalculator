// Initialize calculator state
let state = {
    currentValue: '0',
    previousValue: null,
    memory: 0,
    operator: null,
    isNewNumber: true,
    isDegree: true,
    history: [],
    bracketCount: 0,
    lastCalculation: ''
};

// Memory Functions
const memoryClear = () => {
    state.memory = 0;
    showToast('Memory cleared');
};

const memoryRecall = () => {
    updateDisplay(state.memory.toString());
    animateButton(document.querySelector('[onclick="memoryRecall()"]'));
};

const memoryAdd = () => {
    state.memory += parseFloat(state.currentValue);
    showToast('Added to memory');
    animateButton(document.querySelector('[onclick="memoryAdd()"]'));
};

const memorySubtract = () => {
    state.memory -= parseFloat(state.currentValue);
    showToast('Subtracted from memory');
    animateButton(document.querySelector('[onclick="memorySubtract()"]'));
};

const memoryStore = () => {
    state.memory = parseFloat(state.currentValue);
    showToast('Stored in memory');
    animateButton(document.querySelector('[onclick="memoryStore()"]'));
};

// Set the current operator and prepare for the next input
const setOperator = (op) => {
    animateButton(document.querySelector(`[onclick="setOperator('${op}')"]`));
    
    if (state.previousValue !== null && !state.isNewNumber) {
        calculate('equals');
    }
    
    state.operator = op;
    state.previousValue = state.currentValue;
    state.isNewNumber = true;
    updateHistory();
    vibrate(10);
};

// Append a number to the current value
const appendNumber = (num) => {
    // Find and animate the corresponding button if it exists
    const selector = `[onclick="appendNumber('${num}')"]`;
    const button = document.querySelector(selector);
    if (button) animateButton(button);
    
    if (state.isNewNumber) {
        state.currentValue = num.toString();
        state.isNewNumber = false;
    } else {
        // Prevent multiple leading zeros
        if (state.currentValue === '0' && num === 0) return;
        if (state.currentValue === '0' && num !== '.') {
            state.currentValue = num.toString();
        } else {
            state.currentValue += num.toString();
        }
    }
    updateDisplay(state.currentValue);
    vibrate(5);
};

// Append a decimal point to the current value
const appendDecimal = () => {
    animateButton(document.querySelector('[onclick="appendDecimal()"]'));
    
    if (state.isNewNumber) {
        state.currentValue = '0.';
        state.isNewNumber = false;
    } else if (!state.currentValue.includes('.')) {
        state.currentValue += '.';
    }
    updateDisplay(state.currentValue);
    vibrate(5);
};

// Add bracket support for complex expressions
const appendBracket = () => {
    if (state.isNewNumber || state.currentValue === '0') {
        state.currentValue = '(';
        state.bracketCount = 1;
        state.isNewNumber = false;
    } else if (state.bracketCount > 0 && isOperatorOrOpenBracket(state.currentValue.slice(-1))) {
        state.currentValue += '(';
        state.bracketCount++;
    } else if (state.bracketCount > 0) {
        state.currentValue += ')';
        state.bracketCount--;
    } else {
        state.currentValue += '(';
        state.bracketCount++;
    }
    updateDisplay(state.currentValue);
    vibrate(5);
};

// Helper function to check if the last character is an operator or open bracket
const isOperatorOrOpenBracket = (char) => {
    return ['+', '-', '*', '/', '('].includes(char);
};

// Perform calculations based on the operation type
const calculate = (operation) => {
    animateButton(document.querySelector(`[onclick="calculate('${operation}')"]`));
    
    let result;
    const current = parseFloat(state.currentValue);

    // Add to history for tracking
    if (operation === 'equals' && state.operator) {
        state.lastCalculation = `${state.previousValue} ${state.operator} ${state.currentValue}`;
        state.history.push(state.lastCalculation);
        
        // Limit history to last 10 calculations
        if (state.history.length > 10) {
            state.history.shift();
        }
    }

    // Switch case statement to handle different operations
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
            case 'cbrt':
                result = Math.cbrt(current);
                break;
            case 'pow':
                result = Math.pow(current, 2);
                break;
            case 'pow3':
                result = Math.pow(current, 3);
                break;
            case 'factorial':
                result = factorial(current);
                break;
            case 'exp':
                result = Math.exp(current);
                break;
            case 'inv':
                result = 1 / current;
                break;
            case 'percent':
                result = current / 100;
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
            vibrate(15);
        }
    } catch (error) {
        displayError(error.message);
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
    if (!Number.isInteger(n) || n < 0) return throwError('Invalid input for factorial');
    if (n > 170) return throwError('Value too large');
    if (n === 0) return 1;
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
};

// Format the result to limit decimal places and handle large numbers
const formatResult = (num) => {
    if (isNaN(num)) return 'Error';
    if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';
    
    // For large or small numbers, use scientific notation
    if (Math.abs(num) > 1e10 || (Math.abs(num) < 1e-7 && num !== 0)) {
        return num.toExponential(7);
    }
    
    // For integers or numbers with few decimal places
    if (Number.isInteger(num)) return num.toString();
    
    // For decimal numbers, limit to 8 decimal places
    return parseFloat(num.toFixed(8)).toString();
};

// Toggle between degree and radian modes
const toggleDegRad = () => {
    state.isDegree = !state.isDegree;
    const button = document.querySelector('[onclick="toggleDegRad()"]');
    button.querySelector('span').textContent = state.isDegree ? 'DEG' : 'RAD';
    animateButton(button);
    showToast(state.isDegree ? 'Degree Mode' : 'Radian Mode');
    vibrate(10);
};

// Clear all state and reset the display
const clearAll = () => {
    animateButton(document.querySelector('[onclick="clearAll()"]'));
    
    state = {
        currentValue: '0',
        previousValue: null,
        operator: null,
        isNewNumber: true,
        isDegree: state.isDegree,
        memory: state.memory,
        history: state.history,
        bracketCount: 0,
        lastCalculation: ''
    };
    updateDisplay('0');
    updateHistory();
    vibrate(15);
};

// Clear the current entry (CE)
const clearEntry = () => {
    animateButton(document.querySelector('[onclick="clearEntry()"]'));
    
    state.currentValue = '0';
    updateDisplay('0');
    vibrate(10);
};

// Remove the last digit from the current value
const backspace = () => {
    animateButton(document.querySelector('[onclick="backspace()"]'));
    
    if (state.isNewNumber) return;
    
    state.currentValue = state.currentValue.length > 1 
        ? state.currentValue.slice(0, -1) 
        : '0';
        
    if (state.currentValue === '0') {
        state.isNewNumber = true;
    }
    
    updateDisplay(state.currentValue);
    vibrate(5);
};

// Show last calculation history
const showHistory = () => {
    const historyModal = document.getElementById('history-modal');
    const historyList = document.getElementById('history-list');
    
    historyList.innerHTML = '';
    
    if (state.history.length === 0) {
        historyList.innerHTML = '<li class="empty-history">No calculation history</li>';
    } else {
        state.history.forEach((calc, index) => {
            const li = document.createElement('li');
            li.textContent = calc;
            li.addEventListener('click', () => {
                // Load the calculation when clicked
                const parts = calc.split(' ');
                state.previousValue = parts[0];
                state.operator = parts[1];
                state.currentValue = parts[2];
                updateDisplay(state.currentValue);
                updateHistory();
                closeHistoryModal();
            });
            historyList.appendChild(li);
        });
    }
    
    historyModal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(10);
};

// Close history modal
const closeHistoryModal = () => {
    const historyModal = document.getElementById('history-modal');
    historyModal.classList.remove('show');
    document.body.classList.remove('modal-open');
};

// Handle errors
const throwError = (message) => {
    throw new Error(message);
};

// Display error with the error message
const displayError = (message) => {
    state.currentValue = 'Error';
    updateDisplay('Error');
    showToast(message);
    vibrate([50, 100, 50]);
    
    setTimeout(() => {
        clearAll();
    }, 2000);
};

// Show toast notification
const showToast = (message) => {
    const toast = document.getElementById('toast');
    if (!toast) {
        // Create toast if it doesn't exist
        const newToast = document.createElement('div');
        newToast.id = 'toast';
        newToast.className = 'toast';
        document.body.appendChild(newToast);
    }
    
    const toastElement = document.getElementById('toast');
    toastElement.textContent = message;
    toastElement.classList.add('show');
    
    setTimeout(() => {
        toastElement.classList.remove('show');
    }, 2000);
};

// Haptic feedback function (if supported)
const vibrate = (pattern) => {
    if (navigator.vibrate) {
        navigator.vibrate(pattern);
    }
};

// Animate button when pressed
const animateButton = (button) => {
    if (!button) return;
    
    button.classList.add('animate');
    setTimeout(() => {
        button.classList.remove('animate');
    }, 300);
};

// Initialize keyboard support
const initKeyboardSupport = () => {
    document.addEventListener('keydown', (event) => {
        // Prevent default for calculator keys to avoid page scrolling
        if (['+', '-', '*', '/', '=', 'Enter', 'Backspace', 'Delete', 'Escape'].includes(event.key) ||
           (!isNaN(parseFloat(event.key)) && isFinite(event.key))) {
            event.preventDefault();
        }
        
        // Map keyboard keys to calculator functions
        switch (event.key) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                appendNumber(event.key);
                break;
            case '.':
            case ',':
                appendDecimal();
                break;
            case '+':
                setOperator('+');
                break;
            case '-':
                setOperator('-');
                break;
            case '*':
                setOperator('*');
                break;
            case '/':
                setOperator('/');
                break;
            case '=':
            case 'Enter':
                calculate('equals');
                break;
            case 'Backspace':
                backspace();
                break;
            case 'Delete':
            case 'Escape':
                clearAll();
                break;
            case 'c':
            case 'C':
                if (event.ctrlKey) {
                    memoryStore(); // Ctrl+C for memory store
                } else {
                    clearEntry();
                }
                break;
            case 'r':
            case 'R':
                if (event.ctrlKey) {
                    memoryRecall(); // Ctrl+R for memory recall
                }
                break;
            case 'p':
            case 'P':
                if (event.ctrlKey) {
                    calculate('percent'); // Ctrl+P for percentage
                }
                break;
            case 's':
            case 'S':
                if (event.ctrlKey) {
                    calculate('sin'); // Ctrl+S for sine
                } else if (event.shiftKey) {
                    calculate('sqrt'); // Shift+S for square root
                }
                break;
            case 't':
            case 'T':
                if (event.ctrlKey) {
                    calculate('tan'); // Ctrl+T for tangent
                }
                break;
            case 'h':
            case 'H':
                if (event.ctrlKey) {
                    showHistory(); // Ctrl+H for history
                }
                break;
            case '(':
            case ')':
                appendBracket();
                break;
            case 'd':
            case 'D':
                if (event.ctrlKey) {
                    toggleDegRad(); // Ctrl+D for toggling DEG/RAD
                }
                break;
        }
    });
    
    // Add keyboard support hint
    const keyboardHint = document.createElement('div');
    keyboardHint.id = 'keyboard-hint';
    keyboardHint.innerHTML = '<kbd>?</kbd>';
    keyboardHint.title = 'Keyboard shortcuts available. Press ? for help.';
    document.body.appendChild(keyboardHint);
    
    keyboardHint.addEventListener('click', showKeyboardShortcuts);
    
    // Add keyboard shortcut to show help
    document.addEventListener('keydown', (event) => {
        if (event.key === '?') {
            showKeyboardShortcuts();
        }
    });
};

// Show keyboard shortcuts help
const showKeyboardShortcuts = () => {
    // Create modal for keyboard shortcuts if it doesn't exist
    if (!document.getElementById('keyboard-shortcuts-modal')) {
        const modal = document.createElement('div');
        modal.id = 'keyboard-shortcuts-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Keyboard Shortcuts</h2>
                    <span class="close-modal" onclick="closeKeyboardShortcuts()">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="shortcuts-grid">
                        <div class="shortcut">
                            <kbd>0-9</kbd> <span>Enter numbers</span>
                        </div>
                        <div class="shortcut">
                            <kbd>.</kbd> <span>Decimal point</span>
                        </div>
                        <div class="shortcut">
                            <kbd>+</kbd> <kbd>-</kbd> <kbd>*</kbd> <kbd>/</kbd> <span>Operators</span>
                        </div>
                        <div class="shortcut">
                            <kbd>Enter</kbd> <kbd>=</kbd> <span>Calculate result</span>
                        </div>
                        <div class="shortcut">
                            <kbd>Backspace</kbd> <span>Delete last digit</span>
                        </div>
                        <div class="shortcut">
                            <kbd>Escape</kbd> <kbd>Delete</kbd> <span>Clear all</span>
                        </div>
                        <div class="shortcut">
                            <kbd>C</kbd> <span>Clear entry</span>
                        </div>
                        <div class="shortcut">
                            <kbd>Ctrl</kbd> + <kbd>R</kbd> <span>Memory recall</span>
                        </div>
                        <div class="shortcut">
                            <kbd>Ctrl</kbd> + <kbd>C</kbd> <span>Memory store</span>
                        </div>
                        <div class="shortcut">
                            <kbd>Ctrl</kbd> + <kbd>S</kbd> <span>Sine function</span>
                        </div>
                        <div class="shortcut">
                            <kbd>Shift</kbd> + <kbd>S</kbd> <span>Square root</span>
                        </div>
                        <div class="shortcut">
                            <kbd>Ctrl</kbd> + <kbd>T</kbd> <span>Tangent function</span>
                        </div>
                        <div class="shortcut">
                            <kbd>Ctrl</kbd> + <kbd>H</kbd> <span>History</span>
                        </div>
                        <div class="shortcut">
                            <kbd>(</kbd> <kbd>)</kbd> <span>Brackets</span>
                        </div>
                        <div class="shortcut">
                            <kbd>Ctrl</kbd> + <kbd>D</kbd> <span>Toggle DEG/RAD</span>
                        </div>
                        <div class="shortcut">
                            <kbd>?</kbd> <span>Show this help</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const modal = document.getElementById('keyboard-shortcuts-modal');
    modal.classList.add('show');
    document.body.classList.add('modal-open');
    vibrate(10);
};

// Close keyboard shortcuts modal
const closeKeyboardShortcuts = () => {
    const modal = document.getElementById('keyboard-shortcuts-modal');
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
};

// Setup accessibility features
const setupAccessibility = () => {
    // Add ARIA attributes to calculator buttons
    const buttons = document.querySelectorAll('.buttons-grid button');
    buttons.forEach(button => {
        const text = button.textContent.trim();
        button.setAttribute('aria-label', text);
        
        if (button.classList.contains('operator')) {
            button.setAttribute('aria-role', 'button');
            button.setAttribute('aria-description', `Operator ${text}`);
        } else if (button.classList.contains('number')) {
            button.setAttribute('aria-role', 'button');
            button.setAttribute('aria-description', `Number ${text}`);
        }
    });
    
    // Make the display more accessible
    const display = document.getElementById('display');
    display.setAttribute('aria-live', 'polite');
    display.setAttribute('aria-atomic', 'true');
    display.setAttribute('role', 'textbox');
    display.setAttribute('aria-label', 'Calculator display');
};

// Initialize calculator
const initCalculator = () => {
    // Set initial state
    updateDisplay('0');
    
    // Setup keyboard support
    initKeyboardSupport();
    
    // Setup accessibility
    setupAccessibility();
    
    // Add gesture support for touch devices
    setupGestureSupport();
    
    // Check if we can offer additional browser-specific features
    checkBrowserFeatures();
    
    // Show welcome toast
    setTimeout(() => {
        showToast('Advanced Calculator Ready!');
    }, 1000);
};

// Setup gesture support for touch devices
const setupGestureSupport = () => {
    const calculator = document.querySelector('.calculator');
    let touchStartX = 0;
    let touchStartY = 0;
    
    calculator.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    });
    
    calculator.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        // Horizontal swipe (left/right) for backspace/clear
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left for backspace
                backspace();
            } else {
                // Swipe right for clear entry
                clearEntry();
            }
        }
        
        // Vertical swipe (up/down) for history/settings
        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
            if (diffY > 0) {
                // Swipe up for history
                showHistory();
            }
        }
    });
};

// Check for additional browser features we can use
const checkBrowserFeatures = () => {
    // Check if we can use local storage for saving preferences
    if (typeof Storage !== 'undefined') {
        // Load saved preferences
        const savedTheme = localStorage.getItem('calculator_theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            document.getElementById('theme-toggle').checked = (savedTheme === 'dark');
        }
        
        // Load saved angle mode
        const savedAngleMode = localStorage.getItem('calculator_angle_mode');
        if (savedAngleMode) {
            state.isDegree = (savedAngleMode === 'deg');
            document.querySelector('[onclick="toggleDegRad()"] span').textContent = 
                state.isDegree ? 'DEG' : 'RAD';
        }
        
        // Save theme preference when changed
        document.getElementById('theme-toggle').addEventListener('change', function() {
            const theme = this.checked ? 'dark' : 'light';
            localStorage.setItem('calculator_theme', theme);
        });
    }
    
    // Check if we can use Web Share API
    if (navigator.share) {
        // Add share button
        const shareButton = document.createElement('button');
        shareButton.className = 'share-button';
        shareButton.innerHTML = '<span>📤</span>';
        shareButton.setAttribute('aria-label', 'Share calculator');
        shareButton.addEventListener('click', () => {
            navigator.share({
                title: 'Advanced Scientific Calculator',
                text: state.lastCalculation 
                    ? `Check out my calculation: ${state.lastCalculation} = ${state.currentValue}`
                    : 'Check out this advanced scientific calculator!',
                url: window.location.href
            }).catch(err => {
                console.error('Share failed:', err);
            });
        });
        document.querySelector('.calculator').appendChild(shareButton);
    }
};

// Call initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initCalculator);

// Export functions for external access
window.calculate = calculate;
window.appendNumber = appendNumber;
window.appendDecimal = appendDecimal;
window.setOperator = setOperator;
window.clearAll = clearAll;
window.clearEntry = clearEntry;
window.backspace = backspace;
window.memoryClear = memoryClear;
window.memoryRecall = memoryRecall;
window.memoryAdd = memoryAdd;
window.memorySubtract = memorySubtract;
window.memoryStore = memoryStore;
window.toggleDegRad = toggleDegRad;
window.showHistory = showHistory;
window.closeHistoryModal = closeHistoryModal;
window.showKeyboardShortcuts = showKeyboardShortcuts;
window.closeKeyboardShortcuts = closeKeyboardShortcuts;
window.appendBracket = appendBracket;
