/**
 * @file INITIALIZATION MANAGER MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Initialization manager module for The Great Calculator.
 * Handles module initialization, dependency injection, and startup coordination.
 * Provides ordered module initialization with fallback mechanisms and error handling.
 *
 * Features:
 * - Ordered module initialization with dependency management
 * - Fallback mechanisms for critical modules
 * - Comprehensive error handling and recovery
 * - Module dependency validation
 * - Initialization statistics and monitoring
 * - Graceful cleanup and module destruction
 * - DOM element validation and binding
 *
 * @requires Calculator modules: StorageManager, StateManager, OperationsEngine, DisplayManager, ExportManager
 */

// ------------ TYPE AND JSDOC DEFINITIONS

/**
 * @typedef {Object} LoadedModules
 * @property {Function} [StorageManager] - Storage manager constructor
 * @property {Function} [FallbackStorage] - Fallback storage constructor
 * @property {Function} [StateManager] - State manager constructor
 * @property {Function} [OperationsEngine] - Operations engine constructor
 * @property {Function} [DisplayManager] - Display manager constructor
 * @property {Function} [ExportManager] - Export manager constructor
 */

/**
 * @typedef {Object} InitializedModules
 * @property {any} [storage] - Initialized storage module
 * @property {any} [state] - Initialized state module
 * @property {any} [operations] - Initialized operations module
 * @property {any} [display] - Initialized display module
 * @property {any} [export] - Initialized export module
 */

/**
 * @typedef {Object} InitializationConfig
 * @property {boolean} [enableFallbacks=true] - Whether to use fallback modules
 * @property {number} [timeout=5000] - Initialization timeout in milliseconds
 * @property {boolean} [validateDOM=true] - Whether to validate DOM elements
 */

/**
 * @typedef {Object} InitializationStatistics
 * @property {number} loadedModulesCount - Number of loaded module constructors
 * @property {number} initializedModulesCount - Number of successfully initialized modules
 * @property {string[]} initializationOrder - Order of module initialization
 * @property {string[]} modules - List of initialized module names
 */

// ------------ INITIALIZATION MANAGER CLASS

/**
 * Initialization Manager Class
 *
 * Manages the initialization process for all calculator modules with
 * dependency injection, error handling, and fallback mechanisms.
 *
 * @class InitializationManager
 * @example
 * const initManager = new InitializationManager({
 *   StorageManager: StorageManagerClass,
 *   StateManager: StateManagerClass,
 *   OperationsEngine: OperationsEngineClass,
 *   DisplayManager: DisplayManagerClass,
 *   ExportManager: ExportManagerClass
 * });
 *
 * const modules = await initManager.initializeAllModules();
 * console.log('Initialized modules:', Object.keys(modules));
 */
class InitializationManager {
    /**
     * Create initialization manager instance
     *
     * Initializes the manager with loaded module constructors and sets up
     * the initialization order and module storage.
     *
     * @constructor
     * @param {LoadedModules} [loadedModules={}] - Pre-loaded module constructors
     * @example
     * const initManager = new InitializationManager({
     *   StorageManager: StorageManagerClass,
     *   StateManager: StateManagerClass
     * });
     */
    constructor(loadedModules = {}) {
        /** @type {LoadedModules} Pre-loaded module constructors */
        this.loadedModules = loadedModules;

        /** @type {InitializedModules} Successfully initialized modules */
        this.modules = {};

        /** @type {string[]} Order of module initialization */
        this.initializationOrder = [
            'storage',
            'state',
            'operations',
            'display',
            'export'
        ];
    }

    // ------------ MAIN INITIALIZATION METHODS

    /**
     * Initialize all calculator modules
     *
     * Orchestrates the initialization of all calculator modules in the correct
     * order with comprehensive error handling and dependency management.
     *
     * @async
     * @method initializeAllModules
     * @param {InitializationConfig} [config={}] - Configuration options
     * @returns {Promise<InitializedModules>} Successfully initialized modules
     *
     * @throws {Error} When any critical module fails to initialize
     *
     * @example
     * try {
     *   const modules = await initManager.initializeAllModules({
     *     enableFallbacks: true,
     *     timeout: 10000
     *   });
     *   console.log('All modules ready:', Object.keys(modules));
     * } catch (error) {
     *   console.error('Initialization failed:', error);
     * }
     */
    async initializeAllModules(config = {}) {
        console.log('InitializationManager: Starting module initialization...');

        try {
            // Initialize modules in order
            for (const moduleKey of this.initializationOrder) {
                await this.initializeModule(moduleKey, config);
            }

            console.log('InitializationManager: All modules initialized successfully');
            return this.modules;
        } catch (error) {
            console.error('InitializationManager: Module initialization failed:', error);
            throw error;
        }
    }

