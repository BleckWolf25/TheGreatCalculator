/**
 * @file ADVANCED SERVICE WORKER
 *
 * @version 3.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Advanced service worker for The Great Calculator with comprehensive
 * offline capabilities, intelligent caching strategies, background sync,
 * and progressive features.
 *
 * Features:
 * - Multiple caching strategies (Cache First, Network First, Stale While Revalidate)
 * - Background synchronization with retry logic
 * - Intelligent cache management and cleanup
 * - Network quality adaptation
 * - Offline fallbacks and error handling
 * - Performance optimization with cache warming
 * - Analytics and monitoring integration
 */

// ------------ CACHE CONFIGURATION

const CACHE_VERSION = '3.0.0';
const CACHE_PREFIX = 'great-calculator';

// Cache names for different strategies
const CACHES = {
    STATIC: `${CACHE_PREFIX}-static-v${CACHE_VERSION}`,
    DYNAMIC: `${CACHE_PREFIX}-dynamic-v${CACHE_VERSION}`,
    IMAGES: `${CACHE_PREFIX}-images-v${CACHE_VERSION}`,
    FONTS: `${CACHE_PREFIX}-fonts-v${CACHE_VERSION}`,
    API: `${CACHE_PREFIX}-api-v${CACHE_VERSION}`,
    OFFLINE: `${CACHE_PREFIX}-offline-v${CACHE_VERSION}`
};

// ------------ STATIC ASSETS TO PRECACHE

const STATIC_ASSETS = [
    // Core HTML
    '/',
    '/index.html',

    // Core CSS
    '/src/styles/original-theme.css',
    '/src/css/error-boundary.css',
    '/src/css/accessibility.css',

    // Core JavaScript modules
    '/src/js/main.js',
    '/src/js/moduleLoader.js',
    '/src/js/modules/calculator.js',
    '/src/js/modules/core/state.js',
    '/src/js/modules/core/operations.js',
    '/src/js/modules/storage/StorageManager.js',
    '/src/js/modules/ui/display.js',
    '/src/js/modules/export/exportManager.js',
    '/src/js/modules/accessibility/accessibilityManager.js',
    '/src/js/modules/accessibility/accessibilitySettings.js',
    '/src/js/modules/pwa/pwaUtils.js',
    '/src/js/modules/pwa/offlineManager.js',

    // Legacy fallbacks
    '/src/js/calculator.js',
    '/src/js/display.js',

    // PWA manifest and icons
    '/manifest.json',
    '/icons/icon.svg',
    '/icons/pwa-192x192.png',
    '/icons/pwa-512x512.png',

    // Offline fallback page
    '/offline.html'
];

// ------------ CACHE STRATEGIES CONFIGURATION

const CACHE_STRATEGIES = {
    // Static assets - Cache First with long expiration
    STATIC: {
        strategy: 'CacheFirst',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        maxEntries: 100
    },

    // Dynamic content - Network First with cache fallback
    DYNAMIC: {
        strategy: 'NetworkFirst',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        maxEntries: 50,
        networkTimeout: 3000
    },

    // Images - Cache First with medium expiration
    IMAGES: {
        strategy: 'CacheFirst',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        maxEntries: 200
    },

    // Fonts - Cache First with long expiration
    FONTS: {
        strategy: 'CacheFirst',
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        maxEntries: 50
    },

    // API responses - Network First with short cache
    API: {
        strategy: 'NetworkFirst',
        maxAge: 60 * 60 * 1000, // 1 hour
        maxEntries: 100,
        networkTimeout: 5000
    },

    // Calculator data - Stale While Revalidate
    CALCULATOR_DATA: {
        strategy: 'StaleWhileRevalidate',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        maxEntries: 1000
    }
};

// ------------ BACKGROUND SYNC CONFIGURATION

const SYNC_CONFIG = {
    CALCULATOR_DATA: 'calculator-data-sync',
    SETTINGS: 'settings-sync',
    HISTORY: 'history-sync',
    FORMULAS: 'formulas-sync'
};

// ------------ UTILITY FUNCTIONS

/**
 * Check if request is for static asset
 * @param {Request} request - Request object
 * @returns {boolean} Whether request is for static asset
 */
function isStaticAsset(request) {
    const url = new URL(request.url);
    return STATIC_ASSETS.some(asset => url.pathname === asset) ||
           /\.(js|css|html|png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/i.test(url.pathname);
}

/**
 * Check if request is for image
 * @param {Request} request - Request object
 * @returns {boolean} Whether request is for image
 */
function isImageRequest(request) {
    return /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(request.url);
}

/**
 * Check if request is for font
 * @param {Request} request - Request object
 * @returns {boolean} Whether request is for font
 */
function isFontRequest(request) {
    return /\.(woff|woff2|ttf|eot)$/i.test(request.url);
}

/**
 * Check if request is for API
 * @param {Request} request - Request object
 * @returns {boolean} Whether request is for API
 */
function isApiRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/') || url.pathname.includes('calculator-data');
}

