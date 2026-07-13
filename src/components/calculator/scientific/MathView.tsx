/**
 * @file MathView.tsx
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Safe KaTeX math expression renderer component.
 *
 * @description
 * Converts calculator mathematical expressions into LaTeX representation via Math.js AST
 * parsing when valid, and renders them visually using KaTeX with fallback to plain text.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */

// ---------- IMPORTS
import React, { useMemo } from 'react';
import katex from 'katex';
import { parse } from 'mathjs';

// ---------- INTERFACE: MATH VIEW PROPS
export interface MathViewProps {
  expression: string;
  className?: string;
}

// ---------- COMPONENT: MATH VIEW
export const MathView: React.FC<MathViewProps> = ({ expression, className = '' }) => {
  // ---------- RENDER LATEX (Convert math syntax to LaTeX and compile via KaTeX)
  const renderedHtml = useMemo(() => {
    // Return empty string when expression is blank
    if (!expression || !expression.trim()) {
      return '';
    }

    let latexStr = expression;
    try {
      // Attempt to convert MathJS AST into LaTeX notation
      const node = parse(expression);
      latexStr = node.toTex({ parenthesis: 'auto' });
    } catch {
      // Fallback symbol replacement when expression is incomplete during typing
      latexStr = expression
        .replace(/\*/g, '\\times ')
        .replace(/\//g, '\\div ')
        .replace(/\bpi\b/g, '\\pi');
    }

    try {
      // Render LaTeX string into safe KaTeX HTML markup
      return katex.renderToString(latexStr, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      // Return raw expression text when KaTeX fails
      return expression;
    }
  }, [expression]);

  // Return container span injection of rendered KaTeX markup
  return (
    <span
      className={`inline-block select-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml || expression }}
    />
  );
};
