const displayElement = document.getElementById('display');
const historyElement = document.getElementById('history');
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Update display
const updateDisplay = (value) => {
    displayElement.style.transform = 'scale(1.02)';
    displayElement.style.opacity = '0.9';
    
    setTimeout(() => {
        displayElement.style.transform = 'scale(1)';
        displayElement.style.opacity = '1';
    }, 50);

    const formattedValue = formatDisplayValue(value);
    displayElement.value = formattedValue;
    adjustDisplayTextSize(formattedValue);
    
    // Gradient animation for special results
    if (formattedValue.includes('e')) {
        displayElement.classList.add('scientific-notation');
    } else {
        displayElement.classList.remove('scientific-notation');
    }
};

// History display
const updateHistory = () => {
    historyElement.style.opacity = '0';
    setTimeout(() => {
        if (state.operator && state.previousValue !== null) {
            const historyText = `${state.previousValue} ${state.operator} ${state.currentValue || '?'}`;
            historyElement.textContent = historyText;
            historyElement.setAttribute('aria-label', `History: ${historyText}`);
        } else {
            historyElement.textContent = '';
        }
        historyElement.style.opacity = '1';
    }, 150);
};

// Format the display value
const formatDisplayValue = (value) => {
    // Handle error display
    if (value === 'Error' || value === 'Infinity' || value === '-Infinity') return value;

    // If it's an expression with brackets, don't format
    if (value.includes('(') || value.includes(')')) return value;

    const num = parseFloat(value);
    if (isNaN(num)) return '0';

    // Handle large numbers and scientific notation
    if (Math.abs(num) >= 1e12 || (Math.abs(num) < 1e-8 && num !== 0)) {
        return num.toExponential(8);
    }

    // Format numbers with appropriate thousands separators
    let formatted = value;
    if (Math.abs(num) >= 1000) {
        // Get the user's locale for proper number formatting
        const locale = navigator.language || 'en-US';
        formatted = num.toLocaleString(locale, {
            maximumFractionDigits: 8
        });
        
        // Make sure we keep the decimal part from the original value
        if (value.includes('.')) {
            const decimalPart = value.split('.')[1];
            formatted = formatted.split('.')[0] + '.' + decimalPart;
        }
    }

    // Limit decimal places
    if (formatted.includes('.')) {
        const [integer, decimal] = formatted.split('.');
        return `${integer}.${decimal.slice(0, 8)}`;
    }

    return formatted;
};

// Adjust text size based on content length
const adjustDisplayTextSize = (value) => {
    const length = value.length;
    
    // Reset first
    displayElement.style.fontSize = '';
    
    // Apply progressively smaller font sizes for longer numbers
    if (length > 12) {
        displayElement.style.fontSize = '1.5em';
    }
    if (length > 16) {
        displayElement.style.fontSize = '1.3em';
    }
    if (length > 20) {
        displayElement.style.fontSize = '1.1em';
    }
    if (length > 24) {
        displayElement.style.fontSize = '0.9em';
    }
};

// Initialize the display
updateDisplay('0');

// Set initial theme based on system preference or saved preference
const initializeTheme = () => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('calculator_theme');
    
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        themeToggle.checked = (savedTheme === 'dark');
    } else {
        // Otherwise use system preference
        document.body.setAttribute('data-theme', prefersDarkScheme.matches ? 'dark' : 'light');
        themeToggle.checked = prefersDarkScheme.matches;
    }
    
    // Animate theme transition
    document.body.classList.add('theme-transition');
    setTimeout(() => {
        document.body.classList.remove('theme-transition');
    }, 500);
};

// Initialize theme on load
document.addEventListener('DOMContentLoaded', initializeTheme);

// Listen for theme changes
themeToggle.addEventListener('change', function() {
    
    // Animation class
    document.body.classList.add('theme-transition');
    
    // Apply theme change
    document.body.setAttribute('data-theme', this.checked ? 'dark' : 'light');
    
    // Save preference
    localStorage.setItem('calculator_theme', this.checked ? 'dark' : 'light');
    
    // Remove animation class after transition
    setTimeout(() => {
        document.body.classList.remove('theme-transition');
    }, 500);
});

// Listen for system theme changes
prefersDarkScheme.addEventListener('change', (event) => {
    // Only apply if no saved preference exists
    if (!localStorage.getItem('calculator_theme')) {
        document.body.setAttribute('data-theme', event.matches ? 'dark' : 'light');
    }
});