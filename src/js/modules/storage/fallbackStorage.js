/**
 * @file FALLBACK_STORAGE.JS - Fallback Storage Module
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Fallback Storage Module that provides localStorage-based storage when primary
 * storage systems fail. Offers a reliable backup storage mechanism with
 * comprehensive error handling and data management capabilities.
 *
 * Features:
 * - localStorage-based persistent storage
 * - Automatic fallback when primary storage fails
 * - Data import/export functionality
 * - Storage usage monitoring and statistics
 * - Comprehensive error handling and recovery
 * - Data integrity validation
 *
 * @module FallbackStorage
 */

// ------------ TYPE DEFINITIONS

/**
 * @typedef {Object} StorageStatistics
 * @property {string} backend - Storage backend type
 * @property {boolean} available - Whether storage is available
 * @property {boolean} persistent - Whether storage persists across sessions
 * @property {boolean} isInitialized - Whether storage is initialized
 */

/**
 * @typedef {Object} StorageUsage
 * @property {number} totalSize - Total storage size in bytes
 * @property {number} itemCount - Number of stored items
 * @property {number} estimatedSizeKB - Estimated size in kilobytes
 */

/**
 * @typedef {Object} ExportData
 * @property {Object} metadata - Export metadata
 * @property {string} metadata.exportDate - ISO date string of export
 * @property {string} metadata.version - Calculator version
 * @property {string} metadata.backend - Storage backend used
 * @property {Object} data - Exported calculator data
 */

/**
 * @typedef {Object} ImportData
 * @property {Object} metadata - Import metadata
 * @property {Object} data - Calculator data to import
 */

// ------------ FALLBACK STORAGE CLASS

/**
 * Fallback Storage Class
 *
 * Provides a reliable localStorage-based storage system that serves as a
 * fallback when primary storage mechanisms fail. Includes comprehensive
 * data management, error handling, and monitoring capabilities.
 *
 * @class FallbackStorage
 */
class FallbackStorage {
    /**
     * Create a new FallbackStorage instance
     *
     * @constructor
     *
     * @example
     * const fallbackStorage = new FallbackStorage();
     * await fallbackStorage.initialize();
     *

     */
    constructor() {
        /** @type {string} Prefix for all storage keys */
        this.storagePrefix = 'calculator_';

        /** @type {string} Storage system version */
        this.version = '2.0.0';

        /** @type {boolean} Initialization status */
        this.isInitialized = false;
    }

    /**
     * Initialize fallback storage system
     *
     * Tests localStorage availability and functionality to ensure the fallback
     * storage system is ready for use. Performs validation tests to confirm
     * read/write capabilities.
     *
     * @async
     * @method initialize
     * @returns {Promise<boolean>} True if initialization successful, false otherwise
     *
     * @throws {Error} When localStorage is not available or fails validation
     *
     * @example
     * const success = await fallbackStorage.initialize();
     * if (success) {
     *   console.log('Fallback storage ready');
     * }
     *

     */
    async initialize() {
        try {
            console.log('🔄 Initializing fallback storage...');

            // Test localStorage availability and functionality
            /** @type {string} */
            const testKey = `${this.storagePrefix  }test`;
            /** @type {string} */
            const testValue = `test_value_${  Date.now()}`;

            localStorage.setItem(testKey, testValue);

            /** @type {string|null} */
            const retrievedValue = localStorage.getItem(testKey);

            if (retrievedValue !== testValue) {
                throw new Error('localStorage read/write test failed');
            }

            localStorage.removeItem(testKey);

            this.isInitialized = true;
            console.log('✅ Fallback storage initialized successfully');
            return true;
        } catch (error) {
            console.error('❌ Fallback storage initialization failed:', error);
            this.isInitialized = false;
            return false;
        }
    }

