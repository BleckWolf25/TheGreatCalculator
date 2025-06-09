/**
 * @file VITE.CONFIG.JS
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Vite configuration for The Great Calculator project.
 * Optimized for performance, PWA support, and modern web standards.
 */

// ------------ IMPORTS
import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import legacy from '@vitejs/plugin-legacy'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'

// ------------ CONFIGURATION
export default defineConfig(({ command, mode }) => {
  const isDev = mode === 'development'
  const isProd = mode === 'production'

  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')

  // Enable HTTPS for dev server
  let httpsConfig = false

  // Check for HTTPS environment variable (multiple ways to ensure it works)
  const enableHttps = env.VITE_HTTPS === 'true' ||
                     env.HTTPS === 'true' ||
                     process.env.VITE_HTTPS === 'true' ||
                     process.env.HTTPS === 'true' ||
                     process.argv.includes('--https')

  console.log('HTTPS Environment Check:', {
    'env.VITE_HTTPS': env.VITE_HTTPS,
    'env.HTTPS': env.HTTPS,
    'process.env.VITE_HTTPS': process.env.VITE_HTTPS,
    'process.env.HTTPS': process.env.HTTPS,
    enableHttps,
    isDev
  })

  if (isDev && enableHttps) {
    try {
      // Check if certificate files exist
      if (fs.existsSync('./certs/localhost-key.pem') && fs.existsSync('./certs/localhost.pem')) {
        httpsConfig = {
          key: fs.readFileSync('./certs/localhost-key.pem'),
          cert: fs.readFileSync('./certs/localhost.pem')
        }
        console.log('✅ HTTPS configuration loaded with custom certificates')
      } else {
        // Use Vite's built-in HTTPS with self-signed certificates
        httpsConfig = true
        console.log('⚠️  Using Vite built-in HTTPS (self-signed certificates)')
        console.log('💡 For better HTTPS experience, install mkcert and run:')
        console.log('   brew install mkcert (macOS) or choco install mkcert (Windows)')
        console.log('   mkcert -install')
        console.log('   mkcert localhost 127.0.0.1 ::1')
        console.log('   mkdir -p certs && mv localhost*.pem certs/')
      }
    } catch (error) {
      console.error('❌ Error loading SSL certificates:', error)
      console.log('🔄 Falling back to Vite built-in HTTPS')
      httpsConfig = true
    }
  } else if (isDev) {
    console.log('🌐 Running in HTTP mode')
  }

  return {
    // Root directory for source files
    root: '.',

    // Public directory for static assets
    publicDir: 'public',

    // Resolve configuration for cleaner imports
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@js': resolve(__dirname, 'src/js'),
        '@components': resolve(__dirname, 'src/components'),
        '@utils': resolve(__dirname, 'src/utils')
      }
    },

    // Build configuration
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: isDev ? true : 'hidden', // Hidden sourcemaps in production for debugging without exposing to users

      // Modern build targets for better performance (will be overridden by legacy plugin)
      // target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],

      // CSS code splitting for better caching
      cssCodeSplit: true,

      // Chunk size warning limit (reduced for better performance)
      chunkSizeWarningLimit: 300,

      // Rollup options for advanced bundling
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },

        // External dependencies that shouldn't be bundled
        external: [],

        output: {
          // Organize assets in subdirectories for better caching
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name.split('.')
            const ext = info[info.length - 1]

            // Images and icons
            if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif/i.test(ext)) {
              return `assets/images/[name]-[hash][extname]`
            }

            // Stylesheets
            if (/css/i.test(ext)) {
              return `assets/css/[name]-[hash][extname]`
            }

            // Fonts
            if (/woff2?|eot|ttf|otf/i.test(ext)) {
              return `assets/fonts/[name]-[hash][extname]`
            }

            // Other assets
            return `assets/misc/[name]-[hash][extname]`
          },

          // JavaScript chunks
          chunkFileNames: (chunkInfo) => {
            // Vendor chunks (node_modules)
            if (chunkInfo.facadeModuleId && chunkInfo.facadeModuleId.includes('node_modules')) {
              return 'assets/js/vendor/[name]-[hash].js'
            }

            // Application chunks
            return 'assets/js/[name]-[hash].js'
          },

          // Entry files
          entryFileNames: 'assets/js/[name]-[hash].js',

          // Advanced manual chunk splitting for optimal caching and performance
          manualChunks: (id) => {
            // Vendor chunk for node_modules (excluding PDF library)
            if (id.includes('node_modules')) {
              // Separate PDF library for lazy loading
              if (id.includes('jspdf')) {
                return 'pdf-lib'
              }
              return 'vendor'
            }

            // Core calculator modules (always needed)
            if (id.includes('/src/js/modules/core/') ||
                id.includes('/src/js/modules/calculator.js') ||
                id.includes('/src/js/moduleLoader.js') ||
                id.includes('/src/js/main.js')) {
              return 'core'
            }

            // UI modules (display, accessibility)
            if (id.includes('/src/js/modules/ui/') ||
                id.includes('/src/js/modules/accessibility/')) {
              return 'ui'
            }

            // API and calculation modules
            if (id.includes('/src/js/modules/api/')) {
              return 'api'
            }

            // Storage and persistence modules
            if (id.includes('/src/js/modules/storage/')) {
              return 'storage'
            }

            // Error handling modules (lazy loaded)
            if (id.includes('/src/js/modules/error/')) {
              return 'error-handling'
            }

            // Export functionality (lazy loaded)
            if (id.includes('/src/js/modules/export/')) {
              return 'export'
            }

            // Performance and PWA modules (lazy loaded)
            if (id.includes('/src/js/modules/performance/') ||
                id.includes('/src/js/modules/pwa/')) {
              return 'performance'
            }

            // Utility functions chunk
            if (id.includes('/src/utils/') || id.includes('/src/helpers/')) {
              return 'utils'
            }
          }
        },

        // Tree shaking and optimization
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          unknownGlobalSideEffects: false
        }
      },

      // External dependencies (loaded at runtime)
      external: (id) => {
        // Externalize Vercel packages for runtime loading
        if (id.includes('@vercel/')) {
          return true;
        }
        return false;
      },

      // Advanced minification with Terser for maximum compression
      minify: isProd ? 'terser' : false,
      terserOptions: {
        compress: {
          // Remove console statements in production
          drop_console: isProd,
          drop_debugger: isProd,
          pure_funcs: isProd ? [
            'console.log',
            'console.debug',
            'console.info',
            'console.warn',
            'console.trace'
          ] : [],

          // Advanced compression options
          unsafe_comps: true,
          unsafe_math: true,
          unsafe_methods: true,
          unsafe_proto: true,
          unsafe_regexp: true,
          unsafe_undefined: true,

          // Dead code elimination
          dead_code: true,
          unused: true,

          // Control flow optimization
          conditionals: true,
          evaluate: true,
          booleans: true,
          loops: true,
          if_return: true,
          join_vars: true,

          // Multiple passes for better compression
          passes: 3,

          // Inline functions and variables
          inline: 3,
          reduce_vars: true,
          reduce_funcs: true,

          // String and number optimizations
          collapse_vars: true,
          sequences: true,
          properties: true,

          // Remove unnecessary code
          side_effects: false,
          pure_getters: true,
          keep_infinity: true
        },
        mangle: {
          // Aggressive variable name mangling
          properties: {
            // Only mangle private properties (starting with _)
            regex: /^_/
          },
          safari10: true,
          toplevel: true,
          eval: true,
          keep_fnames: false,
          reserved: ['$', 'exports', 'require'] // Preserve these names
        },
        format: {
          comments: false, // Remove all comments
          ascii_only: true, // ASCII-only output for better compatibility
          beautify: false,
          braces: false,
          semicolons: false,
          preserve_annotations: false,
          ecma: 2020 // Use modern ECMAScript features for smaller output
        },
        // Enable top-level optimizations
        toplevel: true,
        // Keep function names for better debugging
        keep_fnames: !isProd,
        // Source map support
        sourceMap: isDev
      },

      // Report compressed file sizes
      reportCompressedSize: true,

      // Emit manifest file for advanced caching strategies
      manifest: true
    },

    // Development server configuration
    server: {
      port: 1000,
      host: '0.0.0.0', // Allow external connections
      open: false,
      cors: true,
      strictPort: false, // Try next available port if 1000 is taken

      // Hot Module Replacement
      hmr: httpsConfig ? {
        // For HTTPS, use same port to avoid certificate issues
        port: 1000,
        host: 'localhost',
        overlay: true
      } : {
        // For HTTP, can use separate port
        host: '0.0.0.0',
        port: 1001,
        overlay: true
      },

      // Headers for development
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      },

      // Enable HTTPS if configured
      https: httpsConfig,

      // Proxy configuration (Preserved for future use if needed)
      proxy: {
        // Example: '/api': 'http://localhost:1000'
      }
    },

    // Preview server configuration (for production builds)
    preview: {
      port: 9080,
      host: '0.0.0.0',
      open: true,
      strictPort: false,
      cors: true,

      // Security headers for preview
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
      }
    },

    // Asset handling with modern formats
    assetsInclude: [
      '**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif',
      '**/*.webp', '**/*.avif', // Modern image formats
      '**/*.woff', '**/*.woff2', '**/*.eot', '**/*.ttf', '**/*.otf', // Fonts
      '**/*.mp3', '**/*.mp4', '**/*.webm', // Media files
      '**/*.pdf', '**/*.txt' // Documents
    ],

    // Define global constants
    define: {
      __DEV__: JSON.stringify(isDev),
      __PROD__: JSON.stringify(isProd),
      __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },

    // CSS configuration
    css: {
      devSourcemap: isDev,

      // CSS modules configuration (if using CSS modules)
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isDev
          ? '[name]_[local]_[hash:base64:5]'
          : '[hash:base64:8]'
      },

      // Preprocessor options
      preprocessorOptions: {
        scss: {
          // Only import variables if the file exists
          // additionalData: `@import "@styles/variables.scss";`,
          charset: false
        }
      }
    },

    // ESBuild configuration for TypeScript/JSX transformation
    esbuild: {
      target: 'es2020',
      drop: isProd ? ['console', 'debugger'] : [],
      legalComments: 'none',
      charset: 'utf8'
    },

    // Advanced optimization configuration
    optimizeDeps: {
      include: [
        // Pre-bundle core dependencies for faster loading
        // Add any external dependencies here when they're added
      ],
      exclude: [
        // Exclude modules that should be lazy loaded
        'jspdf', // PDF library should be lazy loaded
        '/src/js/modules/error/',
        '/src/js/modules/export/',
        '/src/js/modules/performance/'
        // Removed PWA modules from exclude list since they're now properly imported
      ],
      esbuildOptions: {
        target: 'es2020',
        // Advanced esbuild optimizations
        treeShaking: true,
        minify: isProd,
        legalComments: 'none',
        charset: 'utf8',
        // Optimize for size
        minifyWhitespace: isProd,
        minifyIdentifiers: isProd,
        minifySyntax: isProd
      },
      // Force optimization of specific modules
      force: isProd
    },

    // Worker configuration
    worker: {
      format: 'es',
      plugins: () => []
    },

    // Plugin configuration
    plugins: [
      // Legacy support for older browsers
      legacy({
        targets: ['defaults', 'not IE 11', 'edge >= 88', 'firefox >= 78', 'chrome >= 87', 'safari >= 14'],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
        renderLegacyChunks: true,
        modernPolyfills: true,
        // Fix the build.target override warning
        polyfills: [
          'es.symbol',
          'es.array.filter',
          'es.promise',
          'es.promise.finally'
        ]
      }),

      // PWA plugin with advanced Workbox configuration
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],

        // Manifest configuration
        manifest: {
          name: 'The Great Calculator',
          short_name: 'Calculator',
          description: 'Advanced scientific calculator with comprehensive offline capabilities',
          theme_color: '#007AFF',
          background_color: '#F2F2F7',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'icons/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'icons/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'icons/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          shortcuts: [
            {
              name: 'Quick Calculate',
              short_name: 'Calculate',
              description: 'Open calculator for quick calculations',
              url: '/',
              icons: [{ src: 'icons/shortcut-calculate.png', sizes: '96x96' }]
            },
            {
              name: 'History',
              short_name: 'History',
              description: 'View calculation history',
              url: '/?view=history',
              icons: [{ src: 'icons/shortcut-history.png', sizes: '96x96' }]
            }
          ]
        },

        // Advanced Workbox configuration
        workbox: {
          // Precaching patterns
          globPatterns: [
            '**/*.{js,css,html,ico,png,svg,webp,woff,woff2,json}',
            'icons/**/*.{png,svg,ico}'
          ],

          // Advanced caching options
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,

          // Maximum cache size and entries
          maximumFileSizeToCacheInBytes: 5000000, // 5MB

          // Runtime caching strategies
          runtimeCaching: [
            // Cache API responses with network-first strategy
            {
              urlPattern: /^https:\/\/api\./,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                },
                networkTimeoutSeconds: 10
              }
            },

            // Cache images with cache-first strategy
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },

            // Cache fonts with cache-first strategy
            {
              urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'fonts-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },

            // Cache CSS and JS with stale-while-revalidate
            {
              urlPattern: /\.(?:css|js)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'static-resources',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },

            // Cache HTML pages with network-first strategy
            {
              urlPattern: /\.(?:html)$/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                },
                networkTimeoutSeconds: 3
              }
            },

            // Cache calculator data with network-first strategy
            {
              urlPattern: /\/api\/calculator\//,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'calculator-data',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 1 // 1 day
                },
                cacheableResponse: {
                  statuses: [0, 200]
                },
                networkTimeoutSeconds: 5,
                plugins: [
                  {
                    cacheKeyWillBeUsed: async ({ request }) => {
                      // Custom cache key for calculator data
                      return `calculator-${request.url}`;
                    }
                  }
                ]
              }
            }
          ],

          // Background sync (handled by custom service worker)
          // backgroundSync: {
          //   name: 'calculator-background-sync',
          //   options: {
          //     maxRetentionTime: 24 * 60 // 24 hours
          //   }
          // },

          // Navigation fallback
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],

          // Exclude patterns
          dontCacheBustURLsMatching: /\.\w{8}\./
          // exclude: [/\.map$/, /manifest$/, /\.DS_Store$/] // Handled by globIgnores
        },

        // Development options
        devOptions: {
          enabled: true,
          type: 'module',
          navigateFallback: 'index.html'
        }
      })
    ],

    // Base public path
    base: isProd ? '/' : '/',

    // Experimental features
    experimental: {
      renderBuiltUrl: (filename) => {
        // Custom URL generation for assets
        return filename
      }
    },

    // Environment-specific configurations
    ...(isDev && {
      // Development-only options
      clearScreen: false,
      logLevel: 'info'
    }),

    ...(isProd && {
      // Production-only options
      logLevel: 'warn'
    })
  }
})
