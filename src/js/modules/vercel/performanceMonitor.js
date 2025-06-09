/**
 * @file VERCEL PERFORMANCE MONITOR
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Comprehensive performance monitoring client for The Great Calculator on Vercel.
 * Integrates with Vercel Analytics and Speed Insights, tracks Core Web Vitals,
 * custom metrics, and provides real-time performance monitoring.
 */

// ------------ PERFORMANCE MONITOR CLASS

/**
 * Vercel Performance Monitor Class
 *
 * Provides comprehensive performance monitoring including Core Web Vitals,
 * custom metrics, user interactions, and integration with Vercel services.
 *
 * @class VercelPerformanceMonitor
 * @example
 * const monitor = new VercelPerformanceMonitor();
 * await monitor.initialize();
 */
class VercelPerformanceMonitor {
    /**
     * Create performance monitor instance
     *
     * @constructor
     */
    constructor() {
        /** @type {string|null} Session ID for tracking */
        this.sessionId = null;

        /** @type {Object} Configuration options */
        this.config = {
            enableWebVitals: true,
            enableCustomMetrics: true,
            enableUserTiming: true,
            enableResourceTiming: true,
            enableNavigationTiming: true,
            batchSize: 10,
            flushInterval: 30000, // 30 seconds
            apiEndpoint: '/api/performance',
            debug: false
        };

        /** @type {Array} Metrics queue for batching */
        this.metricsQueue = [];

        /** @type {number|null} Flush interval ID */
        this.flushIntervalId = null;

        /** @type {Object} Performance observers */
        this.observers = {};

        /** @type {boolean} Initialization status */
        this.initialized = false;

        /** @type {Object} Vercel integrations */
        this.vercelIntegrations = {
            analytics: null,
            speedInsights: null
        };

        void this.init();
    }

    /**
     * Initialize performance monitor
     *
     * @method init
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // Generate session ID
            this.sessionId = this.generateSessionId();

            // Initialize Vercel integrations
            await this.initializeVercelIntegrations();

            // Setup Core Web Vitals monitoring
            if (this.config.enableWebVitals) {
                await this.setupWebVitalsMonitoring();
            }

            // Setup custom metrics monitoring
            if (this.config.enableCustomMetrics) {
                this.setupCustomMetricsMonitoring();
            }

            // Setup performance observers
            this.setupPerformanceObservers();

            // Setup automatic flushing
            this.setupAutoFlush();

            // Track page load performance
            this.trackPageLoadPerformance();

            this.initialized = true;
            console.log('📊 Vercel Performance Monitor initialized');

        } catch (error) {
            console.error('❌ Failed to initialize performance monitor:', error);
        }
    }

    /**
     * Initialize Vercel integrations
     *
     * @method initializeVercelIntegrations
     * @returns {Promise<void>}
     * @private
     */
    async initializeVercelIntegrations() {
        try {
            // Initialize Vercel Analytics (CDN-based)
            if (typeof window !== 'undefined' && window.va) {
                this.vercelIntegrations.analytics = window.va;
                console.log('📈 Vercel Analytics integration enabled');
            } else {
                console.log('📈 Waiting for Vercel Analytics to load via CDN...');
            }

            // Initialize Vercel Speed Insights (CDN-based)
            if (typeof window !== 'undefined' && window.speedInsights) {
                this.vercelIntegrations.speedInsights = window.speedInsights;
                console.log('⚡ Vercel Speed Insights integration enabled');
            } else {
                console.log('⚡ Waiting for Vercel Speed Insights to load via CDN...');
            }

        } catch (error) {
            console.warn('⚠️ Failed to initialize Vercel integrations:', error);
        }
    }

