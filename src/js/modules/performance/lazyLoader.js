/**
 * @file LAZY LOADER MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Lazy loading and code splitting module for The Great Calculator.
 * Implements intelligent module loading with performance tracking,
 * caching, retry mechanisms, and user behavior-based preloading.
 *
 * Features:
 * - Dynamic module importing with timeout and retry logic
 * - Intelligent caching and deduplication
 * - Intersection Observer-based lazy loading
 * - User behavior-driven preloading
 * - Performance monitoring integration
 * - Batch loading capabilities
 * - Fallback mechanisms for failed loads
 *
 * @requires Web APIs: IntersectionObserver, Performance API
 */

// ------------ TYPE AND JSDOC DEFINITIONS

/**
 * @typedef {Object} LazyLoadOptions
 * @property {number} [timeout=10000] - Module load timeout in milliseconds
 * @property {number} [retries=3] - Number of retry attempts
 * @property {boolean} [preload=false] - Whether this is a preload operation
 * @property {boolean} [cache=true] - Whether to cache the loaded module
 */

/**
 * @typedef {Object} PreloadQueueItem
 * @property {string} modulePath - Path to the module to preload
 * @property {string} priority - Priority level: 'high', 'medium', 'low'
 * @property {number} timestamp - Timestamp when item was added to queue
 */

/**
 * @typedef {Object} BatchLoadOptions
 * @property {boolean} [parallel=true] - Whether to load modules in parallel
 * @property {boolean} [failFast=false] - Whether to fail on first error
 * @property {number} [timeout=10000] - Timeout for each module load
 */

/**
 * @typedef {Object} LoadResult
 * @property {any} [result] - The loaded module or result
 * @property {Error} [error] - Error if loading failed
 * @property {string} [path] - Module path (included in error cases)
 */

/**
 * @typedef {Object} LazyLoaderStats
 * @property {number} loadedModules - Number of loaded modules in cache
 * @property {number} loadingModules - Number of modules currently loading
 * @property {number} preloadQueue - Number of items in preload queue
 * @property {number} cacheSize - Size of module cache
 */

/**
 * @typedef {Object} ScientificModules
 * @property {any} trigonometry - Trigonometry functions module
 * @property {any} logarithms - Logarithm functions module
 * @property {any} advanced - Advanced mathematical functions module
 */

// ------------ LAZY LOADER CLASS

/**
 * Lazy Loader Class
 *
 * Provides intelligent code splitting and lazy loading capabilities
 * for calculator features with performance optimization and caching.
 *
 * @class LazyLoader
 * @example
 * const lazyLoader = new LazyLoader();
 *
 * // Load a module with options
 * const module = await lazyLoader.loadModule('/path/to/module.js', {
 *   timeout: 5000,
 *   retries: 2,
 *   cache: true
 * });
 *
 * // Preload modules for better performance
 * await lazyLoader.preloadModule('/path/to/module.js', 'high');
 */
class LazyLoader {
  /**
   * Create lazy loader instance
   *
   * Initializes the lazy loader with empty caches and sets up
   * intersection observers and preloading mechanisms.
   *
   * @constructor
   * @example
   * const lazyLoader = new LazyLoader();
   */
  constructor() {
    /** @type {Map<string, any>} Cache of loaded modules */
    this.loadedModules = new Map();

    /** @type {Map<string, Promise<any>>} Currently loading module promises */
    this.loadingPromises = new Map();

    /** @type {PreloadQueueItem[]} Queue of modules to preload */
    this.preloadQueue = [];

    /** @type {any|null} Performance monitor instance */
    this.performanceMonitor = null;

    /** @type {Map<string, number>} Module size tracking for bundle optimization */
    this.moduleSizes = new Map();

    /** @type {Map<string, number>} Module usage frequency for optimization */
    this.usageFrequency = new Map();

    /** @type {Set<string>} Critical modules that should be in main bundle */
    this.criticalModules = new Set([
      '/src/js/modules/core/',
      '/src/js/modules/ui/display.js',
      '/src/js/modules/api/calculatorAPI.js'
    ]);

    /** @type {boolean} Whether to use aggressive code splitting */
    this.aggressiveCodeSplitting = true;

    /** @type {number} Maximum chunk size in bytes for optimization */
    this.maxChunkSize = 250 * 1024; // 250KB

    this.init();
  }

