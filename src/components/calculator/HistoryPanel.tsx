/**
 * @file HistoryPanel.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Sidebar list component displaying historic equation results.
 *
 * @description
 * Lists previous equations logs list, provides buttons to load old expressions/results back
 * into the main active buffer, and allows flushing all entries.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import type { HistoryEntry } from '@/lib/types';
import { cn } from '@/lib/utils';

// ---------- TYPES
interface HistoryPanelProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
  onUseExpression: (expression: string) => void;
  onUseResult: (result: string) => void;
  className?: string;
}

// ---------- COMPONENT: HISTORY PANEL
export function HistoryPanel({
  history,
  onClearHistory,
  onUseExpression,
  onUseResult,
  className,
}: HistoryPanelProps) {
  // ---------- FRONTEND
  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex shrink-0 items-center justify-between border-b border-(--outline-variant) px-4 py-3">
        <h2 className="text-sm font-semibold text-(--on-surface)">History</h2>
        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="text-xs font-medium text-(--error) hover:underline"
            aria-label="Clear all history"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {history.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
            <span className="material-symbols-outlined mb-2 text-4xl text-(--outline)">
              history
            </span>
            <p className="text-sm text-(--on-surface-variant)">No calculations yet</p>
            <p className="mt-1 text-xs text-(--outline)">
              Your calculation history will appear here
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-(--outline-variant)" role="list">
            {[...history].reverse().map((entry) => (
              <li
                key={entry.id}
                className="group px-4 py-3 transition-colors hover:bg-(--surface-container-high) dark:hover:bg-(--surface-container-highest)"
              >
                <button
                  onClick={() => onUseExpression(entry.expression)}
                  className="w-full text-left"
                  aria-label={`Use expression: ${entry.expression}`}
                >
                  <p className="truncate font-mono text-xs text-(--on-surface-variant)">
                    {entry.expression}
                  </p>
                </button>
                <button
                  onClick={() => onUseResult(entry.result)}
                  className="mt-1 w-full text-right"
                  aria-label={`Use result: ${entry.result}`}
                >
                  <p className="truncate font-mono text-sm font-semibold text-(--on-surface)">
                    = {entry.result}
                  </p>
                </button>
                <p className="mt-1 text-[10px] text-(--outline)">
                  {new Date(entry.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' · '}
                  {entry.mode}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
