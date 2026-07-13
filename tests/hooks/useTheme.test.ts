/**
 * @file useTheme.test.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Unit tests for the useTheme custom hook.
 *
 * @description
 * Tests theme synchronization states with localStorage and class injection
 * logic in the document root element.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
// @vitest-environment happy-dom
// ---------- IMPORTS
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';

// ---------- TESTS: THEME HOOK
describe('useTheme Hook', () => {
  // ---------- SETUP (Clear local storage and document class list before test runs)
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  // ---------- TEST: INITIALIZATION
  it('initializes with default system theme preference', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('system');
  });

  // ---------- TEST: VALUE SETTERS
  it('updates local state and writes to localStorage on theme change', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
    expect(localStorage.getItem('calc-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
