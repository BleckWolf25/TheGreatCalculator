/**
 * @file button.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary shadcn/ui Button component with class-variance-authority styling.
 *
 * @description
 * Provides accessible button elements and Slot forwarding with customizable size and color variants.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// ---------- VARIANTS
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--primary) disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-(--primary) text-(--on-primary) shadow hover:bg-(--primary)/90',
        destructive:
          'bg-red-600 dark:bg-red-700 text-white shadow-sm hover:bg-red-600/90 dark:hover:bg-red-700/90',
        outline:
          'border border-(--outline-variant) bg-(--surface) shadow-xs hover:bg-(--surface-container-high) text-(--on-surface)',
        secondary:
          'bg-(--surface-container-high) text-(--on-surface) shadow-xs hover:bg-(--surface-container-highest)',
        ghost: 'hover:bg-(--surface-container-high) text-(--on-surface)',
        link: 'text-(--primary) underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// ---------- TYPES
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

// ---------- COMPONENT: BUTTON
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