    /**
     * Save data to localStorage
     *
     * Stores data in localStorage with automatic JSON serialization and
     * comprehensive error handling including quota exceeded scenarios.
     *
     * @async
     * @method save
     * @param {string} key - Storage key (will be prefixed automatically)
     * @param {any} data - Data to save (will be JSON serialized)
     * @returns {Promise<boolean>} True if save successful, false otherwise
     *
     * @example
     * await fallbackStorage.save('history', calculationHistory);
     * await fallbackStorage.save('settings', { theme: 'dark' });
     *

     */
    async save(key, data) {
        try {
            /** @type {string} */
            const storageKey = this.storagePrefix + key;

            /** @type {string} */
            const serializedData = JSON.stringify(data);

            localStorage.setItem(storageKey, serializedData);

            console.log(`💾 Saved data for key: ${key}`);
            return true;
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                console.error('❌ Storage quota exceeded for key:', key);
            } else {
                console.error('❌ Fallback storage save failed for key:', key, error);
            }
            return false;
        }
    }

    /**
     * Load data from localStorage
     *
     * Retrieves and deserializes data from localStorage with automatic
     * fallback to default values and comprehensive error handling.
     *
     * @async
     * @method load
     * @param {string} key - Storage key (will be prefixed automatically)
     * @param {any} [defaultValue=null] - Default value if key not found or error occurs
     * @returns {Promise<any>} Loaded data or default value
     *
     * @example
     * const history = await fallbackStorage.load('history', []);
     * const theme = await fallbackStorage.load('theme', 'light');
     *

     */
    async load(key, defaultValue = null) {
        try {
            /** @type {string} */
            const storageKey = this.storagePrefix + key;

            /** @type {string|null} */
            const item = localStorage.getItem(storageKey);

            if (item === null) {
                console.log(`📂 No data found for key: ${key}, using default`);
                return defaultValue;
            }

            /** @type {any} */
            const parsedData = JSON.parse(item);

            console.log(`📂 Loaded data for key: ${key}`);
            return parsedData;
        } catch (error) {
            console.error('❌ Fallback storage load failed for key:', key, error);
            return defaultValue;
        }
    }

    /**
     * Remove data from localStorage
     *
     * Removes a specific key-value pair from localStorage with error handling.
     *
     * @async
     * @method remove
     * @param {string} key - Storage key to remove (will be prefixed automatically)
     * @returns {Promise<boolean>} True if removal successful, false otherwise
     *
     * @example
     * await fallbackStorage.remove('history');
     * await fallbackStorage.remove('temp_data');
     *

     */
    async remove(key) {
        try {
            /** @type {string} */
            const storageKey = this.storagePrefix + key;

            localStorage.removeItem(storageKey);

            console.log(`🗑️ Removed data for key: ${key}`);
            return true;
        } catch (error) {
            console.error('❌ Fallback storage remove failed for key:', key, error);
            return false;
        }
    }

    /**
     * Clear all calculator data from localStorage
     *
     * Removes all calculator-related data by finding and deleting all keys
     * that start with the storage prefix. Provides comprehensive cleanup.
     *
     * @async
     * @method clearAll
     * @returns {Promise<boolean>} True if clear successful, false otherwise
     *
     * @example
     * const success = await fallbackStorage.clearAll();
     * if (success) {
     *   console.log('All calculator data cleared');
     * }
     *

     */
    async clearAll() {
        try {
            console.log('🧹 Clearing all calculator data from fallback storage...');

            /** @type {string[]} */
            const keys = Object.keys(localStorage);
            /** @type {number} */
            let removedCount = 0;

            keys.forEach(key => {
                if (key.startsWith(this.storagePrefix)) {
                    localStorage.removeItem(key);
                    removedCount++;
                    console.log(`🗑️ Removed: ${key}`);
                }
            });

            console.log(`✅ Cleared ${removedCount} items from fallback storage`);
            return true;
        } catch (error) {
            console.error('❌ Fallback storage clearAll failed:', error);
            return false;
        }
    }

    /**
     * Get storage statistics
     *
     * Returns comprehensive statistics about the fallback storage system
     * including availability, persistence, and initialization status.
     *
     * @async
     * @method getStorageStats
     * @returns {Promise<StorageStatistics>} Storage statistics object
     *
     * @example
     * const stats = await fallbackStorage.getStorageStats();
     * console.log('Storage backend:', stats.backend);
     * console.log('Is available:', stats.available);
     *

     */
    async getStorageStats() {
        return {
            backend: 'fallback-localStorage',
            available: this.isAvailable(),
            persistent: true,
            isInitialized: this.isInitialized
        };
    }

    /**
     * Export all calculator data
     *
     * Exports all calculator-related data from localStorage in a structured
     * format with metadata for backup and migration purposes.
     *
     * @async
     * @method exportAllData
     * @returns {Promise<ExportData>} Exported data with metadata
     *
     * @example
     * const exportData = await fallbackStorage.exportAllData();
     * console.log('Export date:', exportData.metadata.exportDate);
     * console.log('Data keys:', Object.keys(exportData.data));
     *

     */
    async exportAllData() {
        console.log('📤 Exporting all calculator data from fallback storage...');

        /** @type {Object<string, any>} */
        const data = {};
        /** @type {string[]} */
        const keys = Object.keys(localStorage);
        /** @type {number} */
        let exportedCount = 0;

        keys.forEach(key => {
            if (key.startsWith(this.storagePrefix)) {
                try {
                    /** @type {string|null} */
                    const value = localStorage.getItem(key);
                    if (value) {
                        /** @type {string} */
                        const cleanKey = key.replace(this.storagePrefix, '');
                        data[cleanKey] = JSON.parse(value);
                        exportedCount++;
                    }
                } catch (error) {
                    console.warn('⚠️ Failed to export key:', key, error);
                }
            }
        });

        console.log(`✅ Exported ${exportedCount} items from fallback storage`);

        return {
            metadata: {
                exportDate: new Date().toISOString(),
                version: this.version,
                backend: 'fallback-localStorage'
            },
            data
        };
    }

    /**
     * Import calculator data
     *
     * Imports calculator data from an export structure, validating the format
     * and restoring all data to localStorage with comprehensive error handling.
     *
     * @async
     * @method importAllData
     * @param {ImportData} importData - Data structure to import
     * @returns {Promise<boolean>} True if import successful, false otherwise
     *
     * @throws {Error} When import data format is invalid
     *
     * @example
     * const importData = {
     *   metadata: { version: '2.0.0' },
     *   data: { history: [], settings: {} }
     * };
     * const success = await fallbackStorage.importAllData(importData);
     *

     */
    async importAllData(importData) {
        try {
            console.log('📥 Importing calculator data to fallback storage...');

            if (!importData || !importData.data) {
                throw new Error('Invalid import data format - missing data property');
            }

            /** @type {number} */
            let importedCount = 0;

            for (const [key, value] of Object.entries(importData.data)) {
                const success = await this.save(key, value);
                if (success) {
                    importedCount++;
                } else {
                    console.warn(`⚠️ Failed to import key: ${key}`);
                }
            }

            console.log(`✅ Imported ${importedCount} items to fallback storage`);
            return true;
        } catch (error) {
            console.error('❌ Fallback storage import failed:', error);
            return false;
        }
    }

    /**
     * Check if localStorage is available
     *
     * Tests localStorage availability by attempting a write/read/delete operation.
     * Handles cases where localStorage might be disabled or unavailable.
     *
     * @method isAvailable
     * @returns {boolean} True if localStorage is available and functional
     *
     * @example
     * if (fallbackStorage.isAvailable()) {
     *   console.log('Fallback storage is ready');
     * }
     *

     */
    isAvailable() {
        try {
            /** @type {string} */
            const testKey = `${this.storagePrefix  }availability_test`;
            /** @type {string} */
            const testValue = `test_${  Date.now()}`;

            localStorage.setItem(testKey, testValue);

            /** @type {string|null} */
            const retrieved = localStorage.getItem(testKey);

            localStorage.removeItem(testKey);

            return retrieved === testValue;
        } catch (error) {
            console.warn('⚠️ localStorage availability test failed:', error);
            return false;
        }
    }

    /**
     * Get detailed storage usage information
     *
     * Calculates comprehensive storage usage statistics including total size,
     * item count, and estimated size in kilobytes for all calculator data.
     *
     * @async
     * @method getStorageUsage
     * @returns {Promise<StorageUsage>} Detailed storage usage statistics
     *
     * @example
     * const usage = await fallbackStorage.getStorageUsage();
     * console.log(`Using ${usage.estimatedSizeKB}KB for ${usage.itemCount} items`);
     *

     */
    async getStorageUsage() {
        /** @type {number} */
        let totalSize = 0;
        /** @type {number} */
        let itemCount = 0;

        /** @type {string[]} */
        const keys = Object.keys(localStorage);

        keys.forEach(key => {
            if (key.startsWith(this.storagePrefix)) {
                /** @type {string|null} */
                const value = localStorage.getItem(key);
                totalSize += key.length + (value ? value.length : 0);
                itemCount++;
            }
        });

        return {
            totalSize,
            itemCount,
            estimatedSizeKB: Math.round(totalSize / 1024 * 100) / 100
        };
    }
}

// ------------ MODULE EXPORT


export default FallbackStorage;
