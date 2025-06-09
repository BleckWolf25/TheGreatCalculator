/**
 * @file BABEL.CONFIG.JS
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Modern Babel configuration for The Great Calculator project with ES modules support.
 * Ensures compatibility with various JavaScript environments while preserving ES modules.
 * Optimized for modern browsers and Node.js with native ES module support.
*/

// ------------ ES MODULES CONFIGURATION
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
          browsers: ['last 2 versions', 'not dead', 'not ie <= 11']
        },
        modules: false, // Preserve ES modules for better tree shaking
        useBuiltIns: 'usage',
        corejs: 3
      }
    ]
  ],
  plugins: [
    // Only transform modules when specifically needed
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            },
            modules: 'auto' // Let Babel handle module transformation for Jest
          }
        ]
      ]
    },
    development: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
              browsers: ['last 1 version']
            },
            modules: false
          }
        ]
      ]
    },
    production: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              browsers: ['last 2 versions', 'not dead', 'not ie <= 11']
            },
            modules: false
          }
        ]
      ]
    }
  }
};
