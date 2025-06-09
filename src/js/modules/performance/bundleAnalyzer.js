/**
 * @file BUNDLE ANALYZER MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Bundle analysis and optimization utility for The Great Calculator.
 * Provides comprehensive analysis of bundle composition, size optimization,
 * and performance recommendations for better loading performance.
 *
 * Features:
 * - Bundle size analysis and reporting
 * - Module dependency mapping
 * - Code splitting recommendations
 * - Tree shaking opportunities identification
 * - Performance impact assessment
 * - Optimization strategy suggestions
 * - Real-time bundle monitoring
 */

// ------------ BUNDLE ANALYZER CLASS

/**
 * Bundle Analyzer Class
 *
 * Analyzes application bundle composition and provides optimization
 * recommendations to improve loading performance and reduce bundle size.
 *
 * @class BundleAnalyzer
 * @example
 * const analyzer = new BundleAnalyzer();
 * const report = analyzer.generateReport();
 * console.log('Bundle analysis:', report);
 */
class BundleAnalyzer {
    /**
     * Create bundle analyzer instance
     *
     * Initializes the analyzer with performance tracking and
     * module dependency mapping capabilities.
     */
    constructor() {
        /** @type {Map<string, number>} Module sizes in bytes */
        this.moduleSizes = new Map();

        /** @type {Map<string, Array<string>>} Module dependencies */
        this.dependencies = new Map();

        /** @type {Map<string, number>} Load times for modules */
        this.loadTimes = new Map();

        /** @type {Map<string, number>} Module usage frequency */
        this.usageStats = new Map();

        /** @type {Array<Object>} Performance entries */
        this.performanceEntries = [];

        /** @type {number} Analysis start time */
        this.analysisStartTime = performance.now();

        console.log('📊 Bundle Analyzer initialized');
    }

    /**
     * Generate comprehensive bundle analysis report
     *
     * Creates a detailed report of bundle composition, performance metrics,
     * and optimization recommendations.
     *
     * @method generateReport
     * @returns {Object} Comprehensive bundle analysis report
     *
     * @example
     * const report = analyzer.generateReport();
     * console.log('Total bundle size:', report.totalSize);
     * console.log('Recommendations:', report.recommendations);
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            totalSize: this.calculateTotalSize(),
            moduleCount: this.moduleSizes.size,
            largestModules: this.getLargestModules(),
            dependencyGraph: this.buildDependencyGraph(),
            performanceMetrics: this.getPerformanceMetrics(),
            optimizationOpportunities: this.identifyOptimizations(),
            recommendations: this.generateRecommendations(),
            codeSplittingSuggestions: this.suggestCodeSplitting(),
            treeshakingOpportunities: this.findTreeshakingOpportunities()
        };

        console.log('📈 Bundle analysis report generated');
        return report;
    }

    /**
     * Calculate total bundle size
     *
     * @method calculateTotalSize
     * @returns {number} Total size in bytes
     * @private
     */
    calculateTotalSize() {
        let total = 0;
        for (const size of this.moduleSizes.values()) {
            total += size;
        }
        return total;
    }

    /**
     * Get largest modules by size
     *
     * @method getLargestModules
     * @returns {Array<Object>} Largest modules with sizes
     * @private
     */
    getLargestModules() {
        return Array.from(this.moduleSizes.entries())
            .map(([path, size]) => ({ path, size }))
            .sort((a, b) => b.size - a.size)
            .slice(0, 10);
    }

    /**
     * Build module dependency graph
     *
     * @method buildDependencyGraph
     * @returns {Object} Dependency graph structure
     * @private
     */
    buildDependencyGraph() {
        const graph = {
            nodes: [],
            edges: [],
            circularDependencies: []
        };

        // Build nodes
        for (const [module, deps] of this.dependencies) {
            graph.nodes.push({
                id: module,
                size: this.moduleSizes.get(module) || 0,
                dependencies: deps.length
            });

            // Build edges
            deps.forEach(dep => {
                graph.edges.push({ from: module, to: dep });
            });
        }

        // Detect circular dependencies
        graph.circularDependencies = this.detectCircularDependencies();

        return graph;
    }

    /**
     * Detect circular dependencies
     *
     * @method detectCircularDependencies
     * @returns {Array<Array<string>>} Circular dependency chains
     * @private
     */
    detectCircularDependencies() {
        const visited = new Set();
        const recursionStack = new Set();
        const cycles = [];

        const dfs = (node, path = []) => {
            if (recursionStack.has(node)) {
                const cycleStart = path.indexOf(node);
                cycles.push(path.slice(cycleStart));
                return;
            }

            if (visited.has(node)) return;

            visited.add(node);
            recursionStack.add(node);
            path.push(node);

            const deps = this.dependencies.get(node) || [];
            deps.forEach(dep => dfs(dep, [...path]));

            recursionStack.delete(node);
        };

        for (const module of this.dependencies.keys()) {
            if (!visited.has(module)) {
                dfs(module);
            }
        }

        return cycles;
    }

    /**
     * Get performance metrics
     *
     * @method getPerformanceMetrics
     * @returns {Object} Performance metrics summary
     * @private
     */
    getPerformanceMetrics() {
        const totalLoadTime = Array.from(this.loadTimes.values())
            .reduce((sum, time) => sum + time, 0);

        const avgLoadTime = this.loadTimes.size > 0
            ? totalLoadTime / this.loadTimes.size
            : 0;

        return {
            totalLoadTime,
            averageLoadTime: avgLoadTime,
            slowestModules: this.getSlowestModules(),
            loadTimeDistribution: this.getLoadTimeDistribution()
        };
    }

