/**
 * @file STORAGE_MANAGER.JS - Storage Management Module
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Storage Management Module that handles all data persistence operations with
 * multiple storage backends, automatic fallback mechanisms, and comprehensive
 * data management capabilities for the calculator application.
 *
 * Features:
 * - Multiple storage backend support (localStorage, IndexedDB, memory)
 * - Automatic fallback when primary storage fails
 * - Data import/export functionality with metadata
 * - Storage usage monitoring and statistics
 * - Comprehensive error handling and recovery
 * - Data integrity validation and testing
 *
 * @module StorageManager
 */

// ------------ TYPE DEFINITIONS

/**
 * @typedef {Object} StorageBackend
 * @property {Function} getItem - Get item from storage
 * @property {Function} setItem - Set item in storage
 * @property {Function} removeItem - Remove item from storage
 * @property {Function} [getStats] - Get storage statistics (optional)
 */

/**
 * @typedef {Object} StorageKeys
 * @property {string} history - History storage key
 * @property {string} memory - Memory storage key
 * @property {string} angleMode - Angle mode storage key
 * @property {string} undoStack - Undo stack storage key
 * @property {string} redoStack - Redo stack storage key
 * @property {string} customFormulas - Custom formulas storage key
 * @property {string} theme - Theme storage key
 * @property {string} accessibility - Accessibility mode storage key
 * @property {string} highContrast - High contrast mode storage key
 */

/**
 * @typedef {Object} StorageStatistics
 * @property {string} backend - Current storage backend
 * @property {number} keys - Number of storage keys
 * @property {number} estimatedSize - Estimated storage size in bytes
 * @property {boolean} [available] - Whether storage is available
 * @property {boolean} [persistent] - Whether storage persists across sessions
 */

/**
 * @typedef {Object} ExportMetadata
 * @property {string} exportDate - ISO date string of export
 * @property {string} version - Calculator version
 * @property {string} backend - Storage backend used for export
 */

/**
 * @typedef {Object} ExportData
 * @property {ExportMetadata} metadata - Export metadata
 * @property {Object<string, any>} data - Exported calculator data
 */

// ------------ CALCULATOR STORAGE MANAGER CLASS

/**
 * Calculator Storage Manager Class
 *
 * Manages all data persistence operations for the calculator with multiple
 * storage backends, automatic fallback mechanisms, and comprehensive data
 * management capabilities.
 *
 * @class CalculatorStorageManager
 */
class CalculatorStorageManager {
    /**
     * Create a new CalculatorStorageManager instance
     *
     * @constructor
     *
     * @example
     * const storageManager = new CalculatorStorageManager();
     * await storageManager.initialize();
     *

     */
    constructor() {
        /** @type {Object<string, StorageBackend>} Available storage backends */
        this.storageBackends = {};

        /** @type {string} Primary storage backend name */
        this.primaryBackend = 'localStorage';

        /** @type {string} Fallback storage backend name */
        this.fallbackBackend = 'memory';

        /** @type {StorageKeys} Mapping of logical keys to storage keys */
        this.storageKeys = {
            history: 'calculator_history',
            memory: 'calculator_memory',
            angleMode: 'calculator_angle_mode',
            undoStack: 'calculator_undo_stack',
            redoStack: 'calculator_redo_stack',
            customFormulas: 'calculator_custom_formulas',
            theme: 'calculator_theme',
            accessibility: 'calculator_accessibility_mode',
            highContrast: 'calculator_high_contrast'
        };
    }

    /**
     * Initialize storage manager with all backends
     *
     * Sets up all available storage backends and tests the primary backend
     * for functionality. Automatically falls back to memory storage if
     * primary backend fails.
     *
     * @async
     * @method initialize
     * @returns {Promise<boolean>} True if initialization successful
     *
     * @example
     * const success = await storageManager.initialize();
     * if (success) {
     *   console.log('Storage manager ready');
     * }
     *

     */
    async initialize() {
        try {
            console.log('🔄 Initializing storage manager...');

            // Initialize all storage backends
            this.storageBackends = {
                localStorage: new LocalStorageBackend(),
                indexedDB: new IndexedDBBackend(),
                memory: new MemoryBackend()
            };

            // Test primary backend functionality
            await this.testStorageBackend(this.primaryBackend);
            console.log(`✅ Storage initialized with ${this.primaryBackend}`);
            return true;
        } catch (error) {
            console.error('❌ Storage initialization failed:', error);
            console.warn(`⚠️ Primary storage ${this.primaryBackend} failed, falling back to ${this.fallbackBackend}`);
            this.primaryBackend = this.fallbackBackend;
            return true;
        }
    }