    /**
     * Setup Core Web Vitals monitoring
     *
     * @method setupWebVitalsMonitoring
     * @returns {Promise<void>}
     * @private
     */
    async setupWebVitalsMonitoring() {
        try {
            // Check if web-vitals is available globally (for CDN usage)
            if (typeof window !== 'undefined' && window.webVitals) {
                // Use global web-vitals if available (v5 API)
                const { onCLS, onINP, onFCP, onLCP, onTTFB } = window.webVitals;
                this.setupWebVitalsCallbacks({ onCLS, onINP, onFCP, onLCP, onTTFB });
                console.log('📊 Core Web Vitals monitoring enabled (global v5)');
                return;
            }

            // Try dynamic import for web-vitals library (v5 API)
            const webVitalsModule = await import('web-vitals').catch(() => null);

            if (webVitalsModule) {
                const { onCLS, onINP, onFCP, onLCP, onTTFB } = webVitalsModule;
                this.setupWebVitalsCallbacks({ onCLS, onINP, onFCP, onLCP, onTTFB });
                console.log('📊 Core Web Vitals monitoring enabled (module v5)');
                return;
            }

            throw new Error('Web Vitals library not found');

        } catch (error) {
            console.warn('⚠️ Web Vitals library not available, using fallback:', error);
            this.setupFallbackWebVitals();
        }
    }

    /**
     * Setup Web Vitals callbacks (v5 API)
     *
     * @method setupWebVitalsCallbacks
     * @param {Object} vitals - Web Vitals functions
     * @returns {void}
     * @private
     */
    setupWebVitalsCallbacks(vitals) {
        const { onCLS, onINP, onFCP, onLCP, onTTFB } = vitals;

        // Validate functions exist
        if (typeof onCLS !== 'function') {
            throw new Error('onCLS is not a function - web-vitals v5+ required');
        }

        // Track Cumulative Layout Shift
        onCLS((metric) => {
            this.trackWebVital('CLS', metric);
        });

        // Track Interaction to Next Paint (replaces FID in v5)
        if (typeof onINP === 'function') {
            onINP((metric) => {
                this.trackWebVital('INP', metric);
            });
        }

        // Track First Contentful Paint
        if (typeof onFCP === 'function') {
            onFCP((metric) => {
                this.trackWebVital('FCP', metric);
            });
        }

        // Track Largest Contentful Paint
        if (typeof onLCP === 'function') {
            onLCP((metric) => {
                this.trackWebVital('LCP', metric);
            });
        }

        // Track Time to First Byte
        if (typeof onTTFB === 'function') {
            onTTFB((metric) => {
                this.trackWebVital('TTFB', metric);
            });
        }
    }

