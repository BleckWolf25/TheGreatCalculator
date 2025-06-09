/**
 * Playwright Global Setup
 * Runs once before all E2E tests
 */

export default async function globalSetup(config) {
  console.log('🚀 Starting E2E test suite...');

  // You can add global setup logic here
  // For example: database seeding, authentication setup, etc.

  console.log('✅ E2E global setup completed');
}