    /**
     * Test storage backend functionality
     *
     * Performs comprehensive testing of a storage backend by executing
     * write, read, and delete operations to ensure full functionality.
     *
     * @async
     * @method testStorageBackend
     * @param {string} backendName - Name of the backend to test
     * @returns {Promise<void>} Resolves if test passes
     *
     * @throws {Error} When backend is unknown or test fails
     *
     * @example
     * await storageManager.testStorageBackend('localStorage');
     *

     */
    async testStorageBackend(backendName) {
        /** @type {StorageBackend} */
        const backend = this.storageBackends[backendName];
        if (!backend) {
            throw new Error(`Unknown storage backend: ${backendName}`);
        }

        /** @type {string} */
        const testKey = `storage_test_${  Date.now()}`;
        /** @type {Object} */
        const testValue = { test: true, timestamp: Date.now(), random: Math.random() };

        console.log(`🧪 Testing storage backend: ${backendName}`);

        // Test write operation
        await backend.setItem(testKey, testValue);

        // Test read operation
        /** @type {any} */
        const retrieved = await backend.getItem(testKey);

        // Test delete operation
        await backend.removeItem(testKey);

        // Validate test results
        if (!retrieved || retrieved.test !== true || retrieved.timestamp !== testValue.timestamp) {
            throw new Error(`Storage backend ${backendName} test failed - data integrity check failed`);
        }

        console.log(`✅ Storage backend ${backendName} test passed`);
    }

    /**
     * Save data to storage with fallback support
     *
     * Saves data to the primary storage backend with automatic fallback
     * to secondary backend if the primary fails. Handles key mapping
     * and comprehensive error recovery.
     *
     * @async
     * @method save
     * @param {string} key - Logical storage key (will be mapped to actual key)
     * @param {any} data - Data to save (will be serialized automatically)
     * @returns {Promise<boolean>} True if save successful, false otherwise
     *
     * @example
     * await storageManager.save('history', calculationHistory);
     * await storageManager.save('theme', 'dark');
     *

     */
    async save(key, data) {
        try {
            /** @type {StorageBackend} */
            const backend = this.storageBackends[this.primaryBackend];
            /** @type {string} */
            const storageKey = this.storageKeys[key] || key;

            await backend.setItem(storageKey, data);
            console.log(`💾 Saved data for key: ${key} using ${this.primaryBackend}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to save ${key} using ${this.primaryBackend}:`, error);

            // Try fallback backend
            try {
                /** @type {StorageBackend} */
                const fallbackBackend = this.storageBackends[this.fallbackBackend];
                /** @type {string} */
                const storageKey = this.storageKeys[key] || key;

                await fallbackBackend.setItem(storageKey, data);
                console.log(`💾 Saved data for key: ${key} using fallback ${this.fallbackBackend}`);
                return true;
            } catch (fallbackError) {
                console.error(`❌ Fallback storage also failed for ${key}:`, fallbackError);
                return false;
            }
        }
    }

