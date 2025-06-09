/**
 * @file MAIN.JS
 *
 * @version 2.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Main entry point for The Great Calculator application.
 * Initializes all necessary modules, sets up the calculator system,
 * and provides comprehensive error handling with fallback mechanisms.
 *
 * Features:
 * - Modular architecture with dynamic loading
 * - Progressive Web App (PWA) capabilities
 * - Accessibility features and keyboard navigation
 * - Performance monitoring and optimization
 * - Offline support with service worker
 * - Legacy compatibility layer
 *
 * @requires ./moduleLoader.js
 */

// ------------ IMPORTS

import { LegacyCompatibility, ModuleLoader } from './moduleLoader.js';
import CalculatorAPI from './modules/api/calculatorAPI.js';
import Calculator from './modules/calculator.js';
import CalculationCoordinator from './modules/core/calculationCoordinator.js';
import EventSystem from './modules/core/eventSystem.js';
import InitializationManager from './modules/core/initialization.js';
import OperationsEngine from './modules/core/operations.js';
import StateManager from './modules/core/state.js';
import StatePersistence from './modules/core/statePersistence.js';
import ErrorBoundary, { ERROR_CATEGORIES } from './modules/error/errorBoundary.js';
import FallbackCalculator from './modules/error/fallbackCalculator.js';
import FallbackComponents from './modules/error/fallbackComponents.js';
import ExportManager from './modules/export/exportManager.js';
import FallbackStorage from './modules/storage/fallbackStorage.js';
import CalculatorStorageManager from './modules/storage/storageManager.js';
import DisplayManager from './modules/ui/display.js';

// Make modules globally available for debugging and browser compatibility
// Note: These are kept for debugging purposes and browser console access
if (typeof window !== 'undefined') {
  window.StateManager = StateManager;
  window.OperationsEngine = OperationsEngine;
  window.CalculatorStorageManager = CalculatorStorageManager;
  window.InitializationManager = InitializationManager;
  window.EventSystem = EventSystem;
  window.StatePersistence = StatePersistence;
  window.CalculationCoordinator = CalculationCoordinator;
  window.DisplayManager = DisplayManager;
  window.CalculatorAPI = CalculatorAPI;
  window.ExportManager = ExportManager;
  window.FallbackStorage = FallbackStorage;
  window.Calculator = Calculator;
}

// ------------ TYPE AND JSDOC DEFINITIONS
/**
 * @typedef {Object} CalculatorConfig
 * @property {boolean} enableDebugMode - Enable debug logging
 * @property {boolean} autoSave - Enable automatic state saving
 * @property {boolean} vibrationEnabled - Enable haptic feedback
 * @property {number} [maxHistorySize=50] - Maximum history entries
 * @property {number} [maxUndoSize=50] - Maximum undo stack size
 * @property {string} [theme='dark'] - Default theme
 * @property {boolean} [accessibilityMode=false] - Accessibility
 */

/**
 * @typedef {Object} CalculatorState
 * @property {string} currentValue - Current display value
 * @property {string|null} previousValue - Previous value for operations
 * @property {number} memory - Memory storage value
 * @property {string|null} operator - Current operator
 * @property {boolean} isNewNumber - Whether next input starts new number
 * @property {boolean} isDegree - Angle mode (true=degrees, false=radians)
 * @property {Array<string>} history - Calculation history
 * @property {number} bracketCount - Open bracket count
 * @property {string} lastCalculation - Last calculation string
 * @property {Array<CalculatorState>} undoStack - Undo state stack
 * @property {Array<CalculatorState>} redoStack - Redo state stack
 * @property {Array<Object>} customFormulas - User-defined formulas
 */

/**
 * @typedef {Object} ModuleCollection
 * @property {StateManager} StateManager - State management module
 * @property {OperationsEngine} OperationsEngine - Mathematical operations
 * @property {CalculatorStorageManager} StorageManager - Data persistence
 * @property {DisplayManager} DisplayManager - UI display management
 * @property {Calculator} Calculator - Main calculator class
 * @property {InitializationManager} InitializationManager - Module initialization
 * @property {EventSystem} EventSystem - Event handling system
 * @property {CalculatorAPI} CalculatorAPI - Public API interface
 * @property {ExportManager} ExportManager - Data export functionality
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {number} domContentLoaded - DOM content loaded time
 * @property {number} loadComplete - Complete load time
 * @property {number} totalTime - Total initialization time
 * @property {number} moduleLoadTime - Module loading time
 * @property {number} initializationTime - Calculator initialization time
 */

/**
 * @typedef {Object} PWAInstallPrompt
 * @property {Function} prompt - Show install prompt
 * @property {Promise<{outcome: string}>} userChoice - User choice promise
 */

/**
 * @typedef {Object} ServiceWorkerRegistration
 * @property {ServiceWorker} installing - Installing service worker
 * @property {ServiceWorker} waiting - Waiting service worker
 * @property {ServiceWorker} active - Active service worker
 * @property {Function} addEventListener - Add event listener
 * @property {Function} update - Update service worker
 */

// ------------ INITIALIZATION HELPER FUNCTIONS

/**
 * Initialize error boundary and fallback systems
 * @async
 * @function initializeErrorBoundary
 * @returns {Promise<{errorBoundary: ErrorBoundary, fallbackComponents: FallbackComponents}>}
 */
async function initializeErrorBoundary() {
  const errorBoundary = new ErrorBoundary();
  const errorBoundarySuccess = errorBoundary.initialize();
  let fallbackComponents = null;

  if (errorBoundarySuccess) {
    console.log('✅ Error boundary system initialized');

    // Initialize fallback components
    fallbackComponents = new FallbackComponents();
    const fallbackCalculator = new FallbackCalculator();
    fallbackCalculator.initialize();

    // Register fallback components with error boundary
    errorBoundary.registerFallback('display', () => fallbackComponents.generateDisplay());
    errorBoundary.registerFallback('buttons', () => fallbackComponents.generateButtons());
    errorBoundary.registerFallback('history', () => fallbackComponents.generateHistory());

    // Register custom recovery handlers
    errorBoundary.registerRecoveryHandler('initialization', async (_error, _context) => {
      console.log('🔄 Attempting initialization recovery...');
      const emergencyHTML = fallbackComponents.generateEmergencyCalculator();
      document.body.innerHTML = emergencyHTML;
      return { success: true, message: 'Emergency calculator activated' };
    });

    // Make error boundary globally available
    window.errorBoundary = errorBoundary;
  } else {
    console.warn('⚠️ Error boundary initialization failed, continuing without error protection');
  }

  return { errorBoundary, fallbackComponents };
}

/**
 * Initialize and validate modules
 * @async
 * @function initializeModules
 * @param {ErrorBoundary} errorBoundary - Error boundary instance
 * @param {FallbackComponents} fallbackComponents - Fallback components instance
 * @returns {Promise<{modules: ModuleCollection, moduleLoader: ModuleLoader}>}
 */
async function initializeModules(errorBoundary, fallbackComponents) {
  showLoadingState('Initializing modules...');

  let moduleLoader = null;
  const moduleLoadingResult = await errorBoundary?.wrapOperation(async () => {
    moduleLoader = new ModuleLoader();
    return moduleLoader.loadAllModules();
  }, ERROR_CATEGORIES.INITIALIZATION, { errorBoundary, fallbackComponents }) || await (async () => {
    moduleLoader = new ModuleLoader();
    return moduleLoader.loadAllModules();
  })();

  const modules = moduleLoadingResult;
  console.log('✅ All modules loaded successfully');

  // Validate and resolve StorageManager conflicts
  await validateStorageManager(modules);

  return { modules, moduleLoader };
}

/**
 * Validate StorageManager and resolve conflicts
 * @async
 * @function validateStorageManager
 * @param {ModuleCollection} modules - Loaded modules
 * @returns {Promise<void>}
 */
async function validateStorageManager(modules) {
  console.log('Loaded modules:', Object.keys(modules));
  console.log('StorageManager type:', typeof modules.StorageManager);

  // Test StorageManager instantiation
  try {
    const _testStorage = new modules.StorageManager();
    console.log('✅ Direct StorageManager instantiation successful');
  } catch (error) {
    console.error('❌ Direct StorageManager instantiation failed:', error);
    // Try alternative methods...
  }

  // Handle conflicts with native browser API
  if (modules.StorageManager && (
    modules.StorageManager.toString().includes('[native code]') ||
    modules.StorageManager === window.StorageManager
  )) {
    console.log('Detected native StorageManager conflict, using workaround...');
    if (window.CalculatorStorageManager) {
      modules.StorageManager = window.CalculatorStorageManager;
    } else {
      throw new Error('StorageManager conflict: CalculatorStorageManager not available');
    }
  }

  // Final validation
  if (!modules.StorageManager || typeof modules.StorageManager !== 'function') {
    throw new Error('StorageManager is not available or not a constructor function');
  }

  const _testInstance = new modules.StorageManager();
  console.log('✅ StorageManager validation successful');
}

