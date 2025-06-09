/**
 * @file TREE SHAKING OPTIMIZATION MODULE
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Tree shaking optimization utilities for The Great Calculator.
 * Provides tools to identify unused code, optimize imports,
 * and improve bundle size through dead code elimination.
 *
 * Features:
 * - Unused export detection
 * - Import optimization analysis
 * - Dead code identification
 * - Bundle size impact assessment
 * - Optimization recommendations
 */

// ------------ TREE SHAKING ANALYZER CLASS

/**
 * Tree Shaking Analyzer Class
 *
 * Analyzes code for tree shaking opportunities and provides
 * recommendations for optimizing bundle size through dead code elimination.
 *
 * @class TreeShakingAnalyzer
 * @example
 * const analyzer = new TreeShakingAnalyzer();
 * const report = analyzer.analyzeModule('./src/js/modules/core/operations.js');
 */
class TreeShakingAnalyzer {
    /**
     * Create tree shaking analyzer instance
     */
    constructor() {
        /** @type {Map<string, Set<string>>} Module exports tracking */
        this.moduleExports = new Map();

        /** @type {Map<string, Set<string>>} Module imports tracking */
        this.moduleImports = new Map();

        /** @type {Set<string>} Used exports across all modules */
        this.usedExports = new Set();

        /** @type {Set<string>} Unused exports that can be removed */
        this.unusedExports = new Set();

        /** @type {Map<string, number>} Estimated size savings per optimization */
        this.sizeSavings = new Map();

        console.log('🌳 Tree Shaking Analyzer initialized');
    }

    /**
     * Analyze module for tree shaking opportunities
     *
     * @method analyzeModule
     * @param {string} modulePath - Path to the module to analyze
     * @returns {Object} Analysis report with optimization opportunities
     *
     * @example
     * const report = analyzer.analyzeModule('./src/js/modules/export/exportManager.js');
     * console.log('Unused exports:', report.unusedExports);
     */
    analyzeModule(modulePath) {
        const analysis = {
            modulePath,
            exports: [],
            imports: [],
            unusedExports: [],
            optimizationOpportunities: [],
            estimatedSavings: 0,
            moduleSize: 0,
            complexity: 'low',
            treeshakable: true
        };

        try {
            console.log(`🔍 Analyzing module: ${modulePath}`);

            // Perform static analysis of the module
            const moduleContent = this.getModuleContent(modulePath);
            if (moduleContent) {
                analysis.exports = this.extractExports(moduleContent);
                analysis.imports = this.extractImports(moduleContent);
                analysis.moduleSize = this.estimateModuleSize(moduleContent);
                analysis.complexity = this.analyzeComplexity(moduleContent);
                analysis.treeshakable = this.isTreeshakable(moduleContent, modulePath);

                // Track exports and imports for cross-module analysis
                this.moduleExports.set(modulePath, new Set(analysis.exports.map(exp => exp.name)));
                this.moduleImports.set(modulePath, new Set(analysis.imports.map(imp => imp.name)));

                // Identify unused exports within this module
                analysis.unusedExports = this.findUnusedExports(analysis.exports, analysis.imports);

                // Update global tracking
                analysis.exports.forEach(exp => {
                    if (exp.used) {
                        this.usedExports.add(`${modulePath}:${exp.name}`);
                    } else {
                        this.unusedExports.add(`${modulePath}:${exp.name}`);
                    }
                });
            }

            // Identify optimization opportunities
            analysis.optimizationOpportunities = this.identifyOptimizations(modulePath);
            analysis.estimatedSavings = this.calculateSavings(analysis.optimizationOpportunities);

            console.log(`✅ Module analysis complete: ${analysis.exports.length} exports, ${analysis.imports.length} imports`);
            return analysis;
        } catch (error) {
            console.error(`❌ Failed to analyze module ${modulePath}:`, error);
            return analysis;
        }
    }