    /**
     * Setup fallback Web Vitals monitoring
     *
     * @method setupFallbackWebVitals
     * @returns {void}
     * @private
     */
    setupFallbackWebVitals() {
        console.log('📊 Setting up fallback Web Vitals monitoring');

        // Fallback TTFB measurement
        if (performance.timing) {
            const ttfb = performance.timing.responseStart - performance.timing.requestStart;
            this.trackWebVital('TTFB', {
                name: 'TTFB',
                value: ttfb,
                rating: this.getRating('TTFB', ttfb),
                id: this.generateMetricId(),
                delta: ttfb,
                entries: []
            });
        }

        // Fallback FCP measurement using Performance Observer
        if ('PerformanceObserver' in window) {
            try {
                const paintObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.name === 'first-contentful-paint') {
                            this.trackWebVital('FCP', {
                                name: 'FCP',
                                value: entry.startTime,
                                rating: this.getRating('FCP', entry.startTime),
                                id: this.generateMetricId(),
                                delta: entry.startTime,
                                entries: [entry]
                            });
                        }
                    }
                });
                paintObserver.observe({ entryTypes: ['paint'] });

                // Fallback CLS measurement
                const layoutShiftObserver = new PerformanceObserver((list) => {
                    let clsValue = 0;
                    const entries = [];

                    for (const entry of list.getEntries()) {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                            entries.push(entry);
                        }
                    }

                    if (clsValue > 0) {
                        this.trackWebVital('CLS', {
                            name: 'CLS',
                            value: clsValue,
                            rating: this.getRating('CLS', clsValue),
                            id: this.generateMetricId(),
                            delta: clsValue,
                            entries
                        });
                    }
                });
                layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

                // Fallback INP measurement (basic event timing)
                const eventObserver = new PerformanceObserver((list) => {
                    let maxDuration = 0;
                    let maxEntry = null;

                    for (const entry of list.getEntries()) {
                        if (entry.duration > maxDuration) {
                            maxDuration = entry.duration;
                            maxEntry = entry;
                        }
                    }

                    if (maxEntry && maxDuration > 40) { // Only report significant interactions
                        this.trackWebVital('INP', {
                            name: 'INP',
                            value: maxDuration,
                            rating: this.getRating('INP', maxDuration),
                            id: this.generateMetricId(),
                            delta: maxDuration,
                            entries: [maxEntry]
                        });
                    }
                });
                eventObserver.observe({ entryTypes: ['event'] });

            } catch (error) {
                console.warn('⚠️ Performance Observer not supported:', error);
            }
        }
    }

    /**
     * Track Web Vital metric
     *
     * @method trackWebVital
     * @param {string} name - Metric name
     * @param {Object} metric - Metric data
     * @returns {void}
     * @private
     */
    trackWebVital(name, metric) {
        const webVitalData = {
            name,
            value: metric.value,
            id: metric.id,
            delta: metric.delta,
            rating: metric.rating || this.getRating(name, metric.value),
            sessionId: this.sessionId,
            url: window.location.href,
            timestamp: Date.now()
        };

        // Send to Vercel Analytics if available
        if (this.vercelIntegrations.analytics) {
            this.vercelIntegrations.analytics.track('web-vital', webVitalData);
        }

        // Queue for batch sending to our API
        this.queueMetric('vitals', webVitalData);

        if (this.config.debug) {
            console.log(`📊 Web Vital tracked: ${name}`, webVitalData);
        }
    }

    /**
     * Get performance rating for metric
     *
     * @method getRating
     * @param {string} metric - Metric name
     * @param {number} value - Metric value
     * @returns {string} Rating (good, needs-improvement, poor)
     * @private
     */
    getRating(metric, value) {
        const thresholds = {
            LCP: { good: 2500, poor: 4000 },
            INP: { good: 200, poor: 500 },  // Updated for INP (replaces FID)
            CLS: { good: 0.1, poor: 0.25 },
            FCP: { good: 1800, poor: 3000 },
            TTFB: { good: 800, poor: 1800 },
            // Legacy support
            FID: { good: 100, poor: 300 }
        };

        const threshold = thresholds[metric];
        if (!threshold) return 'unknown';

        if (value <= threshold.good) return 'good';
        if (value <= threshold.poor) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Generate unique metric ID
     *
     * @method generateMetricId
     * @returns {string} Unique metric ID
     * @private
     */
    generateMetricId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Setup custom metrics monitoring
     *
     * @method setupCustomMetricsMonitoring
     * @returns {void}
     * @private
     */
    setupCustomMetricsMonitoring() {
        // Track calculator-specific metrics
        this.trackCalculatorMetrics();

        // Track user interaction metrics
        this.trackUserInteractionMetrics();

        // Track error metrics
        this.trackErrorMetrics();

        console.log('📊 Custom metrics monitoring enabled');
    }

    /**
     * Track calculator-specific metrics
     *
     * @method trackCalculatorMetrics
     * @returns {void}
     * @private
     */
    trackCalculatorMetrics() {
        // Track calculation performance
        window.addEventListener('calculation-performed', (event) => {
            const { duration, complexity, result } = event.detail;

            this.trackCustomMetric('calculation-time', duration, 'ms', 'calculator', {
                complexity,
                hasResult: !!result,
                resultLength: result ? result.toString().length : 0
            });
        });

        // Track module loading performance
        window.addEventListener('module-loaded', (event) => {
            const { moduleName, loadTime } = event.detail;

            this.trackCustomMetric('module-load-time', loadTime, 'ms', 'performance', {
                moduleName
            });
        });

        // Track offline/online transitions
        window.addEventListener('online', () => {
            this.trackCustomMetric('network-transition', 1, 'count', 'connectivity', {
                type: 'online'
            });
        });

        window.addEventListener('offline', () => {
            this.trackCustomMetric('network-transition', 1, 'count', 'connectivity', {
                type: 'offline'
            });
        });
    }

    /**
     * Track user interaction metrics
     *
     * @method trackUserInteractionMetrics
     * @returns {void}
     * @private
     */
    trackUserInteractionMetrics() {
        let interactionCount = 0;
        let lastInteractionTime = Date.now();

        // Track button clicks
        document.addEventListener('click', (event) => {
            if (event.target.matches('button[data-action]')) {
                const action = event.target.getAttribute('data-action');
                const currentTime = Date.now();
                const timeSinceLastInteraction = currentTime - lastInteractionTime;

                interactionCount++;
                lastInteractionTime = currentTime;

                this.trackCustomMetric('user-interaction', timeSinceLastInteraction, 'ms', 'user', {
                    action,
                    interactionCount,
                    buttonType: action
                });
            }
        });

        // Track keyboard usage
        document.addEventListener('keydown', (event) => {
            if (event.target.matches('input, button')) {
                this.trackCustomMetric('keyboard-usage', 1, 'count', 'user', {
                    key: event.key,
                    targetType: event.target.tagName.toLowerCase()
                });
            }
        });
    }

    /**
     * Track error metrics
     *
     * @method trackErrorMetrics
     * @returns {void}
     * @private
     */
    trackErrorMetrics() {
        // Track JavaScript errors
        window.addEventListener('error', (event) => {
            this.trackCustomMetric('javascript-error', 1, 'count', 'error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Track unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.trackCustomMetric('unhandled-rejection', 1, 'count', 'error', {
                reason: event.reason?.toString() || 'Unknown'
            });
        });

        // Track calculation errors
        window.addEventListener('calculation-error', (event) => {
            const { error, expression } = event.detail;

            this.trackCustomMetric('calculation-error', 1, 'count', 'calculator', {
                errorType: error.name,
                errorMessage: error.message,
                expression: expression?.substring(0, 100) // Limit length
            });
        });
    }

    /**
     * Track calculator operation performance
     *
     * @method trackCalculatorOperation
     * @param {string} operation - Operation name
     * @param {number} duration - Operation duration in milliseconds
     * @param {Object} properties - Additional properties
     * @returns {void}
     */
    trackCalculatorOperation(operation, duration, properties = {}) {
        this.trackCustomMetric(`calculator_${operation}`, duration, 'ms', 'calculator', properties);
    }

    /**
     * Track user interaction performance
     *
     * @method trackUserInteraction
     * @param {string} interaction - Interaction type
     * @param {number} responseTime - Response time in milliseconds
     * @param {Object} properties - Additional properties
     * @returns {void}
     */
    trackUserInteraction(interaction, responseTime, properties = {}) {
        this.trackCustomMetric(`user_${interaction}`, responseTime, 'ms', 'user', properties);
    }

    /**
     * Track custom metric
     *
     * @method trackCustomMetric
     * @param {string} name - Metric name
     * @param {number} value - Metric value
     * @param {string} unit - Metric unit
     * @param {string} category - Metric category
     * @param {Object} properties - Additional properties
     * @returns {void}
     */
    trackCustomMetric(name, value, unit = 'ms', category = 'custom', properties = {}) {
        const metricData = {
            name,
            value,
            unit,
            category,
            sessionId: this.sessionId,
            properties,
            timestamp: Date.now()
        };

        // Send to Vercel Analytics if available
        if (this.vercelIntegrations.analytics) {
            this.vercelIntegrations.analytics.track('custom-metric', metricData);
        }

        // Queue for batch sending
        this.queueMetric('custom', metricData);

        if (this.config.debug) {
            console.log(`📊 Custom metric tracked: ${name}`, metricData);
        }
    }

    /**
     * Setup performance observers
     *
     * @method setupPerformanceObservers
     * @returns {void}
     * @private
     */
    setupPerformanceObservers() {
        if (!('PerformanceObserver' in window)) {
            console.warn('⚠️ PerformanceObserver not supported');
            return;
        }

        try {
            // Resource timing observer
            if (this.config.enableResourceTiming) {
                this.observers.resource = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.trackResourceTiming(entry);
                    }
                });
                this.observers.resource.observe({ entryTypes: ['resource'] });
            }

            // Navigation timing observer
            if (this.config.enableNavigationTiming) {
                this.observers.navigation = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.trackNavigationTiming(entry);
                    }
                });
                this.observers.navigation.observe({ entryTypes: ['navigation'] });
            }

            // User timing observer
            if (this.config.enableUserTiming) {
                this.observers.measure = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.trackUserTiming(entry);
                    }
                });
                this.observers.measure.observe({ entryTypes: ['measure'] });
            }

        } catch (error) {
            console.warn('⚠️ Failed to setup performance observers:', error);
        }
    }

    /**
     * Track resource timing
     *
     * @method trackResourceTiming
     * @param {PerformanceResourceTiming} entry - Resource timing entry
     * @returns {void}
     * @private
     */
    trackResourceTiming(entry) {
        // Only track significant resources
        if (entry.duration > 100 || entry.transferSize > 10000) {
            this.trackCustomMetric('resource-load-time', entry.duration, 'ms', 'performance', {
                resourceType: entry.initiatorType,
                resourceName: entry.name.split('/').pop(),
                transferSize: entry.transferSize,
                encodedBodySize: entry.encodedBodySize
            });
        }
    }

    /**
     * Track navigation timing
     *
     * @method trackNavigationTiming
     * @param {PerformanceNavigationTiming} entry - Navigation timing entry
     * @returns {void}
     * @private
     */
    trackNavigationTiming(entry) {
        const metrics = {
            'dns-lookup': entry.domainLookupEnd - entry.domainLookupStart,
            'tcp-connect': entry.connectEnd - entry.connectStart,
            'request-response': entry.responseEnd - entry.requestStart,
            'dom-processing': entry.domContentLoadedEventEnd - entry.responseEnd,
            'page-load': entry.loadEventEnd - entry.navigationStart
        };

        for (const [metricName, value] of Object.entries(metrics)) {
            if (value > 0) {
                this.trackCustomMetric(metricName, value, 'ms', 'navigation');
            }
        }
    }

    /**
     * Track user timing
     *
     * @method trackUserTiming
     * @param {PerformanceMeasure} entry - User timing entry
     * @returns {void}
     * @private
     */
    trackUserTiming(entry) {
        this.trackCustomMetric('user-timing', entry.duration, 'ms', 'performance', {
            measureName: entry.name
        });
    }

    /**
     * Track page load performance
     *
     * @method trackPageLoadPerformance
     * @returns {void}
     * @private
     */
    trackPageLoadPerformance() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    this.trackCustomMetric('page-load-complete', navigation.loadEventEnd, 'ms', 'navigation');
                }

                // Track initial bundle size
                const resources = performance.getEntriesByType('resource');
                const jsResources = resources.filter(r => r.name.includes('.js'));
                const cssResources = resources.filter(r => r.name.includes('.css'));

                const totalJSSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
                const totalCSSSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);

                this.trackCustomMetric('bundle-size-js', totalJSSize, 'bytes', 'performance');
                this.trackCustomMetric('bundle-size-css', totalCSSSize, 'bytes', 'performance');

            }, 1000);
        });
    }

    /**
     * Queue metric for batch sending
     *
     * @method queueMetric
     * @param {string} type - Metric type
     * @param {Object} data - Metric data
     * @returns {void}
     * @private
     */
    queueMetric(type, data) {
        this.metricsQueue.push({ type, data });

        // Flush if queue is full
        if (this.metricsQueue.length >= this.config.batchSize) {
            void this.flushMetrics();
        }
    }

    /**
     * Setup automatic metric flushing
     *
     * @method setupAutoFlush
     * @returns {void}
     * @private
     */
    setupAutoFlush() {
        this.flushIntervalId = setInterval(() => {
            void this.flushMetrics();
        }, this.config.flushInterval);

        // Flush on page unload
        window.addEventListener('beforeunload', () => {
            void this.flushMetrics();
        });

        // Flush on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                void this.flushMetrics();
            }
        });
    }

    /**
     * Flush queued metrics to API
     *
     * @method flushMetrics
     * @returns {Promise<void>}
     */
    async flushMetrics() {
        if (this.metricsQueue.length === 0) return;

        const metricsToSend = [...this.metricsQueue];
        this.metricsQueue = [];

        try {
            // Group metrics by type
            const groupedMetrics = metricsToSend.reduce((groups, metric) => {
                if (!groups[metric.type]) groups[metric.type] = [];
                groups[metric.type].push(metric.data);
                return groups;
            }, {});

            // Send each group to appropriate endpoint
            const promises = [];

            if (groupedMetrics.vitals) {
                for (const vital of groupedMetrics.vitals) {
                    promises.push(this.sendToAPI('/api/performance/vitals', vital));
                }
            }

            if (groupedMetrics.custom) {
                for (const custom of groupedMetrics.custom) {
                    promises.push(this.sendToAPI('/api/performance/custom', custom));
                }
            }

            await Promise.allSettled(promises);

            if (this.config.debug) {
                console.log(`📊 Flushed ${metricsToSend.length} metrics`);
            }

        } catch (error) {
            console.warn('⚠️ Failed to flush metrics:', error);
            // Re-queue failed metrics
            this.metricsQueue.unshift(...metricsToSend);
        }
    }

    /**
     * Send data to API endpoint
     *
     * @method sendToAPI
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Data to send
     * @returns {Promise<Response>}
     * @private
     */
    async sendToAPI(endpoint, data) {
        try {
            // Check if we're in production environment with API available
            const isProduction = window.location.hostname !== 'localhost' &&
                                window.location.hostname !== '127.0.0.1' &&
                                !window.location.hostname.includes('dev') &&
                                (window.location.hostname.includes('vercel.app') ||
                                 window.location.hostname.includes('netlify.app'));

            if (!isProduction) {
                // In development/preview mode, just log the data instead of sending to API
                if (this.config.debug) {
                    console.log(`📊 [DEV] Would send to ${endpoint}:`, data);
                }
                return new Response(JSON.stringify({ success: true, dev: true }), { status: 200 });
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            return response;
        } catch (error) {
            // Gracefully handle API errors
            if (this.config.debug) {
                console.warn(`⚠️ Failed to send data to ${endpoint}:`, error);
            }
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }
    }

    /**
     * Generate unique session ID
     *
     * @method generateSessionId
     * @returns {string} Session ID
     * @private
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get performance report
     *
     * @method getPerformanceReport
     * @returns {Promise<Object>} Performance report
     */
    async getPerformanceReport() {
        try {
            // Check if we're in production environment with API available
            const isProduction = window.location.hostname !== 'localhost' &&
                                window.location.hostname !== '127.0.0.1' &&
                                !window.location.hostname.includes('dev') &&
                                (window.location.hostname.includes('vercel.app') ||
                                 window.location.hostname.includes('netlify.app'));

            if (!isProduction) {
                // In development/preview mode, return mock data
                return {
                    dev: true,
                    message: 'Performance report not available in development mode',
                    timestamp: Date.now()
                };
            }

            const response = await fetch('/api/performance/report');
            return await response.json();
        } catch (error) {
            console.error('Failed to get performance report:', error);
            return null;
        }
    }

    /**
     * Destroy performance monitor
     *
     * @method destroy
     * @returns {void}
     */
    destroy() {
        // Clear flush interval
        if (this.flushIntervalId) {
            clearInterval(this.flushIntervalId);
        }

        // Disconnect observers
        Object.values(this.observers).forEach(observer => {
            if (observer && observer.disconnect) {
                observer.disconnect();
            }
        });

        // Flush remaining metrics
        void this.flushMetrics();

        console.log('📊 Performance monitor destroyed');
    }
}

// ------------ MODULE EXPORTS


export default VercelPerformanceMonitor;