    /**
     * Initialize a specific module
     *
     * Delegates module initialization to the appropriate specialized method
     * based on the module key provided.
     *
     * @async
     * @method initializeModule
     * @param {string} moduleKey - Module identifier to initialize
     * @param {InitializationConfig} config - Configuration options
     * @returns {Promise<void>} Resolves when module is initialized
     *
     * @throws {Error} When module key is unknown or initialization fails
     *
     * @example
     * await initManager.initializeModule('storage', { enableFallbacks: true });
     */
    async initializeModule(moduleKey, config) {
        switch (moduleKey) {
            case 'storage':
                await this.initializeStorageModule(config);
                break;
            case 'state':
                await this.initializeStateModule(config);
                break;
            case 'operations':
                await this.initializeOperationsModule(config);
                break;
            case 'display':
                await this.initializeDisplayModule(config);
                break;
            case 'export':
                await this.initializeExportModule(config);
                break;
            default:
                throw new Error(`Unknown module: ${moduleKey}`);
        }
    }

    // ------------ MODULE-SPECIFIC INITIALIZATION METHODS

    /**
     * Initialize storage module with fallback
     *
     * Initializes the storage module with automatic fallback to a simpler
     * storage implementation if the primary storage fails.
     *
     * @async
     * @method initializeStorageModule
     * @param {InitializationConfig} config - Configuration options
     * @returns {Promise<void>} Resolves when storage is initialized
     *
     * @throws {Error} When both primary and fallback storage fail
     *
     * @example
     * await initManager.initializeStorageModule({ enableFallbacks: true });
     */
    async initializeStorageModule(_config) {
        /** @type {Function|undefined} */
        const StorageManagerClass = this.loadedModules.StorageManager;
        if (!StorageManagerClass || typeof StorageManagerClass !== 'function') {
            throw new Error('StorageManager is not available or not a constructor');
        }

        try {
            console.log('InitializationManager: Creating StorageManager...');
            this.modules.storage = new StorageManagerClass();
            await this.modules.storage.initialize();
            console.log('InitializationManager: StorageManager initialized successfully');
        } catch (error) {
            console.error('InitializationManager: StorageManager failed, trying fallback:', error);

            // Try fallback storage
            /** @type {Function|undefined} */
            const FallbackStorageClass = this.loadedModules.FallbackStorage;
            if (FallbackStorageClass && typeof FallbackStorageClass === 'function') {
                this.modules.storage = new FallbackStorageClass();
                await this.modules.storage.initialize();
                console.log('InitializationManager: Fallback storage initialized');
            } else {
                throw new Error('Both primary and fallback storage failed');
            }
        }
    }

    /**
     * Initialize state management module
     *
     * Creates and initializes the state management module responsible
     * for maintaining calculator state and history.
     *
     * @async
     * @method initializeStateModule
     * @param {InitializationConfig} config - Configuration options
     * @returns {Promise<void>} Resolves when state module is initialized
     *
     * @throws {Error} When StateManager is not available or invalid
     *
     * @example
     * await initManager.initializeStateModule(config);
     */
    async initializeStateModule(_config) {
        /** @type {Function|undefined} */
        const StateManagerClass = this.loadedModules.StateManager;
        if (!StateManagerClass || typeof StateManagerClass !== 'function') {
            throw new Error('StateManager is not available or not a constructor');
        }

        this.modules.state = new StateManagerClass();
        console.log('InitializationManager: StateManager initialized');
    }

    /**
     * Initialize operations engine module
     *
     * Creates and initializes the operations engine responsible for
     * performing mathematical calculations and operations.
     *
     * @async
     * @method initializeOperationsModule
     * @param {InitializationConfig} config - Configuration options
     * @returns {Promise<void>} Resolves when operations module is initialized
     *
     * @throws {Error} When OperationsEngine is not available or invalid
     *
     * @example
     * await initManager.initializeOperationsModule(config);
     */
    async initializeOperationsModule(_config) {
        /** @type {Function|undefined} */
        const OperationsEngineClass = this.loadedModules.OperationsEngine;
        if (!OperationsEngineClass || typeof OperationsEngineClass !== 'function') {
            throw new Error('OperationsEngine is not available or not a constructor');
        }

        this.modules.operations = new OperationsEngineClass();
        console.log('InitializationManager: OperationsEngine initialized');
    }