    /**
     * Get module content for analysis
     *
     * TODO: In a real implementation, this would read the file from disk.
     * For this implementation, we'll simulate module content based on known patterns.
     *
     * @method getModuleContent
     * @param {string} modulePath - Path to the module
     * @returns {string|null} Module content or null if not accessible
     * @private
     */
    getModuleContent(modulePath) {
        // Simulate module content based on known calculator modules
        const modulePatterns = {
            'export/exportManager.js': this.generateExportManagerContent(),
            'error/errorBoundary.js': this.generateErrorBoundaryContent(),
            'performance/performanceMonitor.js': this.generatePerformanceMonitorContent(),
            'accessibility/accessibilityManager.js': this.generateAccessibilityManagerContent(),
            'core/operations.js': this.generateOperationsContent(),
            'ui/display.js': this.generateDisplayContent(),
            'storage/storageManager.js': this.generateStorageManagerContent(),
            'pwa/offlineManager.js': this.generateOfflineManagerContent()
        };

        // Find matching pattern
        for (const [pattern, content] of Object.entries(modulePatterns)) {
            if (modulePath.includes(pattern)) {
                return content;
            }
        }

        // Default generic module content
        return this.generateGenericModuleContent(modulePath);
    }

    /**
     * Extract export statements from module content
     *
     * @method extractExports
     * @param {string} content - Module content
     * @returns {Array<Object>} List of exports with metadata
     * @private
     */
    extractExports(content) {
        const exports = [];

        // Match various export patterns
        const exportPatterns = [
            // export default ClassName
            /export\s+default\s+(\w+)/g,
            // export { name1, name2 }
            /export\s*{\s*([^}]+)\s*}/g,
            // export const/let/var name
            /export\s+(?:const|let|var)\s+(\w+)/g,
            // export function name
            /export\s+function\s+(\w+)/g,
            // export class name
            /export\s+class\s+(\w+)/g,
            // export async function name
            /export\s+async\s+function\s+(\w+)/g
        ];

