/**
 * @file MODULE_LOADER.JS
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Handles dynamic loading and initialization of calculator modules with
 * dependency resolution, error handling, and legacy compatibility.
 *
 * Features:
 * - Dynamic module loading with dependency resolution
 * - Priority-based loading order
 * - Module caching and reloading capabilities
 * - Legacy API compatibility layer
 * - Error handling and fallback mechanisms
 * - Accessibility features and keyboard navigation
 *
 * @module ModuleLoader
 */

// ------------ TYPE DEFINITIONS

/**
 * @typedef {Object} ModuleConfig
 * @property {string} path - Relative path to module file
 * @property {string[]} dependencies - Array of module dependencies
 * @property {number} priority - Loading priority (1=highest, 4=lowest)
 */

/**
 * @typedef {Object} LoadingStats
 * @property {number} totalModules - Total number of modules configured
 * @property {number} loadedModules - Number of successfully loaded modules
 * @property {number} loadingModules - Number of modules currently loading
 * @property {string[]} loadedModuleNames - Names of loaded modules
 * @property {string[]} loadingModuleNames - Names of modules being loaded
 */

/**
 * @typedef {Object} CustomFormula
 * @property {string} name - Formula name
 * @property {string} expression - Mathematical expression
 * @property {string[]} variables - Array of variable names
 * @property {string} created - ISO date string of creation
 */

/**
 * @typedef {Object} Calculator
 * @property {Object} modules - Collection of calculator modules
 * @property {Function} appendNumber - Append number to display
 * @property {Function} setOperator - Set mathematical operator
 * @property {Function} calculate - Perform calculation
 * @property {Function} clear - Clear calculator state
 * @property {Function} undo - Undo last operation
 * @property {Function} redo - Redo last undone operation
 * @property {Function} exportHistory - Export calculation history
 */

// ------------ MODULE LOADER CLASS
/**
 * Dynamic Module Loading System
 *
 * Manages the loading, initialization, and dependency resolution of calculator modules.
 * Provides caching, error handling, and module lifecycle management.
 *
 * @class ModuleLoader
 */
export class ModuleLoader {
    /**
     * Create a new ModuleLoader instance
     *
     * @constructor

     */
    constructor() {
        /** @type {Map<string, any>} Cache of loaded modules */
        this.modules = new Map();

        /** @type {Set<string>} Set of successfully loaded module names */
        this.loadedModules = new Set();

        /** @type {Map<string, Promise<any>>} Map of ongoing loading promises */
        this.loadingPromises = new Map();

        /** @type {string} Base path for module files */
        this.basePath = '/src/js/modules/';

        /** @type {LazyLoader|null} Lazy loading utility */
        this.lazyLoader = null;

        /** @type {BundleAnalyzer|null} Bundle analysis utility */
        this.bundleAnalyzer = null;

        /** @type {Set<string>} Critical modules that should be loaded immediately */
        this.criticalModules = new Set([
            'StateManager',
            'OperationsEngine',
            'DisplayManager',
            'CalculatorAPI'
        ]);

        /** @type {Set<string>} Modules that can be lazy loaded */
        this.lazyLoadableModules = new Set([
            'ExportManager',
            'ErrorBoundary',
            'FallbackComponents',
            'FallbackCalculator',
            'PerformanceMonitor',
            'BundleAnalyzer',
            'ServiceWorker'
        ]);

        /** @type {boolean} Whether to use aggressive code splitting */
        this.aggressiveCodeSplitting = true;

        /** @type {Object<string, ModuleConfig>} Module configuration with dependencies and priorities */
        this.moduleConfig = {
            // Core modules (loaded first)
            'StateManager': {
                path: 'core/state.js',
                dependencies: [],
                priority: 1
            },
            'OperationsEngine': {
                path: 'core/operations.js',
                dependencies: [],
                priority: 1
            },
            'StorageManager': {
                path: 'storage/storageManager.js',
                dependencies: [],
                priority: 1
            },
            'FallbackStorage': {
                path: 'storage/fallbackStorage.js',
                dependencies: [],
                priority: 1
            },
            'InitializationManager': {
                path: 'core/initialization.js',
                dependencies: [],
                priority: 1
            },
            'EventSystem': {
                path: 'core/eventSystem.js',
                dependencies: [],
                priority: 1
            },
            'StatePersistence': {
                path: 'core/statePersistence.js',
                dependencies: [],
                priority: 1
            },
            'CalculationCoordinator': {
                path: 'core/calculationCoordinator.js',
                dependencies: [],
                priority: 1
            },
            // UI modules
            'DisplayManager': {
                path: 'ui/display.js',
                dependencies: [],
                priority: 2
            },
            // API modules
            'CalculatorAPI': {
                path: 'api/calculatorAPI.js',
                dependencies: [],
                priority: 2
            },
            // Feature modules
            'ExportManager': {
                path: 'export/exportManager.js',
                dependencies: [],
                priority: 3
            },
            // Main calculator module (loaded last)
            'Calculator': {
                path: 'calculator.js',
                dependencies: ['StateManager', 'OperationsEngine', 'StorageManager', 'FallbackStorage', 'InitializationManager', 'EventSystem', 'StatePersistence', 'CalculationCoordinator', 'DisplayManager', 'CalculatorAPI', 'ExportManager'],
                priority: 4
            }
        };
    }

    /**
     * Load all modules in dependency order
     *
     * Loads all configured modules in priority order, ensuring dependencies
     * are resolved before dependent modules are loaded. Provides comprehensive
     * error handling and logging.
     *
     * @async
     * @method loadAllModules
     * @returns {Promise<Object<string, any>>} Object containing all loaded modules
     *
     * @throws {Error} When module loading fails
     *
     * @example
     * const moduleLoader = new ModuleLoader();
     * const modules = await moduleLoader.loadAllModules();
     * console.log('Loaded modules:', Object.keys(modules));
     *

     */
    async loadAllModules() {
        try {
            console.log('🔄 Starting module loading...');

            // Check if we're in production mode (modules are bundled)
            const isProduction = typeof __PROD__ !== 'undefined' ? __PROD__ :
                                (window.location.hostname !== 'localhost' &&
                                 window.location.hostname !== '127.0.0.1' &&
                                 !window.location.hostname.includes('dev'));

            console.log('🔍 Environment check:', {
                __PROD__: typeof __PROD__ !== 'undefined' ? __PROD__ : 'undefined',
                hostname: window.location.hostname,
                isProduction
            });

            if (isProduction) {
                console.log('🏭 Production mode detected - using bundled modules');
                return this.loadBundledModules();
            }

            // Sort modules by priority (1=highest priority, 4=lowest)
            /** @type {Array<[string, ModuleConfig]>} */
            const sortedModules = Object.entries(this.moduleConfig)
                .sort(([, a], [, b]) => a.priority - b.priority);

            console.log(`📦 Loading ${sortedModules.length} modules in priority order...`);

            // Load modules sequentially in priority order
            for (const [moduleName, config] of sortedModules) {
                console.log(`⏳ Loading module: ${moduleName} (priority: ${config.priority})`);
                await this.loadModule(moduleName);
            }

            console.log('✅ All modules loaded successfully');

            // Convert Map to Object for easier access
            /** @type {Object<string, any>} */
            const modulesObject = Object.fromEntries(this.modules);

            console.log('📋 Returning modules object:', Object.keys(modulesObject));
            console.log('🗄️ StorageManager in modules:', typeof modulesObject.StorageManager);

            return modulesObject;

        } catch (error) {
            console.error('❌ Module loading failed:', error);
            throw new Error(`Module loading failed: ${error.message}`);
        }
    }

