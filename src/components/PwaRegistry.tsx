/**
 * @file PwaRegistry.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Client-side component to register the Progressive Web App Service Worker.
 *
 * @description
 * Registers /sw.js on component mount when running in production or browser window
 * environments to enable offline asset caching and PWA installation prompts.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- IMPORTS
import { useEffect } from 'react';

// ---------- COMPONENT: PWA REGISTRY
export function PwaRegistry() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Silently handle service worker registration errors
      });
    }
  }, []);

  return null;
}
