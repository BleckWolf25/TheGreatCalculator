/**
 * @file CalculatorContext.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Context provider for managing active calculator modes.
 *
 * @description
 * Creates and exports a React Context, a Provider component, and a hook to
 * coordinate the current mode (scientific or graphing) across all components.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import React, { createContext, useContext, useState } from 'react';
import type { CalculatorMode } from '@/lib/types';

// ---------- TYPES
interface CalculatorContextValue {
  mode: CalculatorMode;
  setMode: (mode: CalculatorMode) => void;
}

// ---------- CONTEXTS
const CalculatorContext = createContext<CalculatorContextValue | undefined>(undefined);

// ---------- PROVIDERS
export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<CalculatorMode>('scientific');

  return (
    <CalculatorContext.Provider value={{ mode, setMode }}>{children}</CalculatorContext.Provider>
  );
}

// ---------- HOOKS
export function useCalculatorContext() {
  const context = useContext(CalculatorContext);

  // ---------- GUARD (Ensure provider wrapper is active)
  if (!context) {
    throw new Error('useCalculatorContext must be used within CalculatorProvider');
  }

  return context;
}