// ------------ MAIN INITIALIZATION FUNCTION
/**
 * Initialize The Great Calculator application
 *
 * This is the main entry point that orchestrates the entire calculator
 * initialization process, including module loading, error handling,
 * and fallback mechanisms.
 *
 * @async
 * @function initializeCalculator
 * @returns {Promise<void>} Resolves when initialization is complete
 *
 * @throws {Error} When both primary and fallback initialization fail
 *
 * @example
 * // Called automatically when module loads
 * await initializeCalculator();
 *
 */
async function initializeCalculator() {
  console.log('🧮 The Great Calculator v2.0.0');
  console.log('Initializing modular calculator system...');

  try {
    // Initialize error boundary and fallback systems
    const { errorBoundary, fallbackComponents } = await initializeErrorBoundary();

    // Load and validate modules
    const { modules, moduleLoader } = await initializeModules(errorBoundary, fallbackComponents);

    // Initialize calculator with modules
    const calculator = await initializeCalculatorCore(modules, errorBoundary, fallbackComponents);

    // Setup all features and finalize
    const legacyCompatibility = await finalizeInitialization(calculator, moduleLoader);

    // Setup global exports and event handlers
    setupGlobalExports(calculator, moduleLoader, legacyCompatibility);
    setupErrorBoundaryHandlers(calculator, errorBoundary, fallbackComponents);

    console.log('🎉 Calculator initialized successfully!');

    // Show welcome message to user
    if (calculator.modules.display?.showToast) {
      calculator.modules.display.showToast('Calculator ready!', 1500);
    }

  } catch (error) {
    console.error('❌ Calculator initialization failed:', error);

    // Attempt fallback initialization with legacy system
    try {
      console.warn('Attempting to initialize with fallback method...');
      await initializeFallbackCalculator();
    } catch (fallbackError) {
      console.error('❌ Fallback initialization also failed:', fallbackError);
      showErrorState(`Calculator failed to initialize: ${error.message}`);
    }
  }
}

/**
 * Initialize calculator core with modules
 * @async
 * @function initializeCalculatorCore
 * @param {ModuleCollection} modules - Loaded modules
 * @param {ErrorBoundary} errorBoundary - Error boundary instance
 * @param {FallbackComponents} fallbackComponents - Fallback components instance
 * @returns {Promise<Calculator>}
 */
async function initializeCalculatorCore(modules, errorBoundary, fallbackComponents) {
  const calculatorInitResult = await errorBoundary?.wrapOperation(async () => {
    const calculator = new modules.Calculator(modules);
    const calculatorConfig = {
      enableDebugMode: false,
      autoSave: true,
      vibrationEnabled: true,
      maxHistorySize: 50,
      maxUndoSize: 50,
      theme: 'dark',
      accessibilityMode: false
    };

    const initSuccess = await calculator.initialize(calculatorConfig);
    if (!initSuccess) {
      throw new Error('Calculator initialization failed');
    }

    return calculator;
  }, ERROR_CATEGORIES.INITIALIZATION, {
    modules,
    errorBoundary,
    fallbackComponents,
    container: document.body
  }) || await (async () => {
    const calculator = new modules.Calculator(modules);
    const calculatorConfig = {
      enableDebugMode: false,
      autoSave: true,
      vibrationEnabled: true,
      maxHistorySize: 50,
      maxUndoSize: 50,
      theme: 'dark',
      accessibilityMode: false
    };
    const initSuccess = await calculator.initialize(calculatorConfig);
    if (!initSuccess) {
      throw new Error('Calculator initialization failed');
    }
    return calculator;
  })();

  return calculatorInitResult;
}

/**
 * Finalize initialization with features setup
 * @async
 * @function finalizeInitialization
 * @param {Calculator} calculator - Calculator instance
 * @param {ModuleLoader} moduleLoader - Module loader instance
 * @returns {Promise<LegacyCompatibility>}
 */
async function finalizeInitialization(calculator, _moduleLoader) {
  const legacyCompatibility = new LegacyCompatibility(calculator);

  await setupAdditionalFeatures(calculator);
  setupKeyboardShortcuts(calculator);
  setupPWAFeatures();
  setupPerformanceMonitoring();
  setupAccessibilityFeatures(calculator);
  await setupAccessability(calculator);
  await setupAdvancedOfflineCapabilities(calculator);
  await setupVercelPerformanceMonitoring(calculator);
  await registerServiceWorker();

  hideLoadingState();

  return legacyCompatibility;
}

/**
 * Setup global exports for debugging
 * @function setupGlobalExports
 * @param {Calculator} calculator - Calculator instance
 * @param {ModuleLoader} moduleLoader - Module loader instance
 * @param {LegacyCompatibility} legacyCompatibility - Legacy compatibility instance
 * @returns {void}
 */
function setupGlobalExports(calculator, moduleLoader, legacyCompatibility) {
  window.calculatorInstance = calculator;
  window.calculator = calculator; // <-- Add this line
  window.moduleLoaderInstance = moduleLoader;
  window.legacyCompatibilityInstance = legacyCompatibility;
}

/**
 * Setup error boundary event handlers
 * @function setupErrorBoundaryHandlers
 * @param {Calculator} calculator - Calculator instance
 * @param {ErrorBoundary} errorBoundary - Error boundary instance
 * @param {FallbackComponents} fallbackComponents - Fallback components instance
 * @returns {void}
 */
function setupErrorBoundaryHandlers(calculator, errorBoundary, fallbackComponents) {
  window.addEventListener('calculator-reset', (_event) => {
    console.log('🔄 Calculator reset requested by error boundary');

    try {
      if (calculator?.modules?.state) {
        calculator.modules.state.reset(true);
      }

      const calc = window.calculator || window.calculatorInstance;
      if (calc?.modules?.display) {
        calc.modules.display.showToast('...');
      }

      if (errorBoundary) {
        errorBoundary.clearErrorUI();
      }

      console.log('✅ Calculator reset completed');
    } catch (resetError) {
      console.error('❌ Calculator reset failed:', resetError);

      if (errorBoundary && fallbackComponents) {
        const emergencyHTML = fallbackComponents.generateEmergencyCalculator();
        document.body.innerHTML = emergencyHTML;
      }
    }
  });
}



/**
 * Initialize fallback calculator using legacy system
     *
     * This function provides a fallback mechanism when the modern modular
     * calculator system fails to initialize. It loads and initializes the
     * legacy monolithic calculator system as a backup.
     *
     * @async
     * @function initializeFallbackCalculator
     * @returns {Promise<void>} Resolves when fallback is initialized
     *
     * @throws {Error} When legacy calculator scripts cannot be loaded
     *
     * @example
     * try {
     *   await initializeCalculator();
     * } catch (error) {
     *   await initializeFallbackCalculator();
     * }
     *

     */
async function initializeFallbackCalculator() {
  console.log('🔄 Initializing fallback calculator system...');

  // Load legacy display script if not already available
  if (!window.updateDisplay) {
    console.log('Loading legacy display script...');
    await loadScript('/src/js/display.js');
  }

  // Load legacy calculator script if not already available
  if (!window.initCalculator) {
    console.log('Loading legacy calculator script...');
    await loadScript('/src/js/calculator.js');
  }

  // Initialize legacy calculator system
  if (window.initCalculator && typeof window.initCalculator === 'function') {
    // Wait for DOM to be ready before initialization
    setTimeout(() => {
      try {
        window.initCalculator();
        console.log('✅ Fallback calculator initialized');
        hideLoadingState();
      } catch (legacyError) {
        console.error('❌ Legacy calculator initialization failed:', legacyError);
        showErrorState('Both modern and legacy calculator systems failed to initialize');
      }
    }, 100);

    // Show compatibility mode notice to user
    setTimeout(() => {
      /** @type {HTMLDivElement} */
      const notice = document.createElement('div');
      notice.className = 'fallback-notice';
      notice.setAttribute('role', 'alert');
      notice.setAttribute('aria-live', 'polite');
      notice.innerHTML = `
                <div class="notice-content">
                    <span>⚠️ Running in compatibility mode</span>
                    <button onclick="this.parentElement.parentElement.remove()"
                            class="close-notice"
                            aria-label="Close compatibility notice">&times;</button>
                </div>
            `;
      document.body.append(notice);

      // Show notice with animation
      setTimeout(() => { notice.classList.add('show'); }, 100);

      // Auto-hide notice after 10 seconds
      setTimeout(() => {
        if (notice.parentElement) {
          notice.remove();
        }
      }, 10_000);
    }, 1000);
  } else {
    throw new Error('Legacy calculator not available');
  }
}

