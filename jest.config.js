/**
 * @file JEST.CONFIG.JS
 *
 * @version 2.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Modern Jest configuration for The Great Calculator project with full ES modules support.
 * Ensures the quality and reliability of the codebase with native ES module handling.
 * Includes unit, integration, and end-to-end tests with performance and accessibility testing.
 */

// ------------ ES MODULES CONFIGURATION
export default {
  // Test environment setup with ES modules support
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  },

  // Setup files after environment
  setupFilesAfterEnv: ['<rootDir>/tests/setup-esm.js'],

  // Module file extensions for tests
  moduleFileExtensions: ['js', 'mjs', 'json'],

  // Test patterns for unit tests
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],

  // Ignore patterns for test files
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/tests/e2e/'
  ],

  // Module name mapping for aliases with ES modules support
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@js/(.*)$': '<rootDir>/src/js/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1'
  },

  // Coverage configuration for code coverage
  collectCoverageFrom: [
    'src/js/modules/**/*.js',
    'src/js/*.js',
    '!src/js/modules/**/index.js',
    '!src/js/main.js',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],

  // Coverage thresholds for quality assurance
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/js/modules/core/': {
      branches: 98,
      functions: 98,
      lines: 98,
      statements: 98
    },
    './src/js/modules/api/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },

  // Coverage directory and reporters for coverage reports
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json'
  ],

  // Transform configuration for ES modules
  transform: {
    '^.+\\.js$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', {
          targets: { node: 'current' },
          modules: 'auto' // Let Babel handle module transformation for Jest
        }]
      ]
    }]
  },

  // Transform ignore patterns - allow ES modules in node_modules
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$))'
  ],

  // Test timeout for unit tests
  testTimeout: 10000,

  // Verbose output for tests
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Error on deprecated features for tests
  errorOnDeprecated: true,

  // Notify mode for watch mode
  notify: false,

  // Max workers for parallel testing for tests
  maxWorkers: '50%',

  // Global setup and teardown for tests with ES modules
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',

  // Node options for ES modules support
  globals: {
    'ts-jest': {
      useESM: true
    }
  },

  // Reporter configuration for test results
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './coverage',
      filename: 'jest-report.html',
      expand: true
    }]
  ],

  // Watch plugins for watch mode
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
};
