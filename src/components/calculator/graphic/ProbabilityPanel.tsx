/**
 * @file ProbabilityPanel.tsx
 *
 * @version 1.1.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Panel component presenting probability parameter configurations using shadcn/ui.
 *
 * @description
 * Sets up selectors for distribution types, displays specific sliders for trials/rates/ranges,
 * handles probability bounds query queries, outputs calculated metrics, and toggles CDF curves
 * using clean shadcn/ui primitives.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import React from 'react';
import type {
  DistributionType,
  DistributionParams,
  ProbabilityQuery,
  ProbabilityResult,
} from '@/lib/types';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// ---------- TYPES
interface ProbabilityPanelProps {
  distributionType: DistributionType;
  onTypeChange: (type: DistributionType) => void;
  params: DistributionParams;
  onParamChange: (params: DistributionParams) => void;
  query: ProbabilityQuery;
  onQueryChange: (query: ProbabilityQuery) => void;
  showCDF: boolean;
  onShowCDFChange: (show: boolean) => void;
  result: ProbabilityResult | null;
}

// ---------- CONSTANTS
const DIST_OPTIONS: { label: string; value: DistributionType }[] = [
  { label: 'Normal (Gaussian)', value: 'normal' },
  { label: 'Binomial', value: 'binomial' },
  { label: 'Poisson', value: 'poisson' },
  { label: 'Uniform', value: 'uniform' },
  { label: 'Exponential', value: 'exponential' },
];

// ---------- COMPONENT: PROBABILITY PANEL
export function ProbabilityPanel({
  distributionType,
  onTypeChange,
  params,
  onParamChange,
  query,
  onQueryChange,
  showCDF,
  onShowCDFChange,
  result,
}: ProbabilityPanelProps) {
  return (
    <div className="flex flex-col space-y-5 overflow-y-auto p-4">
      {/* ---------- DROPDOWN (Select target probability distribution model) */}
      <div className="space-y-1.5">
        <Label>Distribution</Label>
        <Select
          value={distributionType}
          onValueChange={(val) => onTypeChange(val as DistributionType)}
        >
          <SelectTrigger aria-label="Select probability distribution">
            <SelectValue placeholder="Select distribution" />
          </SelectTrigger>
          <SelectContent>
            {DIST_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ---------- CONFIGURATION (Render sliders/inputs depending on parameters type) */}
      <div className="space-y-4 rounded-lg border border-(--outline-variant)/50 bg-(--surface-container-low) p-3.5">
        <div className="text-xs font-semibold tracking-wider text-(--on-surface-variant) uppercase">
          Parameters
        </div>

        {params.type === 'normal' && (
          <>
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span>Mean (μ)</span>
                <span>{params.mu}</span>
              </div>
              <Slider
                min={-10}
                max={10}
                step={0.1}
                value={[params.mu]}
                onValueChange={([val]) => onParamChange({ ...params, mu: val })}
                aria-label="Mean parameter slider"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span>Std Dev (σ)</span>
                <span>{params.sigma}</span>
              </div>
              <Slider
                min={0.1}
                max={5}
                step={0.1}
                value={[params.sigma]}
                onValueChange={([val]) => onParamChange({ ...params, sigma: val })}
                aria-label="Standard deviation parameter slider"
              />
            </div>
          </>
        )}

        {params.type === 'binomial' && (
          <>
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span>Trials (n)</span>
                <span>{params.n}</span>
              </div>
              <Slider
                min={1}
                max={50}
                step={1}
                value={[params.n]}
                onValueChange={([val]) => onParamChange({ ...params, n: val })}
                aria-label="Trials parameter slider"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span>Success Prob (p)</span>
                <span>{params.p}</span>
              </div>
              <Slider
                min={0.01}
                max={0.99}
                step={0.01}
                value={[params.p]}
                onValueChange={([val]) => onParamChange({ ...params, p: val })}
                aria-label="Success probability parameter slider"
              />
            </div>
          </>
        )}

        {params.type === 'poisson' && (
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-xs">
              <span>Rate (λ)</span>
              <span>{params.lambda}</span>
            </div>
            <Slider
              min={0.5}
              max={20}
              step={0.5}
              value={[params.lambda]}
              onValueChange={([val]) => onParamChange({ ...params, lambda: val })}
              aria-label="Poisson rate parameter slider"
            />
          </div>
        )}

        {params.type === 'uniform' && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-xs">
                <span>Min (a)</span>
                <span>{params.a}</span>
              </div>
              <Input
                type="number"
                value={params.a}
                onChange={(e) => onParamChange({ ...params, a: Number(e.target.value) })}
                className="h-8 font-mono text-xs"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between font-mono text-xs">
                <span>Max (b)</span>
                <span>{params.b}</span>
              </div>
              <Input
                type="number"
                value={params.b}
                onChange={(e) => onParamChange({ ...params, b: Number(e.target.value) })}
                className="h-8 font-mono text-xs"
              />
            </div>
          </>
        )}

        {params.type === 'exponential' && (
          <div className="space-y-1.5">
            <div className="flex justify-between font-mono text-xs">
              <span>Rate (λ)</span>
              <span>{params.lambda}</span>
            </div>
            <Slider
              min={0.1}
              max={5}
              step={0.1}
              value={[params.lambda]}
              onValueChange={([val]) => onParamChange({ ...params, lambda: val })}
              aria-label="Exponential rate parameter slider"
            />
          </div>
        )}
      </div>

      {/* ---------- SELECTION (Render mode selector buttons and numeric bounds inputs) */}
      <div className="space-y-3">
        <Label>Probability Query</Label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['leq', 'geq', 'between'] as const).map((m) => (
            <Button
              key={m}
              type="button"
              variant={query.mode === m ? 'default' : 'outline'}
              size="sm"
              onClick={() => onQueryChange({ ...query, mode: m })}
              className="font-mono text-xs"
            >
              {m === 'leq' ? 'P(X ≤ x)' : m === 'geq' ? 'P(X ≥ x)' : 'P(a ≤ X ≤ b)'}
            </Button>
          ))}
        </div>

        {query.mode === 'between' ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              step="any"
              value={query.a ?? 0}
              onChange={(e) => onQueryChange({ ...query, a: Number(e.target.value) })}
              placeholder="a"
              className="w-full"
            />
            <span className="font-mono text-xs text-(--outline)">to</span>
            <Input
              type="number"
              step="any"
              value={query.b ?? 2}
              onChange={(e) => onQueryChange({ ...query, b: Number(e.target.value) })}
              placeholder="b"
              className="w-full"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-mono text-sm font-semibold text-(--on-surface-variant)">
              x =
            </span>
            <Input
              type="number"
              step="any"
              value={query.x ?? 1}
              onChange={(e) => onQueryChange({ ...query, x: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* ---------- METRICS (Display calculated probability densities and distribution statistics) */}
      {result && (
        <div className="space-y-2 rounded-lg border border-(--outline-variant) bg-(--surface-container) p-3.5">
          {result.probability !== undefined && (
            <div className="flex items-center justify-between border-b border-(--outline-variant) pb-2">
              <span className="text-xs font-semibold text-(--on-surface-variant) uppercase">
                Probability
              </span>
              <span className="font-mono text-lg font-bold text-(--primary)">
                {result.probability}
              </span>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div>
              <div className="text-[10px] text-(--outline) uppercase">Mean</div>
              <div className="font-mono text-xs font-semibold">{result.mean}</div>
            </div>
            <div>
              <div className="text-[10px] text-(--outline) uppercase">Variance</div>
              <div className="font-mono text-xs font-semibold">{result.variance}</div>
            </div>
            <div>
              <div className="text-[10px] text-(--outline) uppercase">Std Dev</div>
              <div className="font-mono text-xs font-semibold">{result.stdDev}</div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- TOGGLE (Provide options to toggle CDF visual line overlay) */}
      <div className="flex items-center justify-between pt-1">
        <Label className="cursor-pointer">Show Cumulative (CDF)</Label>
        <Switch
          checked={showCDF}
          onCheckedChange={onShowCDFChange}
          aria-label="Toggle CDF display"
        />
      </div>
    </div>
  );
}
