/**
 * @file PWA UTILITIES
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Progressive Web App utilities for The Great Calculator.
 * Provides PWA installation, update management, and offline capabilities.
 *
 * Features:
 * - Install prompt management
 * - Update notifications
 * - Offline detection
 * - Service worker communication
 * - PWA lifecycle management
 */

// ------------ PWA UTILITIES CLASS
/**
 * PWA utilities class for managing Progressive Web App features
 * @class PWAUtils
 */
class PWAUtils {
    /**
     * Create PWA utilities instance
     * @constructor
     */
    constructor() {
        /** @type {Event|null} */
        this.deferredPrompt = null;

        /** @type {boolean} */
        this.isInstalled = false;

        /** @type {boolean} */
        this.isOnline = navigator.onLine;

        /** @type {ServiceWorkerRegistration|null} */
        this.swRegistration = null;

        /** @type {Set<Function>} */
        this.updateCallbacks = new Set();

        /** @type {Set<Function>} */
        this.installCallbacks = new Set();

        /** @type {Set<Function>} */
        this.offlineCallbacks = new Set();

        this.init();
    }

    /**
     * Initialize PWA utilities
     * @async
     * @method init
     * @returns {Promise<void>}
     */
    async init() {
        try {
            this.setupEventListeners();
            this.checkInstallStatus();
            await this.registerServiceWorker();
            this.setupUpdateDetection();
            console.log('✅ PWA utilities initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize PWA utilities:', error);
        }
    }

    /**
     * Setup event listeners for PWA events
     * @method setupEventListeners
     * @returns {void}
     */
    setupEventListeners() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (event) => {
            event.preventDefault();
            this.deferredPrompt = event;
            this.notifyInstallAvailable();
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', () => {
            this.isInstalled = true;
            this.deferredPrompt = null;
            console.log('✅ PWA installed successfully');
        });

        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notifyOnlineStatus(true);
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notifyOnlineStatus(false);
        });
    }

    /**
     * Check if PWA is already installed
     * @method checkInstallStatus
     * @returns {void}
     */
    checkInstallStatus() {
        // Check if running in standalone mode (installed PWA)
        this.isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                          window.navigator.standalone === true;
    }

    /**
     * Register service worker
     * @async
     * @method registerServiceWorker
     * @returns {Promise<void>}
     */
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered successfully');
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    /**
     * Setup update detection for service worker
     * @method setupUpdateDetection
     * @returns {void}
     */
    setupUpdateDetection() {
        if (this.swRegistration) {
            this.swRegistration.addEventListener('updatefound', () => {
                const newWorker = this.swRegistration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.notifyUpdateAvailable();
                        }
                    });
                }
            });
        }
    }

    /**
     * Show install prompt
     * @async
     * @method showInstallPrompt
     * @returns {Promise<boolean>} True if user accepted install
     */
    async showInstallPrompt() {
        if (!this.deferredPrompt) {
            return false;
        }

        try {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            this.deferredPrompt = null;
            return outcome === 'accepted';
        } catch (error) {
            console.error('❌ Install prompt failed:', error);
            return false;
        }
    }

    /**
     * Check if install is available
     * @method isInstallAvailable
     * @returns {boolean}
     */
    isInstallAvailable() {
        return !!this.deferredPrompt && !this.isInstalled;
    }

    /**
     * Add callback for install availability
     * @method onInstallAvailable
     * @param {Function} callback - Callback function
     * @returns {void}
     */
    onInstallAvailable(callback) {
        this.installCallbacks.add(callback);
    }

    /**
     * Add callback for updates
     * @method onUpdateAvailable
     * @param {Function} callback - Callback function
     * @returns {void}
     */
    onUpdateAvailable(callback) {
        this.updateCallbacks.add(callback);
    }

    /**
     * Add callback for offline status changes
     * @method onOfflineStatusChange
     * @param {Function} callback - Callback function
     * @returns {void}
     */
    onOfflineStatusChange(callback) {
        this.offlineCallbacks.add(callback);
    }

    /**
     * Notify install callbacks
     * @method notifyInstallAvailable
     * @returns {void}
     */
    notifyInstallAvailable() {
        this.installCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('❌ Install callback error:', error);
            }
        });
    }

    /**
     * Notify update callbacks
     * @method notifyUpdateAvailable
     * @returns {void}
     */
    notifyUpdateAvailable() {
        this.updateCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('❌ Update callback error:', error);
            }
        });
    }

    /**
     * Notify offline status callbacks
     * @method notifyOnlineStatus
     * @param {boolean} isOnline - Online status
     * @returns {void}
     */
    notifyOnlineStatus(isOnline) {
        this.offlineCallbacks.forEach(callback => {
            try {
                callback(isOnline);
            } catch (error) {
                console.error('❌ Offline callback error:', error);
            }
        });
    }

    /**
     * Get PWA status information
     * @method getStatus
     * @returns {Object} PWA status
     */
    getStatus() {
        return {
            isInstalled: this.isInstalled,
            isInstallAvailable: this.isInstallAvailable(),
            isOnline: this.isOnline,
            hasServiceWorker: !!this.swRegistration
        };
    }

    /**
     * Log PWA events for analytics
     * @method logEvent
     * @param {string} eventName - Event name
     * @param {Object} [eventData] - Optional event data
     * @returns {void}
     */
    logEvent(eventName, eventData = {}) {
        try {
            // Log to console for debugging
            console.log(`📊 PWA Event: ${eventName}`, eventData);

            // Send to analytics if available
            if (typeof gtag === 'function') {
                gtag('event', eventName, eventData);
            } else if (typeof analytics !== 'undefined' && analytics.track) {
                analytics.track(eventName, eventData);
            }
        } catch (error) {
            console.error('❌ Failed to log PWA event:', error);
        }
    }
}

// ------------ GLOBAL EXPORT
// Make PWAUtils available globally for script loading
if (typeof window !== 'undefined') {
    window.PWAUtils = PWAUtils;
}

/**
 * Export for ES6 module systems (modern bundlers, native ES modules)
 * Enables tree-shaking and modern import/export syntax.
 *
 * @default
 */
export default PWAUtils;
