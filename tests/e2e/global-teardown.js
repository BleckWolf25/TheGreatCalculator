/**
 * Playwright Global Teardown
 * Runs once after all E2E tests
 */

export default async function globalTeardown(config) {
  console.log('🧹 Cleaning up E2E test environment...');

  // You can add global cleanup logic here
  // For example: database cleanup, file cleanup, etc.

  console.log('✅ E2E global teardown completed');
}
