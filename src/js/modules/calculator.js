/**
 * @file CALCULATOR.JS
 *
 * @version 2.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Main Calculator Module that orchestrates all calculator modules and provides
 * the primary API for calculator operations. Manages module initialization,
 * inter-module communication, and provides a unified interface for all
 * calculator functionality.
 *
 * Features:
 * - Module orchestration and lifecycle management
 * - Unified API for calculator operations
 * - Event system coordination
 * - State persistence management
 * - Export functionality
 * - Statistics and monitoring
 *
 * @module Calculator
 */

// ------------ TYPE DEFINITIONS

/**
 * @typedef {Object} CalculatorConfig
 * @property {boolean} [enableDebugMode=false] - Enable debug logging
 * @property {boolean} [autoSave=true] - Enable automatic state saving
 * @property {boolean} [vibrationEnabled=true] - Enable haptic feedback
 * @property {number} [maxHistorySize=50] - Maximum history entries
 * @property {number} [maxUndoSize=50] - Maximum undo stack size
 * @property {string} [theme='dark'] - Default theme
 * @property {boolean} [accessibilityMode=false] - Accessibility
 */

/**
 * @typedef {Object} ModuleCollection
 * @property {StateManager} state - State management module
 * @property {DisplayManager} display - Display management module
 * @property {OperationsEngine} operations - Mathematical operations module
 * @property {CalculatorStorageManager} storage - Storage management module
 * @property {ExportManager} export - Export functionality module
 */

/**
 * @typedef {Object} CalculatorStatistics
 * @property {string} version - Calculator version
 * @property {boolean} isInitialized - Initialization status
 * @property {Object} modules - Module statistics
 * @property {Object} systems - System statistics
 */

/**
 * @typedef {Object} ExportOptions
 * @property {string} [filename] - Custom filename for export
 * @property {boolean} [includeTimestamp=true] - Include timestamp in export
 * @property {string} [dateFormat='ISO'] - Date format for timestamps
 * @property {number} [maxEntries] - Maximum entries to export
 */

// ------------ MAIN CALCULATOR CLASS

/**
 * Main Calculator Class
 *
 * Orchestrates all calculator modules and provides the main API for calculator
 * operations. Manages initialization, module communication, and provides a
 * unified interface for all calculator functionality.
 *
 * @class Calculator
 */
class Calculator {
    /**
     * Create a new Calculator instance
     *
     * @constructor
     * @param {Object<string, any>} [loadedModules={}] - Pre-loaded module classes
     *
     * @example
     * const calculator = new Calculator(loadedModules);
     * await calculator.initialize(config);
     *

     */
    constructor(loadedModules = {}) {
        /** @type {ModuleCollection} Initialized calculator modules */
        this.modules = {};

        /** @type {Object<string, any>} Pre-loaded module classes */
        this.loadedModules = loadedModules;

        /** @type {boolean} Calculator initialization status */
        this.isInitialized = false;

        /** @type {string} Calculator version */
        this.version = '2.0.0';

        // ------------ CORE SYSTEM INSTANCES
        /** @type {InitializationManager|null} Module initialization manager */
        this.initializationManager = null;

        /** @type {EventSystem|null} Inter-module event system */
        this.eventSystem = null;

        /** @type {CalculationCoordinator|null} Calculation coordination system */
        this.calculationCoordinator = null;

        /** @type {StatePersistence|null} State persistence manager */
        this.statePersistence = null;

        /** @type {CalculatorAPI|null} Public API interface */
        this.calculatorAPI = null;
    }