/**
 * Load script dynamically with error handling
     *
     * @async
     * @function loadScript
     * @param {string} src - Script source URL
     * @returns {Promise<void>} Resolves when script is loaded
     *
     * @throws {Error} When script fails to load
     *
     * @example
     * await loadScript('/src/js/legacy/calculator.js');
     *

     */
async function loadScript(source) {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    const existingScript = document.querySelector(`script[src="${source}"]`);
    if (existingScript) {
      resolve();
      return;
    }

    /** @type {HTMLScriptElement} */
    const script = document.createElement('script');
    script.src = source;
    script.async = true;
    script.addEventListener('load', () => { resolve(); });
    script.onerror = () => { reject(new Error(`Failed to load script: ${source}`)); };
    document.head.append(script);
  });
}

/**
 * Show loading state with message
     *
     * @function showLoadingState
     * @param {string} message - Loading message to display
     *
     * @example
     * showLoadingState('Initializing modules...');
     *

     */
function showLoadingState(message) {
  /** @type {HTMLElement|null} */
  const loadingOverlay = document.querySelector('.loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.display = 'flex';
    loadingOverlay.setAttribute('aria-hidden', 'false');

    /** @type {HTMLElement|null} */
    const spinner = loadingOverlay.querySelector('.loading-spinner');
    if (spinner) {
      spinner.setAttribute('aria-label', message);
    }

    /** @type {HTMLElement|null} */
    const messageElement = loadingOverlay.querySelector('.loading-message');
    if (messageElement) {
      messageElement.textContent = message;
    }
  }
}

/**
 * Hide loading state with smooth transition
     *
     * @function hideLoadingState
     *
     * @example
     * hideLoadingState();
     *

     */
function hideLoadingState() {
  /** @type {HTMLElement|null} */
  const loadingOverlay = document.querySelector('.loading-overlay');
  if (loadingOverlay) {
    loadingOverlay.style.opacity = '0';
    loadingOverlay.setAttribute('aria-hidden', 'true');

    setTimeout(() => {
      loadingOverlay.style.display = 'none';
    }, 300);
  }
}

/**
 * Show error state with retry option
     *
     * @function showErrorState
     * @param {string} message - Error message to display
     *
     * @example
     * showErrorState('Calculator failed to initialize');
     *

     */
function showErrorState(message) {
  hideLoadingState();

  /** @type {HTMLDivElement} */
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-state';
  errorDiv.setAttribute('role', 'alert');
  errorDiv.setAttribute('aria-live', 'assertive');
  errorDiv.innerHTML = `
        <div class="error-content">
            <h2>⚠️ Initialization Error</h2>
            <p>${message}</p>
            <button onclick="location.reload()"
                    class="retry-button"
                    aria-label="Retry calculator initialization">
                🔄 Retry
            </button>
        </div>
    `;

  document.body.append(errorDiv);

  // Focus the retry button for accessibility
  setTimeout(() => {
    /** @type {HTMLButtonElement|null} */
    const retryButton = errorDiv.querySelector('.retry-button');
    if (retryButton) {
      retryButton.focus();
    }
  }, 100);
}

// ------------ FEATURE SETUP FUNCTIONS

/**
 * Setup additional calculator features
 *
 * Initializes various features including export functionality,
 * formula management, theme management, and gesture support.
 *
 * @async
 * @function setupAdditionalFeatures
 * @param {Calculator} calculator - Main calculator instance
 * @returns {Promise<void>} Resolves when all features are set up
 *
 * @example
 * await setupAdditionalFeatures(calculatorInstance);
 */
async function setupAdditionalFeatures(calculator) {
  console.log('🔧 Setting up additional features...');

  try {
    // Setup export functionality for history data
    setupExportButtons(calculator);

    // Setup formula management system
    setupFormulaManagement(calculator);

    // Setup theme management and persistence
    setupThemeManagement(calculator);

    // Setup gesture support for touch devices
    setupGestureSupport(calculator);

    console.log('✅ Additional features setup completed');
  } catch (error) {
    console.error('❌ Error setting up additional features:', error);
  }
}

/**
 * Setup export buttons in history modal
 *
 * History modal with export functionality for CSV, PDF, and JSON formats.
 *
 * @function setupExportButtons
 * @param {Calculator} calculator - Calculator instance
 *
 * @example
 * setupExportButtons(calculatorInstance);
 */
function setupExportButtons(_calculator) {
  // Improve the existing showHistory function with export buttons
  /** @type {Function|undefined} */
  const originalShowHistory = window.showHistory;

  window.showHistory = function () {
    // Call original function if it exists
    if (originalShowHistory && typeof originalShowHistory === 'function') {
      originalShowHistory();
    }

    // Add export buttons to history modal after a brief delay
    setTimeout(() => {
      /** @type {HTMLElement|null} */
      const historyModal = document.querySelector('#history-modal');

      if (historyModal && !historyModal.querySelector('.export-buttons')) {
        /** @type {HTMLDivElement} */
        const exportButtons = document.createElement('div');
        exportButtons.className = 'export-buttons';
        exportButtons.setAttribute('role', 'group');
        exportButtons.setAttribute('aria-label', 'Export options');
        exportButtons.innerHTML = `
                    <button onclick="exportHistoryCSV()"
                            class="export-btn csv-btn"
                            aria-label="Export history as CSV file">
                        📊 Export CSV
                    </button>
                    <button onclick="exportHistoryPDF()"
                            class="export-btn pdf-btn"
                            aria-label="Export history as PDF file">
                        📄 Export PDF
                    </button>
                    <button onclick="exportHistoryJSON()"
                            class="export-btn json-btn"
                            aria-label="Export history as JSON file">
                        📋 Export JSON
                    </button>
                `;

        // Add export button styles
        addExportButtonStyles();

        /** @type {HTMLElement|null} */
        const modalBody = historyModal.querySelector('.modal-body');
        if (modalBody) {
          modalBody.insertBefore(exportButtons, modalBody.firstChild);
        }
      }
    }, 100);
  };
}

/**
 * Setup formula management system
 *
 * Initializes the custom formula management system for user-defined calculations.
 * This is a placeholder for future implementation.
 *
 * @function setupFormulaManagement
 * @param {Calculator} calculator - Calculator instance
 *
 * @todo Implement custom formula creation, editing, and management
 *
 * @example
 * setupFormulaManagement(calculatorInstance);
 */
function setupFormulaManagement(calculator) {
  // Create formula management button
  const formulaBtn = document.createElement('button');
  formulaBtn.className = 'formula-btn';
  formulaBtn.innerHTML = '📝';
  formulaBtn.setAttribute('aria-label', 'Manage custom formulas');
  formulaBtn.title = 'Custom Formulas';

  // Add button to calculator controls
  const controls = document.querySelector('.calculator-controls');
  if (controls) {
    controls.appendChild(formulaBtn);
  }

  // Setup formula management modal
  formulaBtn.addEventListener('click', () => {
    void (async () => {
      try {
        // Load formula management module lazily
        const FormulaManager = await calculator.modules.lazyLoader.loadFormulaManagement();
        const formulaManager = new FormulaManager(calculator);

        // Show formula management interface
        const _modal = await formulaManager.showFormulaManager();

        // Load existing formulas
        await formulaManager.loadCustomFormulas();

        console.log('📝 Formula management interface loaded');
      } catch (error) {
        console.error('❌ Error loading formula management:', error);
        calculator.modules.display?.showToast('Failed to load formula manager');
      }
    })();
  });

  console.log('📝 Formula management setup completed');
}

/**
 * Setup theme management and persistence
 *
 * Configures theme switching functionality with automatic persistence
 * and smooth transitions between light and dark modes.
 *
 * @async
 * @function setupThemeManagement
 * @param {Calculator} calculator - Calculator instance
 *
 * @example
 * setupThemeManagement(calculatorInstance);
 */