/**
 * Get appropriate cache name for request
 * @param {Request} request - Request object
 * @returns {string} Cache name
 */
function getCacheName(request) {
    if (isImageRequest(request)) return CACHES.IMAGES;
    if (isFontRequest(request)) return CACHES.FONTS;
    if (isApiRequest(request)) return CACHES.API;
    if (isStaticAsset(request)) return CACHES.STATIC;
    return CACHES.DYNAMIC;
}

/**
 * Get cache strategy for request
 * @param {Request} request - Request object
 * @returns {Object} Cache strategy configuration
 */
function getCacheStrategy(request) {
    if (isImageRequest(request)) return CACHE_STRATEGIES.IMAGES;
    if (isFontRequest(request)) return CACHES.FONTS;
    if (isApiRequest(request)) return CACHE_STRATEGIES.API;
    if (isStaticAsset(request)) return CACHE_STRATEGIES.STATIC;
    return CACHE_STRATEGIES.DYNAMIC;
}

// ------------ SERVICE WORKER EVENT HANDLERS

/**
 * Install event - precache static assets
 */
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing v' + CACHE_VERSION);

    event.waitUntil(
        (async () => {
            try {
                // Open static cache
                const staticCache = await caches.open(CACHES.STATIC);

                console.log('📦 Service Worker: Precaching static assets...');

                // Cache static assets with error handling
                const cachePromises = STATIC_ASSETS.map(async (asset) => {
                    try {
                        const response = await fetch(asset);
                        if (response.ok) {
                            await staticCache.put(asset, response);
                            console.log(`✅ Cached: ${asset}`);
                        } else {
                            console.warn(`⚠️ Failed to cache ${asset}: ${response.status}`);
                        }
                    } catch (error) {
                        console.warn(`⚠️ Error caching ${asset}:`, error);
                    }
                });

                await Promise.allSettled(cachePromises);

                // Create offline fallback page
                await createOfflineFallback(staticCache);

                console.log('✅ Service Worker: Static assets cached successfully');

                // Skip waiting to activate immediately
                await self.skipWaiting();

            } catch (error) {
                console.error('❌ Service Worker: Installation failed:', error);
                throw error;
            }
        })()
    );
});

/**
 * Create offline fallback page
 * @param {Cache} cache - Cache instance
 */
async function createOfflineFallback(cache) {
    const offlineHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Calculator - Offline</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-align: center;
                    padding: 20px;
                }
                .offline-container {
                    max-width: 400px;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }
                .offline-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                }
                h1 {
                    margin: 0 0 20px 0;
                    font-size: 2rem;
                    font-weight: 300;
                }
                p {
                    margin: 0 0 30px 0;
                    opacity: 0.9;
                    line-height: 1.6;
                }
                .retry-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 12px 24px;
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }
                .retry-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-2px);
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="offline-icon">📱</div>
                <h1>You're Offline</h1>
                <p>The calculator is available offline with limited functionality. Check your internet connection to access all features.</p>
                <button class="retry-btn" onclick="window.location.reload()">
                    🔄 Try Again
                </button>
            </div>
        </body>
        </html>
    `;

    const offlineResponse = new Response(offlineHTML, {
        headers: { 'Content-Type': 'text/html' }
    });

    await cache.put('/offline.html', offlineResponse);
    console.log('📄 Offline fallback page created');
}

/**
 * Activate event - clean up old caches and claim clients
 */
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activating v' + CACHE_VERSION);

    event.waitUntil(
        (async () => {
            try {
                // Get all cache names
                const cacheNames = await caches.keys();

                // Delete old caches
                const deletePromises = cacheNames.map(async (cacheName) => {
                    if (cacheName.startsWith(CACHE_PREFIX) &&
                        !Object.values(CACHES).includes(cacheName)) {
                        console.log(`🗑️ Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                });

                await Promise.all(deletePromises);

                // Claim all clients immediately
                await self.clients.claim();

                // Warm up critical caches
                await warmUpCaches();

                console.log('✅ Service Worker: Activated successfully');

                // Notify all clients about activation
                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_ACTIVATED',
                        version: CACHE_VERSION,
                        message: 'Service Worker activated with offline capabilities'
                    });
                });

            } catch (error) {
                console.error('❌ Service Worker: Activation failed:', error);
                throw error;
            }
        })()
    );
});

/**
 * Warm up critical caches by prefetching important resources
 */
