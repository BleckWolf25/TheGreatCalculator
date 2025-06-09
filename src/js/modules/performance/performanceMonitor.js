/**
 * @file PERFORMANCE MONITOR MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Performance monitoring and optimization module for The Great Calculator.
 * Tracks calculation performance, render times, memory usage, user interactions,
 * and provides comprehensive performance analytics and optimization insights.
 *
 * Features:
 * - Real-time calculation performance tracking
 * - Render performance monitoring with FPS tracking
 * - Memory usage monitoring and leak detection
 * - User interaction response time measurement
 * - Configurable performance thresholds
 * - Comprehensive performance analytics
 * - Performance metrics export functionality
 *
 * @requires Web APIs: Performance API, Memory API
 */

// ------------ TYPE AND JSDOC DEFINITIONS

/**
 * @typedef {Object} PerformanceMetrics
 * @property {CalculationMetric[]} calculations - Calculation performance metrics
 * @property {RenderMetric[]} renders - Render performance metrics
 * @property {MemoryMetric[]} memory - Memory usage metrics
 * @property {InteractionMetric[]} interactions - User interaction metrics
 */

/**
 * @typedef {Object} CalculationMetric
 * @property {string} operation - Type of calculation operation
 * @property {number} operands - Number of operands in calculation
 * @property {number} duration - Time taken in milliseconds
 * @property {number} memoryDelta - Memory usage change in bytes
 * @property {number} timestamp - Timestamp when metric was recorded
 * @property {string|null} error - Error message if calculation failed
 */

/**
 * @typedef {Object} RenderMetric
 * @property {string} component - Component or element being rendered
 * @property {number} duration - Render time in milliseconds
 * @property {number} timestamp - Timestamp when metric was recorded
 */

/**
 * @typedef {Object} MemoryMetric
 * @property {number} used - Used memory in bytes
 * @property {number} total - Total allocated memory in bytes
 * @property {number} limit - Memory limit in bytes
 * @property {number} percentage - Memory usage percentage
 * @property {number} timestamp - Timestamp when metric was recorded
 */

/**
 * @typedef {Object} InteractionMetric
 * @property {string} type - Type of interaction (click, keydown, touchstart)
 * @property {string} target - Target element tag name
 * @property {number} duration - Response time in milliseconds
 * @property {number} timestamp - Timestamp when metric was recorded
 */

/**
 * @typedef {Object} PerformanceThresholds
 * @property {number} calculationTime - Maximum acceptable calculation time (ms)
 * @property {number} renderTime - Maximum acceptable render time (ms)
 * @property {number} memoryGrowth - Maximum acceptable memory growth (percentage)
 * @property {number} interactionDelay - Maximum acceptable interaction delay (ms)
 */

/**
 * @typedef {Object} PerformanceSummary
 * @property {number} uptime - Application uptime in milliseconds
 * @property {CalculationSummary} calculations - Calculation performance summary
 * @property {RenderSummary} renders - Render performance summary
 * @property {InteractionSummary} interactions - Interaction performance summary
 * @property {MemoryMetric|null} memory - Current memory usage
 */

/**
 * @typedef {Object} CalculationSummary
 * @property {number} total - Total number of calculations
 * @property {number} average - Average calculation time
 * @property {number} slow - Number of slow calculations
 */

/**
 * @typedef {Object} RenderSummary
 * @property {number} total - Total number of renders
 * @property {number} average - Average render time
 * @property {number} slow - Number of slow renders
 */

/**
 * @typedef {Object} InteractionSummary
 * @property {number} total - Total number of interactions
 * @property {number} average - Average interaction response time
 * @property {number} slow - Number of slow interactions
 */

/**
 * @typedef {Object} MeasurementResult
 * @property {any} result - Result of the measured operation
 * @property {CalculationMetric|RenderMetric|InteractionMetric|null} metric - Performance metric
 */

// ------------ PERFORMANCE MONITOR CLASS

