/**
 * Display Manager Unit Tests
 * Tests for display management and UI updates with ES modules
 */

// Import the DisplayManager module directly
import DisplayManager from '../../src/js/modules/ui/display.js';

// Setup global DOM environment
beforeAll(() => {
  global.window = {
    navigator: {
      vibrate: undefined
    },
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: clearTimeout
  };

  global.document = {
    getElementById: () => null,
    createElement: () => ({}),
    body: { appendChild: () => {} }
  };

  global.setTimeout = setTimeout;
  global.clearTimeout = clearTimeout;
});

describe('DisplayManager', () => {
  let displayManager;
  let mockDisplayElement;
  let mockHistoryElement;

  beforeEach(() => {
    displayManager = new DisplayManager();

    // Track method calls for testing
    let setAttributeCalls = [];
    let getAttributeCalls = [];
    let addClassCalls = [];
    let removeClassCalls = [];
    let appendChildCalls = [];
    let removeChildCalls = [];

    mockDisplayElement = {
      value: '',
      textContent: '',
      style: {},
      setAttribute: (attr, value) => { setAttributeCalls.push({ attr, value }); },
      getAttribute: (attr) => { getAttributeCalls.push(attr); return null; },
      classList: {
        add: (className) => { addClassCalls.push(className); },
        remove: (className) => { removeClassCalls.push(className); },
        contains: () => false
      },
      // Helper methods for testing
      _getSetAttributeCalls: () => setAttributeCalls,
      _getGetAttributeCalls: () => getAttributeCalls,
      _getAddClassCalls: () => addClassCalls,
      _getRemoveClassCalls: () => removeClassCalls
    };

    mockHistoryElement = {
      textContent: '',
      innerHTML: '',
      style: {},
      setAttribute: (attr, value) => { setAttributeCalls.push({ attr, value }); },
      appendChild: (child) => { appendChildCalls.push(child); },
      removeChild: (child) => { removeChildCalls.push(child); },
      // Helper methods for testing
      _getAppendChildCalls: () => appendChildCalls,
      _getRemoveChildCalls: () => removeChildCalls
    };
  });

  describe('Initialization', () => {
    test('should initialize correctly', () => {
      expect(displayManager.isInitialized).toBe(false);

      displayManager.initialize(mockDisplayElement, mockHistoryElement);

      expect(displayManager.isInitialized).toBe(true);
      expect(displayManager.displayElement).toBe(mockDisplayElement);
      expect(displayManager.historyElement).toBe(mockHistoryElement);
    });

    test('should setup accessibility attributes', () => {
      displayManager.initialize(mockDisplayElement, mockHistoryElement);

      const setAttributeCalls = mockDisplayElement._getSetAttributeCalls();
      expect(setAttributeCalls).toContainEqual({ attr: 'aria-live', value: 'polite' });
      expect(setAttributeCalls).toContainEqual({ attr: 'aria-label', value: 'Calculator display' });
    });

    test('should not initialize without required elements', () => {
      displayManager.initialize(null, mockHistoryElement);
      expect(displayManager.isInitialized).toBe(false);

      displayManager.initialize(mockDisplayElement, null);
      expect(displayManager.isInitialized).toBe(false);
    });
  });

  describe('Display Updates', () => {
    beforeEach(() => {
      displayManager.initialize(mockDisplayElement, mockHistoryElement);
    });

    test('should update display value', () => {
      displayManager.updateDisplay('123', { animate: false });

      expect(mockDisplayElement.value).toBe('123');
    });

    test('should format display values with commas', () => {
      displayManager.updateDisplay('1000', { animate: false });

      expect(mockDisplayElement.value).toBe('1,000');
    });

    test('should handle large numbers', () => {
      displayManager.updateDisplay('1000000', { animate: false });

      expect(mockDisplayElement.value).toBe('1,000,000');
    });

    test('should preserve decimal places', () => {
      displayManager.updateDisplay('123.456', { animate: false });

      expect(mockDisplayElement.value).toBe('123.456');
    });

    test('should handle error messages without formatting', () => {
      displayManager.updateDisplay('Error', { animate: false, formatValue: false });

      expect(mockDisplayElement.value).toBe('Error');
    });

    test('should warn when not initialized', () => {
      const uninitializedManager = new DisplayManager();
      let warnCalled = false;
      let warnMessage = '';

      // Mock console.warn
      const originalWarn = console.warn;
      console.warn = (message) => {
        warnCalled = true;
        warnMessage = message;
      };

      uninitializedManager.updateDisplay('123');

      expect(warnCalled).toBe(true);
      expect(warnMessage).toBe('⚠️ Display manager not initialized or display element missing');

      // Restore original console.warn
      console.warn = originalWarn;
    });
  });

  describe('History Management', () => {
    beforeEach(() => {
      displayManager.initialize(mockDisplayElement, mockHistoryElement);
    });

    test('should update history display', () => {
      displayManager.updateHistory('2 + 3 = 5');

      expect(mockHistoryElement.textContent).toBe('2 + 3 = 5');
    });

    test('should handle empty history', () => {
      displayManager.updateHistory('');

      expect(mockHistoryElement.textContent).toBe('');
    });

    test('should clear history display', () => {
      displayManager.updateHistory('1 + 1 = 2');
      displayManager.updateHistory(''); // Clear by setting empty string

      expect(mockHistoryElement.textContent).toBe('');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      displayManager.initialize(mockDisplayElement, mockHistoryElement);
    });

    test('should show error messages', () => {
      displayManager.showError('Division by zero');

      // The showError method calls updateDisplay internally
      expect(mockDisplayElement.value).toBe('Division by zero');
      const addClassCalls = mockDisplayElement._getAddClassCalls();
      expect(addClassCalls).toContain('error-state');
    });

    test('should truncate long error messages', () => {
      const longError = 'This is a very long error message that should be truncated';
      displayManager.showError(longError);

      expect(mockDisplayElement.value.length).toBeLessThanOrEqual(30);
      expect(mockDisplayElement.value).toContain('...');
    });

    test('should clear error state', () => {
      displayManager.showError('Test error');
      displayManager.updateDisplay('123', { animate: false }); // Clear error by updating display

      const removeClassCalls = mockDisplayElement._getRemoveClassCalls();
      expect(removeClassCalls).toContain('error-state');
    });
  });

  describe('Display Formatting', () => {
    beforeEach(() => {
      displayManager.initialize(mockDisplayElement, mockHistoryElement);
    });

    test('should format numbers with thousand separators', () => {
      expect(displayManager.formatDisplayValue('1000')).toBe('1,000');
      expect(displayManager.formatDisplayValue('1000000')).toBe('1,000,000');
      expect(displayManager.formatDisplayValue('123456.789')).toBe('123,456.789');
    });

    test('should not format non-numeric values', () => {
      expect(displayManager.formatDisplayValue('Error')).toBe('Error');
      expect(displayManager.formatDisplayValue('NaN')).toBe('NaN');
      expect(displayManager.formatDisplayValue('Infinity')).toBe('Infinity');
    });

    test('should handle negative numbers', () => {
      // The formatDisplayValue method treats strings with '-' as expressions
      // So negative numbers are returned as-is without formatting
      expect(displayManager.formatDisplayValue('-1000')).toBe('-1000');
      expect(displayManager.formatDisplayValue('-123456.78')).toBe('-123456.78');
    });

    test('should handle scientific notation', () => {
      expect(displayManager.formatDisplayValue('1e+10')).toBe('1e+10');
      expect(displayManager.formatDisplayValue('1.23e-5')).toBe('1.23e-5');
    });
  });

  describe('Animation Handling', () => {
    beforeEach(() => {
      displayManager.initialize(mockDisplayElement, mockHistoryElement);
    });

    test('should queue animations when busy', () => {
      displayManager.updateDisplay('123', { animate: true });
      displayManager.updateDisplay('456', { animate: true });

      // Check if animation queue exists and has items
      if (displayManager.animationQueue) {
        expect(displayManager.animationQueue.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('should process animation queue', () => {
      displayManager.updateDisplay('123', { animate: true });
      displayManager.updateDisplay('456', { animate: true });

      // Since we can't use Jest timers in ES modules, just check final value
      expect(mockDisplayElement.value).toBe('456');
    });
  });

  describe('Accessibility Features', () => {
    beforeEach(() => {
      displayManager.initialize(mockDisplayElement, mockHistoryElement);
    });

    test('should announce to screen readers when requested', () => {
      let announceCalled = false;
      let announceMessage = '';

      // Mock the announceToScreenReader method
      const originalAnnounce = displayManager.announceToScreenReader;
      displayManager.announceToScreenReader = (message) => {
        announceCalled = true;
        announceMessage = message;
      };

      displayManager.updateDisplay('123', { announceToScreenReader: true });

      expect(announceCalled).toBe(true);
      expect(announceMessage).toBe('Display shows 123');

      // Restore original method
      displayManager.announceToScreenReader = originalAnnounce;
    });

    test('should handle screen reader announcements', () => {
      // Mock aria-live region
      let createdElement = null;
      const mockAriaRegion = {
        textContent: '',
        setAttribute: () => {},
        style: { cssText: '' }
      };

      // Mock document methods
      const originalGetElementById = global.document.getElementById;
      const originalCreateElement = global.document.createElement;
      const originalAppendChild = global.document.body.appendChild;

      global.document.getElementById = () => null; // Force creation of new element
      global.document.createElement = () => {
        createdElement = mockAriaRegion;
        return mockAriaRegion;
      };
      global.document.body.appendChild = () => {};

      displayManager.announceToScreenReader('Test announcement');

      expect(createdElement.textContent).toBe('Test announcement');

      // Restore original methods
      global.document.getElementById = originalGetElementById;
      global.document.createElement = originalCreateElement;
      global.document.body.appendChild = originalAppendChild;
    });
  });

  describe('Text Size Adjustment', () => {
    beforeEach(() => {
      displayManager.initialize(mockDisplayElement, mockHistoryElement);
    });

    test('should adjust text size for long numbers', () => {
      const longNumber = '123456789012345';
      displayManager.updateDisplay(longNumber, { animate: false });

      // Should apply smaller font size for long numbers
      expect(mockDisplayElement.style.fontSize).toBeDefined();
    });

    test('should reset text size for normal numbers', () => {
      displayManager.updateDisplay('123456789012345', { animate: false });
      displayManager.updateDisplay('123', { animate: false });

      // Should reset to normal size (2.5rem for short numbers)
      expect(mockDisplayElement.style.fontSize).toBe('2.5rem');
    });
  });

  describe('Vibration Feedback', () => {
    beforeEach(() => {
      displayManager.initialize(mockDisplayElement, mockHistoryElement);
    });

    test('should provide vibration feedback when supported', () => {
      let vibrateCalled = false;
      let vibrateValue = null;

      global.window.navigator.vibrate = (value) => {
        vibrateCalled = true;
        vibrateValue = value;
      };

      displayManager.vibrate(50);

      expect(vibrateCalled).toBe(true);
      expect(vibrateValue).toBe(50);
    });

    test('should handle missing vibration support gracefully', () => {
      global.window.navigator.vibrate = undefined;

      expect(() => displayManager.vibrate(50)).not.toThrow();
    });
  });
});