    /**
     * Load data from storage with fallback support
     *
     * Loads data from the primary storage backend with automatic fallback
     * to secondary backend if the primary fails. Handles key mapping
     * and provides default values when data is not found.
     *
     * @async
     * @method load
     * @param {string} key - Logical storage key (will be mapped to actual key)
     * @param {any} [defaultValue=null] - Default value if key not found or error occurs
     * @returns {Promise<any>} Loaded data or default value
     *
     * @example
     * const history = await storageManager.load('history', []);
     * const theme = await storageManager.load('theme', 'light');
     *

     */
    async load(key, defaultValue = null) {
        try {
            /** @type {StorageBackend} */
            const backend = this.storageBackends[this.primaryBackend];
            /** @type {string} */
            const storageKey = this.storageKeys[key] || key;

            /** @type {any} */
            const data = await backend.getItem(storageKey);

            if (data !== null) {
                console.log(`📂 Loaded data for key: ${key} from ${this.primaryBackend}`);
                return data;
            } else {
                console.log(`📂 No data found for key: ${key}, using default`);
                return defaultValue;
            }
        } catch (error) {
            console.error(`❌ Failed to load ${key} from ${this.primaryBackend}:`, error);

            // Try fallback backend
            try {
                /** @type {StorageBackend} */
                const fallbackBackend = this.storageBackends[this.fallbackBackend];
                /** @type {string} */
                const storageKey = this.storageKeys[key] || key;

                /** @type {any} */
                const data = await fallbackBackend.getItem(storageKey);

                if (data !== null) {
                    console.log(`📂 Loaded data for key: ${key} from fallback ${this.fallbackBackend}`);
                    return data;
                } else {
                    console.log(`📂 No data found for key: ${key} in fallback, using default`);
                    return defaultValue;
                }
            } catch (fallbackError) {
                console.error(`❌ Fallback storage also failed for ${key}:`, fallbackError);
                return defaultValue;
            }
        }
    }

    /**
     * Remove data from storage
     *
     * Removes a specific key-value pair from the primary storage backend
     * with comprehensive error handling.
     *
     * @async
     * @method remove
     * @param {string} key - Logical storage key to remove (will be mapped to actual key)
     * @returns {Promise<boolean>} True if removal successful, false otherwise
     *
     * @example
     * await storageManager.remove('history');
     * await storageManager.remove('temp_data');
     *

     */
    async remove(key) {
        try {
            /** @type {StorageBackend} */
            const backend = this.storageBackends[this.primaryBackend];
            /** @type {string} */
            const storageKey = this.storageKeys[key] || key;

            await backend.removeItem(storageKey);
            console.log(`🗑️ Removed data for key: ${key} from ${this.primaryBackend}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to remove ${key} from ${this.primaryBackend}:`, error);
            return false;
        }
    }

    /**
     * Clear all calculator data
     *
     * Removes all calculator-related data from the primary storage backend
     * by iterating through all defined storage keys and removing each one.
     *
     * @async
     * @method clearAll
     * @returns {Promise<boolean>} True if clear successful, false otherwise
     *
     * @example
     * const success = await storageManager.clearAll();
     * if (success) {
     *   console.log('All calculator data cleared');
     * }
     *

     */
    async clearAll() {
        try {
            console.log('🧹 Clearing all calculator data...');

            /** @type {StorageBackend} */
            const backend = this.storageBackends[this.primaryBackend];
            /** @type {number} */
            let clearedCount = 0;

            for (const [logicalKey, _storageKey] of Object.entries(this.storageKeys)) {
                try {
                    await backend.removeItem(_storageKey);
                    clearedCount++;
                    console.log(`🗑️ Cleared: ${logicalKey}`);
                } catch (error) {
                    console.warn(`⚠️ Failed to clear ${logicalKey}:`, error);
                }
            }

            console.log(`✅ Cleared ${clearedCount} items from storage`);
            return true;
        } catch (error) {
            console.error('❌ Failed to clear all data:', error);
            return false;
        }
    }

    /**
     * Get comprehensive storage usage statistics
     *
     * Returns detailed statistics about storage usage including backend
     * information, item counts, and estimated storage size. Uses backend-specific
     * stats if available, otherwise calculates fallback statistics.
     *
     * @async
     * @method getStorageStats
     * @returns {Promise<StorageStatistics>} Comprehensive storage statistics
     *
     * @example
     * const stats = await storageManager.getStorageStats();
     * console.log(`Using ${stats.backend} with ${stats.estimatedSize} bytes`);
     *

     */
    async getStorageStats() {
        try {
            /** @type {StorageBackend} */
            const backend = this.storageBackends[this.primaryBackend];

            // Use backend-specific stats if available
            if (backend.getStats && typeof backend.getStats === 'function') {
                /** @type {any} */
                const backendStats = await backend.getStats();
                console.log(`📊 Retrieved stats from ${this.primaryBackend} backend`);
                return backendStats;
            }

            // Fallback stats calculation
            console.log(`📊 Calculating fallback stats for ${this.primaryBackend}`);

            /** @type {StorageStatistics} */
            const stats = {
                backend: this.primaryBackend,
                keys: Object.keys(this.storageKeys).length,
                estimatedSize: 0
            };

            for (const [logicalKey, storageKey] of Object.entries(this.storageKeys)) {
                try {
                    /** @type {any} */
                    const data = await backend.getItem(storageKey);
                    if (data) {
                        stats.estimatedSize += JSON.stringify(data).length;
                    }
                } catch (error) {
                    console.warn(`⚠️ Failed to get size for ${logicalKey}:`, error);
                }
            }

            return stats;
        } catch (error) {
            console.error('❌ Failed to get storage stats:', error);
            return {
                backend: this.primaryBackend,
                error: error.message,
                keys: 0,
                estimatedSize: 0
            };
        }
    }

