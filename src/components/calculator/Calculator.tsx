/**
 * @file Calculator.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Top-level page container routing panels, layout grids, and styles.
 *
 * @description
 * Coordinates mode transitions (scientific, graphing), mobile layout selectors
 * (history, settings), synchronizes user config parameters, and mounts sub-panels.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import React, { useState, useEffect } from 'react';
import type { CalculatorMode, CalculatorSettings, ThemeMode } from '@/lib/types';
import { useHistory } from '@/hooks/useHistory';
import { useTheme } from '@/hooks/useTheme';
import { TopNavBar } from './TopNavBar';
import { BottomNavBar } from './BottomNavBar';
import { ScientificCalculator } from './scientific/ScientificCalculator';
import { GraphicCalculator } from './graphic/GraphicCalculator';
import { HistoryPanel } from './HistoryPanel';
import { SettingsPanel } from './SettingsPanel';

// ---------- COMPONENT: CALCULATOR
export function Calculator() {
  const [mode, setMode] = useState<CalculatorMode>('scientific');
  const [mobileTab, setMobileTab] = useState<string>('scientific');
  const { history, addEntry, clearHistory } = useHistory();
  const { theme, setTheme } = useTheme();

  const [settings, setSettingsState] = useState<CalculatorSettings>({
    theme: theme,
    angleMode: 'DEG',
    precision: 10,
  });

  useEffect(() => {
    setSettingsState((prev) => (prev.theme === theme ? prev : { ...prev, theme }));
  }, [theme]);

  const handleSettingsChange = (partial: Partial<CalculatorSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...partial };

      if (partial.theme) {
        setTheme(partial.theme);
      }

      return next;
    });
  };

  const handleThemeToggle = () => {
    const isDark = document.documentElement.classList.contains('dark');
    const nextTheme: ThemeMode = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    setSettingsState((s) => ({ ...s, theme: nextTheme }));
  };

  const handleModeChange = (newMode: CalculatorMode) => {
    setMode(newMode);
    setMobileTab(newMode);
  };

  return (
    <div className="bg-(--background)-(--on-background) flex h-full w-full flex-col overflow-hidden">
      <TopNavBar
        mode={mode}
        onModeChange={handleModeChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />

      <main className="relative mt-14 flex-1 overflow-hidden pb-16 md:mt-16 md:pb-0" role="main">
        {/* ---------- ROUTING (Swap calculator panes or config cards dynamically based on active tab) */}
        {mobileTab === 'history' ? (
          <div className="mx-auto h-full w-full max-w-2xl bg-(--surface)">
            <HistoryPanel
              history={history}
              onClearHistory={clearHistory}
              onUseExpression={() => setMobileTab(mode)}
              onUseResult={() => setMobileTab(mode)}
            />
          </div>
        ) : mobileTab === 'settings' ? (
          <div className="mx-auto h-full w-full max-w-2xl bg-(--surface)">
            <SettingsPanel
              settings={settings}
              onSettingsChange={handleSettingsChange}
              onClearHistory={clearHistory}
            />
          </div>
        ) : mode === 'scientific' ? (
          <ScientificCalculator
            onHistoryAdd={(expr, res) => addEntry(expr, res, 'scientific')}
            exactCAS={settings.exactCAS}
          />
        ) : (
          <GraphicCalculator
            history={history}
            onClearHistory={clearHistory}
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onUseExpression={() => {}}
          />
        )}
      </main>

      <BottomNavBar
        mode={mode}
        onModeChange={setMode}
        activeTab={mobileTab}
        onTabChange={setMobileTab}
      />
    </div>
  );
}
