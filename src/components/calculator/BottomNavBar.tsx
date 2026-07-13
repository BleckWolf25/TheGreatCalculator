/**
 * @file BottomNavBar.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Mobile bottom navigation bar component mapping tab layouts.
 *
 * @description
 * Renders tab icons and labels for Mobile views, handling active state highlights and
 * routing transitions between Scientific, Graphic, History, and Settings sub-panels.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import type { CalculatorMode } from '@/lib/types';
import { cn } from '@/lib/utils';

// ---------- CONSTANTS
const NAV_ITEMS = [
  {
    id: 'scientific' as const,
    label: 'Scientific',
    icon: 'calculate',
    mode: 'scientific' as CalculatorMode,
  },
  {
    id: 'graphic' as const,
    label: 'Graphic',
    icon: 'show_chart',
    mode: 'graphic' as CalculatorMode,
  },
  {
    id: 'history',
    label: 'History',
    icon: 'history',
    mode: null,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings',
    mode: null,
  },
] as const;

// ---------- TYPES
interface BottomNavBarProps {
  mode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// ---------- COMPONENT: BOTTOM NAV BAR
export function BottomNavBar({ mode, onModeChange, activeTab, onTabChange }: BottomNavBarProps) {
  return (
    <nav
      className="pb-safe fixed bottom-0 left-0 z-50 flex h-18 w-full items-center justify-around border-t border-(--outline-variant) bg-(--surface-container) px-4 py-2 md:hidden dark:border-(--outline) dark:bg-(--surface-container-high)"
      role="navigation"
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive =
          (item.mode &&
            item.mode === mode &&
            activeTab !== 'history' &&
            activeTab !== 'settings') ||
          (!item.mode && activeTab === item.id);

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.mode) {
                onModeChange(item.mode);
                onTabChange(item.id);
              } else {
                onTabChange(item.id);
              }
            }}
            className={cn(
              'flex w-16 flex-col items-center justify-center rounded-xl px-3 py-1 transition-colors',
              isActive ? '' : 'text-(--on-surface-variant) hover:bg-(--surface-variant)/50'
            )}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <div
              className={cn(
                'mb-1 rounded-xl px-4 py-1 transition-all',
                isActive ? 'bg-(--primary-container) text-(--on-primary-container)' : ''
              )}
            >
              <span
                className="material-symbols-outlined"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
            </div>
            <span
              className={cn(
                'font-mono text-[11px] font-medium',
                isActive ? 'text-(--on-surface)' : 'text-(--on-surface-variant)'
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