function setupThemeManagement(calculator) {
  /** @type {HTMLInputElement|null} */
  const themeToggle = document.querySelector('#theme-toggle');

  if (themeToggle) {
    // Setup theme toggle event listener
    themeToggle.addEventListener('change', (e) => {
      void (async () => {
        try {
          /** @type {string} */
          const theme = e.target.checked ? 'light' : 'dark';

          // Apply theme to document
          document.documentElement.dataset.theme = theme;

          // Save theme preference
          if (calculator.modules.storage) {
            await calculator.modules.storage.save('theme', theme);
          }

          // Announce theme change to screen readers
          if (calculator.modules.display?.announceToScreenReader) {
            calculator.modules.display.announceToScreenReader(`Theme changed to ${theme} mode`);
          }

          console.log(`🎨 Theme changed to ${theme} mode`);
        } catch (error) {
          console.error('❌ Error changing theme:', error);
        }
      })();
    });

    console.log('🎨 Theme management setup completed');
  } else {
    console.warn('⚠️ Theme toggle element not found');
  }
}

/**
 * Setup keyboard shortcuts and navigation
 *
 * Configures comprehensive keyboard support for calculator operations,
 * including number input, operators, navigation, and accessibility features.
 *
 * @function setupKeyboardShortcuts
 * @param {Calculator} calculator - Calculator instance
 *
 * @example
 * setupKeyboardShortcuts(calculatorInstance);
 *
 * Supported shortcuts:
 * - 0-9: Number input
 * - +, -, *, /: Basic operators
 * - Enter, =: Calculate result
 * - Escape, Delete: Clear all
 * - Backspace: Delete last character
 * - Ctrl+Z: Undo
 * - Ctrl+Shift+Z, Ctrl+Y: Redo
 */
function setupKeyboardShortcuts(calculator) {
  /**
   * Check if user is typing in an input field
   * @param {EventTarget} target - Event target
   * @returns {boolean} True if typing in input field
   */
  function isTypingInInputField(target) {
    return target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    );
  }

  /**
   * Handle number and decimal input
   * @param {string} key - Key pressed
   * @param {Calculator} calc - Calculator instance
   */
  function handleNumberInput(key, calc) {
    if (/^\d$/.test(key)) {
      calc.appendNumber(key);
    } else if (key === '.' || key === ',') {
      calc.appendNumber('.');
    }
  }

  /**
   * Handle operator input
   * @param {string} key - Key pressed
   * @param {Calculator} calc - Calculator instance
   */
  function handleOperatorInput(key, calc) {
    switch (key) {
      case '+':
        calc.setOperator('+');
        break;
      case '-':
        calc.setOperator('-');
        break;
      case '*':
        calc.setOperator('*');
        break;
      case '/':
        calc.setOperator('/');
        break;
    }
  }

  /**
   * Handle undo/redo operations
   * @param {string} key - Key pressed
   * @param {KeyboardEvent} event - Keyboard event
   * @param {Calculator} calc - Calculator instance
   */
  function handleUndoRedo(key, event, calc) {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    switch (key) {
      case 'z':
      case 'Z':
        if (event.shiftKey) {
          calc.redo();
        } else {
          calc.undo();
        }
        break;
      case 'y':
      case 'Y':
        calc.redo();
        break;
    }
  }

  /**
   * Handle calculation and clear operations
   * @param {string} key - Key pressed
   * @param {Calculator} calc - Calculator instance
   */
  function handleCalculationKeys(key, calc) {
    switch (key) {
      case '=':
      case 'Enter':
        calc.calculate();
        break;
      case 'Escape':
      case 'Delete':
        calc.clear();
        break;
      case 'Backspace':
        if (window.backspace && typeof window.backspace === 'function') {
          window.backspace();
        }
        break;
    }
  }

  /**
   * Handle special key operations
   * @param {string} key - Key pressed
   * @param {KeyboardEvent} event - Keyboard event
   * @param {Calculator} calc - Calculator instance
   */
  function handleSpecialKeys(key, event, calc) {
    handleCalculationKeys(key, calc);
    handleUndoRedo(key, event, calc);
  }

  /**
   * Handle keyboard input events
   * @param {KeyboardEvent} event - Keyboard event
   */
  function handleKeyboardInput(event) {
    // Skip if user is typing in an input field
    if (isTypingInInputField(event.target)) {
      return;
    }

    // Prevent default for calculator keys to avoid browser shortcuts
    if (isCalculatorKey(event.key)) {
      event.preventDefault();
    }

    try {
      // Handle different types of input
      handleNumberInput(event.key, calculator);
      handleOperatorInput(event.key, calculator);
      handleSpecialKeys(event.key, event, calculator);
    } catch (error) {
      console.error('❌ Error handling keyboard input:', error);
    }
  }

  // Add keyboard event listener
  document.addEventListener('keydown', handleKeyboardInput);

  console.log('⌨️ Keyboard shortcuts setup completed');
}

/**
 * Check if a key is a calculator-related key
 *
 * Determines whether a keyboard key should be handled by the calculator
 * and have its default browser behavior prevented.
 *
 * @function isCalculatorKey
 * @param {string} key - The key that was pressed
 * @returns {boolean} True if the key is calculator-related
 *
 * @example
 * if (isCalculatorKey(event.key)) {
 *   event.preventDefault();
 * }
 *

 */
function isCalculatorKey(key) {
  /** @type {string[]} List of calculator-related keys */
  const calculatorKeys = [
    // Numbers
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    // Operators
    '+', '-', '*', '/', '=',
    // Decimal points
    '.', ',',
    // Control keys
    'Enter', 'Escape', 'Delete', 'Backspace'
  ];

  return calculatorKeys.includes(key);
}

// ------------ PWA (PROGRESSIVE WEB APP) SETUP FUNCTIONS

/**
 * Setup Progressive Web App features
 *
 * Initializes PWA functionality including install prompts, offline detection,
 * and service worker integration for user experience.
 *
 * @async
 * @function setupPWAFeatures
 *
 * @example
 * setupPWAFeatures();
 *
 * Features included:
 * - App installation prompts
 * - Offline/online detection
 * - Service worker integration
 * - PWA event handling
 *

 */
function setupPWAFeatures() {
  console.log('📱 Setting up PWA features...');

  // Load PWA utilities with fallback
  loadPWAUtilities().then(() => {
    try {
      // Initialize PWA utilities if available
      /** @type {any} */
      const pwaUtilities = new window.PWAUtils();

      // Setup event listeners for PWA events
      setupPWAEventListeners(pwaUtilities);

      // Setup install prompt functionality
      setupInstallPrompt();

      // Setup offline/online detection
      setupOfflineDetection();

      console.log('✅ PWA features setup completed');
    } catch (error) {
      console.error('❌ Error initializing PWA utilities:', error);
      // Fallback to basic PWA setup
      setupBasicPWAFeatures();
    }
  }).catch(error => {
    console.error('❌ Failed to load PWA utilities:', error);
    // Fallback to basic PWA setup without utilities
    setupBasicPWAFeatures();
  });
}

/**
 * Setup basic PWA features without utilities
 *
 * @function setupBasicPWAFeatures

 */
function setupBasicPWAFeatures() {
  console.log('🔄 Setting up basic PWA features...');
  setupInstallPrompt();
  setupOfflineDetection();
  console.log('✅ Basic PWA features setup completed');
}

/**
 * Load PWA utilities module dynamically
 *
 * Attempts to load the PWA utilities module for PWA functionality.
 * If the module is already loaded, returns immediately.
 *
 * @async
 * @function loadPWAUtilities
 * @returns {Promise<void>} Resolves when PWA utilities are loaded
 *
 * @throws {Error} When PWA utilities module fails to load
 *
 * @example
 * try {
 *   await loadPWAUtilities();
 *   const pwaUtils = new window.PWAUtils();
 * } catch (error) {
 *   console.error('PWA utilities not available');
 * }
 *

 */
async function loadPWAUtilities() {
  // Check if PWA utilities are already loaded
  if (window.PWAUtils && typeof window.PWAUtils === 'function') {
    return; // Already loaded
  }

  try {
    // Import PWA utilities as ES module
    const { default: PWAUtils } = await import('./modules/pwa/pwaUtils.js');

    // Make PWAUtils available globally for compatibility
    window.PWAUtils = PWAUtils;

    console.log('✅ PWA utilities loaded successfully');
  } catch (error) {
    console.error('❌ Failed to import PWA utilities module:', error);
    throw new Error(`Failed to load PWA utilities: ${error.message}`);
  }
}

/**
 * Setup PWA event listeners
 * @param {PWAUtils} pwaUtils - PWA utilities instance
 */
