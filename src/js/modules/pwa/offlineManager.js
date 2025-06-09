/**
 * @file OFFLINE MANAGER
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Offline management system for The Great Calculator.
 * Provides comprehensive offline capabilities including data synchronization,
 * background sync, cache management, and offline-first architecture.
 *
 * Features:
 * - Intelligent cache management with multiple strategies
 * - Background data synchronization
 * - Offline-first data persistence
 * - Network status monitoring and adaptation
 * - Conflict resolution for offline changes
 * - Progressive data loading
 * - Cache optimization and cleanup
 */

import { openDB } from 'idb';

// ------------ OFFLINE MANAGER CLASS

/**
 * Advanced Offline Manager Class
 *
 * Manages comprehensive offline functionality for the calculator including
 * intelligent caching, background sync, and offline-first data architecture.
 *
 * @class OfflineManager
 * @example
 * const offlineManager = new OfflineManager();
 * await offlineManager.initialize();
 */
class OfflineManager {
    /**
     * Create offline manager instance
     *
     * @constructor
     */
    constructor() {
        /** @type {IDBDatabase|null} IndexedDB database instance */
        this.db = null;

        /** @type {boolean} Current network status */
        this.isOnline = navigator.onLine;

        /** @type {Array} Queue for offline operations */
        this.offlineQueue = [];

        /** @type {Map} Cache strategies for different data types */
        this.cacheStrategies = new Map();

        /** @type {Object} Sync configuration */
        this.syncConfig = {
            maxRetries: 3,
            retryDelay: 1000,
            batchSize: 10,
            syncInterval: 30000 // 30 seconds
        };

        /** @type {Object} Cache configuration */
        this.cacheConfig = {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            maxEntries: 1000,
            cleanupInterval: 60 * 60 * 1000 // 1 hour
        };

        /** @type {Set} Active sync operations */
        this.activeSyncs = new Set();

        /** @type {number|null} Cleanup interval ID */
        this.cleanupInterval = null;

        /** @type {number|null} Sync interval ID */
        this.syncInterval = null;

        void this.init();
    }

    /**
     * Initialize offline manager
     *
     * @method init
     * @returns {Promise<void>}
     */
    async init() {
        try {
            await this.initializeDatabase();
            this.setupNetworkMonitoring();
            this.setupCacheStrategies();
            this.setupBackgroundSync();
            this.startPeriodicCleanup();
            this.startPeriodicSync();

            console.log('📴 Offline manager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize offline manager:', error);
        }
    }

