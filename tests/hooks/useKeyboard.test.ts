/**
 * @file useKeyboard.test.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Unit tests for the useKeyboard hotkeys hook.
 *
 * @description
 * Listens for keydown events globally and triggers mock handlers for number inputs,
 * evaluations, backspaces, and escapes.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
// @vitest-environment happy-dom
// ---------- IMPORTS
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboard } from '@/hooks/useKeyboard';

// ---------- TESTS: KEYBOARD HOOK
describe('useKeyboard Hook', () => {
  const mockHandlers = {
    onInput: vi.fn(),
    onEvaluate: vi.fn(),
    onDelete: vi.fn(),
    onClear: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------- TEST: KEYDOWN TRIGGERS
  it('intercepts numeric and symbol keyboard entries and dispatches inputs', () => {
    renderHook(() => useKeyboard(mockHandlers));

    // ---------- SIMULATION (Trigger keydown events on the global window context)
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '7' }));
    expect(mockHandlers.onInput).toHaveBeenCalledWith('7');

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '+' }));
    expect(mockHandlers.onInput).toHaveBeenCalledWith('+');
  });

  it('triggers evaluate handlers on Enter or equal inputs', () => {
    renderHook(() => useKeyboard(mockHandlers));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(mockHandlers.onEvaluate).toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: '=' }));
    expect(mockHandlers.onEvaluate).toHaveBeenCalled();
  });

  it('triggers delete and clear actions on Backspace and Escape keys', () => {
    renderHook(() => useKeyboard(mockHandlers));

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));
    expect(mockHandlers.onDelete).toHaveBeenCalled();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(mockHandlers.onClear).toHaveBeenCalled();
  });
});
