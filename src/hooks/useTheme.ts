/**
 * @file useTheme.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Custom React hook to manage light, dark, and system color themes.
 *
 * @description
 * Synchronizes the theme mode state with localStorage, matches client-side system theme
 * preference events, and toggles the "dark" CSS class on the HTML document root.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import { useState, useEffect } from 'react';
import type { ThemeMode } from '@/lib/types';

// ---------- CONSTANTS
const THEME_KEY = 'calc-theme';

// ---------- HOOKS: THEME
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('system');

  // ---------- EFFECT (Load theme from localStorage)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_KEY) as ThemeMode | null;

      // ---------- GUARD (Ensure loaded value is a valid theme option)
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        Promise.resolve().then(() => {
          setThemeState(saved);
        });
      }
    } catch {
      // Ignore local storage read errors gracefully
    }
  }, []);

  // ---------- EFFECT (Apply theme class to HTML root)
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (t: ThemeMode) => {
      let isDark = false;

      // ---------- EVALUATION (Determine target dark mode state)
      if (t === 'dark') {
        isDark = true;
      } else if (t === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme(theme);

    // ---------- SYSTEM DETECTOR (Register listener for changes to OS scheme preference)
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');

      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }

    return undefined;
  }, [theme]);

  // ---------- HELPER (Store theme choice)
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);

    try {
      localStorage.setItem(THEME_KEY, newTheme);
    } catch {
      // Ignore local storage write errors gracefully
    }
  };

  return { theme, setTheme };
}