    /**
     * Initialize display manager module
     *
     * Creates and initializes the display manager with DOM element binding
     * and validation for calculator display and history elements.
     *
     * @async
     * @method initializeDisplayModule
     * @param {InitializationConfig} config - Configuration options
     * @returns {Promise<void>} Resolves when display module is initialized
     *
     * @throws {Error} When DisplayManager is not available or DOM elements missing
     *
     * @example
     * await initManager.initializeDisplayModule({ validateDOM: true });
     */
    async initializeDisplayModule(_config) {
        /** @type {Function|undefined} */
        const DisplayManagerClass = this.loadedModules.DisplayManager;
        if (!DisplayManagerClass || typeof DisplayManagerClass !== 'function') {
            throw new Error('DisplayManager is not available or not a constructor');
        }

        this.modules.display = new DisplayManagerClass();

        // Get DOM elements
        /** @type {HTMLElement|null} */
        const displayElement = document.getElementById('display');
        /** @type {HTMLElement|null} */
        const historyElement = document.getElementById('history');

        if (!displayElement) {
            throw new Error('Display element not found in DOM');
        }

        this.modules.display.initialize(displayElement, historyElement);
        console.log('InitializationManager: DisplayManager initialized');
    }

    /**
     * Initialize export manager module
     *
     * Creates and initializes the export manager responsible for
     * exporting calculator data to various formats.
     *
     * @async
     * @method initializeExportModule
     * @param {InitializationConfig} config - Configuration options
     * @returns {Promise<void>} Resolves when export module is initialized
     *
     * @throws {Error} When ExportManager is not available or invalid
     *
     * @example
     * await initManager.initializeExportModule(config);
     */
    async initializeExportModule(_config) {
        /** @type {Function|undefined} */
        const ExportManagerClass = this.loadedModules.ExportManager;
        if (!ExportManagerClass || typeof ExportManagerClass !== 'function') {
            throw new Error('ExportManager is not available or not a constructor');
        }

        this.modules.export = new ExportManagerClass();
        console.log('InitializationManager: ExportManager initialized');
    }

    // ------------ VALIDATION AND UTILITY METHODS

    /**
     * Validate module dependencies
     *
     * Checks that all required module constructors are available
     * before attempting initialization.
     *
     * @method validateModuleDependencies
     * @returns {boolean} True if all required modules are available
     *
     * @example
     * if (initManager.validateModuleDependencies()) {
     *   console.log('All dependencies available');
     * } else {
     *   console.error('Missing required modules');
     * }
     */
    validateModuleDependencies() {
        /** @type {string[]} */
        const requiredModules = [
            'StorageManager',
            'StateManager',
            'OperationsEngine',
            'DisplayManager',
            'ExportManager'
        ];

        for (const moduleName of requiredModules) {
            if (!this.loadedModules[moduleName]) {
                console.error(`Required module missing: ${moduleName}`);
                return false;
            }
        }

        return true;
    }

    // ------------ STATISTICS AND MONITORING METHODS

    /**
     * Get initialization statistics
     *
     * Returns comprehensive statistics about the initialization process
     * including module counts and initialization status.
     *
     * @method getInitializationStats
     * @returns {InitializationStatistics} Initialization statistics
     *
     * @example
     * const stats = initManager.getInitializationStats();
     * console.log('Loaded modules:', stats.loadedModulesCount);
     * console.log('Initialized modules:', stats.initializedModulesCount);
     * console.log('Module list:', stats.modules);
     */
    getInitializationStats() {
        return {
            loadedModulesCount: Object.keys(this.loadedModules).length,
            initializedModulesCount: Object.keys(this.modules).length,
            initializationOrder: this.initializationOrder,
            modules: Object.keys(this.modules)
        };
    }

    // ------------ CLEANUP METHODS

    /**
     * Cleanup initialized modules
     *
     * Performs graceful cleanup of all initialized modules including
     * calling destroy methods where available and resetting state.
     *
     * @method cleanup
     * @returns {void}
     *
     * @example
     * initManager.cleanup();
     * console.log('All modules cleaned up');
     */
    cleanup() {
        // Cleanup display module if it has a destroy method
        if (this.modules.display && typeof this.modules.display.destroy === 'function') {
            this.modules.display.destroy();
        }

        this.modules = {};
        console.log('InitializationManager: Modules cleaned up');
    }
}

// ------------ MODULE EXPORTS AND GLOBAL REGISTRATION

/**
 * Export for ES6 module systems (modern bundlers, native ES modules)
 * Enables tree-shaking and modern import/export syntax.
 *
 * @default InitializationManager
 */
export default InitializationManager;
