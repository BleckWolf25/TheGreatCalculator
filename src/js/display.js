const displayElement = document.getElementById('display');
const historyElement = document.getElementById('history');
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Update the display with the given value
const updateDisplay = (value) => {
    const formattedValue = formatDisplayValue(value);
    displayElement.value = formattedValue;
};

// Update the history display based on the current state
const updateHistory = () => {
    if (state.operator && state.previousValue !== null) {
        const historyText = `${state.previousValue} ${state.operator} ${state.currentValue}`;
        historyElement.textContent = historyText;
    } else {
        historyElement.textContent = '';
    }
};

// Format the display value
const formatDisplayValue = (value) => {
    // Handle error display
    if (value === 'Error') return value;

    const num = parseFloat(value);
    if (isNaN(num)) return '0';

    // Handle large numbers and scientific notation
    if (Math.abs(num) >= 1e12 || Math.abs(num) < 1e-12 && num !== 0) {
        return num.toExponential(8);
    }

    // Limit decimal places
    if (value.includes('.')) {
        const [integer, decimal] = value.split('.');
        return `${integer}.${decimal.slice(0, 8)}`;
    }

    return value;
};

// Initialize the display
updateDisplay('0');

// Set initial theme based on system preference
document.body.setAttribute('data-theme', prefersDarkScheme.matches ? 'dark' : 'light');
themeToggle.checked = prefersDarkScheme.matches;

// Listen for theme changes
themeToggle.addEventListener('change', function() {
    document.body.setAttribute('data-theme', this.checked ? 'dark' : 'light');
});