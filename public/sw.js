/**
 * @file sw.js
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Progressive Web App Service Worker for offline asset caching.
 *
 * @description
 * Implements standard install/activate caching and network-first / cache-fallback strategy
 * so the calculator can function offline when network connectivity is unavailable.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
// ---------- CONSTANTS
const CACHE_NAME = 'great-calculator-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/TheGreatCalculator.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
];

// ---------- INSTALL
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

// ---------- ACTIVATION
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// ---------- MAIN
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, copy);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
