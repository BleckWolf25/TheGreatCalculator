/**
 * @file slider.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary shadcn/ui Slider component built on Radix UI primitives.
 *
 * @description
 * Provides accessible range slider controls with styled track, range bar, and draggable thumb.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      'relative flex w-full cursor-pointer touch-none items-center select-none',
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-(--surface-container-highest)">
      <SliderPrimitive.Range className="absolute h-full bg-(--primary)" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-(--primary) bg-(--surface) shadow transition-colors focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