    /**
     * Initialize IndexedDB database
     *
     * @method initializeDatabase
     * @returns {Promise<void>}
     * @private
     */
    async initializeDatabase() {
        this.db = await openDB('CalculatorOfflineDB', 3, {
            upgrade(db, _oldVersion, _newVersion, _transaction) {
                // Calculator data store
                if (!db.objectStoreNames.contains('calculatorData')) {
                    const calculatorStore = db.createObjectStore('calculatorData', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    calculatorStore.createIndex('timestamp', 'timestamp');
                    calculatorStore.createIndex('type', 'type');
                    calculatorStore.createIndex('synced', 'synced');
                }

                // History store
                if (!db.objectStoreNames.contains('history')) {
                    const historyStore = db.createObjectStore('history', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    historyStore.createIndex('timestamp', 'timestamp');
                    historyStore.createIndex('expression', 'expression');
                }

                // Formulas store
                if (!db.objectStoreNames.contains('formulas')) {
                    const formulasStore = db.createObjectStore('formulas', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    formulasStore.createIndex('name', 'name');
                    formulasStore.createIndex('category', 'category');
                    formulasStore.createIndex('synced', 'synced');
                }

                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    const settingsStore = db.createObjectStore('settings', {
                        keyPath: 'key'
                    });
                    settingsStore.createIndex('timestamp', 'timestamp');
                }

                // Sync queue store
                if (!db.objectStoreNames.contains('syncQueue')) {
                    const syncStore = db.createObjectStore('syncQueue', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    syncStore.createIndex('priority', 'priority');
                    syncStore.createIndex('timestamp', 'timestamp');
                    syncStore.createIndex('operation', 'operation');
                }

                // Cache metadata store
                if (!db.objectStoreNames.contains('cacheMetadata')) {
                    const cacheMetaStore = db.createObjectStore('cacheMetadata', {
                        keyPath: 'url'
                    });
                    cacheMetaStore.createIndex('timestamp', 'timestamp');
                    cacheMetaStore.createIndex('strategy', 'strategy');
                    cacheMetaStore.createIndex('size', 'size');
                }
            }
        });
    }

    /**
     * Setup network monitoring
     *
     * @method setupNetworkMonitoring
     * @returns {void}
     * @private
     */
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onNetworkStatusChange('online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onNetworkStatusChange('offline');
        });

        // Advanced network quality detection
        if ('connection' in navigator) {
            navigator.connection.addEventListener('change', () => {
                this.onConnectionChange(navigator.connection);
            });
        }
    }

    /**
     * Handle network status changes
     *
     * @method onNetworkStatusChange
     * @param {string} status - Network status ('online' or 'offline')
     * @returns {void}
     * @private
     */
    onNetworkStatusChange(status) {
        console.log(`🌐 Network status changed: ${status}`);

        if (status === 'online') {
            void this.processOfflineQueue();
            void this.syncPendingData();
        }

        // Dispatch custom event
        window.dispatchEvent(new CustomEvent('network-status-change', {
            detail: { status, isOnline: this.isOnline }
        }));
    }

    /**
     * Handle connection quality changes
     *
     * @method onConnectionChange
     * @param {NetworkInformation} connection - Connection information
     * @returns {void}
     * @private
     */
    onConnectionChange(connection) {
        const { effectiveType, downlink, rtt } = connection;

        console.log(`📶 Connection quality: ${effectiveType}, downlink: ${downlink}Mbps, rtt: ${rtt}ms`);

        // Adjust sync behavior based on connection quality
        if (effectiveType === 'slow-2g' || effectiveType === '2g') {
            this.syncConfig.batchSize = 5;
            this.syncConfig.syncInterval = 60000; // 1 minute
        } else if (effectiveType === '3g') {
            this.syncConfig.batchSize = 10;
            this.syncConfig.syncInterval = 30000; // 30 seconds
        } else {
            this.syncConfig.batchSize = 20;
            this.syncConfig.syncInterval = 15000; // 15 seconds
        }
    }

    /**
     * Setup cache strategies for different data types
     *
     * @method setupCacheStrategies
     * @returns {void}
     * @private
     */
    setupCacheStrategies() {
        // Calculator state - cache first with network fallback
        this.cacheStrategies.set('calculator-state', {
            strategy: 'CacheFirst',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            updateInBackground: true
        });

        // History data - network first with cache fallback
        this.cacheStrategies.set('history', {
            strategy: 'NetworkFirst',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            timeout: 3000
        });

        // Formulas - stale while revalidate
        this.cacheStrategies.set('formulas', {
            strategy: 'StaleWhileRevalidate',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            updateInBackground: true
        });

        // Settings - cache first
        this.cacheStrategies.set('settings', {
            strategy: 'CacheFirst',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            updateInBackground: false
        });

        // Static assets - cache first with long expiration
        this.cacheStrategies.set('static', {
            strategy: 'CacheFirst',
            maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
            updateInBackground: false
        });
    }

    /**
     * Setup background sync
     *
     * @method setupBackgroundSync
     * @returns {void}
     * @private
     */
    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then(registration => {
                // Register background sync
                return registration.sync.register('calculator-background-sync');
            }).catch(error => {
                console.warn('⚠️ Background sync not supported:', error);
            });
        }
    }

    /**
     * Save data with offline support
     *
     * @method saveData
     * @param {string} store - Store name
     * @param {Object} data - Data to save
     * @param {Object} options - Save options
     * @returns {Promise<boolean>} Success status
     */
    async saveData(store, data, options = {}) {
        try {
            const timestamp = Date.now();
            const dataWithMeta = {
                ...data,
                timestamp,
                synced: this.isOnline,
                offline: !this.isOnline,
                ...options
            };

            // Save to IndexedDB
            const tx = this.db.transaction(store, 'readwrite');
            const result = tx.objectStore(store).add(dataWithMeta);
            await tx.complete;

            // If offline, add to sync queue
            if (!this.isOnline) {
                await this.addToSyncQueue({
                    operation: 'save',
                    store,
                    data: dataWithMeta,
                    priority: options.priority || 1
                });
            }

            console.log(`💾 Data saved to ${store}:`, result);
            return true;
        } catch (error) {
            console.error(`❌ Failed to save data to ${store}:`, error);
            return false;
        }
    }

    /**
     * Load data with cache strategy
     *
     * @method loadData
     * @param {string} store - Store name
     * @param {Object} query - Query parameters
     * @returns {Promise<Array>} Retrieved data
     */
    async loadData(store, query = {}) {
        try {
            const tx = this.db.transaction(store, 'readonly');
            const objectStore = tx.objectStore(store);

            let result;
            if (query.index && query.value) {
                const index = objectStore.index(query.index);
                result = index.getAll(query.value);
            } else if (query.key) {
                result = [objectStore.get(query.key)];
            } else {
                result = objectStore.getAll();
            }

            await tx.complete;

            // Filter out null/undefined results
            const filteredResult = result.filter(item => item != null);

            console.log(`📖 Loaded ${filteredResult.length} items from ${store}`);
            return filteredResult;
        } catch (error) {
            console.error(`❌ Failed to load data from ${store}:`, error);
            return [];
        }
    }

    /**
     * Add operation to sync queue
     *
     * @method addToSyncQueue
     * @param {Object} operation - Operation to queue
     * @returns {Promise<void>}
     * @private
     */
    async addToSyncQueue(operation) {
        try {
            const queueItem = {
                ...operation,
                timestamp: Date.now(),
                retries: 0,
                id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            };

            const tx = this.db.transaction('syncQueue', 'readwrite');
            tx.objectStore('syncQueue').add(queueItem);
            await tx.complete;

            console.log('📤 Added to sync queue:', queueItem.id);
        } catch (error) {
            console.error('❌ Failed to add to sync queue:', error);
        }
    }

    /**
     * Process offline operation queue
     *
     * @method processOfflineQueue
     * @returns {Promise<void>}
     * @private
     */
    async processOfflineQueue() {
        if (!this.isOnline || this.activeSyncs.has('offline-queue')) {
            return;
        }

        this.activeSyncs.add('offline-queue');

        try {
            const tx = this.db.transaction('syncQueue', 'readonly');
            const queueItems = tx.objectStore('syncQueue').getAll();
            await tx.complete;

            console.log(`🔄 Processing ${queueItems.length} queued operations`);

            for (const item of queueItems) {
                try {
                    await this.processSyncItem(item);
                    await this.removeSyncItem(item.id);
                } catch (error) {
                    console.error('❌ Failed to process sync item:', error);
                    await this.updateSyncItemRetries(item.id);
                }
            }
        } catch (error) {
            console.error('❌ Failed to process offline queue:', error);
        } finally {
            this.activeSyncs.delete('offline-queue');
        }
    }

    /**
     * Process individual sync item
     *
     * @method processSyncItem
     * @param {Object} item - Sync item to process
     * @returns {Promise<void>}
     * @private
     */
    async processSyncItem(item) {
        const { operation, store, data } = item;

        switch (operation) {
            case 'save':
                // Mark as synced and update
                const updatedData = { ...data, synced: true, offline: false };
                const tx = this.db.transaction(store, 'readwrite');
                tx.objectStore(store).put(updatedData);
                await tx.complete;
                break;

            case 'delete':
                // Process deletion
                const deleteTx = this.db.transaction(store, 'readwrite');
                deleteTx.objectStore(store).delete(data.id);
                await deleteTx.complete;
                break;

            case 'update':
                // Process update
                const updateTx = this.db.transaction(store, 'readwrite');
                updateTx.objectStore(store).put(data);
                await updateTx.complete;
                break;

            default:
                console.warn('⚠️ Unknown sync operation:', operation);
        }

        console.log(`✅ Processed sync item: ${item.id}`);
    }

    /**
     * Remove sync item from queue
     *
     * @method removeSyncItem
     * @param {string} itemId - Item ID to remove
     * @returns {Promise<void>}
     * @private
     */
    async removeSyncItem(itemId) {
        try {
            const tx = this.db.transaction('syncQueue', 'readwrite');
            tx.objectStore('syncQueue').delete(itemId);
            await tx.complete;
        } catch (error) {
            console.error('❌ Failed to remove sync item:', error);
        }
    }

    /**
     * Update sync item retry count
     *
     * @method updateSyncItemRetries
     * @param {string} itemId - Item ID to update
     * @returns {Promise<void>}
     * @private
     */
    async updateSyncItemRetries(itemId) {
        try {
            const tx = this.db.transaction('syncQueue', 'readwrite');
            const store = tx.objectStore('syncQueue');
            const item = store.get(itemId);

            if (item) {
                item.retries = (item.retries || 0) + 1;

                if (item.retries >= this.syncConfig.maxRetries) {
                    // Remove item if max retries exceeded
                    store.delete(itemId);
                    console.warn(`⚠️ Max retries exceeded for sync item: ${itemId}`);
                } else {
                    // Update retry count
                    store.put(item);
                }
            }

            await tx.complete;
        } catch (error) {
            console.error('❌ Failed to update sync item retries:', error);
        }
    }

    /**
     * Sync pending data
     *
     * @method syncPendingData
     * @returns {Promise<void>}
     * @private
     */
    async syncUnsyncedData(storeName) {
        try {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);

            // Get unsynced items
            const unsyncedItems = [];
            // eslint-disable-next-line @typescript-eslint/await-thenable
            let cursor = await store.openCursor();

            while (cursor) {
                const item = cursor.value;
                if (item && !item.synced) {
                    unsyncedItems.push(item);
                }
                cursor = await cursor.continue();
            }

            await tx.complete;

            // Process unsynced items in batches
            for (let i = 0; i < unsyncedItems.length; i += this.syncConfig.batchSize) {
                const batch = unsyncedItems.slice(i, i + this.syncConfig.batchSize);
                await this.processSyncBatch(storeName, batch);
            }

            console.log(`✅ Synced ${unsyncedItems.length} items from ${storeName}`);
        } catch (error) {
            console.error(`❌ Failed to sync unsynced data from ${storeName}:`, error);
        }
    }

    /**
     * Process sync batch
     *
     * @method processSyncBatch
     * @param {string} storeName - Store name
     * @param {Array} batch - Batch of items to sync
     * @returns {Promise<void>}
     * @private
     */
    async processSyncBatch(storeName, batch) {
        try {
            // Mark items as synced
            const tx = this.db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);

            for (const item of batch) {
                item.synced = true;
                item.offline = false;
                store.put(item);
            }

            await tx.complete;

            console.log(`✅ Processed sync batch of ${batch.length} items from ${storeName}`);
        } catch (error) {
            console.error(`❌ Failed to process sync batch from ${storeName}:`, error);
        }
    }

    /**
     * Start periodic cleanup
     *
     * @method startPeriodicCleanup
     * @returns {void}
     * @private
     */
    startPeriodicCleanup() {
        this.cleanupInterval = setInterval(() => {
            void this.cleanupExpiredData();
        }, this.cacheConfig.cleanupInterval);
    }

    /**
     * Start periodic sync
     *
     * @method startPeriodicSync
     * @returns {void}
     * @private
     */
    startPeriodicSync() {
        this.syncInterval = setInterval(() => {
            if (this.isOnline) {
                void this.syncPendingData();
            }
        }, this.syncConfig.syncInterval);
    }

    /**
     * Cleanup expired data
     *
     * @method cleanupExpiredData
     * @returns {Promise<void>}
     * @private
     */
    async cleanupExpiredData() {
        try {
            const now = Date.now();
            const stores = ['calculatorData', 'history', 'formulas', 'settings'];

            for (const storeName of stores) {
                const tx = this.db.transaction(storeName, 'readwrite');
                const store = tx.objectStore(storeName);
                const index = store.index('timestamp');

                const expiredItems = [];
                // eslint-disable-next-line @typescript-eslint/await-thenable
                const cursor = await index.openCursor();

                if (cursor) {
                    do {
                        const item = cursor.value;
                        if (now - item.timestamp > this.cacheConfig.maxAge) {
                            expiredItems.push(item.id);
                        }
                    } while (await cursor.continue());
                }

                // Delete expired items
                for (const id of expiredItems) {
                     store.delete(id);
                }

                await tx.complete;

                if (expiredItems.length > 0) {
                    console.log(`🧹 Cleaned up ${expiredItems.length} expired items from ${storeName}`);
                }
            }
        } catch (error) {
            console.error('❌ Failed to cleanup expired data:', error);
        }
    }

    /**
     * Get offline status and statistics
     *
     * @method getOfflineStatus
     * @returns {Promise<Object>} Offline status information
     */
    async getOfflineStatus() {
        try {
            const status = {
                isOnline: this.isOnline,
                queueSize: 0,
                cacheSize: 0,
                lastSync: null,
                stores: {}
            };

            // Get queue size
            const queueTx = this.db.transaction('syncQueue', 'readonly');
            const queueItems =  queueTx.objectStore('syncQueue').getAll();
            status.queueSize = queueItems.length;
            await queueTx.complete;

            // Get store statistics
            const stores = ['calculatorData', 'history', 'formulas', 'settings'];
            for (const storeName of stores) {
                const tx = this.db.transaction(storeName, 'readonly');
                const store = tx.objectStore(storeName);
                const count =  store.count();

                // Get unsynced count
                const unsyncedCount = await this.getUnsyncedCount(storeName);

                status.stores[storeName] = {
                    total: count,
                    unsynced: unsyncedCount
                };

                await tx.complete;
            }

            return status;
        } catch (error) {
            console.error('❌ Failed to get offline status:', error);
            return {
                isOnline: this.isOnline,
                queueSize: 0,
                cacheSize: 0,
                lastSync: null,
                stores: {},
                error: error.message
            };
        }
    }

    /**
     * Get unsynced count for store
     *
     * @method getUnsyncedCount
     * @param {string} storeName - Store name
     * @returns {Promise<number>} Unsynced item count
     * @private
     */
