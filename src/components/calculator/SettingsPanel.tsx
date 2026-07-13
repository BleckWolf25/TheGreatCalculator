/**
 * @file SettingsPanel.tsx
 *
 * @version 1.1.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Configuration panel component for layout themes, angles, and precision using shadcn/ui.
 *
 * @description
 * Renders accessible UI selectors for theme settings (light, dark, system), angle formats (DEG, RAD),
 * decimal rounding precision range bars, exact CAS mode toggle, and handles deletion of local history
 * using shadcn/ui primitives.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import type { CalculatorSettings, ThemeMode, AngleMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MAX_PRECISION } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// ---------- TYPES
interface SettingsPanelProps {
  settings: CalculatorSettings;
  onSettingsChange: (settings: Partial<CalculatorSettings>) => void;
  onClearHistory: () => void;
  className?: string;
}

// ---------- COMPONENT: SETTINGS PANEL
export function SettingsPanel({
  settings,
  onSettingsChange,
  onClearHistory,
  className,
}: SettingsPanelProps) {
  // ---------- FRONTEND
  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="shrink-0 border-b border-(--outline-variant) px-4 py-3">
        <h2 className="text-sm font-semibold text-(--on-surface)">Settings</h2>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-4">
        {/* ---------- SECTION (Theme Preferences Selection) */}
        <section className="space-y-3">
          <Label>Appearance</Label>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as ThemeMode[]).map((theme) => (
              <Button
                key={theme}
                variant={settings.theme === theme ? 'default' : 'outline'}
                className="flex-1 capitalize"
                onClick={() => onSettingsChange({ theme })}
                aria-label={`Theme: ${theme}`}
                aria-pressed={settings.theme === theme}
              >
                <span className="material-symbols-outlined text-lg">
                  {theme === 'light' ? 'light_mode' : theme === 'dark' ? 'dark_mode' : 'contrast'}
                </span>
                <span>{theme}</span>
              </Button>
            ))}
          </div>
        </section>

        {/* ---------- SECTION (Mathematical Angle Selection) */}
        <section className="space-y-3">
          <Label>Angle Mode</Label>
          <div className="flex gap-2">
            {(['DEG', 'RAD'] as AngleMode[]).map((mode) => (
              <Button
                key={mode}
                variant={settings.angleMode === mode ? 'default' : 'outline'}
                className="flex-1 font-mono"
                onClick={() => onSettingsChange({ angleMode: mode })}
                aria-label={`Angle mode: ${mode === 'DEG' ? 'Degrees' : 'Radians'}`}
                aria-pressed={settings.angleMode === mode}
              >
                {mode}
              </Button>
            ))}
          </div>
        </section>

        {/* ---------- SECTION (Precision Slider) */}
        <section className="space-y-3">
          <Label>Decimal Precision</Label>
          <div className="flex items-center gap-3">
            <Slider
              min={1}
              max={MAX_PRECISION}
              step={1}
              value={[settings.precision]}
              onValueChange={([val]) => onSettingsChange({ precision: val })}
              aria-label="Decimal precision"
              className="flex-1"
            />
            <span className="w-8 text-center font-mono text-sm text-(--on-surface)">
              {settings.precision}
            </span>
          </div>
        </section>

        {/* ---------- SECTION (Exact CAS Mode Toggle) */}
        <section>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="cursor-pointer">Exact CAS Mode</Label>
              <p className="text-xs text-(--outline)">Output exact fraction simplifications</p>
            </div>
            <Switch
              checked={!!settings.exactCAS}
              onCheckedChange={(val) => onSettingsChange({ exactCAS: val })}
              aria-label="Toggle exact CAS mode"
            />
          </div>
        </section>

        {/* ---------- SECTION (Delete Actions) */}
        <section className="space-y-3">
          <Label>Data</Label>
          <Button
            variant="destructive"
            className="w-full"
            onClick={onClearHistory}
            aria-label="Clear calculation history"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            <span>Clear History</span>
          </Button>
        </section>

        {/* ---------- SECTION (Application Metadata) */}
        <section className="border-t border-(--outline-variant) pt-4">
          <p className="text-xs text-(--outline)">TheGreatCalculator v4.0.0</p>
          <p className="mt-1 text-xs text-(--outline)">
            A scientific &amp; graphing calculator by João Costa
          </p>
        </section>
      </div>
    </div>
  );
}