    /**
     * Initialize the calculator with all modules
     *
     * Performs complete calculator initialization including module loading,
     * core system setup, inter-module communication, state restoration,
     * and event handler registration.
     *
     * @async
     * @method initialize
     * @param {CalculatorConfig} [config={}] - Configuration options
     * @returns {Promise<boolean>} True if initialization successful, false otherwise
     *
     * @throws {Error} When required modules are not available
     *
     * @example
     * const config = {
     *   enableDebugMode: false,
     *   autoSave: true,
     *   vibrationEnabled: true
     * };
     * const success = await calculator.initialize(config);
     *

     */
    async initialize(config = {}) {
        try {
            console.log(`🚀 Initializing Calculator v${  this.version}`);

            // ------------ INITIALIZATION MANAGER SETUP
            /** @type {typeof InitializationManager} */
            const InitializationManagerClass = this.loadedModules.InitializationManager;
            if (!InitializationManagerClass) {
                throw new Error('InitializationManager is not available');
            }
            this.initializationManager = new InitializationManagerClass(this.loadedModules);

            // ------------ MODULE INITIALIZATION
            console.log('📦 Initializing all calculator modules...');
            this.modules = await this.initializationManager.initializeAllModules(config);

            // ------------ CORE SYSTEMS INITIALIZATION
            console.log('⚙️ Initializing core systems...');
            await this.initializeCoreSystemsModules();

            // ------------ INTER-MODULE COMMUNICATION SETUP
            console.log('🔗 Setting up inter-module communication...');
            this.eventSystem.setupModuleCommunication(this.modules);

            // ------------ STATE RESTORATION
            console.log('💾 Loading saved state...');
            await this.statePersistence.loadSavedState(this.modules);

            // ------------ EVENT HANDLERS SETUP
            console.log('🎯 Setting up UI event handlers...');
            this.eventSystem.setupEventHandlers(this.calculatorAPI);

            this.isInitialized = true;
            console.log('✅ Calculator initialized successfully');

            return true;
        } catch (error) {
            console.error('❌ Calculator initialization failed:', error);
            return false;
        }
    }

    /**
     * Initialize core system modules
     *
     * Sets up the core systems that coordinate between modules including
     * event system, state persistence, calculation coordination, and API layer.
     *
     * @async
     * @method initializeCoreSystemsModules
     * @returns {Promise<void>} Resolves when all core systems are initialized
     *
     * @throws {Error} When required core system classes are not available
     *
     * @private

     */
    async initializeCoreSystemsModules() {
        // ------------ EVENT SYSTEM INITIALIZATION
        /** @type {typeof EventSystem} */
        const EventSystemClass = this.loadedModules.EventSystem;
        if (!EventSystemClass) {
            throw new Error('EventSystem is not available');
        }
        this.eventSystem = new EventSystemClass();
        console.log('✅ Event System initialized');

        // ------------ STATE PERSISTENCE INITIALIZATION
        /** @type {typeof StatePersistence} */
        const StatePersistenceClass = this.loadedModules.StatePersistence;
        if (!StatePersistenceClass) {
            throw new Error('StatePersistence is not available');
        }
        this.statePersistence = new StatePersistenceClass();
        console.log('✅ State Persistence initialized');

        // ------------ CALCULATION COORDINATOR INITIALIZATION
        /** @type {typeof CalculationCoordinator} */
        const CalculationCoordinatorClass = this.loadedModules.CalculationCoordinator;
        if (!CalculationCoordinatorClass) {
            throw new Error('CalculationCoordinator is not available');
        }
        this.calculationCoordinator = new CalculationCoordinatorClass(this.modules);
        this.calculationCoordinator.initialize();
        console.log('✅ Calculation Coordinator initialized');

        // ------------ CALCULATOR API INITIALIZATION
        /** @type {typeof CalculatorAPI} */
        const CalculatorAPIClass = this.loadedModules.CalculatorAPI;
        if (!CalculatorAPIClass) {
            throw new Error('CalculatorAPI is not available');
        }
        this.calculatorAPI = new CalculatorAPIClass(this.modules);
        this.calculatorAPI.initialize();
        console.log('✅ Calculator API initialized');

        console.log('🎯 Calculator: Core system modules initialized successfully');
    }





    // ------------ PUBLIC API METHODS - DELEGATE TO CALCULATOR API

    /**
     * Append number to current value
     *
     * Adds a digit to the current display value. Handles decimal points,
     * number formatting, and state management through the Calculator API.
     *
     * @method appendNumber
     * @param {string|number} number - Number or digit to append
     *
     * @example
     * calculator.appendNumber('5');
     * calculator.appendNumber(3);
     * calculator.appendNumber('.');
     *

     */
    appendNumber(number) {
        if (this.calculatorAPI) {
            this.calculatorAPI.appendNumber(number);
        }
    }