/**
 * Performance Monitor Class
 *
 * Provides comprehensive performance monitoring and analytics for
 * calculator operations, rendering, memory usage, and user interactions.
 *
 * @class PerformanceMonitor
 * @example
 * const monitor = new PerformanceMonitor();
 *
 * // Measure calculation performance
 * const { result, metric } = monitor.measureCalculation('addition', [1, 2], () => 1 + 2);
 *
 * // Get performance summary
 * const summary = monitor.getSummary();
 * console.log('Average calculation time:', summary.calculations.average);
 */
class PerformanceMonitor {
  /**
   * Create performance monitor instance
   *
   * Initializes performance monitoring with default thresholds and
   * sets up automatic monitoring for memory, interactions, and rendering.
   *
   * @constructor
   * @example
   * const monitor = new PerformanceMonitor();
   */
  constructor() {
    /** @type {PerformanceMetrics} Performance metrics storage */
    this.metrics = {
      calculations: [],
      renders: [],
      memory: [],
      interactions: []
    };

    /** @type {PerformanceThresholds} Performance warning thresholds */
    this.thresholds = {
      calculationTime: 50, // ms
      renderTime: 16, // ms (60fps)
      memoryGrowth: 50, // percentage
      interactionDelay: 100 // ms
    };

    /** @type {boolean} Whether monitoring is currently active */
    this.isMonitoring = false;

    /** @type {number} Application start time for uptime calculation */
    this.startTime = performance.now();

    this.init();
  }

  // ------------ INITIALIZATION METHODS

  /**
   * Initialize performance monitoring
   *
   * Sets up automatic monitoring for memory usage, user interactions,
   * and render performance if the Performance API is available.
   *
   * @method init
   * @returns {void}
   *
   * @example
   * const monitor = new PerformanceMonitor();
   * // init() is called automatically in constructor
   */
  init() {
    if (typeof performance === 'undefined') {
      console.warn('Performance API not available');
      return;
    }

    this.setupMemoryMonitoring();
    this.setupInteractionMonitoring();
    this.setupRenderMonitoring();

    this.isMonitoring = true;
    console.log('Performance monitoring initialized');
  }

  // ------------ PERFORMANCE MEASUREMENT METHODS

  /**
   * Measure calculation performance
   *
   * Wraps a calculation function to measure its execution time,
   * memory usage impact, and detect performance issues.
   *
   * @method measureCalculation
   * @param {string} operation - Name of the calculation operation
   * @param {any[]|null} operands - Array of operands used in calculation
   * @param {Function} callback - Function to execute and measure
   * @returns {MeasurementResult} Result and performance metric
   *
   * @example
   * const { result, metric } = monitor.measureCalculation('addition', [5, 3], () => {
   *   return 5 + 3;
   * });
   * console.log('Result:', result, 'Time:', metric.duration + 'ms');
   */
  measureCalculation(operation, operands, callback) {
    /** @type {number} */
    const startTime = performance.now();
    /** @type {MemoryMetric|null} */
    const startMemory = this.getMemoryUsage();

    /** @type {any} */
    let result;
    /** @type {Error|null} */
    let error = null;

    try {
      result = callback();
    } catch (e) {
      error = e;
    }

    /** @type {number} */
    const endTime = performance.now();
    /** @type {MemoryMetric|null} */
    const endMemory = this.getMemoryUsage();

    /** @type {CalculationMetric} */
    const metric = {
      operation,
      operands: operands?.length || 0,
      duration: endTime - startTime,
      memoryDelta: endMemory && startMemory ? endMemory.used - startMemory.used : 0,
      timestamp: Date.now(),
      error: error?.message || null
    };

    this.metrics.calculations.push(metric);

    // Check for performance issues
    if (metric.duration > this.thresholds.calculationTime) {
      console.warn(`Slow calculation detected: ${operation} took ${metric.duration.toFixed(2)}ms`);
    }

    return { result, metric };
  }

