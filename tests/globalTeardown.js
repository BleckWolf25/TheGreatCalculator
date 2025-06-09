/**
 * Jest Global Teardown
 * Runs once after all tests
 */

export default async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...');

  // Clean up any global test artifacts
  delete process.env.CALCULATOR_TEST_MODE;

  // Clear any global timers
  if (global.testTimers) {
    global.testTimers.forEach(timer => clearTimeout(timer));
    delete global.testTimers;
  }

  console.log('✅ Global teardown completed');
};
