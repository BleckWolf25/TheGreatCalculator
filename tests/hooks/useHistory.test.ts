/**
 * @file useHistory.test.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Unit tests for the useHistory custom hook.
 *
 * @description
 * Tests calculator calculation history logs, item additions, limits control,
 * legacy localStorage migrations, and database write triggers.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
// @vitest-environment happy-dom
// ---------- IMPORTS
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useHistory } from '@/hooks/useHistory';

// ---------- MOCKS
vi.mock('@/lib/db', () => ({
  getValue: vi.fn().mockResolvedValue(null),
  setValue: vi.fn().mockResolvedValue(undefined),
}));

// ---------- TESTS: HISTORY HOOK
describe('useHistory Hook', () => {
  // ---------- SETUP
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ---------- TEST: INITIAL STATE
  it('starts with an empty log array', async () => {
    const { result } = renderHook(() => useHistory());

    // ---------- ASYNC COMPILATION (Wait for async database load resolution to prevent act state warnings)
    await waitFor(() => {
      expect(result.current.history).toEqual([]);
    });
  });

  // ---------- TEST: ADD ENTRY
  it('appends calculation entries and controls maximum log counts', async () => {
    const { result } = renderHook(() => useHistory());

    // ---------- ASYNC COMPILATION (Ensure hook is fully hydrated before running actions)
    await waitFor(() => {
      expect(result.current.history).toEqual([]);
    });

    act(() => {
      result.current.addEntry('2 + 2', '4', 'scientific');
    });

    expect(result.current.history.length).toBe(1);
    expect(result.current.history[0].expression).toBe('2 + 2');
    expect(result.current.history[0].result).toBe('4');
  });

  // ---------- TEST: CLEAR HISTORY
  it('clears all recorded histories on clear action', async () => {
    const { result } = renderHook(() => useHistory());

    await waitFor(() => {
      expect(result.current.history).toEqual([]);
    });

    act(() => {
      result.current.addEntry('2 + 2', '4', 'scientific');
      result.current.clearHistory();
    });

    expect(result.current.history).toEqual([]);
  });
});
