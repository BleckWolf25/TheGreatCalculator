/**
 * @file VERCEL PERFORMANCE MONITORING API
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Advanced performance monitoring API for The Great Calculator on Vercel.
 * Tracks Core Web Vitals, custom metrics, and provides performance insights
 * optimized for serverless architecture.
 */

// KV will be initialized dynamically
let kv = null;

// Initialize KV function
async function initializeKV() {
    if (kv) return kv;

    try {
        if (process.env.VERCEL_ENV === 'production' && process.env.KV_REST_API_URL) {
            const kvModule = await import('@vercel/kv');
            kv = kvModule.kv;
            return kv;
        } else {
            // Mock KV for development/preview
            kv = {
                setex: async () => 'OK',
                get: async () => null,
                lrange: async () => [],
                lpush: async () => 1,
                expire: async () => 1,
                del: async () => 1,
                keys: async () => [],
                incr: async () => 1
            };
            return kv;
        }
    } catch (error) {
        console.warn('KV not available, using mock:', error.message);
        // Return mock KV
        kv = {
            setex: async () => 'OK',
            get: async () => null,
            lrange: async () => [],
            lpush: async () => 1,
            expire: async () => 1,
            del: async () => 1,
            keys: async () => [],
            incr: async () => 1
        };
        return kv;
    }
}

// ------------ PERFORMANCE CONFIGURATION

const PERFORMANCE_CONFIG = {
    metrics: {
        // Core Web Vitals thresholds
        LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
        FID: { good: 100, poor: 300 },   // First Input Delay
        CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
        FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
        TTFB: { good: 800, poor: 1800 }  // Time to First Byte
    },
    retention: {
        raw: 24 * 60 * 60 * 1000,      // 24 hours
        aggregated: 30 * 24 * 60 * 60 * 1000, // 30 days
        alerts: 7 * 24 * 60 * 60 * 1000       // 7 days
    },
    alerts: {
        enabled: true,
        thresholds: {
            errorRate: 0.05,     // 5%
            slowRequests: 0.1,   // 10%
            availability: 0.99   // 99%
        }
    }
};

// ------------ MAIN HANDLER

/**
 * Main performance API handler
 * @param {Request} request - Incoming request
 * @returns {Response} API response
 */
