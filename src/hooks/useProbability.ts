/**
 * @file useProbability.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Custom React hook to calculate statistics and cumulative probability densities.
 *
 * @description
 * Manages parameters for discrete/continuous models, updates bounds queries,
 * caches computations using useMemo, and reads/writes state parameters via IndexedDB.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import { useState, useEffect, useMemo } from 'react';
import type { DistributionType, DistributionParams, ProbabilityQuery } from '@/lib/types';
import { DEFAULT_DISTRIBUTION_PARAMS } from '@/lib/constants';
import { calculateDistributionMetrics } from '@/lib/engine/probability';
import { getValue, setValue } from '@/lib/db';

// ---------- HOOKS: PROBABILITY
export function useProbability() {
  const [distributionType, setDistributionType] = useState<DistributionType>('normal');
  const [params, setParams] = useState<DistributionParams>(DEFAULT_DISTRIBUTION_PARAMS.normal);
  const [query, setQuery] = useState<ProbabilityQuery>({
    mode: 'leq',
    x: 1.0,
  });
  const [showCDF, setShowCDF] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // ---------- EFFECT (Load distribution inputs from IndexedDB)
  useEffect(() => {
    getValue<{
      distributionType: DistributionType;
      params: DistributionParams;
      query: ProbabilityQuery;
      showCDF: boolean;
    }>('probability').then((saved) => {
      // ---------- GUARD (Ensure loaded data contains properties)
      if (saved) {
        if (saved.distributionType) setDistributionType(saved.distributionType);
        if (saved.params) setParams(saved.params);
        if (saved.query) setQuery(saved.query);
        if (saved.showCDF !== undefined) setShowCDF(saved.showCDF);
      }
      setIsLoaded(true);
    });
  }, []);

  // ---------- EFFECT (Save distribution inputs to IndexedDB)
  useEffect(() => {
    // ---------- GUARD (Avoid database updates during hydration)
    if (!isLoaded) {
      return;
    }

    setValue('probability', {
      distributionType,
      params,
      query,
      showCDF,
    });
  }, [distributionType, params, query, showCDF, isLoaded]);

  // ---------- HANDLER: TYPE CHANGE
  const handleTypeChange = (type: DistributionType) => {
    setDistributionType(type);
    setParams(DEFAULT_DISTRIBUTION_PARAMS[type]);

    // ---------- QUERY INITIALIZATION (Provide sane bounds defaults based on distribution type)
    if (type === 'normal') {
      setQuery({ mode: 'leq', x: 1.0 });
    } else if (type === 'binomial') {
      setQuery({ mode: 'leq', x: 5 });
    } else if (type === 'poisson') {
      setQuery({ mode: 'leq', x: 4 });
    } else if (type === 'uniform') {
      setQuery({ mode: 'leq', x: 0.5 });
    } else if (type === 'exponential') {
      setQuery({ mode: 'leq', x: 1.0 });
    }
  };

  // ---------- COMPUTED (Calculate probability metrics)
  const result = useMemo(() => {
    return calculateDistributionMetrics(distributionType, params, query);
  }, [distributionType, params, query]);

  return {
    distributionType,
    handleTypeChange,
    params,
    setParams,
    query,
    setQuery,
    showCDF,
    setShowCDF,
    result,
  };
}
