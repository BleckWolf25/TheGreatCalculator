/**
 * @file STATE PERSISTENCE MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * State persistence module for The Great Calculator.
 * Handles loading and saving calculator state to storage with automatic
 * debounced saving, data export/import functionality, and comprehensive
 * state management across browser sessions.
 *
 * Features:
 * - Automatic state persistence with debounced saving
 * - Complete data export/import functionality
 * - Storage key management and organization
 * - Auto-save configuration and control
 * - Data validation and error handling
 * - Storage statistics and monitoring
 * - Cleanup and memory management
 * - Cross-session state restoration
 *
 * @requires Calculator modules: StorageManager, StateManager
 */

// ------------ TYPE AND JSDOC DEFINITIONS

/**
 * @typedef {Object} StorageKeys
 * @property {string} history - Key for calculation history storage
 * @property {string} memory - Key for memory value storage
 * @property {string} angleMode - Key for angle mode storage
 * @property {string} undoStack - Key for undo stack storage
 * @property {string} redoStack - Key for redo stack storage
 * @property {string} customFormulas - Key for custom formulas storage
 * @property {string} settings - Key for settings storage
 */

/**
 * @typedef {Object} CalculatorModules
 * @property {any} storage - Storage manager instance
 * @property {any} state - State manager instance
 */

/**
 * @typedef {Object} ExportData
 * @property {ExportMetadata} metadata - Export metadata information
 * @property {ExportDataContent} data - Actual calculator data
 */

/**
 * @typedef {Object} ExportMetadata
 * @property {string} exportDate - ISO date string of export
 * @property {string} version - Calculator version
 * @property {string} source - Source module name
 */

/**
 * @typedef {Object} ExportDataContent
 * @property {string[]} history - Calculation history
 * @property {number} memory - Memory value
 * @property {string} angleMode - Angle mode ('deg' or 'rad')
 * @property {any[]} customFormulas - Custom formulas array
 * @property {Object} settings - Calculator settings
 */

/**
 * @typedef {Object} PersistenceStatistics
 * @property {boolean} autoSaveEnabled - Whether auto-save is enabled
 * @property {number} saveDebounceTime - Debounce time in milliseconds
 * @property {boolean} hasPendingSave - Whether there's a pending save operation
 * @property {string[]} storageKeys - Array of storage keys used
 * @property {Object} [storageStats] - Storage statistics if available
 */

// ------------ STATE PERSISTENCE CLASS

/**
 * State Persistence Class
 *
 * Manages the persistence of calculator state across browser sessions
 * with automatic saving, data export/import, and comprehensive error handling.
 *
 * @class StatePersistence
 * @example
 * const persistence = new StatePersistence();
 *
 * // Load saved state
 * const loaded = await persistence.loadSavedState(modules);
 *
 * // Enable auto-save with debouncing
 * persistence.debouncedSave(modules);
 *
 * // Export all data
 * const exportData = await persistence.exportAllData(modules);
 */
class StatePersistence {
    /**
     * Create state persistence instance
     *
     * Initializes the persistence manager with storage keys, auto-save
     * configuration, and debouncing settings.
     *
     * @constructor
     * @example
     * const persistence = new StatePersistence();
     */
    constructor() {
        /** @type {StorageKeys} Storage keys for different data types */
        this.storageKeys = {
            history: 'history',
            memory: 'memory',
            angleMode: 'angleMode',
            undoStack: 'undoStack',
            redoStack: 'redoStack',
            customFormulas: 'customFormulas',
            settings: 'settings'
        };

        /** @type {boolean} Whether auto-save is enabled */
        this.autoSaveEnabled = true;

        /** @type {number} Debounce time for auto-save in milliseconds */
        this.saveDebounceTime = 500;

        /** @type {number|null} Timeout ID for debounced save operations */
        this.saveTimeout = null;
    }

    // ------------ STATE LOADING AND SAVING METHODS