function setupPWAEventListeners(pwaUtilities) {
  // Listen for install availability
  window.addEventListener('pwa-install-available', () => {
    const calc = window.calculator || window.calculatorInstance;
    if (calc?.modules?.display) {
        calc.modules.display.showToast('📱 App can be installed!', 3000);
    }
  });

  // Listen for successful installation
  window.addEventListener('pwa-installed', () => {
    console.log('PWA installed successfully');
    const calc = window.calculator || window.calculatorInstance;
    if (calc?.modules?.display) {
      calc.modules.display.showToast('...');
    }
    // Log event if analytics are available
    if (typeof pwaUtilities.logEvent === 'function') {
      pwaUtilities.logEvent('app_installed');
    }
  });

  // Listen for network changes
  window.addEventListener('pwa-network-change', (event) => {
    const { status } = event.detail;
    console.log('Network status changed:', status);
    pwaUtilities.logEvent('network_change', { status });
  });

  // Listen for updates
  window.addEventListener('pwa-update-available', () => {
    console.log('PWA update available');
    showUpdateNotification();
    pwaUtilities.logEvent('update_available');
  });
}

/**
 * Register service worker for offline support
 *
 * Registers the service worker to enable offline functionality, caching,
 * and background sync capabilities for the calculator app.
 *
 * @async
 * @function registerServiceWorker
 * @returns {Promise<void>} Resolves when service worker is registered
 *
 * @example
 * await registerServiceWorker();
 *
 * Features provided:
 * - Offline app functionality
 * - Resource caching
 * - Background data sync
 * - Update notifications
 *

 */
async function registerServiceWorker() {
  // Check if service workers are supported
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Workers not supported in this browser');
    return;
  }

  try {
    console.log('📡 Registering service worker...');

    /** @type {ServiceWorkerRegistration} */
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('✅ Service Worker registered successfully:', registration);

    // Listen for service worker updates
    registration.addEventListener('updatefound', () => {
      /** @type {ServiceWorker|null} */
      const newWorker = registration.installing;

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 New service worker available');
            showUpdateNotification();
          }
        });
      }
    });

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      try {
        /** @type {{type: string, message: string, data?: any}} */
        const { type, message, data } = event.data || {};

        switch (type) {
          case 'DATA_SYNCED': {
            const calc = window.calculator || window.calculatorInstance;
            if (calc?.modules?.display) {
              calc.modules.display.showToast('...');
            }
            break;
          }
          case 'CACHE_UPDATED': {
            console.log('📦 Cache updated:', data);
            break;
          }
          case 'OFFLINE_READY': {
            console.log('📴 App ready for offline use');
            break;
          }
          default: {
            console.log('📨 Service worker message:', { type, message, data });
          }
        }
      } catch (error) {
        console.error('❌ Error handling service worker message:', error);
      }
    });

    // Check for existing service worker
    if (registration.active) {
      console.log('✅ Service worker is active and running');
    }

  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
  }
}

/**
 * Setup install prompt for PWA
 */
function setupInstallPrompt() {
  let deferredPrompt;
  let installButton;

  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('📱 PWA install prompt available');
    e.preventDefault();
    deferredPrompt = e;

    // Create install button if it doesn't exist
    if (installButton) {
      installButton.style.display = 'flex';
    } else {
      installButton = document.createElement('button');
      installButton.textContent = '📱 Install App';
      installButton.className = 'install-button';
      installButton.setAttribute('aria-label', 'Install calculator app');
      installButton.addEventListener('click', () => {
        void (async () => {
          if (deferredPrompt) {
            try {
              // Show the install prompt
              await deferredPrompt.prompt();
              const { outcome } = await deferredPrompt.userChoice;
              console.log(`User ${outcome} the install prompt`);

              if (outcome === 'accepted') {
                const calc = window.calculator || window.calculatorInstance;
                if (calc?.modules?.display) {
                  calc.modules.display.showToast('...');
                }
                // Dispatch custom event for install acceptance
                window.dispatchEvent(new CustomEvent('pwa-install-accepted'));
              } else {
                console.log('User dismissed the install prompt');
              }

              deferredPrompt = null;
              installButton.style.display = 'none';
            } catch (error) {
              console.error('Install prompt failed:', error);
              const calc = window.calculator || window.calculatorInstance;
              if (calc?.modules?.display) {
                calc.modules.display.showToast('...');
              }
            }
          }
        })();
      });

      const themeSwitch = document.querySelector('.theme-switch');
      if (themeSwitch) {
        themeSwitch.append(installButton);
      } else {
        // Fallback: add to calculator controls
        const controls = document.querySelector('.calculator-controls');
        if (controls) {
          controls.appendChild(installButton);
        }
      }
    }

    // Dispatch custom event for install availability
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  });

  // Hide install button when app is installed
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    if (installButton) {
      installButton.remove();
      installButton = null;
    }
    const calc = window.calculator || window.calculatorInstance;
    if (calc?.modules?.display) {
      calc.modules.display.showToast('...');
    }
    // Dispatch custom event for successful installation
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  });
}

/**
 * Setup offline detection
 */
function setupOfflineDetection() {
  function updateOnlineStatus() {
    if (navigator.onLine) {
      document.body.classList.remove('offline');
      const calc = window.calculator || window.calculatorInstance;
      if (calc?.modules?.display) {
        calc.modules.display.showToast('...');
      }
    } else {
      document.body.classList.add('offline');
      const calc = window.calculator || window.calculatorInstance;
      if (calc?.modules?.display) {
        calc.modules.display.showToast('...');
      }
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  // Initial check
  if (!navigator.onLine) {
    document.body.classList.add('offline');
  }
}

/**
 * Show update notification
 */
function showUpdateNotification() {
  const updateBanner = document.createElement('div');
  updateBanner.className = 'update-banner';
  updateBanner.innerHTML = `
            <div class="update-content">
                <span>A new version is available!</span>
                <button class="update-btn" onclick="updateApp()">Update</button>
                <button class="dismiss-btn" onclick="dismissUpdate()">&times;</button>
            </div>
        `;

  document.body.append(updateBanner);
  setTimeout(() => { updateBanner.classList.add('show'); }, 100);

  // Global functions for update actions
  window.updateApp = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  window.dismissUpdate = () => {
    updateBanner.remove();
  };
}

/**
 * Setup performance monitoring
 */
function setupPerformanceMonitoring() {
  // Monitor Core Web Vitals
  if ('web-vital' in window) {
    // This would be implemented with a web vitals library
    console.log('Web Vitals monitoring available');
  }

  // Monitor service worker performance
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_PERFORMANCE') {
        console.log('Cache performance:', event.data.metrics);
      }
    });
  }

  // Monitor app performance
  if ('performance' in window) {
    // Log initial load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('App load performance:', {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          totalTime: perfData.loadEventEnd - perfData.fetchStart
        });
      }, 0);
    });
  }

  console.log('Performance monitoring setup completed');
}

/**
 * Setup accessibility features
 * @param {Calculator} calculator - Calculator instance
 */
function setupAccessibilityFeatures(_calculator) {
  // Accessibility features
  const buttons = document.querySelectorAll('.buttons-grid button');
  for (const [_index, button] of buttons.entries()) {
    button.setAttribute('tabindex', '0');

    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });
  }

  console.log('Accessibility features setup completed');
}

/**
 * Setup accessibility features
 *
 * Initializes the accessibility system with comprehensive support
 * for motor, cognitive, visual, and auditory disabilities.
 *
 * @async
 * @function setupAccessability
 * @param {Calculator} calculator - Calculator instance
 * @returns {Promise<void>} Resolves when accessibility is set up
 */
async function setupAccessability(calculator) {
  console.log('♿ Setting up accessibility system...');

  try {
    // Initialize accessibility settings panel
    const { default: AccessibilitySettings } = await import('./modules/accessibility/accessibilitySettings.js');
    const accessibilitySettings = new AccessibilitySettings(calculator.modules.AccessibilityManager);

    // Make accessibility settings globally available
    window.accessibilitySettings = accessibilitySettings;

    // Setup voice control if supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      console.log('🎤 Voice control support detected');
    }

    // Detect and apply system accessibility preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    }

    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    if (prefersHighContrast) {
      document.documentElement.classList.add('high-contrast');
    }

    const prefersReducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
    if (prefersReducedTransparency) {
      document.documentElement.classList.add('reduced-transparency');
    }

    // Setup keyboard navigation indicators
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.documentElement.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.documentElement.classList.remove('keyboard-navigation');
    });

    // Setup touch device detection
    if ('ontouchstart' in window) {
      document.documentElement.classList.add('touch-device');
    }

    console.log('✅ Accessibility system setup completed');
  } catch (error) {
    console.error('❌ Error setting up accessibility:', error);
  }
}

/**
 * Setup advanced offline capabilities
 *
 * Initializes comprehensive offline functionality including intelligent caching,
 * background sync, and offline-first data architecture.
 *
 * @async
 * @function setupAdvancedOfflineCapabilities
 * @param {Calculator} calculator - Calculator instance
 * @returns {Promise<void>} Resolves when offline capabilities are set up
 */