  /**
   * Measure render performance
   *
   * Wraps a rendering function to measure its execution time
   * and detect render performance issues.
   *
   * @method measureRender
   * @param {string} component - Name of the component being rendered
   * @param {Function} callback - Render function to execute and measure
   * @returns {MeasurementResult} Result and performance metric
   *
   * @example
   * const { result, metric } = monitor.measureRender('calculator-display', () => {
   *   updateDisplay('123.45');
   *   return true;
   * });
   * console.log('Render time:', metric.duration + 'ms');
   */
  measureRender(component, callback) {
    /** @type {number} */
    const startTime = performance.now();

    /** @type {any} */
    let result;
    try {
      result = callback();
    } catch (error) {
      console.error('Render error:', error);
      return { result: null, metric: null };
    }

    /** @type {number} */
    const endTime = performance.now();

    /** @type {RenderMetric} */
    const metric = {
      component,
      duration: endTime - startTime,
      timestamp: Date.now()
    };

    this.metrics.renders.push(metric);

    // Check for render performance issues
    if (metric.duration > this.thresholds.renderTime) {
      console.warn(`Slow render detected: ${component} took ${metric.duration.toFixed(2)}ms`);
    }

    return { result, metric };
  }

  /**
   * Measure user interaction response time
   *
   * Wraps an interaction handler to measure response time
   * and detect interaction performance issues.
   *
   * @method measureInteraction
   * @param {string} type - Type of interaction (click, keydown, etc.)
   * @param {string} target - Target element identifier
   * @param {Function} callback - Interaction handler to execute and measure
   * @returns {MeasurementResult} Result and performance metric
   *
   * @example
   * const { result, metric } = monitor.measureInteraction('click', 'button', () => {
   *   handleButtonClick();
   *   return true;
   * });
   * console.log('Interaction response time:', metric.duration + 'ms');
   */
  measureInteraction(type, target, callback) {
    /** @type {number} */
    const startTime = performance.now();

    /** @type {any} */
    const result = callback();

    /** @type {number} */
    const endTime = performance.now();

    /** @type {InteractionMetric} */
    const metric = {
      type,
      target,
      duration: endTime - startTime,
      timestamp: Date.now()
    };

    this.metrics.interactions.push(metric);

    // Check for interaction delays
    if (metric.duration > this.thresholds.interactionDelay) {
      console.warn(`Slow interaction: ${type} on ${target} took ${metric.duration.toFixed(2)}ms`);
    }

    return { result, metric };
  }

  // ------------ MEMORY MONITORING METHODS

