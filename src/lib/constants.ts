/**
 * @file constants.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Global constants, keypad configurations, and defaults.
 *
 * @description
 * Defines graphing color schemes, default viewport settings, math precision limits,
 * distribution parameters, keyboard mappings, and layouts for scientific and graphing keypads.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import type { GraphViewport, KeypadButtonConfig, DistributionParams } from './types';

// ---------- GRAPH COLORS
export const GRAPH_COLORS = [
  '#0057ff', // Primary Blue
  '#c13600', // Tertiary Orange
  '#16a34a', // Green
  '#7c3aed', // Purple
  '#ec4899', // Pink
  '#0891b2', // Cyan
  '#ca8a04', // Amber
  '#dc2626', // Red
  '#4f46e5', // Indigo
  '#059669', // Emerald
] as const;

// ---------- GRAPH DEFAULTS
export const DEFAULT_VIEWPORT: GraphViewport = {
  xMin: -10,
  xMax: 10,
  yMin: -10,
  yMax: 10,
};

export const ZOOM_FACTOR = 1.2;
export const MIN_ZOOM = 0.001;
export const MAX_ZOOM = 1e6;
export const GRID_SUBDIVISIONS = 5;
export const MAX_EXPRESSIONS = 10;

// ---------- CALCULATOR LIMITS
export const MAX_EXPRESSION_LENGTH = 200;
export const MAX_HISTORY_ENTRIES = 100;
export const DEFAULT_PRECISION = 10;
export const MAX_PRECISION = 15;

// ---------- DISTRIBUTION DEFAULTS
export const DEFAULT_DISTRIBUTION_PARAMS: Record<string, DistributionParams> = {
  normal: { type: 'normal', mu: 0, sigma: 1 },
  binomial: { type: 'binomial', n: 10, p: 0.5 },
  poisson: { type: 'poisson', lambda: 5 },
  uniform: { type: 'uniform', a: 0, b: 1 },
  exponential: { type: 'exponential', lambda: 1 },
};

// ---------- KEYBOARD MAPPINGS
export const KEY_MAP: Record<string, string> = {
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '.': '.',
  '+': '+',
  '-': '-',
  '*': '×',
  '/': '÷',
  '(': '(',
  ')': ')',
  '^': '^',
  '!': '!',
  '%': '%',
  e: 'e',
  p: 'π',
};

export const KEY_ACTIONS: Record<string, string> = {
  Enter: 'evaluate',
  '=': 'evaluate',
  Backspace: 'delete',
  Delete: 'delete',
  Escape: 'clear',
};

// ---------- SCIENTIFIC KEYPAD LAYOUT
export const SCIENTIFIC_KEYPAD: KeypadButtonConfig[][] = [
  [
    { label: '2nd', value: 'shift', variant: 'special', ariaLabel: '2nd (Second function)' },
    {
      label: 'DEG',
      value: 'toggleAngle',
      variant: 'special',
      ariaLabel: 'DEG (Toggle angle mode)',
    },
    { label: 'MC', value: 'mc', variant: 'memory', ariaLabel: 'MC (Memory clear)' },
    { label: 'MR', value: 'mr', variant: 'memory', ariaLabel: 'MR (Memory recall)' },
    { label: 'M+', value: 'm+', variant: 'memory', ariaLabel: 'M+ (Memory add)' },
    { label: 'M−', value: 'm-', variant: 'memory', ariaLabel: 'M− (Memory subtract)' },
  ],
  [
    {
      label: 'sin',
      value: 'sin(',
      variant: 'function',
      shiftLabel: 'sin⁻¹',
      shiftValue: 'asin(',
      ariaLabel: 'sin (Sine)',
    },
    {
      label: 'cos',
      value: 'cos(',
      variant: 'function',
      shiftLabel: 'cos⁻¹',
      shiftValue: 'acos(',
      ariaLabel: 'cos (Cosine)',
    },
    {
      label: 'tan',
      value: 'tan(',
      variant: 'function',
      shiftLabel: 'tan⁻¹',
      shiftValue: 'atan(',
      ariaLabel: 'tan (Tangent)',
    },
    {
      label: 'sinh',
      value: 'sinh(',
      variant: 'function',
      shiftLabel: 'sinh⁻¹',
      shiftValue: 'asinh(',
      ariaLabel: 'sinh (Hyperbolic sine)',
    },
    {
      label: 'cosh',
      value: 'cosh(',
      variant: 'function',
      shiftLabel: 'cosh⁻¹',
      shiftValue: 'acosh(',
      ariaLabel: 'cosh (Hyperbolic cosine)',
    },
    {
      label: 'tanh',
      value: 'tanh(',
      variant: 'function',
      shiftLabel: 'tanh⁻¹',
      shiftValue: 'atanh(',
      ariaLabel: 'tanh (Hyperbolic tangent)',
    },
  ],
  [
    {
      label: 'x²',
      value: '^2',
      variant: 'function',
      shiftLabel: 'x³',
      shiftValue: '^3',
      ariaLabel: 'x² (Square)',
    },
    { label: 'xʸ', value: '^', variant: 'function', ariaLabel: 'xʸ (Power)' },
    { label: 'n!', value: '!', variant: 'function', ariaLabel: 'n! (Factorial)' },
    { label: 'nPr', value: 'nPr(', variant: 'function', ariaLabel: 'nPr (Permutation)' },
    { label: 'nCr', value: 'nCr(', variant: 'function', ariaLabel: 'nCr (Combination)' },
    { label: '|x|', value: 'abs(', variant: 'function', ariaLabel: '|x| (Absolute value)' },
  ],
  [
    { label: 'π', value: 'pi', variant: 'function', ariaLabel: 'π (Pi)' },
    { label: 'e', value: 'e', variant: 'function', ariaLabel: 'e (Euler number)' },
    { label: '(', value: '(', variant: 'operator', ariaLabel: '( (Open parenthesis)' },
    { label: ')', value: ')', variant: 'operator', ariaLabel: ') (Close parenthesis)' },
    { label: '%', value: '%', variant: 'operator', ariaLabel: '% (Percent)' },
    { label: 'EXP', value: 'e', variant: 'function', ariaLabel: 'EXP (Scientific notation)' },
  ],
  [
    { label: '7', value: '7', variant: 'number' },
    { label: '8', value: '8', variant: 'number' },
    { label: '9', value: '9', variant: 'number' },
    { label: '÷', value: '/', variant: 'operator', ariaLabel: '÷ (Divide)' },
    { label: 'AC', value: 'clear', variant: 'action', ariaLabel: 'AC (All clear)' },
    { label: 'DEL', value: 'delete', variant: 'action', ariaLabel: 'DEL (Delete)' },
  ],
  [
    { label: '4', value: '4', variant: 'number' },
    { label: '5', value: '5', variant: 'number' },
    { label: '6', value: '6', variant: 'number' },
    { label: '×', value: '*', variant: 'operator', ariaLabel: '× (Multiply)' },
    { label: 'ANS', value: 'ans', variant: 'special', ariaLabel: 'ANS (Previous answer)' },
    { label: 'mod', value: ' mod ', variant: 'operator', ariaLabel: 'mod (Modulo)' },
  ],
  [
    { label: '1', value: '1', variant: 'number' },
    { label: '2', value: '2', variant: 'number' },
    { label: '3', value: '3', variant: 'number' },
    { label: '−', value: '-', variant: 'operator', ariaLabel: '− (Subtract)' },
    {
      label: 'ln',
      value: 'ln(',
      variant: 'function',
      shiftLabel: 'eˣ',
      shiftValue: 'exp(',
      ariaLabel: 'ln (Natural log)',
    },
    {
      label: 'log',
      value: 'log10(',
      variant: 'function',
      shiftLabel: '10ˣ',
      shiftValue: '10^',
      ariaLabel: 'log (Log base 10)',
    },
  ],
  [
    { label: '0', value: '0', variant: 'number' },
    { label: '.', value: '.', variant: 'number', ariaLabel: '. (Decimal point)' },
    { label: '(−)', value: 'negate', variant: 'operator', ariaLabel: '(−) (Negate)' },
    { label: '+', value: '+', variant: 'operator', ariaLabel: '+ (Add)' },
    {
      label: '√',
      value: 'sqrt(',
      variant: 'function',
      shiftLabel: '∛',
      shiftValue: 'cbrt(',
      ariaLabel: '√ (Square root)',
    },
    { label: '=', value: 'evaluate', variant: 'action', ariaLabel: '= (Equals)' },
  ],
];

// ---------- GRAPH KEYPAD LAYOUT
export const GRAPH_KEYPAD: KeypadButtonConfig[][] = [
  [
    { label: 'x', value: 'x', variant: 'function' },
    { label: 'y', value: 'y', variant: 'function' },
    { label: 'a²', value: '^2', variant: 'function', ariaLabel: 'a² (Square)' },
    { label: 'aᵇ', value: '^', variant: 'function', ariaLabel: 'aᵇ (Power)' },
  ],
  [
    { label: 'sin', value: 'sin(', variant: 'function' },
    { label: 'cos', value: 'cos(', variant: 'function' },
    { label: 'tan', value: 'tan(', variant: 'function' },
    { label: '√', value: 'sqrt(', variant: 'function', ariaLabel: '√ (Square root)' },
  ],
  [
    { label: 'ln', value: 'ln(', variant: 'function' },
    { label: 'log', value: 'log10(', variant: 'function' },
    { label: 'π', value: 'pi', variant: 'function' },
    { label: 'e', value: 'e', variant: 'function' },
  ],
  [
    { label: '7', value: '7', variant: 'number' },
    { label: '8', value: '8', variant: 'number' },
    { label: '9', value: '9', variant: 'number' },
    { label: '÷', value: '/', variant: 'operator' },
  ],
  [
    { label: '4', value: '4', variant: 'number' },
    { label: '5', value: '5', variant: 'number' },
    { label: '6', value: '6', variant: 'number' },
    { label: '×', value: '*', variant: 'operator' },
  ],
  [
    { label: '1', value: '1', variant: 'number' },
    { label: '2', value: '2', variant: 'number' },
    { label: '3', value: '3', variant: 'number' },
    { label: '−', value: '-', variant: 'operator' },
  ],
  [
    { label: '0', value: '0', variant: 'number' },
    { label: '.', value: '.', variant: 'number' },
    { label: '(', value: '(', variant: 'operator' },
    { label: ')', value: ')', variant: 'operator' },
  ],
  [
    { label: '=', value: '=', variant: 'operator' },
    { label: '+', value: '+', variant: 'operator' },
    { label: ',', value: ',', variant: 'operator' },
    { label: 'DEL', value: 'delete', variant: 'action' },
  ],
];
