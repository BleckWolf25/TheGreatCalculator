/**
 * @file eslint.config.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary ESLint Configuration.
 *
 * @description
 * ESLint Configuration for TheGreatCalculator.
 * Strict Configuration.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import type { Linter } from 'eslint';
import nextCoreWebVitalsConfig from 'eslint-config-next/core-web-vitals';
import nextTypescriptConfig from 'eslint-config-next/typescript';

// ---------- CONFIGURATION
const eslintConfig: Linter.Config[] = [
  // Global ignore patterns for configuration files, build outputs, and dependencies
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'public/**',
      'next-env.d.ts',
      'next.config.ts',
      'eslint.config.ts',
      'postcss.config.*',
      'tailwind.config.*',
      'vitest.config.*',
      '*.config.js',
      '*.config.mjs',
      '*.config.cjs',
      '*.config.ts',
    ],
  },
  ...nextCoreWebVitalsConfig,
  ...nextTypescriptConfig,
  {
    rules: {
      // TypeScript strict rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],

      // Best practices
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      eqeqeq: ['error', 'always', { null: 'ignore' }],

      // React strictness
      'react/self-closing-comp': 'error',
      'react/no-unescaped-entities': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Next.js Flat Config adjustments
      '@next/next/no-page-custom-font': 'off',
    },
  },
];

// ---------- EXPORTS
export default eslintConfig;
