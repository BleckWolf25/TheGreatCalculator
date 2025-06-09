/**
 * @file eslint-plugins.d.ts
 * @description Type declarations for ESLint plugins that don't have official type definitions
 */

declare module 'eslint-plugin-import' {
  import type { ESLint } from 'eslint';
  const plugin: ESLint.Plugin & {
    configs: Record<string, any>;
    rules: Record<string, any>;
  };
  export = plugin;
}

declare module 'eslint-plugin-promise' {
  import type { ESLint } from 'eslint';
  const plugin: ESLint.Plugin & {
    configs: Record<string, any>;
    rules: Record<string, any>;
  };
  export = plugin;
}

declare module 'eslint-plugin-security' {
  import type { ESLint } from 'eslint';
  const plugin: ESLint.Plugin & {
    configs: Record<string, any>;
    rules: Record<string, any>;
  };
  export = plugin;
}

declare module 'eslint-plugin-sonarjs' {
  import type { ESLint } from 'eslint';
  const plugin: ESLint.Plugin & {
    configs: Record<string, any>;
    rules: Record<string, any>;
  };
  export = plugin;
}

declare module 'eslint-plugin-unicorn' {
  import type { ESLint } from 'eslint';
  const plugin: ESLint.Plugin & {
    configs: Record<string, any>;
    rules: Record<string, any>;
  };
  export = plugin;
}

declare module 'eslint-plugin-jest' {
  import type { ESLint } from 'eslint';
  const plugin: ESLint.Plugin & {
    configs: Record<string, any>;
    rules: Record<string, any>;
  };
  export = plugin;
}
