/**
 * @file useHistory.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Hook to handle calculation log logs list persistence in IndexedDB.
 *
 * @description
 * Manages adding, listing, and flushing historic calculations. On first launch, it migrates
 * records from the legacy localStorage key storage.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import { useState, useEffect, useCallback } from 'react';
import type { HistoryEntry, CalculatorMode } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { MAX_HISTORY_ENTRIES } from '@/lib/constants';
import { getValue, setValue } from '@/lib/db';

// ---------- CONSTANTS
const HISTORY_KEY = 'calc-history';

// ---------- HOOKS: HISTORY
export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // ---------- EFFECT (Load history logs from IndexedDB or legacy localStorage)
  useEffect(() => {
    getValue<HistoryEntry[]>('history').then((saved) => {
      if (saved) {
        setHistory(saved);
        setIsLoaded(true);
      } else {
        try {
          const legacy = localStorage.getItem(HISTORY_KEY);

          // ---------- GUARD (Ensure legacy records exist before parsing)
          if (legacy) {
            const parsed = JSON.parse(legacy);
            if (Array.isArray(parsed)) {
              setHistory(parsed);
            }
          }
        } catch {
          // Ignore parsing or browser storage security errors
        }
        setIsLoaded(true);
      }
    });
  }, []);

  // ---------- EFFECT (Save history logs to IndexedDB)
  useEffect(() => {
    // ---------- GUARD (Avoid saving until state hydration has occurred)
    if (!isLoaded) {
      return;
    }

    setValue('history', history);
  }, [history, isLoaded]);

  // ---------- HANDLER: ADD ENTRY
  const addEntry = useCallback(
    (expression: string, result: string, mode: CalculatorMode = 'scientific') => {
      setHistory((prev) => {
        const entry: HistoryEntry = {
          id: generateId(),
          expression,
          result,
          timestamp: Date.now(),
          mode,
        };

        return [...prev, entry].slice(-MAX_HISTORY_ENTRIES);
      });
    },
    []
  );

  // ---------- HANDLER: CLEAR HISTORY
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}
