/**
 * @file ExpressionList.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Container list component rendering multiple expression rows.
 *
 * @description
 * Loops through registered mathematical expressions, renders individual card nodes,
 * and handles adding new formulas up to a maximum defined scale.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import React from 'react';
import type { Expression } from '@/lib/types';
import { ExpressionCard } from './ExpressionCard';

// ---------- TYPES
interface ExpressionListProps {
  expressions: Expression[];
  onUpdate: (id: string, text: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onAdd: () => void;
}

// ---------- COMPONENT: EXPRESSION LIST
export function ExpressionList({
  expressions,
  onUpdate,
  onDelete,
  onToggleVisibility,
  onAdd,
}: ExpressionListProps) {
  return (
    <div className="flex flex-col space-y-2 p-3">
      {expressions.map((expr, index) => (
        <ExpressionCard
          key={expr.id}
          expression={expr}
          index={index}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onToggleVisibility={onToggleVisibility}
        />
      ))}

      {/* ---------- ADD TRIGGER (Render dashed border action button if expressions length is under limit) */}
      {expressions.length < 10 && (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center justify-center gap-1.5 rounded-md border border-dashed border-(--outline-variant) bg-(--surface-container-low)/50 px-3 py-2.5 text-xs font-medium text-(--on-surface-variant) transition-colors hover:border-(--primary) hover:text-(--primary)"
          aria-label="Add function expression"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Expression
        </button>
      )}
    </div>
  );
}