  /**
   * Get current memory usage
   *
   * Retrieves current JavaScript heap memory usage information
   * if the Memory API is available in the browser.
   *
   * @method getMemoryUsage
   * @returns {MemoryMetric|null} Current memory usage or null if not supported
   *
   * @example
   * const memoryUsage = monitor.getMemoryUsage();
   * if (memoryUsage) {
   *   console.log(`Memory usage: ${memoryUsage.percentage.toFixed(1)}%`);
   *   console.log(`Used: ${(memoryUsage.used / 1024 / 1024).toFixed(1)} MB`);
   * }
   */
  getMemoryUsage() {
    if (!performance.memory) {
      return null;
    }

    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
      percentage: (performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize) * 100
    };
  }

  /**
   * Setup memory monitoring
   *
   * Configures automatic memory usage sampling at regular intervals
   * to track memory consumption and detect potential memory leaks.
   *
   * @method setupMemoryMonitoring
   * @returns {void}
   *
   * @example
   * monitor.setupMemoryMonitoring();
   * // Memory will be sampled every 10 seconds automatically
   */
  setupMemoryMonitoring() {
    if (!performance.memory) {
      return;
    }

    /**
     * Sample memory usage and store metric
     * @returns {void}
     */
    const sampleMemory = () => {
      /** @type {MemoryMetric|null} */
      const usage = this.getMemoryUsage();
      if (usage) {
        /** @type {MemoryMetric} */
        const memoryMetric = {
          ...usage,
          timestamp: Date.now()
        };
        this.metrics.memory.push(memoryMetric);

        // Keep only last 100 samples
        if (this.metrics.memory.length > 100) {
          this.metrics.memory.shift();
        }

        // Check for memory leaks
        this.checkMemoryLeak();
      }
    };

    // Sample memory every 10 seconds
    setInterval(sampleMemory, 10000);
    sampleMemory(); // Initial sample
  }

  // ------------ INTERACTION MONITORING METHODS

  /**
   * Setup interaction monitoring
   *
   * Configures automatic monitoring of user interactions to measure
   * response times and detect performance issues with user input.
   *
   * @method setupInteractionMonitoring
   * @returns {void}
   *
   * @example
   * monitor.setupInteractionMonitoring();
   * // User interactions will be automatically monitored
   */
  setupInteractionMonitoring() {
    /** @type {string[]} */
    const events = ['click', 'keydown', 'touchstart'];

    events.forEach(eventType => {
      document.addEventListener(eventType, (event) => {
        /** @type {number} */
        const startTime = performance.now();

        // Use requestAnimationFrame to measure when the interaction is processed
        requestAnimationFrame(() => {
          /** @type {number} */
          const endTime = performance.now();

          /** @type {InteractionMetric} */
          const interactionMetric = {
            type: eventType,
            target: event.target.tagName || 'unknown',
            duration: endTime - startTime,
            timestamp: Date.now()
          };

          this.metrics.interactions.push(interactionMetric);
        });
      }, { passive: true });
    });
  }

  // ------------ RENDER MONITORING METHODS

  /**
   * Setup render monitoring
   *
   * Configures automatic frame rate monitoring to detect rendering
   * performance issues and low FPS situations.
   *
   * @method setupRenderMonitoring
   * @returns {void}
   *
   * @example
   * monitor.setupRenderMonitoring();
   * // Frame rate will be automatically monitored
   */
  setupRenderMonitoring() {
    // Monitor frame rate
    /** @type {number} */
    let lastFrameTime = performance.now();
    /** @type {number} */
    let frameCount = 0;
    /** @type {number[]} */
    let frameTimes = [];

    /**
     * Measure frame performance
     * @returns {void}
     */
    const measureFrame = () => {
      /** @type {number} */
      const currentTime = performance.now();
      /** @type {number} */
      const frameTime = currentTime - lastFrameTime;

      frameTimes.push(frameTime);
      frameCount++;

      // Calculate FPS every second
      if (frameCount >= 60) {
        /** @type {number} */
        const averageFrameTime = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
        /** @type {number} */
        const fps = 1000 / averageFrameTime;

        if (fps < 50) {
          console.warn(`Low FPS detected: ${fps.toFixed(1)} fps`);
        }

        frameCount = 0;
        frameTimes = [];
      }

      lastFrameTime = currentTime;
      requestAnimationFrame(measureFrame);
    };

    requestAnimationFrame(measureFrame);
  }

  // ------------ MEMORY LEAK DETECTION METHODS

  /**
   * Check for memory leaks
   *
   * Analyzes recent memory usage patterns to detect potential
   * memory leaks based on growth rate thresholds.
   *
   * @method checkMemoryLeak
   * @returns {void}
   *
   * @example
   * monitor.checkMemoryLeak();
   * // Automatically called during memory sampling
   */
  checkMemoryLeak() {
    if (this.metrics.memory.length < 10) {
      return;
    }

    /** @type {MemoryMetric[]} */
    const recent = this.metrics.memory.slice(-10);
    /** @type {MemoryMetric} */
    const oldest = recent[0];
    /** @type {MemoryMetric} */
    const newest = recent[recent.length - 1];

    /** @type {number} */
    const growthPercentage = ((newest.used - oldest.used) / oldest.used) * 100;

    if (growthPercentage > this.thresholds.memoryGrowth) {
      console.warn(`Potential memory leak detected: ${growthPercentage.toFixed(1)}% growth`);
    }
  }

  // ------------ PERFORMANCE SUMMARY METHODS

  /**
   * Get comprehensive performance summary
   *
   * Returns a detailed summary of all performance metrics including
   * uptime, calculation performance, render performance, interactions,
   * and current memory usage.
   *
   * @method getSummary
   * @returns {PerformanceSummary} Comprehensive performance summary
   *
   * @example
   * const summary = monitor.getSummary();
   * console.log('Application uptime:', summary.uptime + 'ms');
   * console.log('Average calculation time:', summary.calculations.average + 'ms');
   * console.log('Slow calculations:', summary.calculations.slow);
   */
  getSummary() {
    /** @type {number} */
    const now = Date.now();
    /** @type {number} */
    const uptime = now - this.startTime;

    return {
      uptime,
      calculations: {
        total: this.metrics.calculations.length,
        average: this.getAverageCalculationTime(),
        slow: this.metrics.calculations.filter(c => c.duration > this.thresholds.calculationTime).length
      },
      renders: {
        total: this.metrics.renders.length,
        average: this.getAverageRenderTime(),
        slow: this.metrics.renders.filter(r => r.duration > this.thresholds.renderTime).length
      },
      interactions: {
        total: this.metrics.interactions.length,
        average: this.getAverageInteractionTime(),
        slow: this.metrics.interactions.filter(i => i.duration > this.thresholds.interactionDelay).length
      },
      memory: this.getMemoryUsage()
    };
  }

  // ------------ AVERAGE CALCULATION METHODS

  /**
   * Get average calculation time
   *
   * Calculates the average execution time for all recorded calculations.
   *
   * @method getAverageCalculationTime
   * @returns {number} Average calculation time in milliseconds
   *
   * @example
   * const avgTime = monitor.getAverageCalculationTime();
   * console.log('Average calculation time:', avgTime.toFixed(2) + 'ms');
   */
  getAverageCalculationTime() {
    if (this.metrics.calculations.length === 0) return 0;

    /** @type {number} */
    const total = this.metrics.calculations.reduce((sum, calc) => sum + calc.duration, 0);
    return total / this.metrics.calculations.length;
  }

  /**
   * Get average render time
   *
   * Calculates the average execution time for all recorded renders.
   *
   * @method getAverageRenderTime
   * @returns {number} Average render time in milliseconds
   *
   * @example
   * const avgRenderTime = monitor.getAverageRenderTime();
   * console.log('Average render time:', avgRenderTime.toFixed(2) + 'ms');
   */
  getAverageRenderTime() {
    if (this.metrics.renders.length === 0) return 0;

    /** @type {number} */
    const total = this.metrics.renders.reduce((sum, render) => sum + render.duration, 0);
    return total / this.metrics.renders.length;
  }

  /**
   * Get average interaction time
   *
   * Calculates the average response time for all recorded user interactions.
   *
   * @method getAverageInteractionTime
   * @returns {number} Average interaction time in milliseconds
   *
   * @example
   * const avgInteractionTime = monitor.getAverageInteractionTime();
   * console.log('Average interaction time:', avgInteractionTime.toFixed(2) + 'ms');
   */
  getAverageInteractionTime() {
    if (this.metrics.interactions.length === 0) return 0;

    /** @type {number} */
    const total = this.metrics.interactions.reduce((sum, interaction) => sum + interaction.duration, 0);
    return total / this.metrics.interactions.length;
  }

  // ------------ UTILITY METHODS

  /**
   * Clear all performance metrics
   *
   * Resets all collected performance metrics to empty state.
   * Useful for starting fresh measurements or freeing memory.
   *
   * @method clearMetrics
   * @returns {void}
   *
   * @example
   * monitor.clearMetrics();
   * console.log('All metrics cleared');
   */
  clearMetrics() {
    this.metrics = {
      calculations: [],
      renders: [],
      memory: [],
      interactions: []
    };

    console.log('Performance metrics cleared');
  }

  /**
   * Export metrics for analysis
   *
   * Returns all performance data in a structured format suitable
   * for external analysis, reporting, or storage.
   *
   * @method exportMetrics
   * @returns {Object} Complete metrics export with summary and detailed data
   *
   * @example
   * const exportData = monitor.exportMetrics();
   * console.log('Performance summary:', exportData.summary);
   * console.log('Detailed metrics:', exportData.detailed);
   *
   * // Save to file or send to analytics service
   * localStorage.setItem('performance-metrics', JSON.stringify(exportData));
   */
  exportMetrics() {
    return {
      summary: this.getSummary(),
      detailed: this.metrics,
      thresholds: this.thresholds,
      timestamp: Date.now()
    };
  }
}

// ------------ MODULE EXPORTS AND GLOBAL REGISTRATION

/**
 * Export for ES6 module systems (modern bundlers, native ES modules)
 * Enables tree-shaking and modern import/export syntax.
 *
 * @default PerformanceMonitor
 */
export default PerformanceMonitor;