async function setupAdvancedOfflineCapabilities(calculator) {
  console.log('📴 Setting up advanced offline capabilities...');

  try {
    // Initialize offline manager
    const { default: OfflineManager } = await import('./modules/pwa/offlineManager.js');
    const offlineManager = new OfflineManager();

    // Make offline manager globally available
    window.offlineManager = offlineManager;

    // Setup offline data persistence for calculator
    setupOfflineDataPersistence(calculator, offlineManager);

    // Setup network status monitoring
    setupNetworkStatusMonitoring(calculator, offlineManager);

    // Setup background sync for calculator data
    setupCalculatorBackgroundSync(calculator, offlineManager);

    // Setup offline UI indicators
    setupOfflineUIIndicators(calculator, offlineManager);

    console.log('✅ Advanced offline capabilities setup completed');
  } catch (error) {
    console.error('❌ Error setting up offline capabilities:', error);
  }
}

/**
 * Setup offline data persistence for calculator
 *
 * @function setupOfflineDataPersistence
 * @param {Calculator} calculator - Calculator instance
 * @param {OfflineManager} offlineManager - Offline manager instance
 * @returns {void}
 * @private
 */
function setupOfflineDataPersistence(calculator, offlineManager) {
  // Intercept calculator state changes for offline storage
  if (calculator.modules.state) {
    const originalUpdateState = calculator.modules.state.updateState;
    calculator.modules.state.updateState = function (newState) {
      // Call original method
      const result = originalUpdateState.call(this, newState);

      // Save to offline storage
      offlineManager.saveData('calculatorData', {
        state: newState,
        timestamp: Date.now(),
        type: 'state_update'
      }).catch(error => {
        console.warn('⚠️ Failed to save state offline:', error);
      });

      return result;
    };
  }

  // Intercept history updates
  if (calculator.modules.history) {
    const originalAddToHistory = calculator.modules.history.addToHistory;
    calculator.modules.history.addToHistory = function (entry) {
      // Call original method
      const result = originalAddToHistory.call(this, entry);

      // Save to offline storage
      offlineManager.saveData('history', {
        entry,
        timestamp: Date.now(),
        type: 'history_entry'
      }).catch(error => {
        console.warn('⚠️ Failed to save history offline:', error);
      });

      return result;
    };
  }

  // Intercept settings changes
  if (calculator.modules.settings) {
    const originalSaveSetting = calculator.modules.settings.saveSetting;
    calculator.modules.settings.saveSetting = function (key, value) {
      // Call original method
      const result = originalSaveSetting.call(this, key, value);

      // Save to offline storage
      offlineManager.saveData('settings', {
        key,
        value,
        timestamp: Date.now(),
        type: 'setting_change'
      }).catch(error => {
        console.warn('⚠️ Failed to save setting offline:', error);
      });

      return result;
    };
  }
}

/**
 * Setup network status monitoring
 *
 * @function setupNetworkStatusMonitoring
 * @param {Calculator} calculator - Calculator instance
 * @param {OfflineManager} offlineManager - Offline manager instance
 * @returns {void}
 * @private
 */
function setupNetworkStatusMonitoring(calculator, offlineManager) {
  // Listen for network status changes
  window.addEventListener('network-status-change', (event) => {
    const { status, isOnline } = event.detail;

    console.log(`🌐 Network status changed: ${status}`);

    // Update UI based on network status
    updateNetworkStatusUI(isOnline);

    // Show toast notification
    if (calculator.modules.display?.showToast) {
      const message = isOnline ?
        '🌐 Back online - syncing data...' :
        '📴 Offline mode - data will sync when reconnected';
      calculator.modules.display.showToast(message, 3000);
    }

    // Trigger sync when coming back online
    if (isOnline) {
      offlineManager.forceSyncAll().then(success => {
        if (success && calculator.modules.display?.showToast) {
          calculator.modules.display.showToast('✅ Data synchronized', 2000);
        }
      }).catch(error => {
        console.warn('⚠️ Failed to sync data:', error);
      });
    }
  });

  // Initial network status setup
  updateNetworkStatusUI(navigator.onLine);
}

/**
 * Update network status UI
 *
 * @function updateNetworkStatusUI
 * @param {boolean} isOnline - Whether device is online
 * @returns {void}
 * @private
 */
function updateNetworkStatusUI(isOnline) {
  document.documentElement.classList.toggle('offline', !isOnline);
  document.documentElement.classList.toggle('online', isOnline);

  // Update network status indicator
  let statusIndicator = document.querySelector('.network-status-indicator');
  if (!statusIndicator) {
    statusIndicator = document.createElement('div');
    statusIndicator.className = 'network-status-indicator';
    statusIndicator.setAttribute('aria-live', 'polite');
    statusIndicator.setAttribute('aria-label', 'Network status');
    document.body.appendChild(statusIndicator);
  }

  statusIndicator.textContent = isOnline ? '🌐' : '📴';
  statusIndicator.title = isOnline ? 'Online' : 'Offline';
  statusIndicator.classList.toggle('online', isOnline);
  statusIndicator.classList.toggle('offline', !isOnline);
}

/**
 * Setup background sync for calculator data
 *
 * @function setupCalculatorBackgroundSync
 * @param {Calculator} calculator - Calculator instance
 * @param {OfflineManager} offlineManager - Offline manager instance
 * @returns {void}
 * @private
 */
function setupCalculatorBackgroundSync(calculator, offlineManager) {
  // Register background sync when data changes
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    navigator.serviceWorker.ready.then(registration => {
      // Register periodic background sync
      registration.sync.register('calculator-periodic-sync').catch(error => {
        console.warn('⚠️ Failed to register background sync:', error);
      });
    }).catch(error => {
      console.warn('⚠️ Service worker not ready:', error);
    });
  }

  // Setup periodic sync fallback for browsers without background sync
  setInterval(() => {
    if (navigator.onLine && offlineManager) {
      offlineManager.syncPendingData().catch(error => {
        console.warn('⚠️ Periodic sync failed:', error);
      });
    }
  }, 60000); // Every minute
}

/**
 * Setup offline UI indicators
 *
 * @function setupOfflineUIIndicators
 * @param {Calculator} calculator - Calculator instance
 * @param {OfflineManager} offlineManager - Offline manager instance
 * @returns {void}
 * @private
 */
function setupOfflineUIIndicators(calculator, offlineManager) {
  // Add offline status to calculator controls
  const controls = document.querySelector('.calculator-controls');
  if (controls) {
    const offlineStatusBtn = document.createElement('button');
    offlineStatusBtn.className = 'control-btn offline-status-btn';
    offlineStatusBtn.setAttribute('aria-label', 'View offline status');
    offlineStatusBtn.innerHTML = '📊';
    offlineStatusBtn.title = 'Offline Status';

    offlineStatusBtn.addEventListener('click', () => {
      void (async () => {
        const status = await offlineManager.getOfflineStatus();
        showOfflineStatusModal(status);
      })();
    });

    controls.appendChild(offlineStatusBtn);
  }

  // Add CSS for offline indicators
  addOfflineIndicatorStyles();
}

/**
 * Show offline status modal
 *
 * @function showOfflineStatusModal
 * @param {Object} status - Offline status information
 * @returns {void}
 * @private
 */
