/**
 * Jest Global Setup
 * Runs once before all tests
 */

export default async function globalSetup() {
  console.log('🚀 Starting test suite...');

  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.CALCULATOR_TEST_MODE = 'true';

  // Mock performance API if not available
  if (typeof global.performance === 'undefined') {
    global.performance = {
      now: () => Date.now(),
      mark: () => {},
      measure: () => {},
      getEntriesByName: () => [],
      getEntriesByType: () => [],
      clearMarks: () => {},
      clearMeasures: () => {}
    };
  }

  // Mock IntersectionObserver
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock ResizeObserver
  global.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  // Mock requestAnimationFrame
  global.requestAnimationFrame = (callback) => {
    return setTimeout(callback, 16);
  };

  global.cancelAnimationFrame = (id) => {
    clearTimeout(id);
  };

  console.log('✅ Global setup completed');
};
