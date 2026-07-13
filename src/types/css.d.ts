/**
 * @file css.d.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Ambient TypeScript declaration file for CSS stylesheet imports.
 *
 * @description
 * Declares module definitions for standard stylesheet files and CSS module files
 * to allow side-effect CSS imports and type-safe module class name resolution.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
// ---------- MODULE DECLARATIONS
declare module '*.css';
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