async function warmUpCaches() {
    try {
        const criticalResources = [
            '/src/js/main.js',
            '/src/styles/original-theme.css',
            '/src/js/modules/calculator.js'
        ];

        const dynamicCache = await caches.open(CACHES.DYNAMIC);

        const warmUpPromises = criticalResources.map(async (resource) => {
            try {
                if (!(await dynamicCache.match(resource))) {
                    const response = await fetch(resource);
                    if (response.ok) {
                        await dynamicCache.put(resource, response);
                        console.log(`🔥 Warmed up cache: ${resource}`);
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Failed to warm up ${resource}:`, error);
            }
        });

        await Promise.allSettled(warmUpPromises);
        console.log('🔥 Cache warm-up completed');

    } catch (error) {
        console.warn('⚠️ Cache warm-up failed:', error);
    }
}

/**
 * Fetch event - intelligent request handling with multiple caching strategies
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip external requests (except for allowed CDNs)
    const url = new URL(request.url);
    if (url.origin !== self.location.origin && !isAllowedExternalOrigin(url.origin)) {
        return;
    }

    // Handle different types of requests with appropriate strategies
    if (isStaticAsset(request)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isImageRequest(request)) {
        event.respondWith(handleImageRequest(request));
    } else if (isFontRequest(request)) {
        event.respondWith(handleFontRequest(request));
    } else if (isApiRequest(request)) {
        event.respondWith(handleApiRequest(request));
    } else {
        event.respondWith(handleDynamicRequest(request));
    }
});

/**
 * Check if external origin is allowed
 * @param {string} origin - Origin to check
 * @returns {boolean} Whether origin is allowed
 */
function isAllowedExternalOrigin(origin) {
    const allowedOrigins = [
        'https://cdnjs.cloudflare.com',
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com'
    ];
    return allowedOrigins.includes(origin);
}

/**
 * Handle static asset requests with Cache First strategy
 * @param {Request} request - Request object
 * @returns {Promise<Response>} Response promise
 */
async function handleStaticAsset(request) {
    try {
        const cache = await caches.open(CACHES.STATIC);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            console.log(`📦 Static cache hit: ${request.url}`);
            return cachedResponse;
        }

        console.log(`🌐 Fetching static asset: ${request.url}`);
        const response = await fetch(request);

        if (response.ok) {
            const responseClone = response.clone();
            await cache.put(request, responseClone);
            console.log(`💾 Cached static asset: ${request.url}`);
        }

        return response;

    } catch (error) {
        console.error(`❌ Static asset fetch failed: ${request.url}`, error);

        // Return offline fallback for HTML requests
        if (request.headers.get('accept')?.includes('text/html')) {
            const cache = await caches.open(CACHES.STATIC);
            return (await cache.match('/offline.html')) || createOfflineResponse();
        }

        return createOfflineResponse();
    }
}

/**
 * Handle image requests with Cache First strategy
 * @param {Request} request - Request object
 * @returns {Promise<Response>} Response promise
 */
async function handleImageRequest(request) {
    try {
        const cache = await caches.open(CACHES.IMAGES);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            console.log(`🖼️ Image cache hit: ${request.url}`);
            return cachedResponse;
        }

        const response = await fetch(request);

        if (response.ok) {
            const responseClone = response.clone();
            await cache.put(request, responseClone);
            console.log(`💾 Cached image: ${request.url}`);
        }

        return response;

    } catch (error) {
        console.error(`❌ Image fetch failed: ${request.url}`, error);
        return createPlaceholderImage();
    }
}

/**
 * Handle font requests with Cache First strategy
 * @param {Request} request - Request object
 * @returns {Promise<Response>} Response promise
 */
async function handleFontRequest(request) {
    try {
        const cache = await caches.open(CACHES.FONTS);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            console.log(`🔤 Font cache hit: ${request.url}`);
            return cachedResponse;
        }

        const response = await fetch(request);

        if (response.ok) {
            const responseClone = response.clone();
            await cache.put(request, responseClone);
            console.log(`💾 Cached font: ${request.url}`);
        }

        return response;

    } catch (error) {
        console.error(`❌ Font fetch failed: ${request.url}`, error);
        return createOfflineResponse();
    }
}

/**
 * Handle API requests with Network First strategy
 * @param {Request} request - Request object
 * @returns {Promise<Response>} Response promise
 */
async function handleApiRequest(request) {
    const strategy = CACHE_STRATEGIES.API;

    try {
        // Try network first with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), strategy.networkTimeout);

        const response = await fetch(request, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
            const cache = await caches.open(CACHES.API);
            const responseClone = response.clone();
            await cache.put(request, responseClone);
            console.log(`💾 Cached API response: ${request.url}`);
        }

        return response;

    } catch (error) {
        console.warn(`⚠️ API network failed, trying cache: ${request.url}`, error);

        // Fallback to cache
        const cache = await caches.open(CACHES.API);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            console.log(`📦 API cache hit: ${request.url}`);
            return cachedResponse;
        }

        // Return offline API response
        return createOfflineApiResponse();
    }
}

/**
 * Handle dynamic requests with Network First strategy
 * @param {Request} request - Request object
 * @returns {Promise<Response>} Response promise
 */
async function handleDynamicRequest(request) {
    const strategy = CACHE_STRATEGIES.DYNAMIC;

    try {
        // Try network first with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), strategy.networkTimeout);

        const response = await fetch(request, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
            const cache = await caches.open(CACHES.DYNAMIC);
            const responseClone = response.clone();
            await cache.put(request, responseClone);
            console.log(`💾 Cached dynamic content: ${request.url}`);
        }

        return response;

    } catch (error) {
        console.warn(`⚠️ Dynamic network failed, trying cache: ${request.url}`, error);

        // Fallback to cache
        const cache = await caches.open(CACHES.DYNAMIC);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            console.log(`📦 Dynamic cache hit: ${request.url}`);
            return cachedResponse;
        }

        // Return appropriate offline fallback
        if (request.headers.get('accept')?.includes('text/html')) {
            const staticCache = await caches.open(CACHES.STATIC);
            return (await staticCache.match('/offline.html')) || createOfflineResponse();
        }

        return createOfflineResponse();
    }
}

/**
 * Create offline response
 * @returns {Response} Offline response
 */
function createOfflineResponse() {
    return new Response('Offline - Content not available', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
            'Content-Type': 'text/plain'
        })
    });
}

/**
 * Create placeholder image response
 * @returns {Response} Placeholder image response
 */
function createPlaceholderImage() {
    // Simple 1x1 transparent PNG
    const imageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const imageBytes = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));

    return new Response(imageBytes, {
        status: 200,
        statusText: 'OK',
        headers: new Headers({
            'Content-Type': 'image/png',
            'Cache-Control': 'max-age=86400'
        })
    });
}

/**
 * Create offline API response
 * @returns {Response} Offline API response
 */
function createOfflineApiResponse() {
    const offlineData = {
        error: 'Offline',
        message: 'API not available offline',
        offline: true,
        timestamp: Date.now()
    };

    return new Response(JSON.stringify(offlineData), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    });
}

// Background sync for saving data when back online
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'calculator-data-sync') {
    event.waitUntil(syncCalculatorData());
  }
});

// Sync calculator data when back online
async function syncCalculatorData() {
  try {
    // Get pending data from IndexedDB or localStorage
    const pendingData = await getPendingData();

    if (pendingData && pendingData.length > 0) {
      // Process pending data
      for (const data of pendingData) {
        await processPendingData(data);
      }

      // Clear pending data after successful sync
      await clearPendingData();

      // Notify all clients about successful sync
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'DATA_SYNCED',
          message: 'Calculator data synced successfully'
        });
      });
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync calculator data', error);
  }
}

// Helper functions for data management
async function getPendingData() {
  // Implementation would depend on your data storage strategy
  // This is a placeholder for demonstration
  return [];
}

async function processPendingData(data) {
  // Process individual data items
  console.log('Processing pending data:', data);
}

async function clearPendingData() {
  // Clear processed data
  console.log('Clearing pending data');
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;

  switch (type) {
  case 'SKIP_WAITING':
    self.skipWaiting();
    break;
  case 'CACHE_FORMULA':
    // Cache custom formula for offline use
    cacheFormula(data);
    break;
  case 'GET_CACHE_STATUS':
    // Return cache status
    getCacheStatus().then(status => {
      event.ports[0].postMessage(status);
    });
    break;
  default:
    console.log('Service Worker: Unknown message type', type);
  }
});

async function cacheFormula(formula) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const response = new Response(JSON.stringify(formula), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(`/formula/${formula.id}`, response);
    console.log('Service Worker: Formula cached', formula.id);
  } catch (error) {
    console.error('Service Worker: Failed to cache formula', error);
  }
}

async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    const totalSize = await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        return keys.length;
      })
    );

    return {
      caches: cacheNames.length,
      totalFiles: totalSize.reduce((sum, count) => sum + count, 0),
      isOnline: navigator.onLine
    };
  } catch (error) {
    console.error('Service Worker: Failed to get cache status', error);
    return { error: error.message };
  }
}

// Periodic cleanup of old cache entries
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupOldCaches());
  }
});

async function cleanupOldCaches() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const keys = await cache.keys();
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

    for (const request of keys) {
      const response = await cache.match(request);
      const dateHeader = response.headers.get('date');

      if (dateHeader) {
        const cacheDate = new Date(dateHeader).getTime();
        if (now - cacheDate > maxAge) {
          await cache.delete(request);
          console.log('Service Worker: Deleted old cache entry', request.url);
        }
      }
    }
  } catch (error) {
    console.error('Service Worker: Cache cleanup failed', error);
  }
}
