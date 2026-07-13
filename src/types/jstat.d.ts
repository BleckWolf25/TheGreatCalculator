/**
 * @file jstat.d.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Ambient TypeScript declaration file for the jStat library.
 *
 * @description
 * Defines type annotations and interfaces for normal, binomial, poisson,
 * uniform, and exponential probability distributions within the jStat package.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
// ---------- MODULE DECLARATIONS
declare module 'jstat' {
  export const jStat: {
    normal: {
      pdf: (x: number, mean: number, std: number) => number;
      cdf: (x: number, mean: number, std: number) => number;
      inv: (p: number, mean: number, std: number) => number;
    };
    binomial: {
      pdf: (k: number, n: number, p: number) => number;
      cdf: (k: number, n: number, p: number) => number;
    };
    poisson: {
      pdf: (k: number, l: number) => number;
      cdf: (k: number, l: number) => number;
    };
    uniform: {
      pdf: (x: number, a: number, b: number) => number;
      cdf: (x: number, a: number, b: number) => number;
    };
    exponential: {
      pdf: (x: number, rate: number) => number;
      cdf: (x: number, rate: number) => number;
    };
    [key: string]: unknown;
  };
}