    /**
     * Load saved state from storage
     *
     * Retrieves all persisted calculator state data from storage and
     * applies it to the current state manager instance.
     *
     * @async
     * @method loadSavedState
     * @param {CalculatorModules} modules - Calculator modules containing storage and state
     * @returns {Promise<boolean>} True if state was loaded successfully
     *
     * @example
     * const success = await persistence.loadSavedState({
     *   storage: storageManager,
     *   state: stateManager
     * });
     *
     * if (success) {
     *   console.log('Previous session restored');
     * }
     */
    async loadSavedState(modules) {
        if (!modules.storage || !modules.state) {
            console.warn('StatePersistence: Required modules not available');
            return false;
        }

        try {
            console.log('StatePersistence: Loading saved state...');

            // Load all state data in parallel for better performance
            /** @type {[string[], number, string, any[], any[], any[], Object]} */
            const [
                savedHistory,
                savedMemory,
                savedAngleMode,
                savedUndoStack,
                savedRedoStack,
                savedFormulas,
                savedSettings
            ] = await Promise.all([
                modules.storage.load(this.storageKeys.history, []),
                modules.storage.load(this.storageKeys.memory, 0),
                modules.storage.load(this.storageKeys.angleMode, 'deg'),
                modules.storage.load(this.storageKeys.undoStack, []),
                modules.storage.load(this.storageKeys.redoStack, []),
                modules.storage.load(this.storageKeys.customFormulas, []),
                modules.storage.load(this.storageKeys.settings, {})
            ]);

            // Update state with loaded data
            modules.state.updateState({
                history: savedHistory,
                memory: savedMemory,
                isDegree: savedAngleMode === 'deg',
                undoStack: savedUndoStack,
                redoStack: savedRedoStack,
                customFormulas: savedFormulas,
                settings: savedSettings
            });

            console.log('StatePersistence: Saved state loaded successfully');
            return true;
        } catch (error) {
            console.warn('StatePersistence: Failed to load saved state:', error);
            return false;
        }
    }

    /**
     * Save current state to storage
     *
     * Persists the current calculator state to storage by saving all
     * state components to their respective storage keys.
     *
     * @async
     * @method saveCurrentState
     * @param {CalculatorModules} modules - Calculator modules containing storage and state
     * @returns {Promise<boolean>} True if state was saved successfully
     *
     * @example
     * const success = await persistence.saveCurrentState({
     *   storage: storageManager,
     *   state: stateManager
     * });
     *
     * if (success) {
     *   console.log('State saved successfully');
     * }
     */
    async saveCurrentState(modules) {
        if (!modules.storage || !modules.state) {
            console.warn('StatePersistence: Required modules not available');
            return false;
        }

        try {
            /** @type {any} */
            const state = modules.state.getState();

            // Save all state data in parallel for better performance
            await Promise.all([
                modules.storage.save(this.storageKeys.history, state.history),
                modules.storage.save(this.storageKeys.memory, state.memory),
                modules.storage.save(this.storageKeys.angleMode, state.isDegree ? 'deg' : 'rad'),
                modules.storage.save(this.storageKeys.undoStack, state.undoStack),
                modules.storage.save(this.storageKeys.redoStack, state.redoStack),
                modules.storage.save(this.storageKeys.customFormulas, state.customFormulas),
                modules.storage.save(this.storageKeys.settings, state.settings || {})
            ]);

            return true;
        } catch (error) {
            console.warn('StatePersistence: Failed to save state:', error);
            return false;
        }
    }

    /**
     * Save state with debouncing to avoid excessive saves
     *
     * Implements debounced saving to prevent excessive storage operations
     * when state changes frequently. Only saves after a period of inactivity.
     *
     * @method debouncedSave
     * @param {CalculatorModules} modules - Calculator modules containing storage and state
     * @returns {void}
     *
     * @example
     * // Call this after state changes to trigger debounced save
     * persistence.debouncedSave(modules);
     *
     * // Multiple rapid calls will only result in one save operation
     * persistence.debouncedSave(modules);
     * persistence.debouncedSave(modules);
     * persistence.debouncedSave(modules); // Only this triggers actual save
     */
    debouncedSave(modules) {
        if (!this.autoSaveEnabled) return;

        // Clear existing timeout
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        // Set new timeout
        this.saveTimeout = setTimeout(() => {
            const save = async () => {
                await this.saveCurrentState(modules);
                this.saveTimeout = null;
            };
            void save();
        }, this.saveDebounceTime);
    }

