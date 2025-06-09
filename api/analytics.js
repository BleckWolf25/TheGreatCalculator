/**
 * @file VERCEL ANALYTICS API
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Comprehensive analytics API for The Great Calculator on Vercel.
 * Handles user analytics, performance metrics, and usage statistics
 * with serverless architecture optimization.
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
                hgetall: async () => ({}),
                hincrby: async () => 1,
                hset: async () => 1,
                hmset: async () => 'OK',
                expire: async () => 1,
                del: async () => 1,
                lpush: async () => 1,
                lrange: async () => [],
                incr: async () => 1,
                keys: async () => []
            };
            return kv;
        }
    } catch (error) {
        console.warn('KV not available, using mock:', error.message);
        // Return mock KV
        kv = {
            setex: async () => 'OK',
            get: async () => null,
            hgetall: async () => ({}),
            hincrby: async () => 1,
            hset: async () => 1,
            hmset: async () => 'OK',
            expire: async () => 1,
            del: async () => 1,
            lpush: async () => 1,
            lrange: async () => [],
            incr: async () => 1,
            keys: async () => []
        };
        return kv;
    }
}

// ------------ ANALYTICS CONFIGURATION

const ANALYTICS_CONFIG = {
    retention: {
        events: 30 * 24 * 60 * 60 * 1000, // 30 days
        sessions: 7 * 24 * 60 * 60 * 1000, // 7 days
        performance: 24 * 60 * 60 * 1000   // 24 hours
    },
    limits: {
        eventsPerSession: 1000,
        sessionDuration: 4 * 60 * 60 * 1000, // 4 hours
        batchSize: 100
    }
};

// ------------ MAIN HANDLER

/**
 * Main analytics API handler
 * @param {Request} request - Incoming request
 * @returns {Response} API response
 */
