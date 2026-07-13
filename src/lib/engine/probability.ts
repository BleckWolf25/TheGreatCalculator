/**
 * @file probability.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Statistical probability and distribution density engine.
 *
 * @description
 * Computes mean, variance, standard deviation, cumulative density functions,
 * probability density functions, and generates dataset coordinates for binomial,
 * poisson, normal, exponential, and uniform distributions.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import { jStat } from 'jstat';
import type {
  DistributionType,
  DistributionParams,
  ProbabilityQuery,
  ProbabilityResult,
  GraphPoint,
} from '../types';

// ---------- ENGINE METHODS
export function calculateDistributionMetrics(
  type: DistributionType,
  params: DistributionParams,
  query: ProbabilityQuery
): ProbabilityResult {
  let mean = 0;
  let variance = 0;

  // ---------- CALCULATION (Determine parameters for targeted distribution)
  switch (params.type) {
    case 'normal':
      mean = params.mu;
      variance = params.sigma * params.sigma;
      break;
    case 'binomial':
      mean = params.n * params.p;
      variance = params.n * params.p * (1 - params.p);
      break;
    case 'poisson':
      mean = params.lambda;
      variance = params.lambda;
      break;
    case 'uniform':
      mean = (params.a + params.b) / 2;
      variance = Math.pow(params.b - params.a, 2) / 12;
      break;
    case 'exponential':
      mean = 1 / params.lambda;
      variance = 1 / (params.lambda * params.lambda);
      break;
  }

  const stdDev = Math.sqrt(variance);
  let probability: number | undefined;

  try {
    // ---------- INTEGRATION (Evaluate cumulative bounds query range)
    if (query.mode === 'leq' && query.x !== undefined) {
      probability = getCDF(type, params, query.x);
    } else if (query.mode === 'geq' && query.x !== undefined) {
      probability = 1 - getCDF(type, params, query.x);
    } else if (query.mode === 'between' && query.a !== undefined && query.b !== undefined) {
      probability = getCDF(type, params, query.b) - getCDF(type, params, query.a);
    }
  } catch {
    probability = undefined;
  }

  return {
    mean: Number(mean.toFixed(6)),
    variance: Number(variance.toFixed(6)),
    stdDev: Number(stdDev.toFixed(6)),
    probability: probability !== undefined ? Number(probability.toFixed(6)) : undefined,
  };
}

export function getPDF(_type: DistributionType, params: DistributionParams, x: number): number {
  // ---------- PDF/PMF (Fetch probability density at coordinate x)
  switch (params.type) {
    case 'normal':
      return jStat.normal.pdf(x, params.mu, params.sigma);
    case 'binomial':
      return jStat.binomial.pdf(Math.round(x), params.n, params.p);
    case 'poisson':
      return jStat.poisson.pdf(Math.round(x), params.lambda);
    case 'uniform':
      return jStat.uniform.pdf(x, params.a, params.b);
    case 'exponential':
      return jStat.exponential.pdf(x, params.lambda);
    default:
      return 0;
  }
}

export function getCDF(_type: DistributionType, params: DistributionParams, x: number): number {
  // ---------- CDF (Fetch cumulative distribution density at coordinate x)
  switch (params.type) {
    case 'normal':
      return jStat.normal.cdf(x, params.mu, params.sigma);
    case 'binomial':
      return jStat.binomial.cdf(Math.round(x), params.n, params.p);
    case 'poisson':
      return jStat.poisson.cdf(Math.round(x), params.lambda);
    case 'uniform':
      return jStat.uniform.cdf(x, params.a, params.b);
    case 'exponential':
      return jStat.exponential.cdf(x, params.lambda);
    default:
      return 0;
  }
}

export function generateDistributionPlotPoints(
  type: DistributionType,
  params: DistributionParams,
  showCDF = false,
  numPoints = 300
): GraphPoint[] {
  const points: GraphPoint[] = [];

  // ---------- PLOT GENERATION (Create discrete probability step coordinates)
  if (type === 'binomial' && params.type === 'binomial') {
    for (let k = 0; k <= params.n; k++) {
      const y = showCDF ? getCDF(type, params, k) : getPDF(type, params, k);
      points.push({ x: k, y });
    }
    return points;
  }

  if (type === 'poisson' && params.type === 'poisson') {
    const maxK = Math.max(15, Math.ceil(params.lambda + 4 * Math.sqrt(params.lambda)));
    for (let k = 0; k <= maxK; k++) {
      const y = showCDF ? getCDF(type, params, k) : getPDF(type, params, k);
      points.push({ x: k, y });
    }
    return points;
  }

  // ---------- PLOT GENERATION (Create continuous probability curve coordinates)
  let minX = -10;
  let maxX = 10;

  if (params.type === 'normal') {
    minX = params.mu - 4 * params.sigma;
    maxX = params.mu + 4 * params.sigma;
  } else if (params.type === 'uniform') {
    const span = params.b - params.a;
    minX = params.a - span * 0.2;
    maxX = params.b + span * 0.2;
  } else if (params.type === 'exponential') {
    minX = 0;
    maxX = 5 / params.lambda;
  }

  const step = (maxX - minX) / (numPoints - 1);
  for (let i = 0; i < numPoints; i++) {
    const x = minX + i * step;
    const y = showCDF ? getCDF(type, params, x) : getPDF(type, params, x);

    // ---------- GUARD (Ensure calculated density value is valid)
    if (Number.isFinite(y)) {
      points.push({ x, y });
    }
  }

  return points;
}
