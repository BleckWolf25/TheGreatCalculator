/**
 * @file VERCEL HEALTH CHECK API
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Comprehensive health check API for The Great Calculator on Vercel.
 * Monitors system health, dependencies, and provides status information
 * for monitoring and alerting systems.
 */

// ------------ HEALTH CHECK HANDLER

/**
 * Main health check API handler
 * @param {Request} request - Incoming request
 * @returns {Response} API response
 */
export default async function handler(request) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (request.method !== 'GET') {
        return new Response(JSON.stringify({
            error: 'Method Not Allowed',
            message: 'Only GET requests are allowed'
        }), {
            status: 405,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    try {
        const startTime = Date.now();

        // Perform health checks
        const healthStatus = await performHealthChecks();

        const responseTime = Date.now() - startTime;
        const isHealthy = healthStatus.overall === 'healthy';

        // Add response metadata
        healthStatus.metadata = {
            timestamp: new Date().toISOString(),
            responseTime,
            region: process.env.VERCEL_REGION || 'unknown',
            environment: process.env.VERCEL_ENV || 'unknown',
            version: '1.0.0'
        };

        return new Response(JSON.stringify(healthStatus), {
            status: isHealthy ? 200 : 503,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });

    } catch (error) {
        console.error('Health check error:', error);

        return new Response(JSON.stringify({
            overall: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString(),
            region: process.env.VERCEL_REGION || 'unknown'
        }), {
            status: 503,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
        });
    }
}

// ------------ HEALTH CHECK FUNCTIONS

/**
 * Perform comprehensive health checks
 * @returns {Promise<Object>} Health status object
 */
async function performHealthChecks() {
    const checks = {
        system: await checkSystemHealth(),
        storage: await checkStorageHealth(),
        dependencies: await checkDependencies(),
        performance: await checkPerformanceHealth()
    };

    // Determine overall health
    const allHealthy = Object.values(checks).every(check => check.status === 'healthy');
    const anyUnhealthy = Object.values(checks).some(check => check.status === 'unhealthy');

    let overall = 'healthy';
    if (anyUnhealthy) {
        overall = 'unhealthy';
    } else if (!allHealthy) {
        overall = 'degraded';
    }

    return {
        overall,
        checks
    };
}

/**
 * Check system health
 * @returns {Promise<Object>} System health status
 */
async function checkSystemHealth() {
    try {
        const memoryUsage = process.memoryUsage();
        const uptime = process.uptime();

        // Check memory usage (warn if over 80% of heap limit)
        const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
        const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
        const memoryUsagePercent = (heapUsedMB / heapTotalMB) * 100;

        const memoryStatus = memoryUsagePercent > 90 ? 'unhealthy' :
                           memoryUsagePercent > 80 ? 'degraded' : 'healthy';

        return {
            status: memoryStatus,
            details: {
                uptime: Math.round(uptime),
                memory: {
                    heapUsed: Math.round(heapUsedMB),
                    heapTotal: Math.round(heapTotalMB),
                    usagePercent: Math.round(memoryUsagePercent),
                    rss: Math.round(memoryUsage.rss / 1024 / 1024),
                    external: Math.round(memoryUsage.external / 1024 / 1024)
                },
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch
            }
        };

    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
}

/**
 * Check storage health (KV store)
 * @returns {Promise<Object>} Storage health status
 */
async function checkStorageHealth() {
    try {
        // Try to import KV (might not be available in all environments)
        let kvStatus = 'not-configured';
        let kvDetails = {};

        try {
            const { kv } = await import('@vercel/kv');

            // Test KV connection with a simple operation
            const testKey = `health:${Date.now()}`;
            const testValue = 'health-check';

            const startTime = Date.now();
            await kv.setex(testKey, 60, testValue);
            const retrievedValue = await kv.get(testKey);
            await kv.del(testKey);
            const responseTime = Date.now() - startTime;

            if (retrievedValue === testValue) {
                kvStatus = responseTime > 1000 ? 'degraded' : 'healthy';
                kvDetails = {
                    responseTime,
                    connected: true
                };
            } else {
                kvStatus = 'unhealthy';
                kvDetails = {
                    responseTime,
                    connected: false,
                    error: 'Value mismatch'
                };
            }

        } catch (kvError) {
            if (kvError.message.includes('KV_REST_API_URL')) {
                kvStatus = 'not-configured';
                kvDetails = { error: 'KV not configured' };
            } else {
                kvStatus = 'unhealthy';
                kvDetails = { error: kvError.message };
            }
        }

        return {
            status: kvStatus,
            details: {
                kv: kvDetails
            }
        };

    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
}

/**
 * Check dependencies health
 * @returns {Promise<Object>} Dependencies health status
 */
async function checkDependencies() {
    try {
        const dependencies = {
            '@vercel/analytics': await checkDependency('@vercel/analytics'),
            '@vercel/speed-insights': await checkDependency('@vercel/speed-insights')
        };

        const allHealthy = Object.values(dependencies).every(dep => dep.status === 'healthy');
        const anyUnhealthy = Object.values(dependencies).some(dep => dep.status === 'unhealthy');

        let overall = 'healthy';
        if (anyUnhealthy) {
            overall = 'unhealthy';
        } else if (!allHealthy) {
            overall = 'degraded';
        }

        return {
            status: overall,
            details: dependencies
        };

    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
}

/**
 * Check individual dependency
 * @param {string} packageName - Package name to check
 * @returns {Promise<Object>} Dependency status
 */
async function checkDependency(packageName) {
    try {
        await import(packageName);
        return {
            status: 'healthy',
            available: true
        };
    } catch (error) {
        return {
            status: 'degraded',
            available: false,
            error: error.message
        };
    }
}

/**
 * Check performance health
 * @returns {Promise<Object>} Performance health status
 */
async function checkPerformanceHealth() {
    try {
        const startTime = process.hrtime.bigint();

        // Perform a simple CPU-intensive task to check performance
        let sum = 0;
        for (let i = 0; i < 100000; i++) {
            sum += Math.sqrt(i);
        }

        const endTime = process.hrtime.bigint();
        const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

        // Check if execution time is reasonable
        const performanceStatus = executionTime > 100 ? 'degraded' :
                                executionTime > 200 ? 'unhealthy' : 'healthy';

        return {
            status: performanceStatus,
            details: {
                cpuTest: {
                    executionTime: Math.round(executionTime),
                    operations: 100000
                },
                eventLoop: {
                    // Simple event loop lag check
                    lag: await measureEventLoopLag()
                }
            }
        };

    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
}

/**
 * Measure event loop lag
 * @returns {Promise<number>} Event loop lag in milliseconds
 */
function measureEventLoopLag() {
    return new Promise((resolve) => {
        const start = process.hrtime.bigint();
        setImmediate(() => {
            const lag = Number(process.hrtime.bigint() - start) / 1000000;
            resolve(Math.round(lag));
        });
    });
}
