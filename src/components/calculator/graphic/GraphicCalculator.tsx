/**
 * @file GraphicCalculator.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Main graphing calculator page layout containing sidebar and canvas viewports.
 *
 * @description
 * Coordinates custom hooks for equations list drawing and probability distributions,
 * handles screen resize indicators, and routes sub-panels dynamically inside desktop and mobile templates.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import React, { useState } from 'react';
import type { SidebarTab, HistoryEntry, CalculatorSettings } from '@/lib/types';
import { useGraph } from '@/hooks/useGraph';
import { useProbability } from '@/hooks/useProbability';
import { Sidebar } from './Sidebar';
import { ExpressionList } from './ExpressionList';
import { MathKeypad } from './MathKeypad';
import { GraphCanvas } from './GraphCanvas';
import { GraphControls } from './GraphControls';
import { ProbabilityPanel } from './ProbabilityPanel';
import { DistributionGraph } from './DistributionGraph';
import { HistoryPanel } from '../HistoryPanel';
import { SettingsPanel } from '../SettingsPanel';

// ---------- TYPES
interface GraphicCalculatorProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
  settings: CalculatorSettings;
  onSettingsChange: (s: Partial<CalculatorSettings>) => void;
  onUseExpression: (expr: string) => void;
}

// ---------- COMPONENT: GRAPHIC CALCULATOR
export function GraphicCalculator({
  history,
  onClearHistory,
  settings,
  onSettingsChange,
  onUseExpression,
}: GraphicCalculatorProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('expressions');
  const graph = useGraph();
  const prob = useProbability();
  const [mobileTab, setMobileTab] = useState<'functions' | 'probability'>('functions');
  const [isDesktop, setIsDesktop] = useState(false);

  // ---------- EFFECT (Check desktop viewport width size)
  React.useEffect(() => {
    setIsDesktop(window.innerWidth >= 768);

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ---------- HANDLER: KEYPAD INSERT
  const handleKeypadInsert = (value: string) => {
    // ---------- GUARD (Ensure there is at least one expression active to append value)
    if (graph.expressions.length === 0) {
      return;
    }

    const first = graph.expressions[0];
    graph.updateExpression(first.id, first.text + value);
  };

  const isProbabilityMode = activeTab === 'functions';

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-(--background)">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        footer={
          activeTab === 'expressions' ? (
            <MathKeypad onButtonPress={handleKeypadInsert} />
          ) : undefined
        }
      >
        {activeTab === 'expressions' && (
          <ExpressionList
            expressions={graph.expressions}
            onUpdate={graph.updateExpression}
            onDelete={graph.deleteExpression}
            onToggleVisibility={graph.toggleVisibility}
            onAdd={graph.addExpression}
          />
        )}

        {activeTab === 'functions' && (
          <ProbabilityPanel
            distributionType={prob.distributionType}
            onTypeChange={prob.handleTypeChange}
            params={prob.params}
            onParamChange={prob.setParams}
            query={prob.query}
            onQueryChange={prob.setQuery}
            showCDF={prob.showCDF}
            onShowCDFChange={prob.setShowCDF}
            result={prob.result}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPanel
            history={history}
            onClearHistory={onClearHistory}
            onUseExpression={onUseExpression}
            onUseResult={onUseExpression}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel
            settings={settings}
            onSettingsChange={onSettingsChange}
            onClearHistory={onClearHistory}
          />
        )}
      </Sidebar>

      <div className="relative flex h-full min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between border-b border-(--outline-variant) bg-(--surface) px-3 py-1.5 md:hidden">
          <div className="flex gap-1">
            <button
              onClick={() => setMobileTab('functions')}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                mobileTab === 'functions'
                  ? 'bg-(--primary) text-(--on-primary)'
                  : 'text-(--on-surface-variant)'
              }`}
            >
              Functions Graph
            </button>
            <button
              onClick={() => setMobileTab('probability')}
              className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                mobileTab === 'probability'
                  ? 'bg-(--primary) text-(--on-primary)'
                  : 'text-(--on-surface-variant)'
              }`}
            >
              Probability
            </button>
          </div>
        </div>

        <div className="relative h-full flex-1 overflow-hidden">
          {(!isProbabilityMode && mobileTab === 'functions') ||
          (!isProbabilityMode && isDesktop) ? (
            <>
              <GraphCanvas
                expressions={graph.expressions}
                viewport={graph.viewport}
                onViewportChange={graph.setViewport}
                crosshair={graph.crosshair}
                onCrosshairChange={graph.setCrosshair}
                analysisResults={graph.analysisResults}
              />
              <GraphControls
                onZoomIn={graph.zoomIn}
                onZoomOut={graph.zoomOut}
                onRecenter={graph.recenter}
                onFindZeros={graph.runFindZeros}
                onFindExtrema={graph.runFindExtrema}
                onFindIntersections={graph.runFindIntersections}
              />
            </>
          ) : (
            <DistributionGraph
              distributionType={prob.distributionType}
              params={prob.params}
              query={prob.query}
              showCDF={prob.showCDF}
            />
          )}
        </div>

        <div className="h-1/2 overflow-y-auto border-t border-(--outline-variant) bg-(--surface) pb-24 md:hidden">
          {mobileTab === 'functions' ? (
            <ExpressionList
              expressions={graph.expressions}
              onUpdate={graph.updateExpression}
              onDelete={graph.deleteExpression}
              onToggleVisibility={graph.toggleVisibility}
              onAdd={graph.addExpression}
            />
          ) : (
            <ProbabilityPanel
              distributionType={prob.distributionType}
              onTypeChange={prob.handleTypeChange}
              params={prob.params}
              onParamChange={prob.setParams}
              query={prob.query}
              onQueryChange={prob.setQuery}
              showCDF={prob.showCDF}
              onShowCDFChange={prob.setShowCDF}
              result={prob.result}
            />
          )}
        </div>
      </div>
    </div>
  );
}
