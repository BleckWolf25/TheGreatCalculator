/**
 * @file layout.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Root layout component for the Next.js application.
 *
 * @description
 * Sets up metadata, viewport preferences, layout typography fonts, and structures
 * the top-level HTML document containing the font configuration and main theme body style.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';

// ---------- FONTS
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// ---------- METADATA
export const metadata: Metadata = {
  title: 'TheGreatCalculator — Scientific & Graphing Calculator',
  description:
    'A super advanced, performant, responsive, accessible scientific and graphing calculator with probability distributions.',
  keywords: ['calculator', 'scientific', 'graphing', 'probability', 'math'],
  authors: [{ name: 'João Costa' }],
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
};

// ---------- COMPONENT: ROOT LAYOUT
import { PwaRegistry } from '@/components/PwaRegistry';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="flex h-dvh flex-col overflow-hidden font-sans antialiased">
        <PwaRegistry />
        {children}
      </body>
    </html>
  );
}
