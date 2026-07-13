/**
 * @file utils.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Utility functions for styling classes and unique ID generation.
 *
 * @description
 * Implements class merges using clsx and tailwind-merge, and provides a utility
 * to generate collision-resistant alphanumeric identifier strings.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ---------- UTILITIES
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  // ---------- GENERATION (Produce timestamped random string ID)
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
