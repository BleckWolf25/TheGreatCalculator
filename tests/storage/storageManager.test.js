/**
 * Storage Manager Unit Tests
 * Tests for data persistence and storage operations with ES modules
 */

// Import the StorageManager module directly
import StorageManager from '../../src/js/modules/storage/storageManager.js';

// Setup global storage environment
beforeAll(() => {
  // Mock localStorage
  const localStorageMock = {
    store: {},
    getItem: function(key) {
      return this.store[key] || null;
    },
    setItem: function(key, value) {
      this.store[key] = value.toString();
    },
    removeItem: function(key) {
      delete this.store[key];
    },
    clear: function() {
      this.store = {};
    },
    get length() {
      return Object.keys(this.store).length;
    },
    key: function(index) {
      const keys = Object.keys(this.store);
      return keys[index] || null;
    }
  };

  global.localStorage = localStorageMock;
  global.sessionStorage = localStorageMock;
  global.window = { localStorage: localStorageMock, sessionStorage: localStorageMock };
});

describe('StorageManager', () => {
  let storageManager;

  beforeEach(async () => {
    storageManager = new StorageManager();
    await storageManager.initialize();
    global.localStorage.clear();
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      const manager = new StorageManager();
      const result = await manager.initialize();

      expect(result).toBe(true);
      expect(manager.isInitialized).toBe(true);
    });

    test('should detect storage availability', () => {
      expect(storageManager.isStorageAvailable()).toBe(true);
    });

    test('should handle missing localStorage gracefully', () => {
      const originalLocalStorage = global.localStorage;
      global.localStorage = undefined;

      const manager = new StorageManager();
      expect(manager.isStorageAvailable()).toBe(false);

      global.localStorage = originalLocalStorage;
    });
  });

  describe('Basic Storage Operations', () => {
    test('should save and load data', async () => {
      const testData = { test: 'value', number: 42 };

      const saveSuccess = await storageManager.save('test_key', testData);
      expect(saveSuccess).toBe(true);

      const loadedData = await storageManager.load('test_key');
      expect(loadedData).toEqual(testData);
    });

    test('should handle string data', async () => {
      const testString = 'Hello, World!';

      await storageManager.save('string_key', testString);
      const loaded = await storageManager.load('string_key');

      expect(loaded).toBe(testString);
    });

    test('should handle number data', async () => {
      const testNumber = 123.456;

      await storageManager.save('number_key', testNumber);
      const loaded = await storageManager.load('number_key');

      expect(loaded).toBe(testNumber);
    });

    test('should handle array data', async () => {
      const testArray = [1, 2, 3, 'test', { nested: true }];

      await storageManager.save('array_key', testArray);
      const loaded = await storageManager.load('array_key');

      expect(loaded).toEqual(testArray);
    });

    test('should handle complex nested objects', async () => {
      const complexData = {
        user: {
          name: 'John',
          settings: {
            theme: 'dark',
            notifications: true
          }
        },
        history: ['calc1', 'calc2'],
        timestamp: Date.now()
      };

      await storageManager.save('complex_key', complexData);
      const loaded = await storageManager.load('complex_key');

      expect(loaded).toEqual(complexData);
    });
  });

  describe('Default Values', () => {
    test('should return null for missing data without default', async () => {
      const result = await storageManager.load('nonexistent_key');
      expect(result).toBeNull();
    });

    test('should return default value for missing data', async () => {
      const defaultValue = { default: true };
      const result = await storageManager.load('nonexistent_key', defaultValue);

      expect(result).toEqual(defaultValue);
    });

    test('should return actual data when available, ignoring default', async () => {
      const actualData = { actual: true };
      const defaultData = { default: true };

      await storageManager.save('existing_key', actualData);
      const result = await storageManager.load('existing_key', defaultData);

      expect(result).toEqual(actualData);
    });
  });

  describe('Data Removal', () => {
    test('should remove data correctly', async () => {
      await storageManager.save('temp_key', 'temp_value');

      const removeSuccess = await storageManager.remove('temp_key');
      expect(removeSuccess).toBe(true);

      const result = await storageManager.load('temp_key');
      expect(result).toBeNull();
    });

    test('should handle removal of non-existent keys', async () => {
      const removeSuccess = await storageManager.remove('nonexistent_key');
      expect(removeSuccess).toBe(true); // Should not fail
    });

    test('should clear all data', async () => {
      await storageManager.save('key1', 'value1');
      await storageManager.save('key2', 'value2');

      const clearSuccess = await storageManager.clearAll();
      expect(clearSuccess).toBe(true);

      const result1 = await storageManager.load('key1');
      const result2 = await storageManager.load('key2');

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe('Data Export and Import', () => {
    test('should export all data', async () => {
      await storageManager.save('history', ['1+1=2', '2+2=4']);
      await storageManager.save('memory', 42);
      await storageManager.save('settings', { theme: 'dark' });

      const exportData = await storageManager.exportAllData();

      expect(exportData).toHaveProperty('version');
      expect(exportData).toHaveProperty('timestamp');
      expect(exportData).toHaveProperty('data');
      expect(exportData.data.history).toEqual(['1+1=2', '2+2=4']);
      expect(exportData.data.memory).toBe(42);
      expect(exportData.data.settings).toEqual({ theme: 'dark' });
    });

    test('should import all data', async () => {
      const importData = {
        version: '1.0',
        timestamp: Date.now(),
        data: {
          history: ['3+3=6'],
          memory: 100,
          settings: { theme: 'light' }
        }
      };

      const importSuccess = await storageManager.importAllData(importData);
      expect(importSuccess).toBe(true);

      const history = await storageManager.load('history');
      const memory = await storageManager.load('memory');
      const settings = await storageManager.load('settings');

      expect(history).toEqual(['3+3=6']);
      expect(memory).toBe(100);
      expect(settings).toEqual({ theme: 'light' });
    });

    test('should handle invalid import data', async () => {
      const invalidData = { invalid: true };

      const importSuccess = await storageManager.importAllData(invalidData);
      expect(importSuccess).toBe(false);
    });

    test('should preserve existing data on failed import', async () => {
      await storageManager.save('existing', 'data');

      const invalidData = { invalid: true };
      await storageManager.importAllData(invalidData);

      const existing = await storageManager.load('existing');
      expect(existing).toBe('data');
    });
  });

  describe('Error Handling', () => {
    test('should handle JSON serialization errors', async () => {
      const circularData = {};
      circularData.self = circularData; // Circular reference

      const saveSuccess = await storageManager.save('circular', circularData);
      expect(saveSuccess).toBe(false);
    });

    test('should handle storage quota exceeded', async () => {
      // Mock localStorage to throw quota exceeded error
      const originalSetItem = global.localStorage.setItem;
      global.localStorage.setItem = () => {
        throw new Error('QuotaExceededError');
      };

      const saveSuccess = await storageManager.save('test', 'data');
      expect(saveSuccess).toBe(false);

      global.localStorage.setItem = originalSetItem;
    });

    test('should handle corrupted data gracefully', async () => {
      // Manually set corrupted JSON data
      global.localStorage.setItem('calc_corrupted', 'invalid json {');

      const result = await storageManager.load('corrupted');
      expect(result).toBeNull();
    });
  });

  describe('Storage Statistics', () => {
    test('should provide storage statistics', async () => {
      await storageManager.save('key1', 'value1');
      await storageManager.save('key2', { complex: 'object' });

      const stats = await storageManager.getStorageStats();

      expect(stats).toHaveProperty('totalKeys');
      expect(stats).toHaveProperty('totalSize');
      expect(stats).toHaveProperty('availableSpace');
      expect(stats.totalKeys).toBeGreaterThan(0);
    });

    test('should calculate storage usage', async () => {
      const largeData = 'x'.repeat(1000); // 1KB of data
      await storageManager.save('large', largeData);

      const stats = await storageManager.getStorageStats();
      expect(stats.totalSize).toBeGreaterThan(1000);
    });
  });

  describe('Key Management', () => {
    test('should list all calculator keys', async () => {
      await storageManager.save('history', []);
      await storageManager.save('memory', 0);
      await storageManager.save('settings', {});

      const keys = await storageManager.getAllKeys();

      expect(keys).toContain('history');
      expect(keys).toContain('memory');
      expect(keys).toContain('settings');
    });

    test('should filter calculator keys from other localStorage data', async () => {
      // Add non-calculator data
      global.localStorage.setItem('other_app_data', 'not calculator');

      await storageManager.save('calculator_data', 'calculator');

      const keys = await storageManager.getAllKeys();
      expect(keys).toContain('calculator_data');
      expect(keys).not.toContain('other_app_data');
    });
  });

  describe('Data Validation', () => {
    test('should validate data before saving', async () => {
      const validData = { valid: true };
      const saveSuccess = await storageManager.save('valid', validData);

      expect(saveSuccess).toBe(true);
    });

    test('should reject undefined data', async () => {
      const saveSuccess = await storageManager.save('undefined', undefined);
      expect(saveSuccess).toBe(false);
    });

    test('should handle null data appropriately', async () => {
      const saveSuccess = await storageManager.save('null', null);
      expect(saveSuccess).toBe(true);

      const loaded = await storageManager.load('null');
      expect(loaded).toBeNull();
    });
  });

  describe('Backup and Restore', () => {
    test('should create backup of current data', async () => {
      await storageManager.save('important', 'data');

      const backup = await storageManager.createBackup();

      expect(backup).toHaveProperty('timestamp');
      expect(backup).toHaveProperty('data');
      expect(backup.data.important).toBe('data');
    });

    test('should restore from backup', async () => {
      const backup = {
        timestamp: Date.now(),
        data: {
          restored: 'value'
        }
      };

      const restoreSuccess = await storageManager.restoreFromBackup(backup);
      expect(restoreSuccess).toBe(true);

      const restored = await storageManager.load('restored');
      expect(restored).toBe('value');
    });
  });
});