    /**
     * Export all calculator data
     *
     * Exports all calculator-related data in a structured format with
     * metadata for backup, migration, and sharing purposes. Handles
     * errors gracefully and continues with partial exports if needed.
     *
     * @async
     * @method exportAllData
     * @returns {Promise<ExportData>} Structured export data with metadata
     *
     * @example
     * const exportData = await storageManager.exportAllData();
     * console.log('Export date:', exportData.metadata.exportDate);
     * console.log('Data keys:', Object.keys(exportData.data));
     *

     */
    async exportAllData() {
        console.log('📤 Exporting all calculator data...');

        /** @type {ExportData} */
        const exportData = {
            metadata: {
                exportDate: new Date().toISOString(),
                version: '2.0.0',
                backend: this.primaryBackend
            },
            data: {}
        };

        /** @type {number} */
        let exportedCount = 0;

        for (const [logicalKey, _storageKey] of Object.entries(this.storageKeys)) {
            try {
                /** @type {any} */
                const data = await this.load(logicalKey);
                if (data !== null) {
                    exportData.data[logicalKey] = data;
                    exportedCount++;
                    console.log(`📦 Exported: ${logicalKey}`);
                }
            } catch (error) {
                console.warn(`⚠️ Failed to export ${logicalKey}:`, error);
            }
        }

        console.log(`✅ Exported ${exportedCount} items successfully`);
        return exportData;
    }

    /**
     * Import calculator data from export
     *
     * Imports calculator data from a structured export format, validating
     * the data structure and restoring all data with comprehensive error
     * handling and progress tracking.
     *
     * @async
     * @method importAllData
     * @param {ExportData} importData - Structured data to import
     * @returns {Promise<boolean>} True if import successful, false otherwise
     *
     * @throws {Error} When import data format is invalid
     *
     * @example
     * const importData = {
     *   metadata: { version: '2.0.0' },
     *   data: { history: [], theme: 'dark' }
     * };
     * const success = await storageManager.importAllData(importData);
     *

     */
    async importAllData(importData) {
        try {
            console.log('📥 Importing calculator data...');

            if (!importData || !importData.data) {
                throw new Error('Invalid import data format - missing data property');
            }

            /** @type {number} */
            let importedCount = 0;
            /** @type {number} */
            let failedCount = 0;

            for (const [key, value] of Object.entries(importData.data)) {
                try {
                    const success = await this.save(key, value);
                    if (success) {
                        importedCount++;
                        console.log(`📦 Imported: ${key}`);
                    } else {
                        failedCount++;
                        console.warn(`⚠️ Failed to import: ${key}`);
                    }
                } catch (error) {
                    failedCount++;
                    console.warn(`⚠️ Error importing ${key}:`, error);
                }
            }

            console.log(`✅ Import completed: ${importedCount} successful, ${failedCount} failed`);
            return failedCount === 0;
        } catch (error) {
            console.error('❌ Failed to import data:', error);
            return false;
        }
    }
}

// ------------ STORAGE BACKEND CLASSES

/**
 * LocalStorage Backend
 *
 * Provides localStorage-based storage implementation with JSON serialization,
 * quota management, and comprehensive error handling.
 *
 * @class LocalStorageBackend
 * @implements {StorageBackend}
 */
