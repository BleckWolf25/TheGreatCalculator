/**
 * @file utils.test.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Unit tests for general utility helper functions.
 *
 * @description
 * Verifies class name merging behaviors with tailwind-merge overlays,
 * and alphanumeric collision-resistant identifier generation correctness.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import { describe, it, expect } from 'vitest';
import { cn, generateId } from '@/lib/utils';

// ---------- TESTS: UTILITIES
describe('General Utilities', () => {
  // ---------- TEST: CLASS MERGES
  it('combines and cleans CSS Tailwind class names correctly', () => {
    // ---------- TAILWIND OVERLAYS
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
    expect(cn('bg-red-500 text-white', 'bg-blue-500')).toBe('text-white bg-blue-500');

    // ---------- CONDITIONAL CLASSES
    expect(cn('base-class', false && 'hidden', true && 'visible')).toBe('base-class visible');
  });

  // ---------- TEST: ID GENERATION
  it('produces unique collision-resistant timestamped strings', () => {
    const id1 = generateId();
    const id2 = generateId();

    expect(id1).toBeDefined();
    expect(id1).not.toBe(id2);
    expect(typeof id1).toBe('string');
    expect(id1.split('-').length).toBe(2);
  });
});