  // ------------ INITIALIZATION METHODS

  /**
   * Initialize lazy loader
   *
   * Sets up intersection observers for visibility-based loading
   * and intelligent preloading based on user behavior patterns.
   *
   * @method init
   * @returns {void}
   *
   * @example
   * const lazyLoader = new LazyLoader();
   * // init() is called automatically in constructor
   */
  init() {
    this.setupIntersectionObserver();
    this.setupPreloading();

    console.log('Lazy loader initialized');
  }

  // ------------ MODULE LOADING METHODS

  /**
   * Dynamically import a module with performance tracking
   *
   * Loads a module with intelligent caching, deduplication, timeout,
   * and retry mechanisms. Integrates with performance monitoring.
   *
   * @async
   * @method loadModule
   * @param {string} modulePath - Path to the module to load
   * @param {LazyLoadOptions} [options={}] - Loading options
   * @returns {Promise<any>} The loaded module
   *
   * @throws {Error} When module fails to load after all retries
   *
   * @example
   * try {
   *   const module = await lazyLoader.loadModule('/src/js/modules/scientific/trigonometry.js', {
   *     timeout: 5000,
   *     retries: 2,
   *     cache: true
   *   });
   *   console.log('Module loaded:', module);
   * } catch (error) {
   *   console.error('Failed to load module:', error);
   * }
   */
  async loadModule(modulePath, options = {}) {
    const {
      timeout = 10000,
      retries = 3,
      preload = false,
      cache = true
    } = options;

    // Return cached module if available
    if (cache && this.loadedModules.has(modulePath)) {
      return this.loadedModules.get(modulePath);
    }

    // Return existing loading promise if module is already being loaded
    if (this.loadingPromises.has(modulePath)) {
      return this.loadingPromises.get(modulePath);
    }

    /** @type {Promise<any>} */
    const loadPromise = this.performModuleLoad(modulePath, timeout, retries);

    if (!preload) {
      this.loadingPromises.set(modulePath, loadPromise);
    }

    try {
      /** @type {any} */
      const module = await loadPromise;

      if (cache) {
        this.loadedModules.set(modulePath, module);
      }

      this.loadingPromises.delete(modulePath);

      console.log(`Module loaded successfully: ${modulePath}`);
      return module;

    } catch (error) {
      this.loadingPromises.delete(modulePath);
      console.error(`Failed to load module: ${modulePath}`, error);
      throw error;
    }
  }