    // ------------ DATA EXPORT AND IMPORT METHODS

    /**
     * Export all calculator data
     *
     * Creates a comprehensive export of all calculator data including
     * metadata for version tracking and data validation.
     *
     * @async
     * @method exportAllData
     * @param {CalculatorModules} modules - Calculator modules containing storage and state
     * @returns {Promise<ExportData>} Complete export data with metadata
     *
     * @throws {Error} When storage module is not available
     *
     * @example
     * try {
     *   const exportData = await persistence.exportAllData(modules);
     *   const jsonString = JSON.stringify(exportData, null, 2);
     *   // Save to file or send to server
     * } catch (error) {
     *   console.error('Export failed:', error);
     * }
     */
    async exportAllData(modules) {
        if (!modules.storage) {
            throw new Error('Storage module not available');
        }

        try {
            // Use storage module's export functionality if available
            if (typeof modules.storage.exportAllData === 'function') {
                return await modules.storage.exportAllData();
            }

            // Fallback: manually collect data
            /** @type {any} */
            const state = modules.state ? modules.state.getState() : {};

            return {
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: '2.0.0',
                    source: 'StatePersistence'
                },
                data: {
                    history: state.history || [],
                    memory: state.memory || 0,
                    angleMode: state.isDegree ? 'deg' : 'rad',
                    customFormulas: state.customFormulas || [],
                    settings: state.settings || {}
                }
            };
        } catch (error) {
            console.error('StatePersistence: Export failed:', error);
            throw error;
        }
    }

    /**
     * Import calculator data
     *
     * Imports calculator data from an export file, validating the format
     * and applying the data to the current calculator state.
     *
     * @async
     * @method importAllData
     * @param {CalculatorModules} modules - Calculator modules containing storage and state
     * @param {ExportData} importData - Previously exported calculator data
     * @returns {Promise<boolean>} True if import was successful
     *
     * @throws {Error} When required modules are not available or data format is invalid
     *
     * @example
     * try {
     *   const importData = JSON.parse(fileContent);
     *   const success = await persistence.importAllData(modules, importData);
     *
     *   if (success) {
     *     console.log('Data imported successfully');
     *   }
     * } catch (error) {
     *   console.error('Import failed:', error);
     * }
     */
    async importAllData(modules, importData) {
        if (!modules.storage || !modules.state) {
            throw new Error('Required modules not available');
        }

        try {
            // Use storage module's import functionality if available
            if (typeof modules.storage.importAllData === 'function') {
                /** @type {boolean} */
                const success = await modules.storage.importAllData(importData);
                if (success) {
                    // Reload state after import
                    await this.loadSavedState(modules);
                }
                return success;
            }

            // Fallback: manually import data
            if (!importData.data) {
                throw new Error('Invalid import data format');
            }

            /** @type {ExportDataContent} */
            const data = importData.data;

            // Update state with imported data
            modules.state.updateState({
                history: data.history || [],
                memory: data.memory || 0,
                isDegree: data.angleMode === 'deg',
                customFormulas: data.customFormulas || [],
                settings: data.settings || {}
            });

            // Save the imported state
            await this.saveCurrentState(modules);

            return true;
        } catch (error) {
            console.error('StatePersistence: Import failed:', error);
            throw error;
        }
    }

    // ------------ DATA MANAGEMENT METHODS

    /**
     * Clear all saved data
     *
     * Removes all persisted calculator data from storage by clearing
     * all registered storage keys.
     *
     * @async
     * @method clearAllData
     * @param {CalculatorModules} modules - Calculator modules containing storage
     * @returns {Promise<boolean>} True if all data was cleared successfully
     *
     * @example
     * const success = await persistence.clearAllData(modules);
     * if (success) {
     *   console.log('All saved data cleared');
     * }
     */
    async clearAllData(modules) {
        if (!modules.storage) {
            console.warn('StatePersistence: Storage module not available');
            return false;
        }

        try {
            // Clear all storage keys in parallel
            await Promise.all(
                Object.values(this.storageKeys).map(key =>
                    modules.storage.remove(key)
                )
            );

            console.log('StatePersistence: All data cleared');
            return true;
        } catch (error) {
            console.error('StatePersistence: Failed to clear data:', error);
            return false;
        }
    }

    // ------------ STATISTICS AND MONITORING METHODS

    /**
     * Get persistence statistics
     *
     * Returns comprehensive statistics about the persistence system
     * including configuration, status, and storage information.
     *
     * @async
     * @method getStatistics
     * @param {CalculatorModules} modules - Calculator modules containing storage
     * @returns {Promise<PersistenceStatistics>} Persistence statistics object
     *
     * @example
     * const stats = await persistence.getStatistics(modules);
     * console.log('Auto-save enabled:', stats.autoSaveEnabled);
     * console.log('Pending save:', stats.hasPendingSave);
     * console.log('Storage keys:', stats.storageKeys);
     */
    async getStatistics(modules) {
        /** @type {PersistenceStatistics} */
        const stats = {
            autoSaveEnabled: this.autoSaveEnabled,
            saveDebounceTime: this.saveDebounceTime,
            hasPendingSave: !!this.saveTimeout,
            storageKeys: Object.keys(this.storageKeys)
        };

        if (modules.storage && typeof modules.storage.getStorageStats === 'function') {
            try {
                stats.storageStats = await modules.storage.getStorageStats();
            } catch (error) {
                console.warn('StatePersistence: Failed to get storage stats:', error);
            }
        }

        return stats;
    }

    // ------------ CONFIGURATION METHODS

    /**
     * Enable or disable auto-save
     *
     * Controls the automatic saving of calculator state with optional
     * cleanup of pending save operations when disabled.
     *
     * @method setAutoSave
     * @param {boolean} enabled - Whether to enable auto-save functionality
     * @returns {void}
     *
     * @example
     * // Enable auto-save
     * persistence.setAutoSave(true);
     *
     * // Disable auto-save (clears pending saves)
     * persistence.setAutoSave(false);
     */
    setAutoSave(enabled) {
        this.autoSaveEnabled = enabled;

        if (!enabled && this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }

        console.log(`StatePersistence: Auto-save ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Set save debounce time
     *
     * Configures the debounce delay for auto-save operations to control
     * how frequently state is persisted to storage.
     *
     * @method setSaveDebounceTime
     * @param {number} time - Debounce time in milliseconds (minimum 100ms)
     * @returns {void}
     *
     * @example
     * // Set debounce to 1 second
     * persistence.setSaveDebounceTime(1000);
     *
     * // Set debounce to minimum (100ms)
     * persistence.setSaveDebounceTime(50); // Will be set to 100ms
     */
    setSaveDebounceTime(time) {
        this.saveDebounceTime = Math.max(100, time); // Minimum 100ms
        console.log(`StatePersistence: Save debounce time set to ${this.saveDebounceTime}ms`);
    }

    // ------------ CLEANUP METHODS

    /**
     * Cleanup persistence module
     *
     * Performs cleanup operations including clearing pending save timeouts
     * and resetting internal state for proper module destruction.
     *
     * @method cleanup
     * @returns {void}
     *
     * @example
     * // Clean up before destroying the persistence instance
     * persistence.cleanup();
     */
    cleanup() {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
            this.saveTimeout = null;
        }
        console.log('StatePersistence: Cleaned up');
    }
}

// ------------ MODULE EXPORTS AND GLOBAL REGISTRATION

/**
 * Export for ES6 module systems (modern bundlers, native ES modules)
 * Enables tree-shaking and modern import/export syntax.
 *
 * @default StatePersistence
 */
export default StatePersistence;