    /**
     * Load bundled modules in production mode
     *
     * In production, modules are bundled by Vite and should be available
     * in the global scope or through static imports. This method creates
     * a modules object using the bundled modules.
     *
     * @async
     * @method loadBundledModules
     * @returns {Promise<Object<string, any>>} Object containing all bundled modules
     *
     * @throws {Error} When bundled modules are not available
     *
     * @example
     * const modules = await moduleLoader.loadBundledModules();
     */
    async loadBundledModules() {
        console.log('📦 Loading bundled modules for production...');

        try {
            // In production, modules should be available globally or through imports
            const modules = {};

            // Try to get modules from global scope first (fallback compatibility)
            const moduleNames = Object.keys(this.moduleConfig);

            for (const moduleName of moduleNames) {
                try {
                    if (window[moduleName] && typeof window[moduleName] === 'function') {
                        modules[moduleName] = window[moduleName];
                        console.log(`✅ Found bundled module in global scope: ${moduleName}`);
                    }
                } catch (error) {
                    console.warn(`⚠️ Error accessing global module ${moduleName}:`, error);
                }
            }

            // If we don't have enough modules from global scope, use fallback
            if (Object.keys(modules).length < moduleNames.length) {
                console.log('⚠️ Not all modules found in global scope, using bundled fallback strategy');
                const fallbackModules = this._getBundledFallbackModules();
                Object.assign(modules, fallbackModules);
            }

            // Validate that we have all required modules
            const missingModules = moduleNames.filter(name => !modules[name]);
            if (missingModules.length > 0) {
                console.warn('⚠️ Missing bundled modules:', missingModules);
                // TODO: Create modules for missing ones
                for (const moduleName of missingModules) {
                    modules[moduleName] = this._createPlaceholderModule(moduleName);
                }
            }

            console.log('✅ Bundled modules loaded:', Object.keys(modules));
            return modules;

        } catch (error) {
            console.error('❌ Failed to load bundled modules:', error);
            throw new Error(`Bundled module loading failed: ${error.message}`);
        }
    }

    /**
     * Helper to provide fallback bundled modules for production
     * @private
     * @returns {Object<string, any>}
     */
    _getBundledFallbackModules() {
        return {
            StateManager: window.StateManager || this._createPlaceholderModule('StateManager'),
            OperationsEngine: window.OperationsEngine || this._createPlaceholderModule('OperationsEngine'),
            StorageManager: window.CalculatorStorageManager || window.StorageManager || this._createPlaceholderModule('StorageManager'),
            FallbackStorage: window.FallbackStorage || this._createPlaceholderModule('FallbackStorage'),
            InitializationManager: window.InitializationManager || this._createPlaceholderModule('InitializationManager'),
            EventSystem: window.EventSystem || this._createPlaceholderModule('EventSystem'),
            StatePersistence: window.StatePersistence || this._createPlaceholderModule('StatePersistence'),
            CalculationCoordinator: window.CalculationCoordinator || this._createPlaceholderModule('CalculationCoordinator'),
            DisplayManager: window.DisplayManager || this._createPlaceholderModule('DisplayManager'),
            CalculatorAPI: window.CalculatorAPI || this._createPlaceholderModule('CalculatorAPI'),
            ExportManager: window.ExportManager || this._createPlaceholderModule('ExportManager'),
            Calculator: window.Calculator || this._createPlaceholderModule('Calculator')
        };
    }

    /**
     * Create a placeholder module for missing modules
     * @private
     * @param {string} moduleName - Name of the module
     * @returns {Function} Placeholder module constructor
     */
    _createPlaceholderModule(moduleName) {
        return class PlaceholderModule {
            constructor() {
                console.warn(`⚠️ Using placeholder for missing module: ${moduleName}`);
                this.moduleName = moduleName;
                this.isPlaceholder = true;
            }

            // Provide basic methods that might be called
            initialize() {
                console.warn(`⚠️ Placeholder ${moduleName}.initialize() called`);
                return Promise.resolve();
            }

            getState() {
                console.warn(`⚠️ Placeholder ${moduleName}.getState() called`);
                return {};
            }

            updateState() {
                console.warn(`⚠️ Placeholder ${moduleName}.updateState() called`);
            }

            // Catch-all for any other method calls
            [Symbol.for('nodejs.util.inspect.custom')]() {
                return `PlaceholderModule(${moduleName})`;
            }
        };
    }

    /**
     * Load a specific module with caching and dependency resolution
     *
     * Loads a single module by name, handling caching, dependency resolution,
     * and error recovery. Prevents duplicate loading and manages loading state.
     *
     * @async
     * @method loadModule
     * @param {string} moduleName - Name of the module to load
     * @returns {Promise<any>} The loaded module class or object
     *
     * @throws {Error} When module is unknown or loading fails
     *
     * @example
     * const storageManager = await moduleLoader.loadModule('StorageManager');
     * const calculator = new storageManager();
     *

     */
    async loadModule(moduleName) {
        // Return cached module if already loaded
        if (this.modules.has(moduleName)) {
            console.log(`📋 Using cached module: ${moduleName}`);
            return this.modules.get(moduleName);
        }

        // Return existing loading promise if module is currently being loaded
        if (this.loadingPromises.has(moduleName)) {
            console.log(`⏳ Waiting for ongoing load: ${moduleName}`);
            return this.loadingPromises.get(moduleName);
        }

        // Get module configuration
        /** @type {ModuleConfig} */
        const config = this.moduleConfig[moduleName];
        if (!config) {
            throw new Error(`Unknown module: ${moduleName}`);
        }

        // Create and cache loading promise to prevent duplicate loads
        /** @type {Promise<any>} */
        const loadingPromise = this.loadModuleInternal(moduleName, config);
        this.loadingPromises.set(moduleName, loadingPromise);

        try {
            /** @type {any} */
            const module = await loadingPromise;

            // Cache the loaded module
            this.modules.set(moduleName, module);
            this.loadedModules.add(moduleName);
            this.loadingPromises.delete(moduleName);

            console.log(`✅ Module loaded successfully: ${moduleName}`);
            return module;
        } catch (error) {
            // Clean up failed loading attempt
            this.loadingPromises.delete(moduleName);
            console.error(`❌ Failed to load module: ${moduleName}`, error);
            throw new Error(`Failed to load module ${moduleName}: ${error.message}`);
        }
    }

