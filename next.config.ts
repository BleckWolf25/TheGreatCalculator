/**
 * @file next.config.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Next.js application runtime configuration.
 *
 * @description
 * Sets up static HTML exports, strict React development modes, removes console logs
 * in production environments, disables powered-by headers, and bypasses image optimization.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import type { NextConfig } from 'next';

// ---------- CONFIGURATION
const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'export',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // Compiler
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },

  // Typescript
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Images
  images: {
    unoptimized: true,
  },
};

// ---------- EXPORTS
export default nextConfig;