export default async function handler(request) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const url = new URL(request.url);
        const path = url.pathname.replace('/api/performance', '');
        const method = request.method;

        switch (true) {
            case path === '/vitals' && method === 'POST':
                return await handleWebVitals(request, corsHeaders);

            case path === '/custom' && method === 'POST':
                return await handleCustomMetric(request, corsHeaders);

            case path === '/report' && method === 'GET':
                return await handlePerformanceReport(request, corsHeaders);

            case path === '/alerts' && method === 'GET':
                return await handleGetAlerts(request, corsHeaders);

            case path === '/cleanup' && method === 'POST':
                return await handleCleanup(request, corsHeaders);

            case path === '/health' && method === 'GET':
                return await handleHealthCheck(corsHeaders);

            default:
                return new Response(JSON.stringify({
                    error: 'Not Found',
                    message: 'Performance endpoint not found'
                }), {
                    status: 404,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
        }

    } catch (error) {
        console.error('Performance API Error:', error);

        return new Response(JSON.stringify({
            error: 'Internal Server Error',
            message: 'Performance monitoring failed',
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

// ------------ WEB VITALS TRACKING

/**
 * Handle Core Web Vitals tracking
 * @param {Request} request - Request object
 * @param {Object} corsHeaders - CORS headers
 * @returns {Response} Response object
 */
async function handleWebVitals(request, corsHeaders) {
    try {
        const data = await request.json();
        const {
            name,
            value,
            id,
            delta,
            rating,
            sessionId,
            url: pageUrl,
            timestamp = Date.now()
        } = data;

        if (!name || value === undefined || !sessionId) {
            return new Response(JSON.stringify({
                error: 'Bad Request',
                message: 'Metric name, value, and session ID are required'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Validate metric name
        if (!['LCP', 'FID', 'CLS', 'FCP', 'TTFB', 'INP'].includes(name)) {
            return new Response(JSON.stringify({
                error: 'Bad Request',
                message: 'Invalid Web Vital metric name'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Create metric record
        const metricRecord = {
            id: id || `${name}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            value,
            delta,
            rating: rating || calculateRating(name, value),
            sessionId,
            url: pageUrl,
            timestamp,
            region: process.env.VERCEL_REGION || 'unknown',
            userAgent: request.headers.get('user-agent')
        };

        // Store raw metric
        const metricKey = `vitals:${sessionId}:${name}:${timestamp}`;
        await kv.setex(metricKey, PERFORMANCE_CONFIG.retention.raw / 1000, JSON.stringify(metricRecord));

        // Update aggregated stats
        const today = new Date().toISOString().split('T')[0];
        const aggregateKey = `vitals:daily:${today}:${name}`;

        await kv.lpush(aggregateKey, value);
        await kv.expire(aggregateKey, PERFORMANCE_CONFIG.retention.aggregated / 1000);

        // Update rating counts
        const ratingKey = `vitals:rating:${today}:${name}:${metricRecord.rating}`;
        await kv.incr(ratingKey);
        await kv.expire(ratingKey, PERFORMANCE_CONFIG.retention.aggregated / 1000);

        // Check for performance alerts
        await checkPerformanceAlerts(name, value, metricRecord.rating);

        return new Response(JSON.stringify({
            success: true,
            metricId: metricRecord.id,
            rating: metricRecord.rating,
            timestamp: metricRecord.timestamp
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Web Vitals tracking error:', error);

        return new Response(JSON.stringify({
            error: 'Processing Error',
            message: 'Failed to track Web Vitals'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

// ------------ CUSTOM METRICS

/**
 * Handle custom metric tracking
 * @param {Request} request - Request object
 * @param {Object} corsHeaders - CORS headers
 * @returns {Response} Response object
 */
async function handleCustomMetric(request, corsHeaders) {
    try {
        const data = await request.json();
        const {
            name,
            value,
            unit = 'ms',
            category = 'custom',
            sessionId,
            properties = {},
            timestamp = Date.now()
        } = data;

        if (!name || value === undefined || !sessionId) {
            return new Response(JSON.stringify({
                error: 'Bad Request',
                message: 'Metric name, value, and session ID are required'
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Create custom metric record
        const metricRecord = {
            id: `custom_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            name,
            value,
            unit,
            category,
            sessionId,
            properties,
            timestamp,
            region: process.env.VERCEL_REGION || 'unknown'
        };

        // Store custom metric
        const metricKey = `custom:${sessionId}:${name}:${timestamp}`;
        await kv.setex(metricKey, PERFORMANCE_CONFIG.retention.raw / 1000, JSON.stringify(metricRecord));

        // Update daily aggregates
        const today = new Date().toISOString().split('T')[0];
        const aggregateKey = `custom:daily:${today}:${category}:${name}`;

        await kv.lpush(aggregateKey, value);
        await kv.expire(aggregateKey, PERFORMANCE_CONFIG.retention.aggregated / 1000);

        return new Response(JSON.stringify({
            success: true,
            metricId: metricRecord.id,
            timestamp: metricRecord.timestamp
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Custom metric tracking error:', error);

        return new Response(JSON.stringify({
            error: 'Processing Error',
            message: 'Failed to track custom metric'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

// ------------ PERFORMANCE REPORTING

/**
 * Handle performance report generation
 * @param {Request} request - Request object
 * @param {Object} corsHeaders - CORS headers
 * @returns {Response} Response object
 */
async function handlePerformanceReport(request, corsHeaders) {
    try {
        const url = new URL(request.url);
        const period = url.searchParams.get('period') || 'today';
        const metric = url.searchParams.get('metric');

        const report = {
            period,
            timestamp: Date.now(),
            webVitals: {},
            customMetrics: {},
            summary: {}
        };

        const today = new Date().toISOString().split('T')[0];

        // Get Web Vitals data
        for (const vitalName of ['LCP', 'FID', 'CLS', 'FCP', 'TTFB']) {
            if (!metric || metric === vitalName) {
                const values = await kv.lrange(`vitals:daily:${today}:${vitalName}`, 0, -1);

                if (values.length > 0) {
                    const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));

                    // Get rating distribution
                    const goodCount = await kv.get(`vitals:rating:${today}:${vitalName}:good`) || 0;
                    const needsImprovementCount = await kv.get(`vitals:rating:${today}:${vitalName}:needs-improvement`) || 0;
                    const poorCount = await kv.get(`vitals:rating:${today}:${vitalName}:poor`) || 0;

                    report.webVitals[vitalName] = {
                        count: numericValues.length,
                        avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
                        min: Math.min(...numericValues),
                        max: Math.max(...numericValues),
                        p50: calculatePercentile(numericValues, 50),
                        p75: calculatePercentile(numericValues, 75),
                        p95: calculatePercentile(numericValues, 95),
                        ratings: {
                            good: parseInt(goodCount),
                            needsImprovement: parseInt(needsImprovementCount),
                            poor: parseInt(poorCount)
                        }
                    };
                }
            }
        }

        // Calculate summary metrics
        const totalMeasurements = Object.values(report.webVitals).reduce((sum, vital) => sum + vital.count, 0);
        const goodMeasurements = Object.values(report.webVitals).reduce((sum, vital) => sum + vital.ratings.good, 0);

        report.summary = {
            totalMeasurements,
            goodScore: totalMeasurements > 0 ? (goodMeasurements / totalMeasurements) * 100 : 0,
            region: process.env.VERCEL_REGION || 'unknown'
        };

        return new Response(JSON.stringify(report), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Performance report error:', error);

        return new Response(JSON.stringify({
            error: 'Processing Error',
            message: 'Failed to generate performance report'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

// ------------ UTILITY FUNCTIONS

/**
 * Calculate performance rating based on thresholds
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @returns {string} Rating (good, needs-improvement, poor)
 */
function calculateRating(metric, value) {
    const thresholds = PERFORMANCE_CONFIG.metrics[metric];
    if (!thresholds) return 'unknown';

    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
}

/**
 * Calculate percentile from array of values
 * @param {number[]} values - Array of numeric values
 * @param {number} percentile - Percentile to calculate (0-100)
 * @returns {number} Percentile value
 */
function calculatePercentile(values, percentile) {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
}

/**
 * Check for performance alerts
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @param {string} rating - Performance rating
 * @returns {Promise<void>}
 */
async function checkPerformanceAlerts(metric, value, rating) {
    if (!PERFORMANCE_CONFIG.alerts.enabled) return;

    // Check if this is a poor performance metric
    if (rating === 'poor') {
        const alertKey = `alert:${metric}:${Date.now()}`;
        const alertData = {
            type: 'performance',
            metric,
            value,
            rating,
            timestamp: Date.now(),
            region: process.env.VERCEL_REGION || 'unknown'
        };

        await kv.setex(alertKey, PERFORMANCE_CONFIG.retention.alerts / 1000, JSON.stringify(alertData));
    }
}

/**
 * Handle alerts retrieval
 * @param {Request} request - Request object
 * @param {Object} corsHeaders - CORS headers
 * @returns {Response} Response object
 */
async function handleGetAlerts(request, corsHeaders) {
    try {
        // Get recent alerts
        const alertKeys = await kv.keys('alert:*');
        const alerts = [];

        for (const key of alertKeys.slice(0, 100)) { // Limit to 100 recent alerts
            const alertData = await kv.get(key);
            if (alertData) {
                alerts.push(JSON.parse(alertData));
            }
        }

        // Sort by timestamp (newest first)
        alerts.sort((a, b) => b.timestamp - a.timestamp);

        return new Response(JSON.stringify({
            success: true,
            alerts,
            count: alerts.length,
            timestamp: Date.now()
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Alerts retrieval error:', error);

        return new Response(JSON.stringify({
            error: 'Processing Error',
            message: 'Failed to retrieve alerts'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Handle data cleanup (cron job)
 * @param {Request} request - Request object
 * @param {Object} corsHeaders - CORS headers
 * @returns {Response} Response object
 */
async function handleCleanup(request, corsHeaders) {
    try {
        let cleanedCount = 0;

        // Clean up old raw metrics (older than 24 hours)
        const cutoffTime = Date.now() - PERFORMANCE_CONFIG.retention.raw;
        const rawKeys = await kv.keys('vitals:*:*:*');

        for (const key of rawKeys) {
            const parts = key.split(':');
            const timestamp = parseInt(parts[parts.length - 1]);

            if (timestamp < cutoffTime) {
                await kv.del(key);
                cleanedCount++;
            }
        }

        return new Response(JSON.stringify({
            success: true,
            cleanedCount,
            timestamp: Date.now()
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Cleanup error:', error);

        return new Response(JSON.stringify({
            error: 'Processing Error',
            message: 'Failed to cleanup data'
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

/**
 * Handle health check
 * @param {Object} corsHeaders - CORS headers
 * @returns {Response} Response object
 */
async function handleHealthCheck(corsHeaders) {
    try {
        const testKey = `health:perf:${Date.now()}`;
        await kv.setex(testKey, 60, 'ok');
        const testValue = await kv.get(testKey);
        await kv.del(testKey);

        const isHealthy = testValue === 'ok';

        return new Response(JSON.stringify({
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: Date.now(),
            region: process.env.VERCEL_REGION || 'unknown'
        }), {
            status: isHealthy ? 200 : 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            status: 'unhealthy',
            error: error.message,
            timestamp: Date.now()
        }), {
            status: 503,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