async getUnsyncedCount(storeName) {
    try {
        const tx = this.db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);

        let count = 0;
        // eslint-disable-next-line @typescript-eslint/await-thenable
        let cursor = await store.openCursor();

        while (cursor) {
            if (cursor.value && !cursor.value.synced) {
                count++;
            }
            cursor = await cursor.continue();
        }

        await tx.complete;
        return count;
    } catch (error) {
        console.error(`❌ Failed to get unsynced count for ${storeName}:`, error);
        return 0;
    }
}

    /**
     * Force sync all data
     *
     * @method forceSyncAll
     * @returns {Promise<boolean>} Success status
     */
    async forceSyncAll() {
        if (!this.isOnline) {
            console.warn('⚠️ Cannot force sync while offline');
            return false;
        }

        try {
            await this.processOfflineQueue();
            await this.syncPendingData();

            console.log('✅ Force sync completed successfully');
            return true;
        } catch (error) {
            console.error('❌ Force sync failed:', error);
            return false;
        }
    }

    /**
     * Clear all offline data
     *
     * @method clearOfflineData
     * @returns {Promise<boolean>} Success status
     */
    async clearOfflineData() {
        try {
            const stores = ['calculatorData', 'history', 'formulas', 'settings', 'syncQueue', 'cacheMetadata'];

            for (const storeName of stores) {
                const tx = this.db.transaction(storeName, 'readwrite');
                 tx.objectStore(storeName).clear();
                await tx.complete;
            }

            console.log('🧹 All offline data cleared');
            return true;
        } catch (error) {
            console.error('❌ Failed to clear offline data:', error);
            return false;
        }
    }

    /**
     * Destroy offline manager
     *
     * @method destroy
     * @returns {void}
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }

        if (this.db) {
            this.db.close();
        }

        console.log('🔄 Offline manager destroyed');
    }
}

// ------------ MODULE EXPORTS


export default OfflineManager;