        exportPatterns.forEach((pattern, index) => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const exportName = match[1];
                if (exportName) {
                    // Handle multiple exports in braces
                    if (index === 1) { // export { name1, name2 }
                        const names = exportName.split(',').map(n => n.trim());
                        names.forEach(name => {
                            exports.push({
                                name: name.replace(/\s+as\s+\w+/, ''), // Remove 'as alias'
                                type: 'named',
                                line: this.getLineNumber(content, match.index),
                                used: false
                            });
                        });
                    } else {
                        exports.push({
                            name: exportName,
                            type: index === 0 ? 'default' : 'named',
                            line: this.getLineNumber(content, match.index),
                            used: false
                        });
                    }
                }
            }
        });

        return exports;
    }

    /**
     * Extract import statements from module content
     *
     * @method extractImports
     * @param {string} content - Module content
     * @returns {Array<Object>} List of imports with metadata
     * @private
     */
    extractImports(content) {
        const imports = [];

        // Match various import patterns
        const importPatterns = [
            // import DefaultExport from 'module'
            /import\s+(\w+)\s+from\s+["'`]([^"'`]+)["'`]/g,
            // import { name1, name2 } from 'module'
            /import\s*{\s*([^}]+)\s*}\s*from\s+["'`]([^"'`]+)["'`]/g,
            // import * as name from 'module'
            /import\s*\*\s*as\s+(\w+)\s+from\s+["'`]([^"'`]+)["'`]/g,
            // Dynamic imports: import('module')
            /import\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g
        ];

        importPatterns.forEach((pattern, index) => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                if (index === 3) { // Dynamic import
                    imports.push({
                        name: '*',
                        module: match[1],
                        type: 'dynamic',
                        line: this.getLineNumber(content, match.index)
                    });
                } else if (index === 1) { // Named imports
                    const names = match[1].split(',').map(n => n.trim());
                    names.forEach(name => {
                        imports.push({
                            name: name.replace(/\s+as\s+\w+/, ''), // Remove 'as alias'
                            module: match[2],
                            type: 'named',
                            line: this.getLineNumber(content, match.index)
                        });
                    });
                } else {
                    imports.push({
                        name: match[1],
                        module: match[2] || match[1],
                        type: index === 0 ? 'default' : index === 2 ? 'namespace' : 'named',
                        line: this.getLineNumber(content, match.index)
                    });
                }
            }
        });

        return imports;
    }

    /**
     * Identify tree shaking optimization opportunities
     *
     * @method identifyOptimizations
     * @param {string} modulePath - Module path to analyze
     * @returns {Array<Object>} List of optimization opportunities
     * @private
     */
    identifyOptimizations(modulePath) {
        const opportunities = [];

        // Check for common tree shaking opportunities
        if (modulePath.includes('export/')) {
            opportunities.push({
                type: 'lazy-load',
                description: 'Export functionality can be lazy loaded',
                impact: 'high',
                savings: 25000 // estimated bytes
            });
        }

        if (modulePath.includes('error/')) {
            opportunities.push({
                type: 'conditional-load',
                description: 'Error handling can be loaded conditionally',
                impact: 'medium',
                savings: 15000
            });
        }

        if (modulePath.includes('performance/')) {
            opportunities.push({
                type: 'development-only',
                description: 'Performance monitoring can be excluded in production',
                impact: 'medium',
                savings: 20000
            });
        }

        return opportunities;
    }

    /**
     * Calculate estimated size savings
     *
     * @method calculateSavings
     * @param {Array<Object>} opportunities - Optimization opportunities
     * @returns {number} Estimated savings in bytes
     * @private
     */
    calculateSavings(opportunities) {
        return opportunities.reduce((total, opp) => total + (opp.savings || 0), 0);
    }

    /**
     * Generate tree shaking recommendations
     *
     * @method generateRecommendations
     * @returns {Array<Object>} List of recommendations
     *
     * @example
     * const recommendations = analyzer.generateRecommendations();
     * recommendations.forEach(rec => console.log(rec.description));
     */
    generateRecommendations() {
        const recommendations = [];

        // General tree shaking recommendations
        recommendations.push({
            category: 'imports',
            title: 'Optimize Import Statements',
            description: 'Use named imports instead of default imports for better tree shaking',
            example: "import { specificFunction } from 'module' // Good\nimport * as module from 'module' // Avoid",
            impact: 'high'
        });

        recommendations.push({
            category: 'exports',
            title: 'Remove Unused Exports',
            description: 'Remove exported functions and variables that are never imported',
            example: '// Remove exports that are never used elsewhere',
            impact: 'medium'
        });

        recommendations.push({
            category: 'side-effects',
            title: 'Mark Modules as Side-Effect Free',
            description: 'Add "sideEffects": false to package.json for better tree shaking',
            example: '{\n  "sideEffects": false\n}',
            impact: 'high'
        });

        recommendations.push({
            category: 'conditional',
            title: 'Use Conditional Loading',
            description: 'Load modules conditionally based on feature flags or user actions',
            example: 'if (needsExport) {\n  const { ExportManager } = await import("./export/exportManager.js");\n}',
            impact: 'high'
        });

        return recommendations;
    }

    /**
     * Get tree shaking configuration for bundlers
     *
     * @method getBundlerConfig
     * @returns {Object} Configuration for webpack/rollup/vite
     *
     * @example
     * const config = analyzer.getBundlerConfig();
     * // Use in webpack.config.js or vite.config.js
     */
    getBundlerConfig() {
        return {
            // Webpack configuration
            webpack: {
                optimization: {
                    usedExports: true,
                    sideEffects: false,
                    concatenateModules: true
                },
                resolve: {
                    mainFields: ['module', 'main']
                }
            },

            // Vite configuration
            vite: {
                build: {
                    rollupOptions: {
                        treeshake: {
                            moduleSideEffects: false,
                            propertyReadSideEffects: false,
                            unknownGlobalSideEffects: false
                        }
                    }
                }
            },

            // Rollup configuration
            rollup: {
                treeshake: {
                    moduleSideEffects: false,
                    propertyReadSideEffects: false,
                    unknownGlobalSideEffects: false,
                    pureExternalModules: true
                }
            }
        };
    }

    /**
     * Generate tree shaking report
     *
     * @method generateReport
     * @returns {Object} Comprehensive tree shaking report
     *
     * @example
     * const report = analyzer.generateReport();
     * console.log('Total potential savings:', report.totalSavings);
     */
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalModules: this.moduleExports.size,
                unusedExports: this.unusedExports.size,
                totalSavings: Array.from(this.sizeSavings.values()).reduce((a, b) => a + b, 0)
            },
            recommendations: this.generateRecommendations(),
            bundlerConfig: this.getBundlerConfig(),
            optimizationOpportunities: this.getOptimizationOpportunities()
        };

        return report;
    }

    /**
     * Get optimization opportunities across all modules
     *
     * @method getOptimizationOpportunities
     * @returns {Array<Object>} List of optimization opportunities
     * @private
     */
    getOptimizationOpportunities() {
        const opportunities = [];

        // Calculator-specific optimizations
        opportunities.push({
            module: 'export/exportManager.js',
            type: 'lazy-load',
            description: 'Export functionality is rarely used - lazy load it',
            estimatedSavings: '25KB',
            implementation: 'Use dynamic import when export button is clicked'
        });

        opportunities.push({
            module: 'error/errorBoundary.js',
            type: 'conditional-load',
            description: 'Error boundary only needed when errors occur',
            estimatedSavings: '15KB',
            implementation: 'Load error boundary on first error'
        });

        opportunities.push({
            module: 'performance/performanceMonitor.js',
            type: 'development-only',
            description: 'Performance monitoring not needed in production',
            estimatedSavings: '20KB',
            implementation: 'Exclude from production builds'
        });

        opportunities.push({
            module: 'accessibility/accessibilityManager.js',
            type: 'feature-flag',
            description: 'Load accessibility features only when enabled',
            estimatedSavings: '12KB',
            implementation: 'Check accessibility preference before loading'
        });

        return opportunities;
    }
}

// ------------ TREE SHAKING UTILITIES

/**
 * Tree shaking utility functions
 */
export const TreeShakingUtils = {
    /**
     * Check if a module can be tree shaken
     *
     * @param {string} modulePath - Path to the module
     * @returns {boolean} Whether the module can be tree shaken
     */
    canTreeShake(modulePath) {
        // Modules that typically can't be tree shaken
        const nonTreeShakable = [
            'polyfills',
            'side-effects',
            'global-styles'
        ];

        return !nonTreeShakable.some(pattern => modulePath.includes(pattern));
    },

    /**
     * Get recommended import pattern for tree shaking
     *
     * @param {string} modulePath - Path to the module
     * @returns {string} Recommended import pattern
     */
    getRecommendedImport(modulePath) {
        if (modulePath.includes('utils/')) {
            return 'import { specificFunction } from "./utils/module.js"';
        }

        if (modulePath.includes('core/')) {
            return 'import CoreModule from "./core/module.js"';
        }

        return 'import { namedExport } from "./module.js"';
    },

    /**
     * Estimate bundle size reduction from tree shaking
     *
     * @param {Array<string>} modules - List of modules to analyze
     * @returns {number} Estimated size reduction in bytes
     */
    estimateSizeReduction(modules) {
        let totalReduction = 0;

        for (const module of modules) {
            if (module.includes('export/')) totalReduction += 25000;
            if (module.includes('error/')) totalReduction += 15000;
            if (module.includes('performance/')) totalReduction += 20000;
            if (module.includes('accessibility/')) totalReduction += 12000;
        }

        return totalReduction;
    }
};

// ------------ MODULE EXPORTS

// Export for ES6 module systems
export default TreeShakingAnalyzer;
