/**
 * @file types.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Interface and type declarations for the application.
 *
 * @description
 * Defines domain models, state containers, parameter interfaces, and button layout types
 * for the calculator engine, graphing viewport, probability distributions, and app settings.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
// ---------- CALCULATOR MODES
export type CalculatorMode = 'scientific' | 'graphic';
export type AngleMode = 'DEG' | 'RAD';
export type GraphicSubTab = 'functions' | 'probabilities';
export type SidebarTab = 'expressions' | 'functions' | 'history' | 'settings';
export type MobileTab = 'scientific' | 'graphic' | 'history' | 'settings';

// ---------- SCIENTIFIC CALCULATOR
export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  mode: CalculatorMode;
}

export interface MemoryState {
  value: number;
  hasValue: boolean;
}

export interface CalculatorState {
  expression: string;
  result: string;
  previousResult: string;
  history: HistoryEntry[];
  memory: MemoryState;
  angleMode: AngleMode;
  error: string | null;
  isShiftActive: boolean;
}

// ---------- GRAPH TYPES
export interface Expression {
  id: string;
  text: string;
  color: string;
  visible: boolean;
}

export interface GraphViewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface GraphPoint {
  x: number;
  y: number;
}

export interface ScreenPoint {
  sx: number;
  sy: number;
}

export interface AnalysisResult {
  type: 'zero' | 'intersection' | 'minimum' | 'maximum';
  point: GraphPoint;
  expressionId?: string;
  expressionIds?: [string, string];
}

export interface TraceState {
  active: boolean;
  expressionId: string | null;
  point: GraphPoint | null;
}

export interface GraphState {
  viewport: GraphViewport;
  expressions: Expression[];
  traceState: TraceState;
  analysisResults: AnalysisResult[];
  crosshair: GraphPoint | null;
}

// ---------- PROBABILITY TYPES
export type DistributionType = 'normal' | 'binomial' | 'poisson' | 'uniform' | 'exponential';

export interface NormalParams {
  type: 'normal';
  mu: number;
  sigma: number;
}

export interface BinomialParams {
  type: 'binomial';
  n: number;
  p: number;
}

export interface PoissonParams {
  type: 'poisson';
  lambda: number;
}

export interface UniformParams {
  type: 'uniform';
  a: number;
  b: number;
}

export interface ExponentialParams {
  type: 'exponential';
  lambda: number;
}

export type DistributionParams =
  NormalParams | BinomialParams | PoissonParams | UniformParams | ExponentialParams;

export interface ProbabilityQuery {
  mode: 'leq' | 'geq' | 'between';
  x?: number;
  a?: number;
  b?: number;
}

export interface ProbabilityResult {
  mean: number;
  variance: number;
  stdDev: number;
  probability?: number;
}

export interface ProbabilityState {
  distributionType: DistributionType;
  params: DistributionParams;
  query: ProbabilityQuery;
  result: ProbabilityResult | null;
  showCDF: boolean;
}

// ---------- SETTINGS
export type ThemeMode = 'light' | 'dark' | 'system';

export interface CalculatorSettings {
  theme: ThemeMode;
  angleMode: AngleMode;
  precision: number;
  exactCAS?: boolean;
}

// ---------- BUTTON TYPES
export type KeypadButtonVariant =
  'number' | 'operator' | 'function' | 'action' | 'memory' | 'special';

export interface KeypadButtonConfig {
  label: string;
  value: string;
  variant: KeypadButtonVariant;
  ariaLabel?: string;
  shiftLabel?: string;
  shiftValue?: string;
  colSpan?: number;
}
