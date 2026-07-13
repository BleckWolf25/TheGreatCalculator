/**
 * @file input.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary shadcn/ui Input component with custom clean styling.
 *
 * @description
 * Provides accessible text and number input elements formatted to match the design token system,
 * explicitly hiding native browser spinner controls on numeric fields.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

// ---------- TYPES
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

// ---------- COMPONENT: INPUT
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full [appearance:textfield] rounded-md border border-(--outline-variant) bg-(--surface-container) px-3 py-1 font-mono text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-(--outline) focus-visible:ring-1 focus-visible:ring-(--primary) focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
