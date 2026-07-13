/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @file db.test.ts
 *
 * @version 1.0.0
 * @author BleckWolf25
 * @license MIT
 *
 * @summary Unit tests for IndexedDB database helper methods.
 *
 * @description
 * Mocks browser-native IndexedDB services, window objects, and transactions
 * to verify correct database operations for get, set, and delete.
 *
 * @since 13/07/2026
 * @updated 13/07/2026
 */
// ---------- IMPORTS
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { openDB, getValue, setValue, deleteValue } from '@/lib/db';

// ---------- TESTS: DATABASE UTILITIES
describe('Database Utilities (IndexedDB)', () => {
  // ---------- CONFIGURATION (Mock window and indexedDB objects globally in Node)
  beforeEach(() => {
    const mockRequest: any = {};
    const mockDb: any = {
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(true),
      },
      transaction: vi.fn().mockImplementation(() => {
        const mockStoreRequest: any = {};
        const mockStore = {
          get: vi.fn().mockImplementation(() => {
            setTimeout(() => {
              mockStoreRequest.result = 'mock-value';
              if (mockStoreRequest.onsuccess) mockStoreRequest.onsuccess();
            }, 1);
            return mockStoreRequest;
          }),
          put: vi.fn().mockImplementation(() => {
            setTimeout(() => {
              if (mockStoreRequest.onsuccess) mockStoreRequest.onsuccess();
            }, 1);
            return mockStoreRequest;
          }),
          delete: vi.fn().mockImplementation(() => {
            setTimeout(() => {
              if (mockStoreRequest.onsuccess) mockStoreRequest.onsuccess();
            }, 1);
            return mockStoreRequest;
          }),
        };
        return {
          objectStore: vi.fn().mockReturnValue(mockStore),
        };
      }),
    };

    const mockIndexedDB = {
      open: vi.fn().mockImplementation(() => {
        // ---------- STAGE RESOLUTION (Trigger success event asynchronously after call)
        setTimeout(() => {
          mockRequest.result = mockDb;
          if (mockRequest.onsuccess) {
            mockRequest.onsuccess();
          }
        }, 1);
        return mockRequest;
      }),
    };

    global.window = {
      indexedDB: mockIndexedDB,
    } as any;

    // ---------- GLOBAL REGISTER (Register global indexedDB to resolve standard scoping)
    global.indexedDB = mockIndexedDB as any;
  });

  afterEach(() => {
    delete (global as any).window;
    delete (global as any).indexedDB;
  });

  // ---------- TEST: OPEN DB
  it('opens IndexedDB database instance successfully', async () => {
    const db = await openDB();
    expect(db).toBeDefined();
    expect(db?.objectStoreNames).toBeDefined();
  });

  // ---------- TEST: GET VALUE
  it('performs query retrieval request from store', async () => {
    const val = await getValue('test-key');
    expect(val).toBe('mock-value');
  });

  // ---------- TEST: SET VALUE
  it('performs set write requests to store successfully', async () => {
    await expect(setValue('test-key', 'new-val')).resolves.toBeUndefined();
  });

  // ---------- TEST: DELETE VALUE
  it('performs key deletion requests from store successfully', async () => {
    await expect(deleteValue('test-key')).resolves.toBeUndefined();
  });
});