class LocalStorageBackend {
    /**
     * Get item from localStorage
     *
     * @async
     * @method getItem
     * @param {string} key - Storage key
     * @returns {Promise<any|null>} Parsed data or null if not found
     *

     */
    async getItem(key) {
        try {
            /** @type {string|null} */
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('❌ LocalStorage getItem error for key:', key, error);
            return null;
        }
    }

    /**
     * Set item in localStorage
     *
     * @async
     * @method setItem
     * @param {string} key - Storage key
     * @param {any} value - Value to store (will be JSON serialized)
     * @returns {Promise<void>}
     *
     * @throws {Error} When storage quota is exceeded or other errors occur
     *

     */
    async setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                throw new Error('Storage quota exceeded - please clear some data');
            }
            throw error;
        }
    }

    /**
     * Remove item from localStorage
     *
     * @async
     * @method removeItem
     * @param {string} key - Storage key to remove
     * @returns {Promise<void>}
     *

     */
    async removeItem(key) {
        localStorage.removeItem(key);
    }

    /**
     * Get localStorage usage statistics
     *
     * @async
     * @method getStats
     * @returns {Promise<Object>} Storage statistics
     *

     */
    async getStats() {
        /** @type {number} */
        let totalSize = 0;
        /** @type {number} */
        let itemCount = 0;

        for (let i = 0; i < localStorage.length; i++) {
            /** @type {string|null} */
            const key = localStorage.key(i);
            if (key && key.startsWith('calculator_')) {
                /** @type {string|null} */
                const value = localStorage.getItem(key);
                totalSize += key.length + (value ? value.length : 0);
                itemCount++;
            }
        }

        return {
            backend: 'localStorage',
            itemCount,
            totalSize,
            available: true,
            persistent: true
        };
    }
}

/**
 * IndexedDB Backend
 *
 * Provides IndexedDB-based storage implementation with automatic database
 * initialization, transaction management, and comprehensive error handling
 * with fallback to localStorage when IndexedDB is not available.
 *
 * @class IndexedDBBackend
 * @implements {StorageBackend}
 */
class IndexedDBBackend {
    /**
     * Create IndexedDB backend instance
     *
     * @constructor

     */
    constructor() {
        /** @type {string} IndexedDB database name */
        this.dbName = 'CalculatorDB';

        /** @type {number} Database version */
        this.version = 1;

        /** @type {string} Object store name */
        this.storeName = 'calculator_data';

        /** @type {IDBDatabase|null} Database instance */
        this.db = null;

        /** @type {boolean} Whether IndexedDB is available and initialized */
        this.isAvailable = false;

        /** @type {LocalStorageBackend} Fallback backend */
        this.fallback = new LocalStorageBackend();

        /** @type {Promise<void>|null} Database initialization promise */
        this.initPromise = null;
    }

