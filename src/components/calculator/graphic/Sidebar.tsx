/**
 * @file Sidebar.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Desktop sidebar frame routing multiple tab contents.
 *
 * @description
 * Coordinates tab switching buttons (Functions, Probability, History, Settings),
 * renders active sub-components, and embeds keypad docks inside desktop layouts.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import React from 'react';
import type { SidebarTab } from '@/lib/types';
import { cn } from '@/lib/utils';

// ---------- TYPES
interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// ---------- CONSTANTS
const SIDEBAR_TABS: { id: SidebarTab; label: string; icon: string }[] = [
  { id: 'expressions', label: 'Functions', icon: 'functions' },
  { id: 'functions', label: 'Probability', icon: 'analytics' },
  { id: 'history', label: 'History', icon: 'history' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

// ---------- COMPONENT: SIDEBAR
export function Sidebar({ activeTab, onTabChange, children, footer }: SidebarProps) {
  return (
    <aside
      className="hidden h-full w-90 shrink-0 flex-col border-r border-(--outline-variant) bg-(--surface) select-none md:flex dark:border-(--outline) dark:bg-(--surface)"
      role="complementary"
      aria-label="Calculator sidebar"
    >
      <div
        className="flex shrink-0 border-b border-(--outline-variant) bg-(--surface-container-lowest)"
        role="tablist"
      >
        {SIDEBAR_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 border-b-2 px-2 py-3 transition-all',
                isActive
                  ? 'border-(--primary) bg-(--primary-container)/10 font-semibold text-(--primary)'
                  : 'border-transparent text-(--on-surface-variant) hover:bg-(--surface-container-low) hover:text-(--on-surface)'
              )}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              <span className="text-[11px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>

      {footer && <div className="shrink-0">{footer}</div>}
    </aside>
  );
}