    /**
     * Internal module loading logic with dependency resolution
     *
     * Handles the actual loading process including dependency resolution,
     * script loading, and special cases like StorageManager conflicts.
     *
     * @async
     * @method loadModuleInternal
     * @param {string} moduleName - Name of the module to load
     * @param {ModuleConfig} config - Module configuration object
     * @returns {Promise<any>} The loaded module class or object
     *
     * @throws {Error} When module loading or instantiation fails
     *
     * @private
     */
    async loadModuleInternal(moduleName, config) {
        try {
            // ------------ DEPENDENCY RESOLUTION
            console.log(`🔗 Resolving dependencies for ${moduleName}:`, config.dependencies);

            // Load all dependencies first (recursive)
            const dependencyPromises = config.dependencies.map(async (dependency) => {
                console.log(`📦 Loading dependency: ${dependency} for ${moduleName}`);
                try {
                    return await this.loadModule(dependency);
                } catch (error) {
                    console.warn(`⚠️ Failed to load dependency ${dependency} for ${moduleName}:`, error);
                    // Continue with placeholder if dependency fails
                    return this._createPlaceholderModule(dependency);
                }
            });

            await Promise.all(dependencyPromises);

            // ------------ MODULE SCRIPT LOADING
            /** @type {string} */
            const moduleUrl = this._resolveModuleUrl(config.path);
            console.log(`📂 Loading script: ${moduleUrl}`);

            // Check if module is already available globally (hot reload scenario)
            if (window[moduleName] && typeof window[moduleName] === 'function') {
                console.log(`♻️ Module ${moduleName} already available globally`);
                return this._validateAndProcessModule(moduleName, window[moduleName]);
            }

            // Load module using dynamic import for ES6 modules
            let ModuleClass;
            try {
                const moduleExports = await import(/* @vite-ignore */ moduleUrl);
                ModuleClass = moduleExports.default || moduleExports[moduleName];
                console.log(`🔍 Module ${moduleName} loaded via import, type:`, typeof ModuleClass);
            } catch (importError) {
                console.warn(`⚠️ ES6 import failed for ${moduleName}, trying script loading:`, importError);

                // Fallback to script loading for legacy modules
                try {
                    await this.loadScript(moduleUrl);
                    ModuleClass = window[moduleName];
                    console.log(`🔍 Module ${moduleName} loaded via script, type:`, typeof ModuleClass);
                } catch (scriptError) {
                    console.error(`❌ Both import and script loading failed for ${moduleName}:`, scriptError);
                    // Return placeholder module as last resort
                    return this._createPlaceholderModule(moduleName);
                }
            }

            return this._validateAndProcessModule(moduleName, ModuleClass);

        } catch (error) {
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            throw new Error(`Failed to load module ${moduleName}: ${error.message}`);
        }
    }

    /**
     * Resolve module URL with environment-specific logic
     * @private
     * @param {string} path - Module path
     * @returns {string} Resolved module URL
     */
    _resolveModuleUrl(path) {
        // Handle different base paths for different environments
        const isAbsolutePath = path.startsWith('/') || path.startsWith('http');
        if (isAbsolutePath) {
            return path;
        }

        // Use relative path resolution
        const baseUrl = window.location.origin;
        const fullPath = this.basePath + path;

        // Ensure proper URL format
        return new URL(fullPath, baseUrl).href;
    }

    /**
     * Validate and process loaded module
     * @private
     * @param {string} moduleName - Name of the module
     * @param {any} ModuleClass - Loaded module class
     * @returns {any} Processed module class
     */
    _validateAndProcessModule(moduleName, ModuleClass) {
        // ------------ SPECIAL HANDLING FOR STORAGE MANAGER
        if (moduleName === 'StorageManager') {
            // Check if we got the native StorageManager instead of our custom one
            if (ModuleClass && (
                ModuleClass.toString().includes('[native code]') ||
                ModuleClass === window.StorageManager
            )) {
                console.log('⚠️ Detected native StorageManager conflict, resolving...');

                // Try to get our custom StorageManager
                if (window.CalculatorStorageManager) {
                    ModuleClass = window.CalculatorStorageManager;
                    console.log('✅ Using CalculatorStorageManager instead');
                } else {
                    console.warn('⚠️ CalculatorStorageManager not found, using placeholder');
                    return this._createPlaceholderModule(moduleName);
                }
            }
        }

        // ------------ FINAL VALIDATION
        if (!ModuleClass) {
            console.warn(`⚠️ Module ${moduleName} not found, using placeholder`);
            return this._createPlaceholderModule(moduleName);
        }

        if (typeof ModuleClass !== 'function') {
            console.warn(`⚠️ Module ${moduleName} is not a constructor function (type: ${typeof ModuleClass})`);
            // If it's an object with a default export, try to use that
            if (typeof ModuleClass === 'object' && ModuleClass.default) {
                ModuleClass = ModuleClass.default;
            }
        }

        return ModuleClass;
    }