    /**
     * Initialize IndexedDB database
     *
     * Creates the database and object store if they don't exist.
     * Sets up proper error handling and fallback mechanisms.
     *
     * @async
     * @method initializeDatabase
     * @returns {Promise<void>}
     * @private

     */
    async initializeDatabase() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise((resolve, reject) => {
            try {
                // Check if IndexedDB is available
                if (!window.indexedDB) {
                    throw new Error('IndexedDB not supported in this browser');
                }

                /** @type {IDBOpenDBRequest} */
                const request = indexedDB.open(this.dbName, this.version);

                request.onerror = () => {
                    console.error('❌ IndexedDB database open failed:', request.error);
                    this.isAvailable = false;
                    reject(new Error(`IndexedDB open failed: ${request.error?.message || 'Unknown error'}`));
                };

                request.onsuccess = () => {
                    this.db = request.result;
                    this.isAvailable = true;
                    console.log('✅ IndexedDB database opened successfully');
                    resolve();
                };

                request.onupgradeneeded = (event) => {
                    console.log('🔄 IndexedDB database upgrade needed');
                    /** @type {IDBDatabase} */
                    const db = event.target.result;

                    // Create object store if it doesn't exist
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        /** @type {IDBObjectStore} */
                        const store = db.createObjectStore(this.storeName, {
                            keyPath: 'key'
                        });

                        // Create indexes for better query performance
                        store.createIndex('timestamp', 'timestamp', { unique: false });
                        store.createIndex('type', 'type', { unique: false });

                        console.log(`✅ Created object store: ${this.storeName}`);
                    }
                };

                request.onblocked = () => {
                    console.warn('⚠️ IndexedDB database blocked - another tab may be using an older version');
                };

            } catch (error) {
                console.error('❌ IndexedDB initialization error:', error);
                this.isAvailable = false;
                reject(error);
            }
        });

        return this.initPromise;
    }

    /**
     * Ensure database is initialized before operations
     *
     * @async
     * @method ensureInitialized
     * @returns {Promise<boolean>} True if IndexedDB is available, false otherwise
     * @private

     */
    async ensureInitialized() {
        if (this.isAvailable && this.db) {
            return true;
        }

        try {
            await this.initializeDatabase();
            return this.isAvailable;
        } catch (error) {
            console.warn('⚠️ IndexedDB initialization failed, will use fallback:', error);
            this.isAvailable = false;
            return false;
        }
    }

    /**
     * Get item from IndexedDB
     *
     * Retrieves data from IndexedDB with automatic fallback to localStorage
     * if IndexedDB is not available or fails.
     *
     * @async
     * @method getItem
     * @param {string} key - Storage key
     * @returns {Promise<any|null>} Stored data or null
     *

     */
    async getItem(key) {
        try {
            // Try IndexedDB first
            if (await this.ensureInitialized()) {
                return new Promise((resolve, reject) => {
                    /** @type {IDBTransaction} */
                    const transaction = this.db.transaction([this.storeName], 'readonly');
                    /** @type {IDBObjectStore} */
                    const store = transaction.objectStore(this.storeName);
                    /** @type {IDBRequest} */
                    const request = store.get(key);

                    request.onsuccess = () => {
                        /** @type {any} */
                        const result = request.result;
                        resolve(result ? result.value : null);
                    };

                    request.onerror = () => {
                        console.error('❌ IndexedDB getItem error for key:', key, request.error);
                        reject(request.error);
                    };

                    transaction.onerror = () => {
                        console.error('❌ IndexedDB transaction error:', transaction.error);
                        reject(transaction.error);
                    };
                });
            }
        } catch (error) {
            console.warn(`⚠️ IndexedDB getItem failed for key ${key}, using fallback:`, error);
        }

        // Fallback to localStorage
        return this.fallback.getItem(key);
    }

    /**
     * Set item in IndexedDB
     *
     * Stores data in IndexedDB with automatic fallback to localStorage
     * if IndexedDB is not available or fails.
     *
     * @async
     * @method setItem
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {Promise<void>}
     *

     */
    async setItem(key, value) {
        try {
            // Try IndexedDB first
            if (await this.ensureInitialized()) {
                return new Promise((resolve, reject) => {
                    /** @type {IDBTransaction} */
                    const transaction = this.db.transaction([this.storeName], 'readwrite');
                    /** @type {IDBObjectStore} */
                    const store = transaction.objectStore(this.storeName);

                    /** @type {Object} */
                    const data = {
                        key,
                        value,
                        timestamp: Date.now(),
                        type: 'calculator_data'
                    };

                    /** @type {IDBRequest} */
                    const request = store.put(data);

                    request.onsuccess = () => {
                        resolve();
                    };

                    request.onerror = () => {
                        console.error('❌ IndexedDB setItem error for key:', key, request.error);
                        reject(request.error);
                    };

                    transaction.onerror = () => {
                        console.error('❌ IndexedDB transaction error:', transaction.error);
                        reject(transaction.error);
                    };
                });
            }
        } catch (error) {
            console.warn(`⚠️ IndexedDB setItem failed for key ${key}, using fallback:`, error);
        }

        // Fallback to localStorage
        return this.fallback.setItem(key, value);
    }

    /**
     * Remove item from IndexedDB
     *
     * Removes data from IndexedDB with automatic fallback to localStorage
     * if IndexedDB is not available or fails.
     *
     * @async
     * @method removeItem
     * @param {string} key - Storage key to remove
     * @returns {Promise<void>}
     *

     */
    async removeItem(key) {
        try {
            // Try IndexedDB first
            if (await this.ensureInitialized()) {
                return new Promise((resolve, reject) => {
                    /** @type {IDBTransaction} */
                    const transaction = this.db.transaction([this.storeName], 'readwrite');
                    /** @type {IDBObjectStore} */
                    const store = transaction.objectStore(this.storeName);
                    /** @type {IDBRequest} */
                    const request = store.delete(key);

                    request.onsuccess = () => {
                        resolve();
                    };

                    request.onerror = () => {
                        console.error('❌ IndexedDB removeItem error for key:', key, request.error);
                        reject(request.error);
                    };

                    transaction.onerror = () => {
                        console.error('❌ IndexedDB transaction error:', transaction.error);
                        reject(transaction.error);
                    };
                });
            }
        } catch (error) {
            console.warn(`⚠️ IndexedDB removeItem failed for key ${key}, using fallback:`, error);
        }

        // Fallback to localStorage
        return this.fallback.removeItem(key);
    }

    /**
     * Get IndexedDB usage statistics
     *
     * Returns detailed statistics about IndexedDB usage including
     * item counts, estimated storage size, and availability status.
     *
     * @async
     * @method getStats
     * @returns {Promise<Object>} Storage statistics
     *

     */
    async getStats() {
        try {
            if (await this.ensureInitialized()) {
                return new Promise((resolve, reject) => {
                    /** @type {IDBTransaction} */
                    const transaction = this.db.transaction([this.storeName], 'readonly');
                    /** @type {IDBObjectStore} */
                    const store = transaction.objectStore(this.storeName);
                    /** @type {IDBRequest} */
                    const countRequest = store.count();
                    /** @type {IDBRequest} */
                    const getAllRequest = store.getAll();

                    /** @type {Object} */
                    const stats = {
                        backend: 'indexedDB',
                        available: true,
                        persistent: true,
                        itemCount: 0,
                        totalSize: 0
                    };

                    countRequest.onsuccess = () => {
                        stats.itemCount = countRequest.result;
                    };

                    getAllRequest.onsuccess = () => {
                        /** @type {Array} */
                        const items = getAllRequest.result;
                        stats.totalSize = items.reduce((total, item) => {
                            return total + JSON.stringify(item).length;
                        }, 0);
                        resolve(stats);
                    };

                    transaction.onerror = () => {
                        console.error('❌ IndexedDB stats transaction error:', transaction.error);
                        reject(transaction.error);
                    };
                });
            }
        } catch (error) {
            console.warn('⚠️ IndexedDB stats failed, using fallback:', error);
        }

        // Fallback stats
        return {
            backend: 'indexedDB (fallback)',
            available: false,
            persistent: false,
            itemCount: 0,
            totalSize: 0,
            fallbackUsed: true
        };
    }
}

