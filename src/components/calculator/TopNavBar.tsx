/**
 * @file TopNavBar.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Top navigation header containing branding, mode, theme, and share buttons.
 *
 * @description
 * Mounts standard brand titles, coordinates tablet mode selectors (Scientific vs Graphic),
 * triggers dark mode toggle adjustments, and interfaces share API web dialogs.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import { useState, useEffect } from 'react';
import type { CalculatorMode, ThemeMode } from '@/lib/types';
import { cn } from '@/lib/utils';

// ---------- TYPES
interface TopNavBarProps {
  mode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
  theme: ThemeMode;
  onThemeToggle: () => void;
}

// ---------- COMPONENT: TOP NAV BAR
export function TopNavBar({ mode, onModeChange, theme, onThemeToggle }: TopNavBarProps) {
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  // ---------- EFFECT (Resolve theme system value)
  useEffect(() => {
    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      setResolvedTheme(mq.matches ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  // ---------- HANDLER: SHARE
  const handleShare = async () => {
    const shareData = {
      title: 'TheGreatCalculator',
      text: 'Check out this awesome scientific and graphing calculator!',
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setShareStatus('copied');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus('copied');
      }
    } catch (err) {
      console.error('Error sharing URL:', err);

      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus('copied');
      } catch {
        setShareStatus('error');
      }
    }

    setTimeout(() => {
      setShareStatus('idle');
    }, 2000);
  };

  // ---------- FRONTEND
  return (
    <header
      className="fixed top-0 right-0 left-0 z-50 flex h-14 w-full shrink-0 items-center justify-between border-b border-(--outline-variant) bg-(--surface-container-lowest) px-4 shadow-sm transition-colors duration-200 md:h-16 dark:border-(--outline)"
      role="banner"
    >
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold tracking-tight text-(--on-surface) md:text-2xl">
          TheGreatCalculator
        </h1>
        <div className="hidden items-center rounded-lg border border-(--outline-variant) bg-(--surface-container-high) p-1 sm:flex dark:bg-(--surface-container-highest)">
          <button
            onClick={() => onModeChange('scientific')}
            className={cn(
              'cursor-pointer rounded px-3 py-1 font-mono text-xs font-medium transition-all',
              mode === 'scientific'
                ? 'bg-(--primary) text-(--on-primary) shadow-sm'
                : 'text-(--on-surface-variant) hover:text-(--on-surface)'
            )}
          >
            Scientific
          </button>
          <button
            onClick={() => onModeChange('graphic')}
            className={cn(
              'cursor-pointer rounded px-3 py-1 font-mono text-xs font-medium transition-all',
              mode === 'graphic'
                ? 'bg-(--primary) text-(--on-primary) shadow-sm'
                : 'text-(--on-surface-variant) hover:text-(--on-surface)'
            )}
          >
            Graphic
          </button>
        </div>
      </div>

      <div className="relative flex items-center gap-1.5">
        {shareStatus === 'copied' && (
          <span className="animate-fade-in absolute right-0 -bottom-10 z-50 rounded bg-(--inverse-surface) px-2.5 py-1 font-mono text-xs whitespace-nowrap text-(--inverse-on-surface) shadow-md">
            Link copied!
          </span>
        )}
        {shareStatus === 'error' && (
          <span className="animate-fade-in absolute right-0 -bottom-10 z-50 rounded bg-(--error) px-2.5 py-1 font-mono text-xs whitespace-nowrap text-(--on-error) shadow-md">
            Failed to copy
          </span>
        )}

        <button
          onClick={onThemeToggle}
          className="flex cursor-pointer items-center justify-center rounded-full border border-transparent p-2.5 text-(--on-surface) transition-colors hover:border-(--outline-variant)/30 hover:bg-(--surface-container-high) dark:hover:bg-(--surface-container-highest)"
          aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <span className="material-symbols-outlined text-xl">
            {resolvedTheme === 'dark' ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        <button
          onClick={handleShare}
          className={cn(
            'flex cursor-pointer items-center justify-center rounded-full border border-transparent p-2.5 transition-colors hover:border-(--outline-variant)/30',
            shareStatus === 'copied'
              ? 'bg-(--primary-container)/10 text-(--primary)'
              : 'text-(--on-surface) hover:bg-(--surface-container-high) dark:hover:bg-(--surface-container-highest)'
          )}
          aria-label="Share calculator link"
        >
          <span className="material-symbols-outlined text-xl">
            {shareStatus === 'copied' ? 'check' : 'share'}
          </span>
        </button>
      </div>
    </header>
  );
}
