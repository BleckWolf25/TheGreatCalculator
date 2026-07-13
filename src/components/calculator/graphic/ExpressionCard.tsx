/**
 * @file ExpressionCard.tsx
 *
 * @version 1.1.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Single mathematical expression input card for the graphic calculator using shadcn/ui.
 *
 * @description
 * Renders an editable equation text box with visibility toggles and delete controls
 * formatted using shadcn/ui primitives.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import React, { useState, useRef } from 'react';
import type { Expression } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// ---------- TYPES
interface ExpressionCardProps {
  expression: Expression;
  index: number;
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

// ---------- HELPERS
function formatMathExpression(raw: string): string {
  let formatted = raw.replace(/\s+/g, ' ');
  formatted = formatted.replace(/\b(sin|cos|tan|sqrt|log|ln)\s*\(/g, '$1(');
  formatted = formatted.replace(/(\d+)\s*\*\s*([a-zA-Z(])/g, '$1$2');
  formatted = formatted.replace(/\s*\^\s*/g, '^');
  formatted = formatted.replace(/\s*\+\s*/g, ' + ');
  formatted = formatted.replace(/\s*\-\s*/g, ' - ');
  formatted = formatted.replace(/\s*\/\s*/g, ' / ');

  return formatted.trim();
}

// ---------- COMPONENT: EXPRESSION CARD
export function ExpressionCard({
  expression,
  index,
  onUpdate,
  onDelete,
  onToggleVisibility,
}: ExpressionCardProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayFormatted = formatMathExpression(expression.text);

  return (
    <div
      className={cn(
        'group flex items-center gap-2 rounded-md border bg-(--surface-container-lowest) px-3 py-2 transition-colors dark:bg-(--surface-container-lowest)',
        expression.visible
          ? 'border-(--outline-variant) hover:border-(--outline)'
          : 'border-dashed border-(--outline-variant) opacity-70'
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onToggleVisibility(expression.id)}
        className="h-6 w-6 shrink-0 rounded p-1"
        aria-label={expression.visible ? 'Hide function' : 'Show function'}
      >
        <span
          className="inline-block h-3.5 w-3.5 rounded-full border border-black/10"
          style={{
            backgroundColor: expression.visible ? expression.color : 'transparent',
            borderColor: expression.color,
          }}
        />
      </Button>

      <span className="shrink-0 font-mono text-xs font-medium text-(--outline)">
        y_{index + 1} =
      </span>

      <div className="relative flex min-w-0 flex-1 items-center">
        <Input
          ref={inputRef}
          type="text"
          value={expression.text}
          onChange={(e) => onUpdate(expression.id, e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="e.g. sin(x) + 2"
          className={cn(
            'h-8 w-full border-0 bg-transparent px-1 font-mono text-sm shadow-none focus-visible:ring-0',
            !isFocused && expression.text
              ? 'pointer-events-none absolute inset-0 -z-10 opacity-0'
              : 'opacity-100'
          )}
          aria-label={`Expression ${index + 1}`}
        />
        {!isFocused && expression.text && (
          <div
            onClick={() => {
              setIsFocused(true);
              setTimeout(() => inputRef.current?.focus(), 10);
            }}
            className="w-full cursor-text bg-transparent px-1 py-1 font-mono text-sm text-(--on-surface) select-text"
          >
            {displayFormatted}
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onDelete(expression.id)}
        className="h-7 w-7 shrink-0 text-(--outline) opacity-60 transition-opacity hover:text-(--error) hover:opacity-100"
        aria-label={`Delete expression ${index + 1}`}
      >
        <span className="material-symbols-outlined text-base">close</span>
      </Button>
    </div>
  );
}