    /**
     * Set operator for calculation
     *
     * Sets the mathematical operator for the next calculation.
     * Handles operator precedence and expression building.
     *
     * @method setOperator
     * @param {string} operator - Mathematical operator (+, -, *, /, etc.)
     *
     * @example
     * calculator.setOperator('+');
     * calculator.setOperator('*');
     * calculator.setOperator('sin');
     *

     */
    setOperator(operator) {
        if (this.calculatorAPI) {
            this.calculatorAPI.setOperator(operator);
        }
    }

    /**
     * Perform calculation
     *
     * Executes the current mathematical expression and displays the result.
     * Handles error states and updates calculation history.
     *
     * @method calculate
     *
     * @example
     * calculator.appendNumber('5');
     * calculator.setOperator('+');
     * calculator.appendNumber('3');
     * calculator.calculate(); // Result: 8
     *

     */
    calculate() {
        if (this.calculatorAPI) {
            this.calculatorAPI.calculate();
        }
    }

    /**
     * Clear calculator state
     *
     * Resets the calculator to initial state. Optionally clears memory.
     *
     * @method clear
     * @param {boolean} [clearMemory=false] - Whether to clear memory storage
     *
     * @example
     * calculator.clear();           // Clear display and state
     * calculator.clear(true);       // Clear everything including memory
     *

     */
    clear(clearMemory = false) {
        if (this.calculatorAPI) {
            this.calculatorAPI.clear(clearMemory);
        }
    }

    /**
     * Undo last operation
     *
     * Reverts the calculator to the previous state in the undo stack.
     *
     * @method undo
     *
     * @example
     * calculator.undo(); // Reverts last operation
     *

     */
    undo() {
        if (this.calculatorAPI) {
            this.calculatorAPI.undo();
        }
    }

    /**
     * Redo last undone operation
     *
     * Re-applies the last undone operation from the redo stack.
     *
     * @method redo
     *
     * @example
     * calculator.redo(); // Re-applies last undone operation
     *

     */
    redo() {
        if (this.calculatorAPI) {
            this.calculatorAPI.redo();
        }
    }

    // ------------ EXPORT FUNCTIONALITY

    /**
     * Export calculation history
     *
     * Exports the calculator's calculation history in various formats
     * including CSV, PDF, JSON, and TXT. Provides user feedback and
     * error handling.
     *
     * @async
     * @method exportHistory
     * @param {string} [format='csv'] - Export format ('csv', 'pdf', 'json', 'txt')
     * @param {ExportOptions} [options={}] - Export configuration options
     * @returns {Promise<void>} Resolves when export is complete
     *
     * @example
     * // Export as CSV
     * await calculator.exportHistory('csv');
     *
     * // Export as PDF with custom options
     * await calculator.exportHistory('pdf', {
     *   filename: 'my-calculations',
     *   includeTimestamp: true,
     *   maxEntries: 100
     * });
     *

     */
    async exportHistory(format = 'csv', options = {}) {
        if (!this.isInitialized) {
            console.warn('⚠️ Calculator not initialized, cannot export history');
            return;
        }

        try {
            console.log(`📤 Exporting history as ${format.toUpperCase()}...`);

            /** @type {Object} */
            const state = this.modules.state.getState();

            await this.modules.export.exportHistory(state.history, format, options);

            this.modules.display.showToast(`History exported as ${format.toUpperCase()}`);
            console.log(`✅ History export completed successfully`);
        } catch (error) {
            const errorMessage = `Export failed: ${error.message}`;
            this.modules.display.showToast(errorMessage);
            console.error('❌ Export error:', error);
        }
    }

    // ------------ EVENT SYSTEM DELEGATION

