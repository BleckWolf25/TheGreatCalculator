/**
 * @file db.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary IndexedDB helper methods for persistent key-value storage.
 *
 * @description
 * Wrapper functions to open database transactions, fetch values, set values,
 * and delete entries asynchronously in a browser-native IndexedDB database.
 *
 * @since 10/07/2026
 * @updated 13/07/2026
 */
'use client';

// ---------- CONSTANTS
const DB_NAME = 'TheGreatCalculatorDB';
const STORE_NAME = 'calculator-store';

// ---------- DATABASE ACTIONS
export function openDB(): Promise<IDBDatabase | null> {
  // ---------- GUARD (Check window availability for Server-Side Rendering compatibility)
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;

      // ---------- INITIALIZATION (Create store if it does not exist)
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function getValue<T>(key: string): Promise<T | null> {
  const db = await openDB();

  // ---------- GUARD (Verify database was opened successfully)
  if (!db) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve((request.result ?? null) as T | null);
  });
}

export async function setValue<T>(key: string, value: T): Promise<void> {
  const db = await openDB();

  // ---------- GUARD (Verify database was opened successfully)
  if (!db) {
    return;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteValue(key: string): Promise<void> {
  const db = await openDB();

  // ---------- GUARD (Verify database was opened successfully)
  if (!db) {
    return;
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