export default async function handler(request) {
    // CORS headers for all responses
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 200,
            headers: corsHeaders
        });
    }

    try {
        const url = new URL(request.url);
        const path = url.pathname.replace('/api/analytics', '');
        const method = request.method;

        // Route to appropriate handler
        switch (true) {
            case path === '/track' && method === 'POST':
                return await handleTrackEvent(request, corsHeaders);

            case path === '/session' && method === 'POST':
                return await handleSessionUpdate(request, corsHeaders);

            case path === '/performance' && method === 'POST':
                return await handlePerformanceMetric(request, corsHeaders);

            case path === '/stats' && method === 'GET':
                return await handleGetStats(request, corsHeaders);

            case path === '/aggregate' && method === 'POST':
                return await handleAggregateData(request, corsHeaders);

            case path === '/health' && method === 'GET':
                return await handleHealthCheck(corsHeaders);

            default:
                return new Response(JSON.stringify({
                    error: 'Not Found',
                    message: 'Analytics endpoint not found'
                }), {
                    status: 404,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    }
                });
        }

    } catch (error) {
        console.error('Analytics API Error:', error);

        return new Response(JSON.stringify({
            error: 'Internal Server Error',
            message: 'Analytics processing failed',
            timestamp: new Date().toISOString()
        }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }
}

// ------------ EVENT TRACKING

/**
 * Handle event tracking
 * @param {Request} request - Request object
 * @param {Object} corsHeaders - CORS headers
 * @returns {Response} Response object
 */
async function handleTrackEvent(request, corsHeaders) {
    try {
        const data = await request.json();
        const {
            event,
            properties = {},
            sessionId,
            userId,
            timestamp = Date.now()
        } = data;

        // Validate required fields
        if (!event || !sessionId) {
            return new Response(JSON.stringify({
                error: 'Bad Request',
                message: 'Event name and session ID are required'
            }), {
                status: 400,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            });
        }

        // Create event record
        const eventRecord = {
            id: `event_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            event,
            properties: {
                ...properties,
                userAgent: request.headers.get('user-agent'),
                referer: request.headers.get('referer'),
                ip: request.headers.get('x-forwarded-for') ||
                    request.headers.get('x-real-ip') ||
                    'unknown'
            },
            sessionId,
            userId,
            timestamp,
            region: process.env.VERCEL_REGION || 'unknown'
        };

        // Initialize KV and store event
        const kvStore = await initializeKV();
        const eventKey = `event:${sessionId}:${timestamp}`;
        await kvStore.setex(eventKey, ANALYTICS_CONFIG.retention.events / 1000, JSON.stringify(eventRecord));

        // Update session event count
        const sessionKey = `session:${sessionId}`;
        await kv.hincrby(sessionKey, 'eventCount', 1);
        await kv.expire(sessionKey, ANALYTICS_CONFIG.retention.sessions / 1000);

        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        const dailyKey = `daily:${today}`;
        await kv.hincrby(dailyKey, 'totalEvents', 1);
        await kv.hincrby(dailyKey, `event:${event}`, 1);
        await kv.expire(dailyKey, ANALYTICS_CONFIG.retention.events / 1000);

        return new Response(JSON.stringify({
            success: true,
            eventId: eventRecord.id,
            timestamp: eventRecord.timestamp
        }), {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Event tracking error:', error);

        return new Response(JSON.stringify({
            error: 'Processing Error',
            message: 'Failed to track event'
        }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }
}

// ------------ SESSION MANAGEMENT

/**
 * Handle session updates
 * @param {Request} request - Request object
 * @param {Object} corsHeaders - CORS headers
 * @returns {Response} Response object
 */
async function handleSessionUpdate(request, corsHeaders) {
    try {
        const data = await request.json();
        const {
            sessionId,
            userId,
            action = 'update',
            properties = {}
        } = data;

        if (!sessionId) {
            return new Response(JSON.stringify({
                error: 'Bad Request',
                message: 'Session ID is required'
            }), {
                status: 400,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            });
        }

        const sessionKey = `session:${sessionId}`;
        const timestamp = Date.now();

        if (action === 'start') {
            // Create new session
            const sessionData = {
                id: sessionId,
                userId,
                startTime: timestamp,
                lastActivity: timestamp,
                eventCount: 0,
                properties: {
                    ...properties,
                    userAgent: request.headers.get('user-agent'),
                    referer: request.headers.get('referer'),
                    region: process.env.VERCEL_REGION || 'unknown'
                }
            };

            await kv.hmset(sessionKey, sessionData);
            await kv.expire(sessionKey, ANALYTICS_CONFIG.retention.sessions / 1000);

            // Update daily session count
            const today = new Date().toISOString().split('T')[0];
            const dailyKey = `daily:${today}`;
            await kv.hincrby(dailyKey, 'totalSessions', 1);
            await kv.expire(dailyKey, ANALYTICS_CONFIG.retention.events / 1000);

        } else if (action === 'update') {
            // Update existing session
            await kv.hset(sessionKey, 'lastActivity', timestamp);

            // Update properties if provided
            if (Object.keys(properties).length > 0) {
                for (const [key, value] of Object.entries(properties)) {
                    await kv.hset(sessionKey, `properties.${key}`, value);
                }
            }

            await kv.expire(sessionKey, ANALYTICS_CONFIG.retention.sessions / 1000);

        } else if (action === 'end') {
            // End session
            await kv.hset(sessionKey, 'endTime', timestamp);

            // Calculate session duration
            const sessionData = await kv.hgetall(sessionKey);
            if (sessionData.startTime) {
                const duration = timestamp - parseInt(sessionData.startTime);
                await kv.hset(sessionKey, 'duration', duration);

                // Update daily duration stats
                const today = new Date().toISOString().split('T')[0];
                const dailyKey = `daily:${today}`;
                await kv.hincrby(dailyKey, 'totalDuration', duration);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            sessionId,
            action,
            timestamp
        }), {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Session update error:', error);

        return new Response(JSON.stringify({
            error: 'Processing Error',
            message: 'Failed to update session'
        }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }
}

// ------------ PERFORMANCE METRICS

/**
 * Handle performance metric tracking
 * @param {Request} request - Request object
 * @param {Object} corsHeaders - CORS headers
 * @returns {Response} Response object
 */
async function handlePerformanceMetric(request, corsHeaders) {
    try {
        const data = await request.json();
        const {
            metric,
            value,
            sessionId,
            timestamp = Date.now(),
            properties = {}
        } = data;

        if (!metric || value === undefined || !sessionId) {
            return new Response(JSON.stringify({
                error: 'Bad Request',
                message: 'Metric name, value, and session ID are required'
            }), {
                status: 400,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            });
        }

        // Store performance metric
        const metricKey = `perf:${sessionId}:${metric}:${timestamp}`;
        const metricData = {
            metric,
            value,
            sessionId,
            timestamp,
            properties,
            region: process.env.VERCEL_REGION || 'unknown'
        };

        await kv.setex(metricKey, ANALYTICS_CONFIG.retention.performance / 1000, JSON.stringify(metricData));

        // Update daily performance stats
        const today = new Date().toISOString().split('T')[0];
        const dailyPerfKey = `daily:perf:${today}`;

        // Store metric value for aggregation
        await kv.lpush(`${dailyPerfKey}:${metric}`, value);
        await kv.expire(`${dailyPerfKey}:${metric}`, ANALYTICS_CONFIG.retention.performance / 1000);

        return new Response(JSON.stringify({
            success: true,
            metric,
            value,
            timestamp
        }), {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Performance metric error:', error);

        return new Response(JSON.stringify({
            error: 'Processing Error',
            message: 'Failed to track performance metric'
        }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }
}

// ------------ STATISTICS RETRIEVAL

/**
 * Handle statistics retrieval
 * @param {Request} request - Request object
 * @param {Object} corsHeaders - CORS headers
 * @returns {Response} Response object
 */
async function handleGetStats(request, corsHeaders) {
    try {
        const url = new URL(request.url);
        const period = url.searchParams.get('period') || 'today';
        const metric = url.searchParams.get('metric');

        let stats = {};

        if (period === 'today') {
            const today = new Date().toISOString().split('T')[0];
            const dailyKey = `daily:${today}`;
            stats = await kv.hgetall(dailyKey) || {};
        }

        // Add performance metrics if requested
        if (metric) {
            const today = new Date().toISOString().split('T')[0];
            const perfKey = `daily:perf:${today}:${metric}`;
            const values = await kv.lrange(perfKey, 0, -1);

            if (values.length > 0) {
                const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
                stats.performance = {
                    [metric]: {
                        count: numericValues.length,
                        avg: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
                        min: Math.min(...numericValues),
                        max: Math.max(...numericValues)
                    }
                };
            }
        }

        return new Response(JSON.stringify({
            success: true,
            period,
            stats,
            timestamp: Date.now()
        }), {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Stats retrieval error:', error);

        return new Response(JSON.stringify({
            error: 'Processing Error',
            message: 'Failed to retrieve statistics'
        }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }
}

// ------------ DATA AGGREGATION

/**
 * Handle data aggregation (cron job)
 * @param {Request} request - Request object
 * @param {Object} corsHeaders - CORS headers
 * @returns {Response} Response object
 */
async function handleAggregateData(request, corsHeaders) {
    try {
        // This would typically be called by a cron job
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Aggregate yesterday's data
        const dailyKey = `daily:${yesterday}`;
        const dailyData = await kv.hgetall(dailyKey);

        if (dailyData && Object.keys(dailyData).length > 0) {
            // Store aggregated data
            const aggregateKey = `aggregate:${yesterday}`;
            await kv.setex(aggregateKey, 30 * 24 * 60 * 60, JSON.stringify(dailyData)); // 30 days retention

            // Clean up daily data
            await kv.del(dailyKey);
        }

        return new Response(JSON.stringify({
            success: true,
            aggregated: yesterday,
            timestamp: Date.now()
        }), {
            status: 200,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Data aggregation error:', error);

        return new Response(JSON.stringify({
            error: 'Processing Error',
            message: 'Failed to aggregate data'
        }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }
}

// ------------ HEALTH CHECK

/**
 * Handle health check
 * @param {Object} corsHeaders - CORS headers
 * @returns {Response} Response object
 */
async function handleHealthCheck(corsHeaders) {
    try {
        // Test KV connection
        const testKey = `health:${Date.now()}`;
        await kv.setex(testKey, 60, 'ok');
        const testValue = await kv.get(testKey);
        await kv.del(testKey);

        const isHealthy = testValue === 'ok';

        return new Response(JSON.stringify({
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: Date.now(),
            region: process.env.VERCEL_REGION || 'unknown',
            services: {
                kv: isHealthy ? 'ok' : 'error'
            }
        }), {
            status: isHealthy ? 200 : 503,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Health check error:', error);

        return new Response(JSON.stringify({
            status: 'unhealthy',
            error: error.message,
            timestamp: Date.now()
        }), {
            status: 503,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json'
            }
        });
    }
}