    /**
     * Add event listener
     *
     * Registers an event listener for calculator events through the event system.
     *
     * @method on
     * @param {string} event - Event name to listen for
     * @param {Function} callback - Callback function to execute
     *
     * @example
     * calculator.on('calculation-complete', (result) => {
     *   console.log('Calculation result:', result);
     * });
     *

     */
    on(event, callback) {
        if (this.eventSystem) {
            this.eventSystem.on(event, callback);
        }
    }

    /**
     * Emit event
     *
     * Triggers an event through the calculator's event system.
     *
     * @method emit
     * @param {string} event - Event name to emit
     * @param {...any} args - Arguments to pass to event listeners
     *
     * @example
     * calculator.emit('custom-event', data1, data2);
     *

     */
    emit(event, ...args) {
        if (this.eventSystem) {
            this.eventSystem.emit(event, ...args);
        }
    }

    /**
     * Get comprehensive calculator statistics
     *
     * Returns detailed statistics about the calculator's current state,
     * module performance, and system health.
     *
     * @method getStatistics
     * @returns {CalculatorStatistics} Comprehensive calculator statistics
     *
     * @example
     * const stats = calculator.getStatistics();
     * console.log('Calculator version:', stats.version);
     * console.log('Modules loaded:', Object.keys(stats.modules));
     *

     */
    getStatistics() {
        if (!this.isInitialized) {
            return { error: 'Calculator not initialized' };
        }

        /** @type {CalculatorStatistics} */
        const stats = {
            version: this.version,
            isInitialized: this.isInitialized,
            modules: {
                state: this.modules.state ? this.modules.state.getStatistics() : null,
                display: this.modules.display ? this.modules.display.getStatistics() : null,
                storage: this.modules.storage ? this.modules.storage.getStorageStats() : null
            },
            systems: {}
        };

        // Add system statistics
        if (this.eventSystem) {
            stats.systems.eventSystem = this.eventSystem.getStatistics();
        }
        if (this.calculationCoordinator) {
            stats.systems.calculationCoordinator = this.calculationCoordinator.getStatistics();
        }
        if (this.calculatorAPI) {
            stats.systems.calculatorAPI = this.calculatorAPI.getStatistics();
        }
        if (this.statePersistence) {
            stats.systems.statePersistence = this.statePersistence.getStatistics(this.modules);
        }

        return stats;
    }

    /**
     * Get current calculator display value
     *
     * Returns the current value shown in the calculator display.
     *
     * @method getCurrentValue
     * @returns {string} Current display value
     *
     * @example
     * const currentValue = calculator.getCurrentValue();
     * console.log('Current display:', currentValue);
     *

     */
    getCurrentValue() {
        if (this.calculatorAPI) {
            return this.calculatorAPI.getCurrentValue();
        }
        return '0';
    }

    /**
     * Cleanup and destroy calculator instance
     *
     * Performs complete cleanup of all calculator systems, modules, and
     * resources. Should be called when the calculator is no longer needed.
     *
     * @method destroy
     *
     * @example
     * // Clean shutdown
     * calculator.destroy();
     *

     */
    destroy() {
        console.log('🧹 Starting calculator cleanup...');

        // ------------ CLEANUP CORE SYSTEMS
        if (this.eventSystem) {
            this.eventSystem.cleanup();
            console.log('✅ Event system cleaned up');
        }
        if (this.calculationCoordinator) {
            this.calculationCoordinator.cleanup();
            console.log('✅ Calculation coordinator cleaned up');
        }
        if (this.statePersistence) {
            this.statePersistence.cleanup();
            console.log('✅ State persistence cleaned up');
        }
        if (this.initializationManager) {
            this.initializationManager.cleanup();
            console.log('✅ Initialization manager cleaned up');
        }

        // ------------ CLEANUP MODULES
        if (this.modules.display) {
            this.modules.display.destroy();
            console.log('✅ Display module cleaned up');
        }

        // ------------ RESET ALL REFERENCES
        this.modules = {};
        this.eventSystem = null;
        this.calculationCoordinator = null;
        this.statePersistence = null;
        this.calculatorAPI = null;
        this.initializationManager = null;
        this.isInitialized = false;

        console.log('✅ Calculator cleanup completed successfully');
    }
}

// ------------ MODULE EXPORT


export default Calculator;
