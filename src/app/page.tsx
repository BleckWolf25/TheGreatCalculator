/**
 * @file page.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Root page component for the application.
 *
 * @description
 * Renders the main Calculator container component as the default view for the
 * application home route.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import { Calculator } from '@/components/calculator/Calculator';

// ---------- COMPONENT: HOME
export default function Home() {
  return <Calculator />;
}