  /**
   * Perform the actual module loading with retries
   *
   * Implements the core module loading logic with timeout handling,
   * exponential backoff retry strategy, and performance tracking.
   *
   * @async
   * @method performModuleLoad
   * @param {string} modulePath - Path to the module to load
   * @param {number} timeout - Timeout in milliseconds
   * @param {number} retries - Number of retry attempts
   * @returns {Promise<any>} The loaded module
   *
   * @throws {Error} When all retry attempts fail
   *
   * @example
   * const module = await lazyLoader.performModuleLoad('/path/to/module.js', 5000, 3);
   */
  async performModuleLoad(modulePath, timeout, retries) {
    /** @type {Error|undefined} */
    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        /** @type {number} */
        const startTime = performance.now();

        // Create a timeout promise
        /** @type {Promise<never>} */
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Module load timeout: ${modulePath}`)), timeout);
        });

        // Race between import and timeout
        /** @type {any} */
        const module = await Promise.race([
          import(modulePath),
          timeoutPromise
        ]);

        /** @type {number} */
        const loadTime = performance.now() - startTime;

        // Track performance if monitor is available
        if (this.performanceMonitor && typeof this.performanceMonitor.trackModuleLoad === 'function') {
          this.performanceMonitor.trackModuleLoad(modulePath, loadTime, attempt);
        }

        return module;

      } catch (error) {
        lastError = error;
        console.warn(`Module load attempt ${attempt} failed for ${modulePath}:`, error);

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await this.delay(2**attempt * 100);
        }
      }
    }

    throw lastError;
  }

  // ------------ PRELOADING METHODS

  /**
   * Preload modules for better performance
   *
   * Adds modules to a priority queue and loads them in the background
   * to improve perceived performance when they're actually needed.
   *
   * @async
   * @method preloadModule
   * @param {string} modulePath - Path to the module to preload
   * @param {string} [priority='low'] - Priority level: 'high', 'medium', 'low'
   * @returns {Promise<void>} Resolves when preloading is complete
   *
   * @example
   * // Preload scientific functions with medium priority
   * await lazyLoader.preloadModule('/src/js/modules/scientific/trigonometry.js', 'medium');
   *
   * // Preload with default low priority
   * await lazyLoader.preloadModule('/src/js/modules/export/exportManager.js');
   */
  async preloadModule(modulePath, priority = 'low') {
    try {
      // Add to preload queue
      /** @type {PreloadQueueItem} */
      const queueItem = { modulePath, priority, timestamp: Date.now() };
      this.preloadQueue.push(queueItem);

      // Sort by priority
      this.preloadQueue.sort((a, b) => {
        /** @type {Record<string, number>} */
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      // Preload with low priority to avoid blocking main thread
      await this.loadModule(modulePath, { preload: true, cache: true });

      // Remove from queue
      this.preloadQueue = this.preloadQueue.filter(item => item.modulePath !== modulePath);

    } catch (error) {
      console.warn(`Preload failed for ${modulePath}:`, error);
    }
  }

  // ------------ SPECIALIZED LOADING METHODS

  /**
   * Load scientific calculator functions lazily
   *
   * Loads all scientific calculator modules in parallel and returns
   * them as a structured object for easy access.
   *
   * @async
   * @method loadScientificFunctions
   * @returns {Promise<ScientificModules>} Object containing scientific function modules
   *
   * @throws {Error} When any of the scientific modules fail to load
   *
   * @example
   * const scientificModules = await lazyLoader.loadScientificFunctions();
   * const sinResult = scientificModules.trigonometry.sin(Math.PI / 2);
   * const logResult = scientificModules.logarithms.log10(100);
   */
  async loadScientificFunctions() {
    /** @type {any[]} */
    const modules = await Promise.all([
      this.loadModule('/src/js/modules/scientific/trigonometry.js'),
      this.loadModule('/src/js/modules/scientific/logarithms.js'),
      this.loadModule('/src/js/modules/scientific/advanced.js')
    ]);

    return {
      trigonometry: modules[0].default,
      logarithms: modules[1].default,
      advanced: modules[2].default
    };
  }

  /**
   * Load formula management features lazily
   *
   * Loads the formula management module for creating and managing
   * custom user-defined formulas and calculations.
   *
   * @async
   * @method loadFormulaManagement
   * @returns {Promise<any>} Formula management module
   *
   * @throws {Error} When formula management module fails to load
   *
   * @example
   * const formulaManager = await lazyLoader.loadFormulaManagement();
   * formulaManager.createFormula('quadratic', 'a*x^2 + b*x + c');
   */
  async loadFormulaManagement() {
    /** @type {any} */
    const module = await this.loadModule('/src/js/modules/formulas/formulaManager.js');
    return module.default;
  }

  /**
   * Load export functionality lazily
   *
   * Loads the export manager module for exporting calculation
   * history and results in various formats (CSV, PDF, JSON).
   *
   * @async
   * @method loadExportFeatures
   * @returns {Promise<any>} Export manager module
   *
   * @throws {Error} When export module fails to load
   *
   * @example
   * const exportManager = await lazyLoader.loadExportFeatures();
   * await exportManager.exportToCSV(calculationHistory);
   */
  async loadExportFeatures() {
    /** @type {any} */
    const module = await this.loadModule('/src/js/modules/export/exportManager.js');
    return module.default;
  }

  /**
   * Load accessibility features lazily
   *
   * Loads the accessibility manager module for screen reader
   * support, keyboard navigation, and other accessibility features.
   *
   * @async
   * @method loadAccessibilityFeatures
   * @returns {Promise<any>} Accessibility manager module
   *
   * @throws {Error} When accessibility module fails to load
   *
   * @example
   * const accessibilityManager = await lazyLoader.loadAccessibilityFeatures();
   * accessibilityManager.enableScreenReaderMode();
   */
  async loadAccessibilityFeatures() {
    /** @type {any} */
    const module = await this.loadModule('/src/js/modules/accessibility/accessibilityManager.js');
    return module.default;
  }

  /**
   * Load performance monitoring lazily
   *
   * Loads and initializes the performance monitoring module for
   * tracking calculator performance metrics and optimization.
   *
   * @async
   * @method loadPerformanceMonitoring
   * @returns {Promise<any>} Performance monitor instance
   *
   * @throws {Error} When performance monitor module fails to load
   *
   * @example
   * const performanceMonitor = await lazyLoader.loadPerformanceMonitoring();
   * const metrics = performanceMonitor.getSummary();
   */
  async loadPerformanceMonitoring() {
    /** @type {any} */
    const module = await this.loadModule('/src/js/modules/performance/performanceMonitor.js');
    this.performanceMonitor = new module.default();
    return this.performanceMonitor;
  }

  // ------------ INTERSECTION OBSERVER METHODS

  /**
   * Setup intersection observer for lazy loading based on visibility
   *
   * Configures an IntersectionObserver to automatically load modules
   * when their associated DOM elements become visible in the viewport.
   *
   * @method setupIntersectionObserver
   * @returns {void}
   *
   * @example
   * // HTML element with lazy loading attribute
   * // <div data-lazy-module="/src/js/modules/scientific/trigonometry.js"></div>
   *
   * lazyLoader.setupIntersectionObserver();
   * // Module will load when element becomes visible
   */
  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported');
      return;
    }

    /** @type {IntersectionObserver} */
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          /** @type {HTMLElement} */
          const element = entry.target;
          /** @type {string|undefined} */
          const modulePath = element.dataset.lazyModule;

          if (modulePath) {
            this.loadModule(modulePath).then(module => {
              // Initialize the module if it has an init function
              if (module.default && typeof module.default.init === 'function') {
                module.default.init(element);
              }

              // Remove the observer
              observer.unobserve(element);
            }).catch(error => {
              console.error('Failed to lazy load module:', error);
            });
          }
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.1
    });

    // Observe elements with lazy loading attributes
    /** @type {NodeListOf<Element>} */
    const lazyElements = document.querySelectorAll('[data-lazy-module]');
    lazyElements.forEach(element => {
      observer.observe(element);
    });
  }

  // ------------ INTELLIGENT PRELOADING METHODS

  /**
   * Setup intelligent preloading based on user behavior
   *
   * Configures event listeners to detect user behavior patterns and
   * preload relevant modules before they're needed for better UX.
   *
   * @method setupPreloading
   * @returns {void}
   *
   * @example
   * lazyLoader.setupPreloading();
   * // Automatically preloads modules based on user interactions
   */
  setupPreloading() {
    // Preload scientific functions when user hovers over scientific toggle
    /** @type {HTMLElement|null} */
    const scientificToggle = document.querySelector('.scientific-toggle');
    if (scientificToggle) {
      /** @type {number|undefined} */
      let hoverTimeout;

      scientificToggle.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(() => {
          void this.preloadModule('/src/js/modules/scientific/trigonometry.js', 'medium');
          void this.preloadModule('/src/js/modules/scientific/logarithms.js', 'medium');
          void this.preloadModule('/src/js/modules/scientific/advanced.js', 'medium');
        }, 500); // Preload after 500ms hover
      });

      scientificToggle.addEventListener('mouseleave', () => {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
        }
      });
    }

    // Preload export features when user performs calculations
    /** @type {number} */
    let calculationCount = 0;
    document.addEventListener('click', (event) => {
      /** @type {HTMLElement} */
      const target = event.target;
      if (target.classList.contains('btn-equals')) {
        calculationCount++;

        // Preload export features after 3 calculations
        if (calculationCount === 3) {
          void this.preloadModule('/src/js/modules/export/exportManager.js', 'low');
        }
      }
    });

    // Preload accessibility features if user uses keyboard navigation
    /** @type {number} */
    let keyboardUsage = 0;
    document.addEventListener('keydown', (event) => {
      /** @type {string[]} */
      const navigationKeys = ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (navigationKeys.includes(event.key)) {
        keyboardUsage++;

        // Preload accessibility features after keyboard usage
        if (keyboardUsage === 5) {
          void this.preloadModule('/src/js/modules/accessibility/accessibilityManager.js', 'high');
        }
      }
    });
  }

  // ------------ UTILITY AND HELPER METHODS

  /**
   * Create a module loader with fallback
   *
   * Creates a function that attempts to load a module and falls back
   * to a provided function if the module loading fails.
   *
   * @method createModuleLoader
   * @param {string} modulePath - Path to the module to load
   * @param {Function} fallbackFunction - Function to use if module loading fails
   * @returns {Function} Async function that loads module or uses fallback
   *
   * @example
   * const advancedCalculator = lazyLoader.createModuleLoader(
   *   '/src/js/modules/scientific/advanced.js',
   *   (x) => x * x // Simple fallback for square function
   * );
   *
   * const result = await advancedCalculator(5); // Uses module or fallback
   */
  createModuleLoader(modulePath, fallbackFunction) {
    return async (...args) => {
      try {
        /** @type {any} */
        const module = await this.loadModule(modulePath);
        return module.default(...args);
      } catch (error) {
        console.error(`Failed to load module: ${modulePath}`, error);
        console.warn(`Module ${modulePath} failed to load, using fallback`);
        return fallbackFunction(...args);
      }
    };
  }

  /**
   * Batch load multiple modules
   *
   * Loads multiple modules either in parallel or sequentially with
   * configurable error handling and timeout options.
   *
   * @async
   * @method loadModules
   * @param {string[]} modulePaths - Array of module paths to load
   * @param {BatchLoadOptions} [options={}] - Batch loading options
   * @returns {Promise<LoadResult[]>} Array of load results
   *
   * @example
   * // Load modules in parallel
   * const results = await lazyLoader.loadModules([
   *   '/src/js/modules/scientific/trigonometry.js',
   *   '/src/js/modules/scientific/logarithms.js'
   * ], { parallel: true, failFast: false });
   *
   * // Load modules sequentially
   * const results = await lazyLoader.loadModules(modulePaths, {
   *   parallel: false,
   *   failFast: true,
   *   timeout: 5000
   * });
   */
  async loadModules(modulePaths, options = {}) {
    const {
      parallel = true,
      failFast = false,
      timeout = 10000
    } = options;

    if (parallel) {
      /** @type {Promise<any>[]} */
      const promises = modulePaths.map(path =>
        this.loadModule(path, { timeout }).catch(error => ({ error, path }))
      );

      /** @type {LoadResult[]} */
      const results = await Promise.all(promises);

      if (failFast) {
        /** @type {LoadResult|undefined} */
        const failed = results.find(result => result.error);
        if (failed) {
          throw new Error(`Failed to load module: ${failed.path}`);
        }
      }

      return results;
    } else {
      // Sequential loading
      /** @type {LoadResult[]} */
      const results = [];
      for (const path of modulePaths) {
        try {
          /** @type {any} */
          const module = await this.loadModule(path, { timeout });
          results.push({ result: module });
        } catch (error) {
          if (failFast) {
            throw error;
          }
          results.push({ error, path });
        }
      }
      return results;
    }
  }

  // ------------ CACHE MANAGEMENT METHODS

  /**
   * Clear module cache
   *
   * Removes modules from the cache to free memory or force reloading.
   * Can clear a specific module or all cached modules.
   *
   * @method clearCache
   * @param {string|null} [modulePath=null] - Specific module path to clear, or null for all
   * @returns {void}
   *
   * @example
   * // Clear specific module
   * lazyLoader.clearCache('/src/js/modules/scientific/trigonometry.js');
   *
   * // Clear all cached modules
   * lazyLoader.clearCache();
   */
  clearCache(modulePath = null) {
    if (modulePath) {
      this.loadedModules.delete(modulePath);
      console.log(`Cache cleared for module: ${modulePath}`);
    } else {
      this.loadedModules.clear();
      console.log('All module cache cleared');
    }
  }

  /**
   * Get loading statistics
   *
   * Returns comprehensive statistics about the current state of
   * the lazy loader including cache size and loading queue status.
   *
   * @method getStats
   * @returns {LazyLoaderStats} Current loading statistics
   *
   * @example
   * const stats = lazyLoader.getStats();
   * console.log(`Loaded: ${stats.loadedModules}, Loading: ${stats.loadingModules}`);
   * console.log(`Preload queue: ${stats.preloadQueue}, Cache size: ${stats.cacheSize}`);
   */
  getStats() {
    return {
      loadedModules: this.loadedModules.size,
      loadingModules: this.loadingPromises.size,
      preloadQueue: this.preloadQueue.length,
      cacheSize: this.loadedModules.size
    };
  }

  // ------------ BUNDLE OPTIMIZATION METHODS

  /**
   * Analyze bundle composition and suggest optimizations
   *
   * Analyzes loaded modules to identify optimization opportunities
   * such as code splitting, tree shaking, and chunk consolidation.
   *
   * @method analyzeBundleComposition
   * @returns {Object} Bundle analysis report with optimization suggestions
   *
   * @example
   * const analysis = lazyLoader.analyzeBundleComposition();
   * console.log('Bundle size:', analysis.totalSize);
   * console.log('Optimization suggestions:', analysis.suggestions);
   */
  analyzeBundleComposition() {
    const analysis = {
      totalSize: 0,
      moduleCount: this.loadedModules.size,
      largestModules: [],
      unusedModules: [],
      criticalPath: [],
      suggestions: []
    };

    // Calculate total size and identify large modules
    for (const [path, _module] of this.loadedModules) {
      const size = this.moduleSizes.get(path) || 0;
      analysis.totalSize += size;

      if (size > 50 * 1024) { // Modules larger than 50KB
        analysis.largestModules.push({ path, size });
      }

      const usage = this.usageFrequency.get(path) || 0;
      if (usage === 0) {
        analysis.unusedModules.push(path);
      }
    }

    // Sort largest modules by size
    analysis.largestModules.sort((a, b) => b.size - a.size);

    // Generate optimization suggestions
    if (analysis.totalSize > this.maxChunkSize * 3) {
      analysis.suggestions.push('Consider more aggressive code splitting');
    }

    if (analysis.largestModules.length > 0) {
      analysis.suggestions.push('Large modules detected - consider breaking them down');
    }

    if (analysis.unusedModules.length > 0) {
      analysis.suggestions.push('Unused modules detected - implement tree shaking');
    }

    return analysis;
  }

  /**
   * Track module usage for optimization
   *
   * @method trackModuleUsage
   * @param {string} modulePath - Path of used module
   * @returns {void}
   *
   * @example
   * lazyLoader.trackModuleUsage('/src/js/modules/export/exportManager.js');
   */
  trackModuleUsage(modulePath) {
    const currentUsage = this.usageFrequency.get(modulePath) || 0;
    this.usageFrequency.set(modulePath, currentUsage + 1);
  }

  /**
   * Get bundle optimization recommendations
   *
   * @method getOptimizationRecommendations
   * @returns {Array<string>} List of optimization recommendations
   *
   * @example
   * const recommendations = lazyLoader.getOptimizationRecommendations();
   * recommendations.forEach(rec => console.log('Recommendation:', rec));
   */
  getOptimizationRecommendations() {
    const recommendations = [];
    const analysis = this.analyzeBundleComposition();

    if (analysis.totalSize > 1024 * 1024) { // > 1MB
      recommendations.push('Bundle size is large - consider lazy loading more modules');
    }

    if (analysis.largestModules.length > 3) {
      recommendations.push('Multiple large modules detected - implement code splitting');
    }

    if (this.preloadQueue.length > 10) {
      recommendations.push('Large preload queue - prioritize critical modules');
    }

    const lowUsageModules = Array.from(this.usageFrequency.entries())
      .filter(([, usage]) => usage < 2)
      .length;

    if (lowUsageModules > 5) {
      recommendations.push('Many low-usage modules - consider lazy loading');
    }

    return recommendations;
  }

  // ------------ UTILITY METHODS

  /**
   * Utility delay function
   *
   * Creates a promise that resolves after the specified delay.
   * Used internally for retry backoff strategies.
   *
   * @method delay
   * @param {number} ms - Delay in milliseconds
   * @returns {Promise<void>} Promise that resolves after delay
   *
   * @example
   * await lazyLoader.delay(1000); // Wait 1 second
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ------------ MODULE EXPORTS AND GLOBAL REGISTRATION

/**
 * Export for ES6 module systems (modern bundlers, native ES modules)
 * Enables tree-shaking and modern import/export syntax.
 *
 * @default LazyLoader
 */
export default LazyLoader;