    /**
     * Get slowest loading modules
     *
     * @method getSlowestModules
     * @returns {Array<Object>} Slowest modules with load times
     * @private
     */
    getSlowestModules() {
        return Array.from(this.loadTimes.entries())
            .map(([path, time]) => ({ path, loadTime: time }))
            .sort((a, b) => b.loadTime - a.loadTime)
            .slice(0, 5);
    }

    /**
     * Get load time distribution
     *
     * @method getLoadTimeDistribution
     * @returns {Object} Load time distribution statistics
     * @private
     */
    getLoadTimeDistribution() {
        const times = Array.from(this.loadTimes.values());
        if (times.length === 0) return {};

        times.sort((a, b) => a - b);

        return {
            min: times[0],
            max: times[times.length - 1],
            median: times[Math.floor(times.length / 2)],
            p95: times[Math.floor(times.length * 0.95)]
        };
    }

    /**
     * Identify optimization opportunities
     *
     * @method identifyOptimizations
     * @returns {Array<Object>} Optimization opportunities
     * @private
     */
    identifyOptimizations() {
        const opportunities = [];
        const totalSize = this.calculateTotalSize();

        // Large bundle opportunity
        if (totalSize > 1024 * 1024) { // > 1MB
            opportunities.push({
                type: 'bundle-size',
                severity: 'high',
                description: 'Bundle size exceeds 1MB - consider code splitting',
                impact: 'High impact on initial load time',
                solution: 'Implement lazy loading for non-critical modules'
            });
        }

        // Large modules opportunity
        const largeModules = this.getLargestModules().filter(m => m.size > 100 * 1024);
        if (largeModules.length > 0) {
            opportunities.push({
                type: 'large-modules',
                severity: 'medium',
                description: `${largeModules.length} modules exceed 100KB`,
                impact: 'Medium impact on chunk loading',
                solution: 'Break down large modules into smaller chunks'
            });
        }

        // Unused modules opportunity
        const unusedModules = Array.from(this.usageStats.entries())
            .filter(([, usage]) => usage === 0);

        if (unusedModules.length > 0) {
            opportunities.push({
                type: 'unused-modules',
                severity: 'low',
                description: `${unusedModules.length} modules are never used`,
                impact: 'Low impact but unnecessary bundle bloat',
                solution: 'Remove unused modules or implement tree shaking'
            });
        }

        return opportunities;
    }

    /**
     * Generate optimization recommendations
     *
     * @method generateRecommendations
     * @returns {Array<string>} List of recommendations
     * @private
     */
    generateRecommendations() {
        const recommendations = [];
        const totalSize = this.calculateTotalSize();
        const moduleCount = this.moduleSizes.size;

        if (totalSize > 500 * 1024) {
            recommendations.push('Implement aggressive code splitting for modules > 50KB');
        }

        if (moduleCount > 20) {
            recommendations.push('Consider bundling small related modules together');
        }

        const circularDeps = this.detectCircularDependencies();
        if (circularDeps.length > 0) {
            recommendations.push('Resolve circular dependencies to improve tree shaking');
        }

        const slowModules = this.getSlowestModules();
        if (slowModules.length > 0 && slowModules[0].loadTime > 1000) {
            recommendations.push('Optimize slow-loading modules or implement preloading');
        }

        return recommendations;
    }

    /**
     * Suggest code splitting strategies
     *
     * @method suggestCodeSplitting
     * @returns {Array<Object>} Code splitting suggestions
     * @private
     */
    suggestCodeSplitting() {
        const suggestions = [];

        // Suggest splitting by feature
        suggestions.push({
            strategy: 'feature-based',
            description: 'Split by calculator features (scientific, export, etc.)',
            modules: [
                '/src/js/modules/export/',
                '/src/js/modules/error/',
                '/src/js/modules/performance/'
            ]
        });

        // Suggest splitting by usage frequency
        const lowUsageModules = Array.from(this.usageStats.entries())
            .filter(([, usage]) => usage < 3)
            .map(([path]) => path);

        if (lowUsageModules.length > 0) {
            suggestions.push({
                strategy: 'usage-based',
                description: 'Lazy load infrequently used modules',
                modules: lowUsageModules
            });
        }

        return suggestions;
    }

    /**
     * Find tree shaking opportunities
     *
     * @method findTreeshakingOpportunities
     * @returns {Array<Object>} Tree shaking opportunities
     * @private
     */
    findTreeshakingOpportunities() {
        const opportunities = [];

        // Check for modules with no usage
        const unusedModules = Array.from(this.usageStats.entries())
            .filter(([, usage]) => usage === 0)
            .map(([path]) => path);

        if (unusedModules.length > 0) {
            opportunities.push({
                type: 'unused-modules',
                description: 'Completely unused modules can be removed',
                modules: unusedModules,
                potentialSavings: unusedModules.reduce((sum, path) =>
                    sum + (this.moduleSizes.get(path) || 0), 0)
            });
        }

        return opportunities;
    }

    /**
     * Track module size
     *
     * @method trackModuleSize
     * @param {string} modulePath - Module path
     * @param {number} size - Size in bytes
     */
    trackModuleSize(modulePath, size) {
        this.moduleSizes.set(modulePath, size);
    }

    /**
     * Track module load time
     *
     * @method trackLoadTime
     * @param {string} modulePath - Module path
     * @param {number} loadTime - Load time in milliseconds
     */
    trackLoadTime(modulePath, loadTime) {
        this.loadTimes.set(modulePath, loadTime);
    }

    /**
     * Track module usage
     *
     * @method trackUsage
     * @param {string} modulePath - Module path
     */
    trackUsage(modulePath) {
        const current = this.usageStats.get(modulePath) || 0;
        this.usageStats.set(modulePath, current + 1);
    }
}

// ------------ MODULE EXPORTS


export default BundleAnalyzer;