// ------------ MEMORY BACKEND CLASS

/**
 * Memory Backend (fallback)
 *
 * In-memory storage backend that provides temporary storage when
 * persistent storage is not available. Data is lost on page reload.
 *
 * @class MemoryBackend
 * @implements {StorageBackend}
 */
class MemoryBackend {
    /**
     * Create memory backend instance
     *
     * @constructor

     */
    constructor() {
        /** @type {Map<string, any>} In-memory storage map */
        this.storage = new Map();
    }

    /**
     * Get item from memory storage
     *
     * @async
     * @method getItem
     * @param {string} key - Storage key
     * @returns {Promise<any|null>} Stored data or null
     *

     */
    async getItem(key) {
        return this.storage.get(key) || null;
    }

    /**
     * Set item in memory storage
     *
     * @async
     * @method setItem
     * @param {string} key - Storage key
     * @param {any} value - Value to store
     * @returns {Promise<void>}
     *

     */
    async setItem(key, value) {
        this.storage.set(key, value);
    }

    /**
     * Remove item from memory storage
     *
     * @async
     * @method removeItem
     * @param {string} key - Storage key to remove
     * @returns {Promise<void>}
     *

     */
    async removeItem(key) {
        this.storage.delete(key);
    }

    /**
     * Get memory storage statistics
     *
     * @async
     * @method getStats
     * @returns {Promise<Object>} Storage statistics
     *

     */
    async getStats() {
        return {
            backend: 'memory',
            itemCount: this.storage.size,
            available: true,
            persistent: false
        };
    }
}


export default CalculatorStorageManager;