function showOfflineStatusModal(status) {
  const modal = document.createElement('div');
  modal.className = 'offline-status-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-labelledby', 'offline-status-title');
  modal.setAttribute('aria-modal', 'true');

  modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="offline-status-title">Offline Status</h2>
                    <button class="close-btn" aria-label="Close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="status-grid">
                        <div class="status-item">
                            <span class="status-label">Network Status:</span>
                            <span class="status-value ${status.isOnline ? 'online' : 'offline'}">
                                ${status.isOnline ? '🌐 Online' : '📴 Offline'}
                            </span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Sync Queue:</span>
                            <span class="status-value">${status.queueSize} items</span>
                        </div>
                        <div class="status-item">
                            <span class="status-label">Cache Size:</span>
                            <span class="status-value">${status.cacheSize} entries</span>
                        </div>
                        ${Object.entries(status.stores || {}).map(([store, data]) => `
                            <div class="status-item">
                                <span class="status-label">${store}:</span>
                                <span class="status-value">${data.total} total, ${data.unsynced} unsynced</span>
                            </div>
                        `).join('')}
                    </div>
                    ${!status.isOnline ? `
                        <div class="offline-notice">
                            <p>📴 You're currently offline. Data will be synchronized when you reconnect to the internet.</p>
                        </div>
                    ` : ''}
                </div>
                <div class="modal-footer">
                    <button class="btn-primary" onclick="this.closest('.offline-status-modal').remove()">
                        Close
                    </button>
                    ${status.isOnline ? `
                        <button class="btn-secondary" onclick="window.offlineManager?.forceSyncAll(); this.closest('.offline-status-modal').remove();">
                            Force Sync
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

  // Close modal when clicking outside or on close button
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('close-btn')) {
      modal.remove();
    }
  });

  // Close modal with Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  document.body.appendChild(modal);

  // Focus the close button for accessibility
  setTimeout(() => {
    const closeBtn = modal.querySelector('.close-btn');
    if (closeBtn) closeBtn.focus();
  }, 100);
}

/**
 * Add CSS styles for export buttons
 *
 * @function addExportButtonStyles
 * @returns {void}
 * @private
 */
function addExportButtonStyles() {
  // Check if styles already added
  if (document.querySelector('#export-button-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'export-button-styles';
  style.textContent = `
            .export-buttons {
                display: flex;
                gap: 12px;
                margin: 20px 0;
                padding: 16px;
                background: var(--surface, #f8f9fa);
                border: 1px solid var(--border, #e9ecef);
                border-radius: 12px;
                flex-wrap: wrap;
                justify-content: center;
            }

            .export-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 16px;
                border: 1px solid var(--border, #e9ecef);
                border-radius: 8px;
                background: var(--surface-elevated, white);
                color: var(--text-primary, #333);
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                min-width: 120px;
                justify-content: center;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            .export-btn:hover {
                background: var(--bg-secondary, #f1f3f4);
                border-color: var(--border-focus, #007bff);
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }

            .export-btn:active {
                transform: translateY(0);
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            .export-btn:focus {
                outline: 2px solid var(--accent-primary, #007bff);
                outline-offset: 2px;
            }

            .csv-btn {
                border-color: var(--success-border, #28a745);
                color: var(--success-text, #28a745);
            }

            .csv-btn:hover {
                background: var(--success-bg, #d4edda);
                border-color: var(--success-border, #28a745);
            }

            .pdf-btn {
                border-color: var(--error-border, #dc3545);
                color: var(--error-text, #dc3545);
            }

            .pdf-btn:hover {
                background: var(--error-bg, #f8d7da);
                border-color: var(--error-border, #dc3545);
            }

            .json-btn {
                border-color: var(--warning-border, #ffc107);
                color: var(--warning-text, #856404);
            }

            .json-btn:hover {
                background: var(--warning-bg, #fff3cd);
                border-color: var(--warning-border, #ffc107);
            }

            /* Dark theme adjustments */
            [data-theme="dark"] .export-buttons {
                background: var(--surface-dark, #2a2a2a);
                border-color: var(--border-dark, #444);
            }

            [data-theme="dark"] .export-btn {
                background: var(--surface-elevated-dark, #333);
                color: var(--text-primary-dark, #e0e0e0);
                border-color: var(--border-dark, #444);
            }

            [data-theme="dark"] .export-btn:hover {
                background: var(--bg-secondary-dark, #3a3a3a);
            }

            /* Responsive design */
            @media (max-width: 768px) {
                .export-buttons {
                    flex-direction: column;
                    gap: 8px;
                }

                .export-btn {
                    width: 100%;
                    min-width: auto;
                }
            }

            /* High contrast mode */
            @media (prefers-contrast: high) {
                .export-btn {
                    border-width: 2px;
                    font-weight: 600;
                }
            }

            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .export-btn {
                    transition: none;
                }

                .export-btn:hover {
                    transform: none;
                }
            }
        `;
  document.head.appendChild(style);
}

/**
 * Add CSS styles for offline indicators
 *
 * @function addOfflineIndicatorStyles
 * @returns {void}
 * @private
 */
function addOfflineIndicatorStyles() {
  const style = document.createElement('style');
  style.textContent = `
            .network-status-indicator {
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 1000;
                font-size: 1.2em;
                padding: 8px 12px;
                border-radius: 12px;
                background: var(--surface-elevated, rgba(255, 255, 255, 0.9));
                border: 1px solid var(--border, rgba(0, 0, 0, 0.1));
                color: var(--text-primary, #333);
                backdrop-filter: var(--backdrop-blur, blur(10px));
                transition: all 0.3s ease;
                box-shadow: var(--shadow-elevated, 0 4px 12px rgba(0, 0, 0, 0.1));
            }

            .offline-status-btn {
                background: var(--surface, #f8f9fa);
                border: 1px solid var(--border, #e9ecef);
                color: var(--text-primary, #333);
                border-radius: 8px;
                padding: 8px 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 6px;
                font-family: inherit;
            }

            .offline-status-btn:hover {
                background: var(--surface-elevated, white);
                border-color: var(--border-focus, #007bff);
                transform: translateY(-1px);
                box-shadow: var(--shadow-elevated, 0 4px 12px rgba(0, 0, 0, 0.1));
            }

            .offline-status-btn:focus {
                outline: 2px solid var(--accent-primary, #007bff);
                outline-offset: 2px;
            }

            .network-status-indicator.offline {
                background: rgba(255, 0, 0, 0.1);
                animation: pulse 2s infinite;
            }

            .network-status-indicator.online {
                background: rgba(0, 255, 0, 0.1);
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            .offline-status-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 2000;
            }

            .offline-status-modal .modal-content {
                background: var(--surface-elevated, white);
                border: 1px solid var(--border, #e9ecef);
                border-radius: 16px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                color: var(--text-primary, #333);
            }

            .offline-status-modal .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 24px;
                border-bottom: 1px solid var(--border, #e9ecef);
            }

            .offline-status-modal .modal-header h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
                color: var(--text-primary, #333);
            }

            .offline-status-modal .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--text-secondary, #666);
                padding: 4px;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px;
                transition: all 0.2s ease;
            }

            .offline-status-modal .close-btn:hover {
                background: var(--surface, #f8f9fa);
                color: var(--text-primary, #333);
            }

            .offline-status-modal .modal-body {
                padding: 24px;
            }

            .offline-status-modal .status-grid {
                display: grid;
                gap: 12px;
            }

            .offline-status-modal .status-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: var(--surface, #f8f9fa);
                border: 1px solid var(--border, #e9ecef);
                border-radius: 8px;
                transition: all 0.2s ease;
            }

            .offline-status-modal .status-item:hover {
                background: var(--bg-secondary, #f1f3f4);
                border-color: var(--border-focus, #007bff);
            }

            .offline-status-modal .status-label {
                font-weight: 500;
                color: var(--text-secondary, #666);
            }

            .offline-status-modal .status-value {
                font-weight: 600;
                color: var(--text-primary, #333);
            }

            .offline-status-modal .status-value.online {
                color: var(--success-text, #28a745);
            }

            .offline-status-modal .status-value.offline {
                color: var(--error-text, #dc3545);
            }

            .offline-status-modal .offline-notice {
                margin-top: 16px;
                padding: 16px;
                background: var(--warning-bg, #fff3cd);
                border: 1px solid var(--warning-border, #ffeaa7);
                border-radius: 8px;
                color: var(--warning-text, #856404);
            }

            .offline-status-modal .modal-footer {
                padding: 24px;
                border-top: 1px solid var(--border, #e9ecef);
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                flex-wrap: wrap;
            }

            .offline-status-modal button {
                padding: 10px 20px;
                border-radius: 8px;
                border: none;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
                min-width: 80px;
            }

            .offline-status-modal .btn-primary {
                background: var(--accent-primary, #007bff);
                color: white;
            }

            .offline-status-modal .btn-primary:hover {
                background: var(--accent-primary-hover, #0056b3);
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
            }

            .offline-status-modal .btn-secondary {
                background: var(--surface, #f8f9fa);
                color: var(--text-primary, #333);
                border: 1px solid var(--border, #e9ecef);
            }

            .offline-status-modal .btn-secondary:hover {
                background: var(--surface-elevated, white);
                border-color: var(--border-focus, #007bff);
                transform: translateY(-1px);
            }

            /* Offline mode styles */
            html.offline .calculator-container {
                border: 2px solid #ffc107;
            }

            html.offline .calculator-container::before {
                content: "📴 Offline Mode";
                position: absolute;
                top: -30px;
                left: 50%;
                transform: translateX(-50%);
                background: #ffc107;
                color: #212529;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 12px;
                font-weight: 600;
                z-index: 10;
            }
        `;
  document.head.appendChild(style);
}

/**
 * Setup Vercel performance monitoring
 *
 * Initializes comprehensive performance monitoring including Core Web Vitals,
 * custom metrics, and integration with Vercel Analytics and Speed Insights.
 *
 * @async
 * @function setupVercelPerformanceMonitoring
 * @param {Calculator} calculator - Calculator instance
 * @returns {Promise<void>} Resolves when performance monitoring is set up
 */
async function setupVercelPerformanceMonitoring(calculator) {
  console.log('📊 Setting up Vercel performance monitoring...');

  try {
    // Initialize Vercel Performance Monitor
    const { default: VercelPerformanceMonitor } = await import('./modules/vercel/performanceMonitor.js');
    const performanceMonitor = new VercelPerformanceMonitor();

    // Make performance monitor globally available
    window.performanceMonitor = performanceMonitor;

    // Setup calculator-specific performance tracking
    setupCalculatorPerformanceTracking(calculator, performanceMonitor);

    // Setup user interaction tracking
    setupUserInteractionTracking(calculator, performanceMonitor);

    // Setup error tracking
    setupErrorTracking(calculator, performanceMonitor);

    // Setup resource monitoring
    setupResourceMonitoring(performanceMonitor);

    console.log('✅ Vercel performance monitoring setup completed');
  } catch (error) {
    console.error('❌ Error setting up Vercel performance monitoring:', error);
  }
}

/**
 * Setup calculator-specific performance tracking
 *
 * @function setupCalculatorPerformanceTracking
 * @param {Calculator} calculator - Calculator instance
 * @param {VercelPerformanceMonitor} performanceMonitor - Performance monitor instance
 * @returns {void}
 * @private
 */
function setupCalculatorPerformanceTracking(calculator, performanceMonitor) {
  // Track calculation performance
  if (calculator.modules.operations) {
    const originalCalculate = calculator.modules.operations.calculate;
    calculator.modules.operations.calculate = function (expression) {
      const startTime = performance.now();
      const result = originalCalculate.call(this, expression);
      const duration = performance.now() - startTime;

      performanceMonitor.trackCalculatorOperation('calculate', duration, {
        expression: expression?.substring(0, 50), // Limit length for privacy
        complexity: expression?.length || 0
      });

      return result;
    };
  }

  // Track state updates
  if (calculator.modules.state) {
    const originalUpdateState = calculator.modules.state.updateState;
    calculator.modules.state.updateState = function (newState) {
      const startTime = performance.now();
      const result = originalUpdateState.call(this, newState);
      const duration = performance.now() - startTime;

      performanceMonitor.trackCalculatorOperation('state_update', duration, {
        stateSize: JSON.stringify(newState).length
      });

      return result;
    };
  }

  // Track display updates
  if (calculator.modules.display) {
    const originalUpdateDisplay = calculator.modules.display.updateDisplay;
    calculator.modules.display.updateDisplay = function (value) {
      const startTime = performance.now();
      const result = originalUpdateDisplay.call(this, value);
      const duration = performance.now() - startTime;

      performanceMonitor.trackCalculatorOperation('display_update', duration, {
        valueLength: value?.toString().length || 0
      });

      return result;
    };
  }
}

/**
 * Setup user interaction tracking
 *
 * @function setupUserInteractionTracking
 * @param {Calculator} calculator - Calculator instance
 * @param {VercelPerformanceMonitor} performanceMonitor - Performance monitor instance
 * @returns {void}
 * @private
 */
function setupUserInteractionTracking(calculator, performanceMonitor) {
  // Track button clicks
  document.addEventListener('click', (event) => {
    if (event.target.matches('button[data-action]')) {
      const startTime = performance.now();

      // Use requestAnimationFrame to measure actual response time
      requestAnimationFrame(() => {
        const responseTime = performance.now() - startTime;
        const action = event.target.getAttribute('data-action');
        const value = event.target.getAttribute('data-value') || event.target.textContent;

        performanceMonitor.trackUserInteraction('button_click', responseTime, {
          action,
          value: value?.substring(0, 10), // Limit for privacy
          buttonType: event.target.className
        });
      });
    }
  });

  // Track keyboard interactions
  document.addEventListener('keydown', (event) => {
    const startTime = performance.now();

    requestAnimationFrame(() => {
      const responseTime = performance.now() - startTime;

      performanceMonitor.trackUserInteraction('keyboard', responseTime, {
        key: event.key,
        code: event.code,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey
      });
    });
  });

  // Track touch interactions on mobile
  if ('ontouchstart' in window) {
    document.addEventListener('touchstart', (event) => {
      const startTime = performance.now();

      requestAnimationFrame(() => {
        const responseTime = performance.now() - startTime;

        performanceMonitor.trackUserInteraction('touch', responseTime, {
          touches: event.touches.length,
          target: event.target.tagName
        });
      });
    });
  }
}

/**
 * Setup error tracking
 *
 * @function setupErrorTracking
 * @param {Calculator} calculator - Calculator instance
 * @param {VercelPerformanceMonitor} performanceMonitor - Performance monitor instance
 * @returns {void}
 * @private
 */
function setupErrorTracking(calculator, performanceMonitor) {
  // Track JavaScript errors
  window.addEventListener('error', (event) => {
    performanceMonitor.trackCustomMetric('javascript_error', 1, 'count', 'error', {
      message: event.message?.substring(0, 100),
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    performanceMonitor.trackCustomMetric('promise_rejection', 1, 'count', 'error', {
      reason: event.reason?.toString().substring(0, 100)
    });
  });

  // Track calculator-specific errors
  if (calculator.modules.errorBoundary) {
    const originalHandleError = calculator.modules.errorBoundary.handleError;
    calculator.modules.errorBoundary.handleError = function (error, context) {
      performanceMonitor.trackCustomMetric('calculator_error', 1, 'count', 'error', {
        message: error.message?.substring(0, 100),
        context: context?.substring(0, 50),
        stack: error.stack?.substring(0, 200)
      });

      return originalHandleError.call(this, error, context);
    };
  }
}

/**
 * Setup resource monitoring
 *
 * @function setupResourceMonitoring
 * @param {VercelPerformanceMonitor} performanceMonitor - Performance monitor instance
 * @returns {void}
 * @private
 */
function setupResourceMonitoring(performanceMonitor) {
  // Monitor memory usage
  if ('memory' in performance) {
    setInterval(() => {
      const memInfo = performance.memory;
      performanceMonitor.trackCustomMetric('memory_used', memInfo.usedJSHeapSize, 'bytes', 'memory');
      performanceMonitor.trackCustomMetric('memory_total', memInfo.totalJSHeapSize, 'bytes', 'memory');
      performanceMonitor.trackCustomMetric('memory_limit', memInfo.jsHeapSizeLimit, 'bytes', 'memory');
    }, 30000); // Every 30 seconds
  }

  // Monitor connection quality
  if ('connection' in navigator) {
    const connection = navigator.connection;

    performanceMonitor.trackCustomMetric('connection_type', 1, 'count', 'network', {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    });

    // Track connection changes
    connection.addEventListener('change', () => {
      performanceMonitor.trackCustomMetric('connection_change', 1, 'count', 'network', {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt
      });
    });
  }

  // Monitor page visibility
  document.addEventListener('visibilitychange', () => {
    performanceMonitor.trackCustomMetric('visibility_change', 1, 'count', 'lifecycle', {
      hidden: document.hidden,
      visibilityState: document.visibilityState
    });
  });
}

/**
 * Setup gesture support
 * @param {Calculator} calculator - Calculator instance
 */
function setupGestureSupport(calculator) {
  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });

  document.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) { return; }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Swipe gestures
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right - undo
        calculator.undo();
      } else {
        // Swipe left - redo
        calculator.redo();
      }
    }

    touchStartX = 0;
    touchStartY = 0;
  });

  console.log('Gesture support setup completed');
}

// ------------ APPLICATION INITIALIZATION

/**
 * Initialize the calculator application when the module loads
 *
 * This is the main entry point that starts the calculator initialization
 * process as soon as the module is loaded. It handles both successful
 * initialization and error scenarios gracefully.
 *
 */
void (async () => {
  try {
    console.log('🚀 Starting The Great Calculator...');
    await initializeCalculator();
  } catch (error) {
    console.error('💥 Fatal error during calculator startup:', error);

    // Show critical error message
    const errorMessage = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #ff4444;
                color: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                z-index: 9999;
                font-family: system-ui, sans-serif;
            ">
                <h2>⚠️ Calculator Startup Failed</h2>
                <p>The calculator could not be initialized.</p>
                <button onclick="location.reload()" style="
                    background: white;
                    color: #ff4444;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                ">Reload Page</button>
            </div>
        `;

    document.body.insertAdjacentHTML('beforeend', errorMessage);
  }
})();
