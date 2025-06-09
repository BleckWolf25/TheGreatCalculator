/**
 * Jest Test Setup
 * Global configuration and mocks for all tests
 */

// Jest is already available globally in Jest environment
// No need to import it

// Mock browser APIs - simple implementations for ES modules
global.alert = () => {};
global.confirm = () => true;
global.prompt = () => 'test';

// Store original timers
const originalSetTimeout = global.setTimeout;
const originalClearTimeout = global.clearTimeout;
const originalSetInterval = global.setInterval;
const originalClearInterval = global.clearInterval;

// Mock setTimeout and setInterval with proper implementation
global.setTimeout = jest.fn().mockImplementation((fn, delay) => {
  if (typeof fn === 'function') {
    return originalSetTimeout(fn, delay || 0);
  }
  return 1;
});

global.setInterval = jest.fn().mockImplementation((fn, delay) => {
  if (typeof fn === 'function') {
    return originalSetInterval(fn, delay || 0);
  }
  return 1;
});

global.clearTimeout = jest.fn().mockImplementation((id) => {
  if (id) originalClearTimeout(id);
});

global.clearInterval = jest.fn().mockImplementation((id) => {
  if (id) originalClearInterval(id);
});

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn().mockImplementation((callback) => {
  return originalSetTimeout(callback, 16);
});

global.cancelAnimationFrame = jest.fn().mockImplementation((id) => {
  originalClearTimeout(id);
});

// Mock Blob constructor
global.Blob = jest.fn((content, options) => ({
  size: content ? content.join('').length : 0,
  type: options?.type || '',
  text: jest.fn().mockResolvedValue(content ? content.join('') : ''),
  arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
  stream: jest.fn(),
  slice: jest.fn()
}));

// Mock URL.createObjectURL and revokeObjectURL
global.URL = {
  createObjectURL: jest.fn(() => 'blob:mock-url'),
  revokeObjectURL: jest.fn()
};

// Mock DOM environment
const createMockElement = (tagName = 'DIV') => ({
  tagName: tagName.toUpperCase(),
  setAttribute: jest.fn(),
  getAttribute: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  appendChild: jest.fn(),
  removeChild: jest.fn(),
  remove: jest.fn(),
  click: jest.fn(),
  focus: jest.fn(),
  blur: jest.fn(),
  style: {},
  classList: {
    add: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(() => false),
    toggle: jest.fn()
  },
  value: '',
  textContent: '',
  innerHTML: '',
  dataset: {},
  disabled: false,
  tabIndex: 0
});

global.document = {
  getElementById: jest.fn(() => createMockElement()),
  querySelector: jest.fn(() => createMockElement()),
  querySelectorAll: jest.fn(() => [createMockElement()]),
  createElement: jest.fn((tagName) => createMockElement(tagName)),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  activeElement: createMockElement('BUTTON'),
  body: {
    appendChild: jest.fn(),
    removeChild: jest.fn(),
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      contains: jest.fn(() => false)
    },
    contains: jest.fn(() => true)
  },
  head: {
    appendChild: jest.fn(),
    removeChild: jest.fn()
  }
};

// Make activeElement configurable for tests
Object.defineProperty(global.document, 'activeElement', {
  value: createMockElement('BUTTON'),
  writable: true,
  configurable: true
});

// Mock window object
global.window = {
  ...global.window,
  matchMedia: jest.fn(() => ({
    matches: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  })),
  navigator: {
    vibrate: jest.fn(),
    language: 'en-US',
    userAgent: 'test'
  },
  URL: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn()
  },
  Blob: jest.fn(),
  location: {
    href: 'http://localhost',
    origin: 'http://localhost'
  },
  setTimeout: jest.fn((fn, delay) => {
    if (typeof fn === 'function') {
      return setTimeout(fn, delay || 0);
    }
    return 1;
  }),
  clearTimeout: jest.fn(),
  setInterval: jest.fn(),
  clearInterval: jest.fn(),
  alert: jest.fn(),
  confirm: jest.fn(() => true),
  prompt: jest.fn(() => 'test'),
  open: jest.fn(() => ({
    document: {
      write: jest.fn(),
      close: jest.fn()
    },
    print: jest.fn(),
    close: jest.fn()
  })),
  print: jest.fn()
};

// Mock global functions
global.setTimeout = global.window.setTimeout;
global.clearTimeout = global.window.clearTimeout;
global.setInterval = global.window.setInterval;
global.clearInterval = global.window.clearInterval;
global.alert = global.window.alert;
global.confirm = global.window.confirm;
global.prompt = global.window.prompt;

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => store[key] = value.toString(),
    removeItem: (key) => delete store[key],
    clear: () => store = {},
    length: () => Object.keys(store).length,
    key: (index) => Object.keys(store)[index] || null
  };
})();

global.localStorage = mockLocalStorage;
global.sessionStorage = mockLocalStorage;

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  mockLocalStorage.clear();
});