    /**
     * Load script dynamically with error handling
     *
     * Dynamically loads a JavaScript file, with duplicate detection
     * and comprehensive error handling.
     *
     * @async
     * @method loadScript
     * @param {string} url - URL of the script to load
     * @returns {Promise<void>} Resolves when script is loaded
     *
     * @throws {Error} When script fails to load
     *
     * @example
     * await moduleLoader.loadScript('/src/js/modules/core/state.js');
     *

     */
    async loadScript(url) {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded to prevent duplicates
            /** @type {HTMLScriptElement|null} */
            const existingScript = document.querySelector(`script[src="${url}"]`);
            if (existingScript) {
                console.log(`📋 Script already loaded: ${url}`);
                resolve();
                return;
            }

            /** @type {HTMLScriptElement} */
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.defer = true;
            script.type = 'module';

            script.addEventListener('load', () => {
                console.log(`✅ Script loaded successfully: ${url}`);
                resolve();
            });

            script.onerror = () => {
                console.error(`❌ Failed to load script: ${url}`);
                reject(new Error(`Failed to load script: ${url}`));
            };

            document.head.append(script);
        });
    }

    /**
     * Get a loaded module by name
     *
     * @method getModule
     * @param {string} moduleName - Name of the module to retrieve
     * @returns {any|undefined} The loaded module or undefined if not found
     *
     * @example
     * const storageManager = moduleLoader.getModule('StorageManager');
     *

     */
    getModule(moduleName) {
        return this.modules.get(moduleName);
    }

    /**
     * Check if a module is loaded
     *
     * @method isModuleLoaded
     * @param {string} moduleName - Name of the module to check
     * @returns {boolean} True if the module is loaded
     *
     * @example
     * if (moduleLoader.isModuleLoaded('Calculator')) {
     *   console.log('Calculator module is ready');
     * }
     *

     */
    isModuleLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }

    /**
     * Get comprehensive loading statistics
     *
     * Provides detailed information about the current state of module loading,
     * including counts and lists of loaded and loading modules.
     *
     * @method getLoadingStats
     * @returns {LoadingStats} Object containing loading statistics
     *
     * @example
     * const stats = moduleLoader.getLoadingStats();
     * console.log(`Loaded ${stats.loadedModules}/${stats.totalModules} modules`);
     */
    getLoadingStats() {
        const stats = {
            totalModules: Object.keys(this.moduleConfig).length,
            loadedModules: this.loadedModules.size,
            loadingModules: this.loadingPromises.size,
            loadedModuleNames: [...this.loadedModules],
            loadingModuleNames: [...this.loadingPromises.keys()],
            loadingErrors: this.loadingErrors.length,
            totalLoadTime: this.totalLoadTime,
            averageLoadTime: this.loadedModules.size > 0 ? this.totalLoadTime / this.loadedModules.size : 0,
            bundleAnalysis: this.bundleAnalyzer?.generateReport() || null,
            memoryUsage: this._getMemoryUsage(),
            cacheHitRate: this._calculateCacheHitRate(),
            moduleHealth: this._getModuleHealth(),
            loadingTimeline: this.loadingTimeline || []
        };

        // Add performance recommendations
        stats.recommendations = this._generatePerformanceRecommendations(stats);

        return stats;
    }

    /**
     * Get module health status
     * @private
     * @returns {Object} Module health information
     */
    _getModuleHealth() {
        const health = {
            healthy: 0,
            placeholder: 0,
            failed: 0,
            total: this.modules.size
        };

        for (const [moduleName, moduleInstance] of this.modules) {
            try {
                if (moduleInstance && moduleInstance.isPlaceholder) {
                    health.placeholder++;
                } else if (typeof moduleInstance === 'function') {
                    health.healthy++;
                } else {
                    health.failed++;
                }
            } catch (error) {
                console.warn(`Error checking health of module ${moduleName}:`, error);
                health.failed++;
            }
        }

        return health;
    }

    /**
     * Generate performance recommendations
     * @private
     * @param {Object} stats - Current statistics
     * @returns {string[]} Array of recommendations
     */
    _generatePerformanceRecommendations(stats) {
        const recommendations = [];

        if (stats.averageLoadTime > 100) {
            recommendations.push('Consider implementing more aggressive lazy loading for better performance');
        }

        if (stats.moduleHealth.placeholder > 0) {
            recommendations.push(`${stats.moduleHealth.placeholder} modules are using placeholders - check module loading`);
        }

        if (stats.loadingErrors.length > 0) {
            recommendations.push(`${stats.loadingErrors.length} loading errors detected - review error logs`);
        }

        if (stats.cacheHitRate < 0.8) {
            recommendations.push('Low cache hit rate - consider implementing better caching strategies');
        }

        if (stats.loadedModules > 15) {
            recommendations.push('High number of modules loaded - consider module consolidation');
        }

        return recommendations;
    }

    /**
     * Get memory usage information
     * @private
     * @returns {Object} Memory usage information
     */
    _getMemoryUsage() {
        try {
            if (performance.memory) {
                return {
                    usedJSHeapSize: performance.memory.usedJSHeapSize,
                    totalJSHeapSize: performance.memory.totalJSHeapSize,
                    jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
                    usagePercentage: Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100)
                };
            }
        } catch (error) {
            console.warn('Memory usage information not available:', error);
        }

        return {
            usedJSHeapSize: 'unknown',
            totalJSHeapSize: 'unknown',
            jsHeapSizeLimit: 'unknown',
            usagePercentage: 'unknown'
        };
    }

    /**
     * Calculate cache hit rate
     * @private
     * @returns {number} Cache hit rate (0-1)
     */
    _calculateCacheHitRate() {
        const totalRequests = this.loadedModules.size + this.loadingErrors.length;
        if (totalRequests === 0) return 1;

        const successfulLoads = this.loadedModules.size;
        return successfulLoads / totalRequests;
    }

    /**
     * Add error boundary for module operations
     * @method addErrorBoundary
     * @param {Function} operation - Operation to wrap with error boundary
     * @param {string} context - Context description for error reporting
     * @returns {Function} Wrapped operation with error boundary
     */
    addErrorBoundary(operation, context) {
        return async (...args) => {
            try {
                return await operation(...args);
            } catch (error) {
                console.error(`❌ Error in ${context}:`, error);

                // Track error for statistics
                this.loadingErrors.push({
                    context,
                    error: error.message,
                    timestamp: Date.now(),
                    stack: error.stack
                });

                // Attempt recovery based on error type
                if (error.message.includes('Module not found') || error.message.includes('Failed to load')) {
                    console.log(`🔄 Attempting recovery for ${context}...`);
                    // Could implement retry logic here
                }

                // Re-throw error for caller to handle
                throw error;
            }
        };
    }

    /**
     * Initialize error monitoring and recovery
     * @method initializeErrorHandling
     */
    initializeErrorHandling() {
        // Global error handler for unhandled module errors
        window.addEventListener('error', (event) => {
            if (event.filename && event.filename.includes('/modules/')) {
                console.error('❌ Unhandled module error:', event.error);
                this.loadingErrors.push({
                    context: 'Global error handler',
                    error: event.message,
                    filename: event.filename,
                    timestamp: Date.now()
                });
            }
        });

        // Promise rejection handler for async module errors
        window.addEventListener('unhandledrejection', (event) => {
            if (event.reason && event.reason.message && event.reason.message.includes('module')) {
                console.error('❌ Unhandled module promise rejection:', event.reason);
                this.loadingErrors.push({
                    context: 'Unhandled promise rejection',
                    error: event.reason.message,
                    timestamp: Date.now()
                });
            }
        });

        console.log('🛡️ Error handling initialized');
    }

    /**
     * Reload a specific module
     *
     * Removes a module from cache and reloads it from scratch, useful for
     * development and hot reloading scenarios.
     *
     * @async
     * @method reloadModule
     * @param {string} moduleName - Name of the module to reload
     * @returns {Promise<any>} The reloaded module
     *
     * @throws {Error} When module reload fails
     *
     * @example
     * // Reload the Calculator module during development
     * const calculator = await moduleLoader.reloadModule('Calculator');
     *

     */
    async reloadModule(moduleName) {
        console.log(`🔄 Reloading module: ${moduleName}`);

        // Remove from all caches
        this.modules.delete(moduleName);
        this.loadedModules.delete(moduleName);

        // Cancel any ongoing loading promises
        if (this.loadingPromises.has(moduleName)) {
            this.loadingPromises.delete(moduleName);
        }

        // Remove script from DOM to force fresh load
        /** @type {ModuleConfig} */
        const config = this.moduleConfig[moduleName];
        if (config) {
            /** @type {string} */
            const scriptUrl = this.basePath + config.path;
            /** @type {HTMLScriptElement|null} */
            const script = document.querySelector(`script[src="${scriptUrl}"]`);
            if (script) {
                script.remove();
                console.log(`🗑️ Removed script from DOM: ${scriptUrl}`);
            }
        }

        // Reload module fresh
        console.log(`♻️ Reloading module: ${moduleName}`);
        return this.loadModule(moduleName);
    }

    /**
     * Unload all modules and clean up resources
     *
     * Completely clears all module caches and removes all loaded scripts
     * from the DOM. Useful for complete system reset.
     *
     * @method unloadAll
     *
     * @example
     * // Complete system reset
     * moduleLoader.unloadAll();
     *

     */
    unloadAll() {
        console.log('🧹 Unloading all modules...');

        // Clear all internal caches
        this.modules.clear();
        this.loadedModules.clear();
        this.loadingPromises.clear();

        // Remove all module scripts from DOM
        for (const config of Object.values(this.moduleConfig)) {
            /** @type {string} */
            const scriptUrl = this.basePath + config.path;
            /** @type {HTMLScriptElement|null} */
            const script = document.querySelector(`script[src="${scriptUrl}"]`);
            if (script) {
                script.remove();
                console.log(`🗑️ Removed script: ${scriptUrl}`);
            }
        }

        console.log('✅ All modules unloaded successfully');
    }

    // ------------ BUNDLE OPTIMIZATION METHODS

    /**
     * Initialize lazy loading system
     *
     * Sets up the lazy loading system for non-critical modules to improve
     * initial bundle size and loading performance.
     *
     * @async
     * @method initializeLazyLoading
     * @returns {Promise<void>}
     *
     * @example
     * await moduleLoader.initializeLazyLoading();
     */
    async initializeLazyLoading() {
        try {
            console.log('🚀 Initializing lazy loading system...');

            // Try to dynamically import LazyLoader
            try {
                const lazyLoaderModule = await import('./modules/performance/lazyLoader.js');
                const LazyLoader = lazyLoaderModule.default || lazyLoaderModule.LazyLoader;
                if (LazyLoader) {
                    this.lazyLoader = new LazyLoader();
                    console.log('✅ LazyLoader initialized');
                } else {
                    console.warn('⚠️ LazyLoader not found in module');
                }
            } catch (lazyLoaderError) {
                console.warn('⚠️ Failed to load LazyLoader:', lazyLoaderError);
                // Create a simple fallback lazy loader
                this.lazyLoader = this._createFallbackLazyLoader();
            }

            // Try to initialize bundle analyzer
            try {
                const bundleAnalyzerModule = await import('./modules/performance/bundleAnalyzer.js');
                const BundleAnalyzer = bundleAnalyzerModule.default || bundleAnalyzerModule.BundleAnalyzer;
                if (BundleAnalyzer) {
                    this.bundleAnalyzer = new BundleAnalyzer();
                    console.log('✅ BundleAnalyzer initialized');
                } else {
                    console.warn('⚠️ BundleAnalyzer not found in module');
                }
            } catch (bundleAnalyzerError) {
                console.warn('⚠️ Failed to load BundleAnalyzer:', bundleAnalyzerError);
                // Create a simple fallback bundle analyzer
                this.bundleAnalyzer = this._createFallbackBundleAnalyzer();
            }

            console.log('🚀 Lazy loading system initialized');
        } catch (error) {
            console.warn('⚠️ Failed to initialize lazy loading:', error);
            // Create fallback implementations
            this.lazyLoader = this._createFallbackLazyLoader();
            this.bundleAnalyzer = this._createFallbackBundleAnalyzer();
        }
    }

    /**
     * Create fallback lazy loader
     * @private
     * @returns {Object} Fallback lazy loader
     */
    _createFallbackLazyLoader() {
        return {
            loadModule: async (moduleName, loader) => {
                console.log(`🔄 Fallback lazy loading: ${moduleName}`);
                return await loader();
            },
            preloadModule: (moduleName, url, priority = 'low') => {
                console.log(`🔄 Fallback preloading: ${moduleName} (${priority})`);
                // Simple preload using link rel="prefetch"
                const link = document.createElement('link');
                link.rel = priority === 'high' ? 'preload' : 'prefetch';
                link.as = 'script';
                link.href = url;
                document.head.appendChild(link);
            }
        };
    }

    /**
     * Create fallback bundle analyzer
     * @private
     * @returns {Object} Fallback bundle analyzer
     */
    _createFallbackBundleAnalyzer() {
        return {
            trackUsage: (moduleUrl) => {
                console.log(`📊 Fallback tracking usage: ${moduleUrl}`);
            },
            generateReport: () => {
                console.log('📊 Fallback generating bundle report');
                return {
                    totalSize: 'unknown',
                    moduleCount: this.modules.size,
                    recommendations: ['Use proper bundle analyzer for detailed insights']
                };
            }
        };
    }

    /**
     * Load module with lazy loading strategy
     *
     * Loads modules using lazy loading strategies based on priority and usage patterns.
     * Critical modules are loaded immediately, while others are loaded on demand.
     *
     * @async
     * @method loadModuleLazy
     * @param {string} moduleName - Name of the module to load
     * @param {boolean} [immediate=false] - Whether to load immediately
     * @returns {Promise<any>} The loaded module
     *
     * @example
     * // Load critical module immediately
     * const stateManager = await moduleLoader.loadModuleLazy('StateManager', true);
     *
     * // Load non-critical module lazily
     * const exportManager = await moduleLoader.loadModuleLazy('ExportManager');
     */
    async loadModuleLazy(moduleName, immediate = false) {
        // Check if module is critical or should be loaded immediately
        const isCritical = this.criticalModules.has(moduleName);
        const shouldLoadImmediately = immediate || isCritical;

        if (shouldLoadImmediately) {
            console.log(`⚡ Loading critical module immediately: ${moduleName}`);
            return this.loadModule(moduleName);
        }

        // Use lazy loader if available
        if (this.lazyLoader && this.lazyLoadableModules.has(moduleName)) {
            console.log(`🔄 Lazy loading module: ${moduleName}`);

            const config = this.moduleConfig[moduleName];
            if (!config) {
                throw new Error(`Unknown module: ${moduleName}`);
            }

            const moduleUrl = this.basePath + config.path;

            return this.lazyLoader.loadModule(moduleName, async () => {
                await this.loadScript(moduleUrl);
                return window[moduleName];
            });
        }

        // Fallback to regular loading
        return this.loadModule(moduleName);
    }

    /**
     * Preload modules based on usage patterns
     *
     * Intelligently preloads modules that are likely to be needed soon
     * based on user behavior and usage patterns.
     *
     * @async
     * @method preloadModules
     * @param {Array<string>} [moduleNames] - Specific modules to preload
     * @returns {Promise<void>}
     *
     * @example
     * // Preload export functionality when user starts calculation
     * await moduleLoader.preloadModules(['ExportManager']);
     */
    async preloadModules(moduleNames = []) {
        if (!this.lazyLoader) {
            console.warn('⚠️ Lazy loader not initialized, skipping preload');
            return;
        }

        const modulesToPreload = moduleNames.length > 0
            ? moduleNames
            : [...this.lazyLoadableModules];

        console.log('🔄 Preloading modules:', modulesToPreload);

        for (const moduleName of modulesToPreload) {
            if (!this.isModuleLoaded(moduleName)) {
                try {
                    const config = this.moduleConfig[moduleName];
                    if (config) {
                        const moduleUrl = this.basePath + config.path;
                        this.lazyLoader.preloadModule(moduleName, moduleUrl, 'low');
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to preload module ${moduleName}:`, error);
                }
            }
        }
    }

    /**
     * Get bundle optimization report
     *
     * Generates a comprehensive report on bundle composition and optimization opportunities.
     *
     * @method getBundleReport
     * @returns {Object|null} Bundle analysis report
     *
     * @example
     * const report = moduleLoader.getBundleReport();
     * console.log('Bundle size:', report.totalSize);
     * console.log('Recommendations:', report.recommendations);
     */
    getBundleReport() {
        if (!this.bundleAnalyzer) {
            console.warn('⚠️ Bundle analyzer not initialized');
            return null;
        }

        // Track loaded modules in bundle analyzer
        for (const [moduleName, _module] of this.modules) {
            const config = this.moduleConfig[moduleName];
            if (config) {
                const moduleUrl = this.basePath + config.path;
                this.bundleAnalyzer.trackUsage(moduleUrl);
            }
        }

        return this.bundleAnalyzer.generateReport();
    }

    /**
     * Optimize loading order based on usage patterns
     *
     * Reorders module loading priorities based on actual usage patterns
     * and performance metrics.
     *
     * @method optimizeLoadingOrder
     * @returns {Array<string>} Optimized module loading order
     *
     * @example
     * const optimizedOrder = moduleLoader.optimizeLoadingOrder();
     * console.log('Optimized loading order:', optimizedOrder);
     */
    optimizeLoadingOrder() {
        const modules = Object.keys(this.moduleConfig);

        return modules.sort((a, b) => {
            // Critical modules first
            const aIsCritical = this.criticalModules.has(a);
            const bIsCritical = this.criticalModules.has(b);

            if (aIsCritical && !bIsCritical) {return -1;}
            if (!aIsCritical && bIsCritical) {return 1;}

            // Then by current priority
            const aPriority = this.moduleConfig[a].priority;
            const bPriority = this.moduleConfig[b].priority;

            return aPriority - bPriority;
        });
    }
}

// ------------ LEGACY COMPATIBILITY CLASS

/**
 * Legacy Compatibility Layer
 *
 * Provides backward compatibility with the old monolithic calculator structure
 * by exposing modern modular functionality through legacy global functions.
 * Ensures existing code and integrations continue to work seamlessly.
 *
 * @class LegacyCompatibility
 */
export class LegacyCompatibility {
    /**
     * Create a new LegacyCompatibility instance
     *
     * @constructor
     * @param {Calculator} calculator - The modern calculator instance
     *
     * @example
     * const calculator = new Calculator(modules);
     * const legacy = new LegacyCompatibility(calculator);
     *

     */
    constructor(calculator) {
        /** @type {Calculator} The modern calculator instance */
        this.calculator = calculator;

        // Initialize legacy API immediately
        this.setupLegacyAPI();
    }

    /**
     * Setup legacy API functions in global scope
     *
     * Exposes all calculator functionality through global functions
     * to maintain compatibility with existing HTML onclick handlers
     * and external integrations.
     *
     * @method setupLegacyAPI
     *
     * @example
     * // After setup, these global functions are available:
     * appendNumber('5');
     * setOperator('+');
     * calculate();
     *

     */
    setupLegacyAPI() {
        console.log('🔗 Setting up legacy API functions...');

        // ------------ BASIC CALCULATOR FUNCTIONS
        /** @type {Function} Append number to display */
        window.appendNumber = (number_) => this.calculator.appendNumber(number_);

        /** @type {Function} Set mathematical operator */
        window.setOperator = (op) => this.calculator.setOperator(op);

        /** @type {Function} Perform calculation or scientific function */
        window.calculate = (operation) => { this.handleCalculate(operation); };

        /** @type {Function} Clear all calculator state */
        window.clearAll = () => this.calculator.clear();

        /** @type {Function} Clear current entry (alias for clearAll) */
        window.clearEntry = () => this.calculator.clear();

        /** @type {Function} Undo last operation */
        window.undo = () => this.calculator.undo();

        /** @type {Function} Redo last undone operation */
        window.redo = () => this.calculator.redo();

        // ------------ MEMORY FUNCTIONS
        /** @type {Function} Clear memory */
        window.memoryClear = () => { this.memoryOperation('clear'); };

        /** @type {Function} Recall value from memory */
        window.memoryRecall = () => { this.memoryOperation('recall'); };

        /** @type {Function} Add current value to memory */
        window.memoryAdd = () => { this.memoryOperation('add'); };

        /** @type {Function} Subtract current value from memory */
        window.memorySubtract = () => { this.memoryOperation('subtract'); };

        /** @type {Function} Store current value in memory */
        window.memoryStore = () => { this.memoryOperation('store'); };

        // ------------ EXPORT FUNCTIONS
        /** @type {Function} Export history in specified format */
        window.exportHistory = (format) => this.calculator.exportHistory(format);

        /** @type {Function} Export history as CSV */
        window.exportHistoryCSV = () => this.calculator.exportHistory('csv');

        /** @type {Function} Export history as PDF */
        window.exportHistoryPDF = () => this.calculator.exportHistory('pdf');

        /** @type {Function} Export history as JSON */
        window.exportHistoryJSON = () => this.calculator.exportHistory('json');

        // ------------ UTILITY FUNCTIONS
        /** @type {Function} Append decimal point */
        window.appendDecimal = () => this.calculator.appendNumber('.');

        /** @type {Function} Delete last character */
        window.backspace = () => { this.backspaceOperation(); };

        /** @type {Function} Toggle between degrees and radians */
        window.toggleDegRad = () => { this.toggleAngleMode(); };

        /** @type {Function} Handle bracket input */
        window.appendBracket = (type) => { this.handleBracket(type); };

        // ------------ MODAL AND UI FUNCTIONS
        /** @type {Function} Show calculation history modal */
        window.showHistory = () => { this.showHistoryModal(); };

        /** @type {Function} Close history modal */
        window.closeHistoryModal = () => { this.closeHistoryModal(); };

        /** @type {Function} Show keyboard shortcuts modal */
        window.showKeyboardShortcuts = () => { this.showKeyboardShortcuts(); };

        /** @type {Function} Close keyboard shortcuts modal */
        window.closeKeyboardShortcuts = () => { this.closeKeyboardShortcuts(); };

        // ------------ ADVANCED FEATURE FUNCTIONS
        /** @type {Function} Show formula manager modal */
        window.showFormulaManager = () => { this.showFormulaManager(); };

        /** @type {Function} Toggle accessibility mode */
        window.toggleAccessibilityMode = () => { this.toggleAccessibilityMode(); };

        console.log('✅ Legacy API compatibility layer initialized successfully');
    }

    /**
     * Handle calculate operations with legacy support
     *
     * Provides backward compatibility for both regular calculations
     * and scientific function calls through the legacy API.
     *
     * @method handleCalculate
     * @param {string} [operation] - Optional scientific operation to perform
     *
     * @example
     * // Regular calculation
     * handleCalculate();
     *
     * // Scientific function
     * handleCalculate('sin');
     *

     */
    handleCalculate(operation) {
        if (!operation || operation === 'equals') {
            // Regular calculation
            this.calculator.calculate();
            return;
        }

        const state = this.calculator.modules.state.getState();
        const currentValue = Number.parseFloat(state.currentValue) || 0;

        try {
            let result;

            switch (operation) {
                case 'sin': {
                    result = this.calculator.modules.operations.sin(currentValue, state.isDegree);
                    break;
                }
                case 'cos': {
                    result = this.calculator.modules.operations.cos(currentValue, state.isDegree);
                    break;
                }
                case 'tan': {
                    result = this.calculator.modules.operations.tan(currentValue, state.isDegree);
                    break;
                }
                case 'log': {
                    result = this.calculator.modules.operations.log10(currentValue);
                    break;
                }
                case 'ln': {
                    result = this.calculator.modules.operations.ln(currentValue);
                    break;
                }
                case 'sqrt': {
                    result = this.calculator.modules.operations.sqrt(currentValue);
                    break;
                }
                case 'pow': {
                    result = this.calculator.modules.operations.power(currentValue, 2);
                    break;
                }
                case 'exp': {
                    result = Math.exp(currentValue);
                    break;
                }
                case 'factorial': {
                    result = this.calculator.modules.operations.factorial(currentValue);
                    break;
                }
                default: {
                    // Regular calculation
                    this.calculator.calculate();
                    return;
                }
            }

            // Update state with result
            const formattedResult = this.calculator.modules.operations.formatResult(result);
            const calculation = `${operation}(${currentValue}) = ${formattedResult}`;

            this.calculator.modules.state.updateState({
                currentValue: formattedResult,
                isNewNumber: true
            }, true);

            // Add to history
            this.calculator.modules.state.addToHistory(calculation);

            this.calculator.modules.display.vibrate(15);

        } catch (error) {
            this.calculator.modules.display.showError(error.message);
            console.error('Scientific calculation error:', error);
        }
    }

    /**
     * Handle memory operations
     *
     * Provides legacy support for memory functions (MC, MR, M+, M-, MS).
     *
     * @method memoryOperation
     * @param {string} operation - Memory operation ('clear', 'recall', 'add', 'subtract', 'store')
     *
     * @example
     * memoryOperation('store'); // MS
     * memoryOperation('recall'); // MR
     *

     */
    memoryOperation(operation) {
        const state = this.calculator.modules.state.getState();
        const currentValue = Number.parseFloat(state.currentValue) || 0;

        switch (operation) {
            case 'clear': {
                this.calculator.modules.state.updateState({ memory: 0 });
                this.calculator.modules.display.showToast('Memory cleared');
                break;
            }
            case 'recall': {
                this.calculator.modules.state.updateState({
                    currentValue: state.memory.toString(),
                    isNewNumber: true
                });
                break;
            }
            case 'add': {
                this.calculator.modules.state.updateState({
                    memory: state.memory + currentValue
                });
                this.calculator.modules.display.showToast('Added to memory');
                break;
            }
            case 'subtract': {
                this.calculator.modules.state.updateState({
                    memory: state.memory - currentValue
                });
                this.calculator.modules.display.showToast('Subtracted from memory');
                break;
            }
            case 'store': {
                this.calculator.modules.state.updateState({ memory: currentValue });
                this.calculator.modules.display.showToast('Stored in memory');
                break;
            }
        }
    }

    /**
     * Handle backspace operation
     *
     * Removes the last entered character or digit from the display.
     *
     * @method backspaceOperation
     *
     * @example
     * backspaceOperation(); // Removes last character
     *

     */
    backspaceOperation() {
        const state = this.calculator.modules.state.getState();

        if (state.isNewNumber) {return;}

        const newValue = state.currentValue.length > 1
            ? state.currentValue.slice(0, -1)
            : '0';

        // Handle bracket count adjustment
        const lastChar = state.currentValue.slice(-1);
        let {bracketCount} = state;

        if (lastChar === '(') {
            bracketCount = Math.max(0, bracketCount - 1);
        } else if (lastChar === ')') {
            bracketCount++;
        }

        this.calculator.modules.state.updateState({
            currentValue: newValue,
            isNewNumber: newValue === '0',
            bracketCount: newValue === '0' ? 0 : bracketCount
        });
    }

    /**
     * Toggle angle mode between degrees and radians
     *
     * Switches the calculator between degree and radian modes
     * for trigonometric calculations.
     *
     * @method toggleAngleMode
     *
     * @example
     * toggleAngleMode(); // Switches DEG ↔ RAD
     *

     */
    toggleAngleMode() {
        const state = this.calculator.modules.state.getState();
        const newMode = !state.isDegree;

        this.calculator.modules.state.updateState({ isDegree: newMode });

        // Update UI button if it exists
        const button = document.querySelector('[onclick="toggleDegRad()"]');
        if (button) {
            const span = button.querySelector('span');
            if (span) {
                span.textContent = newMode ? 'DEG' : 'RAD';
            }
        }

        this.calculator.modules.display.showToast(newMode ? 'Degree Mode' : 'Radian Mode');
    }

    /**
     * Handle bracket operations
     *
     * Manages opening and closing brackets for complex expressions.
     *
     * @method handleBracket
     * @param {string} type - Bracket type ('open', 'close', or 'auto')
     *
     * @example
     * handleBracket('open');  // Adds (
     * handleBracket('close'); // Adds )
     * handleBracket('auto');  // Smart bracket insertion
     *

     */
    handleBracket(type) {
        const state = this.calculator.modules.state.getState();
        let newValue = state.currentValue;
        let bracketCount = state.bracketCount || 0;

        switch (type) {
            case 'open': {
                newValue += '(';
                bracketCount++;
                break;
            }
            case 'close': {
                if (bracketCount > 0) {
                    newValue += ')';
                    bracketCount--;
                }
                break;
            }
            case 'auto': {
                if (bracketCount > 0) {
                    newValue += ')';
                    bracketCount--;
                } else {
                    newValue += '(';
                    bracketCount++;
                }
                break;
            }
        }

        this.calculator.modules.state.updateState({
            currentValue: newValue,
            bracketCount
        });
    }

    /**
     * Show history modal
     */
    showHistoryModal() {
        const modal = document.querySelector('#history-modal');
        const historyList = document.querySelector('#history-list');

        if (!modal || !historyList) {return;}

        const state = this.calculator.modules.state.getState();
        historyList.innerHTML = '';

        if (state.history && state.history.length > 0) {
            for (const [_index, calc] of state.history.slice(-10).reverse().entries()) {
                const li = document.createElement('li');
                li.textContent = calc;
                li.className = 'history-item';
                li.setAttribute('tabindex', '0');
                li.setAttribute('role', 'button');
                li.addEventListener('click', () => {
                    // Load calculation
                    const parts = calc.split(' = ');
                    if (parts.length === 2) {
                        this.calculator.modules.state.updateState({
                            currentValue: parts[1],
                            isNewNumber: true
                        });
                        this.closeHistoryModal();
                    }
                });
                historyList.append(li);
            }
        } else {
            const li = document.createElement('li');
            li.textContent = 'No history available';
            li.className = 'history-empty';
            historyList.append(li);
        }

        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }

    /**
     * Close history modal
     */
    closeHistoryModal() {
        const modal = document.querySelector('#history-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Show keyboard shortcuts modal
     */
    showKeyboardShortcuts() {
        // Create modal if it doesn't exist
        let modal = document.querySelector('#shortcuts-modal');
        if (!modal) {
            modal = this.createKeyboardShortcutsModal();
        }

        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
    }

    /**
     * Close keyboard shortcuts modal
     */
    closeKeyboardShortcuts() {
        const modal = document.querySelector('#shortcuts-modal');
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Create keyboard shortcuts modal
     */
    createKeyboardShortcutsModal() {
        const modal = document.createElement('div');
        modal.id = 'shortcuts-modal';
        modal.className = 'modal';
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Keyboard Shortcuts</h2>
                    <span class="close-modal" onclick="closeKeyboardShortcuts()" aria-label="Close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="shortcuts-grid">
                        <div class="shortcut-item">
                            <kbd>0-9</kbd>
                            <span>Numbers</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>+ - * /</kbd>
                            <span>Basic Operations</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Enter</kbd>
                            <span>Calculate (=)</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Escape</kbd>
                            <span>Clear All</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Backspace</kbd>
                            <span>Delete Last</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl+Z</kbd>
                            <span>Undo</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl+Y</kbd>
                            <span>Redo</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>.</kbd>
                            <span>Decimal Point</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.append(modal);
        return modal;
    }

    /**
     * Show formula manager
     */
    showFormulaManager() {
        // Create modal if it doesn't exist
        let modal = document.querySelector('#formula-modal');
        if (!modal) {
            modal = this.createFormulaManagerModal();
        }

        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        void this.loadCustomFormulas();
    }

    /**
     * Create formula manager modal
     */
    createFormulaManagerModal() {
        const modal = document.createElement('div');
        modal.id = 'formula-modal';
        modal.className = 'modal';
        modal.setAttribute('aria-hidden', 'true');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Formula Manager</h2>
                    <span class="close-modal" onclick="closeFormulaManager()" aria-label="Close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="formula-section">
                        <h3>Create New Formula</h3>
                        <div class="formula-input-group">
                            <input type="text" id="formula-name" placeholder="Formula name (e.g., 'area_circle')" />
                            <input type="text" id="formula-expression" placeholder="Expression (e.g., 'π * r²')" />
                            <input type="text" id="formula-variables" placeholder="Variables (e.g., 'r')" />
                            <button onclick="saveCustomFormula()" class="formula-btn">Save Formula</button>
                        </div>
                    </div>
                    <div class="formula-section">
                        <h3>Saved Formulas</h3>
                        <div id="formula-list" class="formula-list"></div>
                    </div>
                </div>
            </div>
        `;

        // Add close function to global scope
        window.closeFormulaManager = () => {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        };

        window.saveCustomFormula = async () => this.saveCustomFormula();

        document.body.append(modal);
        return modal;
    }

    /**
     * Load custom formulas
     */
    async loadCustomFormulas() {
        const state = this.calculator.modules.state.getState();
        const formulaList = document.querySelector('#formula-list');

        if (!formulaList) {return;}

        formulaList.innerHTML = '';

        if (state.customFormulas && state.customFormulas.length > 0) {
            for (const [index, formula] of state.customFormulas.entries()) {
                const formulaItem = document.createElement('div');
                formulaItem.className = 'formula-item';
                formulaItem.innerHTML = `
                    <div class="formula-info">
                        <strong>${formula.name}</strong>
                        <span>${formula.expression}</span>
                        <small>Variables: ${formula.variables.join(', ')}</small>
                    </div>
                    <div class="formula-actions">
                        <button onclick="useFormula(${index})" class="formula-btn use-btn">Use</button>
                        <button onclick="deleteFormula(${index})" class="formula-btn delete-btn">Delete</button>
                    </div>
                `;
                formulaList.append(formulaItem);
            }

            // Add global functions for formula actions
            window.useFormula = (index) => { this.useFormula(index); };
            window.deleteFormula = (index) => { this.deleteFormula(index); };
        } else {
            formulaList.innerHTML = '<p class="no-formulas">No custom formulas saved</p>';
        }
    }

    /**
     * Save custom formula
     */
    async saveCustomFormula() {
        const nameInput = document.querySelector('#formula-name');
        const expressionInput = document.querySelector('#formula-expression');
        const variablesInput = document.querySelector('#formula-variables');

        if (!nameInput || !expressionInput || !variablesInput) {return;}

        const name = nameInput.value.trim();
        const expression = expressionInput.value.trim();
        const variables = variablesInput.value.trim().split(',').map(v => v.trim()).filter(Boolean);

        if (!name || !expression) {
            this.calculator.modules.display.showToast('Please fill in name and expression');
            return;
        }

        const state = this.calculator.modules.state.getState();
        const customFormulas = state.customFormulas || [];

        const newFormula = {
            name,
            expression,
            variables,
            created: new Date().toISOString()
        };

        customFormulas.push(newFormula);

        this.calculator.modules.state.updateState({ customFormulas });

        // Clear inputs
        nameInput.value = '';
        expressionInput.value = '';
        variablesInput.value = '';

        this.calculator.modules.display.showToast('Formula saved successfully');
        void this.loadCustomFormulas();
    }

    /**
     * Use a custom formula
     */
    useFormula(index) {
        const state = this.calculator.modules.state.getState();
        const formula = state.customFormulas[index];

        if (!formula) {return;}

        // Insert the expression into the display for evaluation
        this.calculator.modules.state.updateState({
            currentValue: formula.expression,
            isNewNumber: false
        });

        window.closeFormulaManager();
        this.calculator.modules.display.showToast(`Using formula: ${formula.name}`);
    }

    /**
     * Delete a custom formula
     */
    deleteFormula(index) {
        const state = this.calculator.modules.state.getState();
        const customFormulas = [...(state.customFormulas || [])];

        if (index >= 0 && index < customFormulas.length) {
            const deletedFormula = customFormulas.splice(index, 1)[0];
            this.calculator.modules.state.updateState({ customFormulas });
            this.calculator.modules.display.showToast(`Deleted formula: ${deletedFormula.name}`);
            void this.loadCustomFormulas();
        }
    }

    /**
     * Toggle accessibility mode
     */
    toggleAccessibilityMode() {
        const {body} = document;
        const isAccessible = body.classList.contains('accessibility-mode');

        if (isAccessible) {
            body.classList.remove('accessibility-mode');
            this.calculator.modules.display.showToast('Accessibility mode disabled');
        } else {
            body.classList.add('accessibility-mode');
            this.calculator.modules.display.showToast('Accessibility mode enabled');
            this.setupAccessibilityFeatures();
        }

        // Save preference
        this.calculator.modules.storage.save('accessibility', !isAccessible);
    }

    /**
     * Setup accessibility features
     */
    setupAccessibilityFeatures() {
        // Keyboard navigation
        const buttons = document.querySelectorAll('.buttons-grid button');
        for (const [index, button] of buttons.entries()) {
            button.setAttribute('tabindex', '0');

            // Add keyboard navigation
            button.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowRight': {
                        e.preventDefault();
                        this.focusNextButton(buttons, index, 1);
                        break;
                    }
                    case 'ArrowLeft': {
                        e.preventDefault();
                        this.focusNextButton(buttons, index, -1);
                        break;
                    }
                    case 'ArrowDown': {
                        e.preventDefault();
                        this.focusNextButton(buttons, index, 4); // Assuming 4 columns
                        break;
                    }
                    case 'ArrowUp': {
                        e.preventDefault();
                        this.focusNextButton(buttons, index, -4);
                        break;
                    }
                    case 'Enter':
                    case ' ': {
                        e.preventDefault();
                        button.click();
                        break;
                    }
                }
            });
        }

        // Add screen reader announcements
        this.setupScreenReaderAnnouncements();
    }

    /**
     * Focus next button in grid
     */
    focusNextButton(buttons, currentIndex, direction) {
        const nextIndex = currentIndex + direction;
        if (nextIndex >= 0 && nextIndex < buttons.length) {
            buttons[nextIndex].focus();
        }
    }

    /**
     * Setup screen reader announcements
     */
    setupScreenReaderAnnouncements() {
        // Create live region for announcements
        let liveRegion = document.querySelector('#calculator-announcements');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'calculator-announcements';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.append(liveRegion);
        }

        // Override display update to include announcements
        const originalUpdateDisplay = this.calculator.modules.display.updateDisplay;
        this.calculator.modules.display.updateDisplay = function(value) {
            originalUpdateDisplay.call(this, value);
            liveRegion.textContent = `Display shows: ${value}`;
        };
    }
}

// Export for global use
window.ModuleLoader = ModuleLoader;
window.LegacyCompatibility = LegacyCompatibility;
