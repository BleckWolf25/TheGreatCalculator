/**
 * @file KeypadButton.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Single button component styling and shift-modifier label swap logic.
 *
 * @description
 * Builds on top of class-variance-authority to deliver styled number, operator, function,
 * memory, action, and special buttons with transition animations and shifts.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ---------- CONSTANTS
const keypadButtonVariants = cva(
  'keypad-btn relative flex items-center justify-center font-medium rounded-lg select-none transition-all duration-150 active:translate-y-[1px] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) border cursor-pointer min-h-[48px] shadow-sm',
  {
    variants: {
      variant: {
        number:
          'bg-white dark:bg-[#161a22] text-slate-900 dark:text-[#dfe2eb] border-slate-200 dark:border-[#434656]/30 hover:bg-slate-50 dark:hover:bg-[#1e232f] text-base md:text-lg font-mono font-bold shadow-sm',
        operator:
          'bg-blue-50/80 dark:bg-[#252a35] text-blue-700 dark:text-[#4a84ff] border-blue-100 dark:border-[#434656]/50 hover:bg-blue-100 dark:hover:bg-[#2b313f] text-base md:text-lg font-mono font-semibold',
        function:
          'bg-slate-50 dark:bg-[#0a0e14] text-slate-700 dark:text-[#c3c5d9] border-slate-200/60 dark:border-[#434656]/20 hover:bg-slate-100 dark:hover:bg-[#10141a] text-xs md:text-sm font-mono',
        action:
          'bg-(--primary) text-(--on-primary) border-(--primary-container) hover:brightness-110 active:brightness-95 text-base md:text-lg font-mono font-semibold shadow-md',
        memory:
          'bg-slate-50/50 dark:bg-[#0a0e14] text-slate-500 dark:text-[#bfc7d3] border-slate-200/40 dark:border-[#434656]/15 hover:bg-slate-100 dark:hover:bg-[#10141a] text-xs font-mono',
        special:
          'bg-slate-100 dark:bg-[#2e3440] text-slate-800 dark:text-[#dfe2eb] border-slate-200 dark:border-[#434656]/40 hover:bg-slate-200 dark:hover:bg-[#3b4252] text-xs md:text-sm font-semibold',
      },
    },
    defaultVariants: {
      variant: 'number',
    },
  }
);

// ---------- TYPES
export interface KeypadButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof keypadButtonVariants> {
  label: string;
  shiftLabel?: string;
  isShiftActive?: boolean;
}

// ---------- COMPONENT: KEYPAD BUTTON
export function KeypadButton({
  label,
  shiftLabel,
  isShiftActive,
  variant,
  className,
  ...props
}: KeypadButtonProps) {
  return (
    <button type="button" className={cn(keypadButtonVariants({ variant }), className)} {...props}>
      {isShiftActive && shiftLabel ? (
        <span className="scale-105 font-black tracking-wide text-(--tertiary) drop-shadow-sm transition-all">
          {shiftLabel}
        </span>
      ) : (
        <span className="transition-all">{label}</span>
      )}
      {shiftLabel && !isShiftActive && (
        <span className="absolute top-0.5 left-1 font-mono text-[10px] font-black tracking-tight text-(--tertiary) opacity-100 dark:text-(--tertiary)">
          {shiftLabel}
        </span>
      )}
    </button>
  );
}
