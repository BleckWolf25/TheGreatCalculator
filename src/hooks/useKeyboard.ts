/**
 * @file useKeyboard.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Hook to listen for keyboard keydown events and trigger calculator actions.
 *
 * @description
 * Listens for standard numeric, operator, evaluate, backspace, and escape keystrokes
 * globally, filtering out event triggers when input elements are in focus.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import { useEffect } from 'react';

// ---------- TYPES
export interface KeyboardHandlers {
  onInput: (val: string) => void;
  onEvaluate: () => void;
  onDelete: () => void;
  onClear: () => void;
}

// ---------- HOOKS: KEYBOARD
export function useKeyboard({ onInput, onEvaluate, onDelete, onClear }: KeyboardHandlers) {
  useEffect(() => {
    // ---------- EVENT (Keyboard keypress handler)
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;

      // ---------- GUARD (Ensure we ignore hotkeys when user is focusing an input element)
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const key = e.key;

      // ---------- DISPATCH (Match keys and trigger corresponding calculator callback)
      if (/^[0-9]$/.test(key) || ['.', '+', '-', '(', ')', '%'].includes(key)) {
        e.preventDefault();
        onInput(key);
      } else if (key === '*') {
        e.preventDefault();
        onInput('*');
      } else if (key === '/') {
        e.preventDefault();
        onInput('/');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        onEvaluate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        onDelete();
      } else if (key === 'Escape') {
        e.preventDefault();
        onClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onInput, onEvaluate, onDelete, onClear]);
}
