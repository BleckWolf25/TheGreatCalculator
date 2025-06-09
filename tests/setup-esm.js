/**
 * Jest Test Setup for ES Modules
 * Simplified global configuration and mocks for ES module tests
 */

// Mock browser APIs with simple implementations
global.alert = () => {};
global.confirm = () => true;
global.prompt = () => 'test';

// Mock basic DOM elements
const createMockElement = (tagName = 'DIV') => ({
  tagName: tagName.toUpperCase(),
  setAttribute: () => {},
  getAttribute: () => null,
  addEventListener: () => {},
  removeEventListener: () => {},
  appendChild: () => {},
  removeChild: () => {},
  remove: () => {},
  click: () => {},
  focus: () => {},
  blur: () => {},
  style: {},
  classList: {
    add: () => {},
    remove: () => {},
    contains: () => false,
    toggle: () => {}
  },
  value: '',
  textContent: '',
  innerHTML: '',
  dataset: {},
  disabled: false,
  tabIndex: 0
});

// Mock document
global.document = {
  getElementById: () => createMockElement(),
  querySelector: () => createMockElement(),
  querySelectorAll: () => [createMockElement()],
  createElement: (tagName) => createMockElement(tagName),
  addEventListener: () => {},
  removeEventListener: () => {},
  activeElement: createMockElement('BUTTON'),
  body: {
    appendChild: () => {},
    removeChild: () => {},
    classList: {
      add: () => {},
      remove: () => {},
      contains: () => false
    },
    contains: () => true
  },
  head: {
    appendChild: () => {},
    removeChild: () => {}
  }
};

// Mock window object
global.window = {
  ...global.window,
  matchMedia: () => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {}
  }),
  navigator: {
    vibrate: () => {},
    language: 'en-US',
    userAgent: 'test'
  },
  URL: {
    createObjectURL: () => 'mock-url',
    revokeObjectURL: () => {}
  },
  Blob: function(content, options) {
    this.size = content ? content.join('').length : 0;
    this.type = options?.type || '';
    this.text = () => Promise.resolve(content ? content.join('') : '');
    this.arrayBuffer = () => Promise.resolve(new ArrayBuffer(0));
    this.stream = () => {};
    this.slice = () => {};
  },
  location: {
    href: 'http://localhost',
    origin: 'http://localhost'
  },
  setTimeout: (fn, delay) => setTimeout(fn, delay || 0),
  clearTimeout: (id) => clearTimeout(id),
  setInterval: (fn, delay) => setInterval(fn, delay || 0),
  clearInterval: (id) => clearInterval(id),
  alert: () => {},
  confirm: () => true,
  prompt: () => 'test',
  open: () => ({
    document: {
      write: () => {},
      close: () => {}
    },
    print: () => {},
    close: () => {}
  }),
  print: () => {}
};

// Mock localStorage
const mockStorage = (() => {
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

global.localStorage = mockStorage;
global.sessionStorage = mockStorage;

// Mock URL and Blob globally
global.URL = global.window.URL;
global.Blob = global.window.Blob;
