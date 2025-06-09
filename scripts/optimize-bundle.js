#!/usr/bin/env node

/**
 * @file BUNDLE OPTIMIZATION SCRIPT
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 *
 * @description
 * Comprehensive bundle optimization script for The Great Calculator.
 * Analyzes bundle composition, identifies optimization opportunities,
 * and provides actionable recommendations for improving performance.
 */

// ------------ IMPORTS
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// ------------ ES MODULE COMPATIBILITY
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------ CONFIGURATION
const CONFIG = {
  // Bundle size thresholds (in bytes)
  MAX_BUNDLE_SIZE: 1024 * 1024, // 1MB
  MAX_CHUNK_SIZE: 250 * 1024,   // 250KB
  MAX_ASSET_SIZE: 100 * 1024,   // 100KB

  // Paths
  SRC_DIR: path.join(__dirname, '../src'),
  DIST_DIR: path.join(__dirname, '../dist'),
  MODULES_DIR: path.join(__dirname, '../src/js/modules'),

  // File patterns
  JS_PATTERN: /\.js$/,
  CSS_PATTERN: /\.css$/,
  ASSET_PATTERN: /\.(png|jpe?g|gif|svg|ico|woff|woff2|eot|ttf|otf)$/
};

// ------------ MAIN OPTIMIZATION FUNCTION
/**
 * Main bundle optimization function
 */
async function optimizeBundle() {
  console.log('🚀 Starting bundle optimization analysis...\n');

  try {
    // Step 1: Analyze current bundle
    const bundleAnalysis = await analyzeBundleComposition();

    // Step 2: Identify optimization opportunities
    const opportunities = identifyOptimizations(bundleAnalysis);

    // Step 3: Generate recommendations
    const recommendations = generateRecommendations(opportunities);

    // Step 4: Create optimization report
    const report = createOptimizationReport(bundleAnalysis, opportunities, recommendations);

    // Step 5: Save report
    await saveReport(report);

    // Step 6: Display summary
    displaySummary(report);

    console.log('\n✅ Bundle optimization analysis complete!');

  } catch (error) {
    console.error('❌ Bundle optimization failed:', error);
    process.exit(1);
  }
}

// ------------ ANALYSIS FUNCTIONS

/**
 * Analyze bundle composition
 */
async function analyzeBundleComposition() {
  console.log('📊 Analyzing bundle composition...');

  const analysis = {
    totalSize: 0,
    fileCount: 0,
    files: [],
    modules: [],
    dependencies: new Map(),
    duplicates: [],
    largeFiles: [],
    unusedFiles: []
  };

  // Analyze source files
  const sourceFiles = await getSourceFiles(CONFIG.SRC_DIR);

  for (const file of sourceFiles) {
    const stats = await fs.stat(file);
    const relativePath = path.relative(CONFIG.SRC_DIR, file);

    const fileInfo = {
      path: relativePath,
      fullPath: file,
      size: stats.size,
      type: getFileType(file),
      dependencies: await extractDependencies(file)
    };

    analysis.files.push(fileInfo);
    analysis.totalSize += stats.size;
    analysis.fileCount++;

    // Track dependencies
    analysis.dependencies.set(relativePath, fileInfo.dependencies);

    // Identify large files
    if (stats.size > CONFIG.MAX_ASSET_SIZE) {
      analysis.largeFiles.push(fileInfo);
    }
  }

  // Analyze modules specifically
  if (await fs.access(CONFIG.MODULES_DIR).then(() => true).catch(() => false)) {
    analysis.modules = await analyzeModules();
  }

  // Find duplicates
  analysis.duplicates = await findDuplicateCode(analysis.files);

  console.log(`   📁 Analyzed ${analysis.fileCount} files`);
  console.log(`   📏 Total size: ${formatBytes(analysis.totalSize)}`);

  return analysis;
}

/**
 * Get all source files recursively
 */
async function getSourceFiles(dir) {
  const files = [];

  async function traverse(currentDir) {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await traverse(fullPath);
        }
      } else if (entry.isFile()) {
        // Include JS, CSS, and asset files
        if (CONFIG.JS_PATTERN.test(entry.name) ||
            CONFIG.CSS_PATTERN.test(entry.name) ||
            CONFIG.ASSET_PATTERN.test(entry.name)) {
          files.push(fullPath);
        }
      }
    }
  }

  await traverse(dir);
  return files;
}

/**
 * Extract dependencies from a JavaScript file
 */
async function extractDependencies(filePath) {
  if (!CONFIG.JS_PATTERN.test(filePath)) {
    return [];
  }

  try {
    const content = await fs.readFile(filePath, 'utf8');
    const dependencies = [];

    // Match import statements
    const importMatches = content.match(/import\s+.*?\s+from\s+['"`]([^'"`]+)['"`]/g);
    if (importMatches) {
      for (const match of importMatches) {
        const depMatch = match.match(/from\s+['"`]([^'"`]+)['"`]/);
        if (depMatch) {
          dependencies.push(depMatch[1]);
        }
      }
    }

    // Match require statements
    const requireMatches = content.match(/require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g);
    if (requireMatches) {
      for (const match of requireMatches) {
        const depMatch = match.match(/['"`]([^'"`]+)['"`]/);
        if (depMatch) {
          dependencies.push(depMatch[1]);
        }
      }
    }

    return dependencies;
  } catch (error) {
    console.warn(`⚠️ Failed to extract dependencies from ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Analyze module structure
 */
async function analyzeModules() {
  const modules = [];
  const moduleFiles = await getSourceFiles(CONFIG.MODULES_DIR);

  for (const file of moduleFiles) {
    if (CONFIG.JS_PATTERN.test(file)) {
      const stats = await fs.stat(file);
      const relativePath = path.relative(CONFIG.MODULES_DIR, file);

      modules.push({
        name: path.basename(file, '.js'),
        path: relativePath,
        size: stats.size,
        category: getModuleCategory(relativePath)
      });
    }
  }

  return modules;
}

/**
 * Get module category based on path
 */
function getModuleCategory(modulePath) {
  if (modulePath.includes('core/')) return 'core';
  if (modulePath.includes('ui/')) return 'ui';
  if (modulePath.includes('api/')) return 'api';
  if (modulePath.includes('storage/')) return 'storage';
  if (modulePath.includes('export/')) return 'export';
  if (modulePath.includes('error/')) return 'error';
  if (modulePath.includes('performance/')) return 'performance';
  if (modulePath.includes('pwa/')) return 'pwa';
  return 'other';
}

/**
 * Find duplicate code patterns
 */
async function findDuplicateCode(files) {
  const duplicates = [];
  const codeHashes = new Map();
  const crypto = await import('crypto');

  // Process each JavaScript file
  for (const file of files) {
    if (file.type !== 'javascript') continue;

    try {
      // Read file content asynchronously
      const content = await fs.readFile(file.fullPath, 'utf8');

      // Generate hash for code blocks (split by functions/classes)
      const codeBlocks = content.split(/\n\s*(?:function|class|const|let|var)\s+/);

      for (const block of codeBlocks) {
        if (block.trim().length < 50) continue; // Skip small blocks

        // Create normalized hash of the code block
        const normalizedBlock = block
          .replace(/\s+/g, ' ')
          .replace(/['"]/g, '"')
          .trim();
        const hash = crypto.createHash('sha256')
          .update(normalizedBlock)
          .digest('hex');

        // Check for duplicates
        if (codeHashes.has(hash)) {
          duplicates.push({
            originalFile: codeHashes.get(hash),
            duplicateFile: file.path,
            size: block.length,
            hash
          });
        } else {
          codeHashes.set(hash, file.path);
        }
      }
    } catch (error) {
      console.warn(`⚠️ Failed to analyze ${file.path} for duplicates:`, error.message);
    }
  }

  return duplicates;
}

/**
 * Get file type
 */
function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.js') return 'javascript';
  if (ext === '.css') return 'stylesheet';
  if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'].includes(ext)) return 'image';
  if (['.woff', '.woff2', '.eot', '.ttf', '.otf'].includes(ext)) return 'font';
  return 'other';
}

// ------------ OPTIMIZATION IDENTIFICATION

/**
 * Identify optimization opportunities
 */
function identifyOptimizations(analysis) {
  console.log('🔍 Identifying optimization opportunities...');

  const opportunities = {
    bundleSize: [],
    codesplitting: [],
    treeshaking: [],
    compression: [],
    lazyLoading: [],
    caching: []
  };

  // Bundle size opportunities
  if (analysis.totalSize > CONFIG.MAX_BUNDLE_SIZE) {
    opportunities.bundleSize.push({
      type: 'large-bundle',
      severity: 'high',
      description: `Total bundle size (${formatBytes(analysis.totalSize)}) exceeds recommended limit`,
      recommendation: 'Implement aggressive code splitting and lazy loading'
    });
  }

  // Large file opportunities
  for (const file of analysis.largeFiles) {
    opportunities.codesplitting.push({
      type: 'large-file',
      severity: 'medium',
      file: file.path,
      size: file.size,
      description: `File ${file.path} is ${formatBytes(file.size)}`,
      recommendation: 'Consider breaking into smaller modules or lazy loading'
    });
  }

  // Module-specific opportunities
  const modulesByCategory = groupModulesByCategory(analysis.modules);

  for (const [category, modules] of Object.entries(modulesByCategory)) {
    const totalSize = modules.reduce((sum, mod) => sum + mod.size, 0);

    if (totalSize > CONFIG.MAX_CHUNK_SIZE && category !== 'core') {
      opportunities.lazyLoading.push({
        type: 'large-category',
        category,
        modules: modules.length,
        size: totalSize,
        description: `${category} modules total ${formatBytes(totalSize)}`,
        recommendation: 'Consider lazy loading non-critical modules'
      });
    }
  }

  console.log(`   🎯 Found ${Object.values(opportunities).flat().length} optimization opportunities`);

  return opportunities;
}

/**
 * Group modules by category
 */
function groupModulesByCategory(modules) {
  const grouped = {};

  for (const module of modules) {
    if (!grouped[module.category]) {
      grouped[module.category] = [];
    }
    grouped[module.category].push(module);
  }

  return grouped;
}

// ------------ RECOMMENDATION GENERATION

/**
 * Generate optimization recommendations
 */
function generateRecommendations(opportunities) {
  console.log('💡 Generating optimization recommendations...');

  const recommendations = [];

  // High priority recommendations
  const highPriorityOpps = Object.values(opportunities).flat()
    .filter(opp => opp.severity === 'high');

  if (highPriorityOpps.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Critical Bundle Size Issues',
      description: 'Address these issues immediately to improve performance',
      actions: highPriorityOpps.map(opp => opp.recommendation)
    });
  }

  // Code splitting recommendations
  if (opportunities.codesplitting.length > 0) {
    recommendations.push({
      priority: 'medium',
      title: 'Code Splitting Opportunities',
      description: 'Break down large modules for better caching and loading',
      actions: [
        'Split large modules into smaller chunks',
        'Implement dynamic imports for non-critical features',
        'Use Webpack splitChunks optimization'
      ]
    });
  }

  // Lazy loading recommendations
  if (opportunities.lazyLoading.length > 0) {
    recommendations.push({
      priority: 'medium',
      title: 'Lazy Loading Opportunities',
      description: 'Load non-critical modules on demand',
      actions: [
        'Implement lazy loading for export functionality',
        'Defer error handling modules until needed',
        'Load performance monitoring modules asynchronously'
      ]
    });
  }

  console.log(`   📋 Generated ${recommendations.length} recommendation categories`);

  return recommendations;
}

// ------------ REPORT GENERATION

/**
 * Create optimization report
 */
function createOptimizationReport(analysis, opportunities, recommendations) {
  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalSize: analysis.totalSize,
      fileCount: analysis.fileCount,
      moduleCount: analysis.modules.length,
      opportunityCount: Object.values(opportunities).flat().length,
      recommendationCount: recommendations.length
    },
    analysis,
    opportunities,
    recommendations,
    metrics: {
      bundleSizeScore: calculateBundleSizeScore(analysis.totalSize),
      modularityScore: calculateModularityScore(analysis.modules),
      optimizationScore: calculateOptimizationScore(opportunities)
    }
  };
}

/**
 * Calculate bundle size score (0-100)
 */
function calculateBundleSizeScore(totalSize) {
  const ratio = totalSize / CONFIG.MAX_BUNDLE_SIZE;
  return Math.max(0, Math.min(100, 100 - (ratio - 1) * 50));
}

/**
 * Calculate modularity score (0-100)
 */
function calculateModularityScore(modules) {
  if (modules.length === 0) return 0;

  const avgModuleSize = modules.reduce((sum, mod) => sum + mod.size, 0) / modules.length;
  const idealSize = 50 * 1024; // 50KB
  const ratio = avgModuleSize / idealSize;

  return Math.max(0, Math.min(100, 100 - Math.abs(ratio - 1) * 50));
}

/**
 * Calculate optimization score (0-100)
 */
function calculateOptimizationScore(opportunities) {
  const totalOpportunities = Object.values(opportunities).flat().length;
  return Math.max(0, 100 - totalOpportunities * 10);
}

// ------------ UTILITY FUNCTIONS

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Save report to file
 */
async function saveReport(report) {
  const reportPath = path.join(__dirname, '../bundle-optimization-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Report saved to: ${reportPath}`);
}

/**
 * Display optimization summary
 */
function displaySummary(report) {
  console.log('\n📊 BUNDLE OPTIMIZATION SUMMARY');
  console.log('================================');
  console.log(`Total Bundle Size: ${formatBytes(report.summary.totalSize)}`);
  console.log(`File Count: ${report.summary.fileCount}`);
  console.log(`Module Count: ${report.summary.moduleCount}`);
  console.log(`Optimization Opportunities: ${report.summary.opportunityCount}`);
  console.log(`Bundle Size Score: ${report.metrics.bundleSizeScore.toFixed(1)}/100`);
  console.log(`Modularity Score: ${report.metrics.modularityScore.toFixed(1)}/100`);
  console.log(`Optimization Score: ${report.metrics.optimizationScore.toFixed(1)}/100`);

  if (report.recommendations.length > 0) {
    console.log('\n🎯 TOP RECOMMENDATIONS:');
    report.recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`${index + 1}. ${rec.title} (${rec.priority} priority)`);
      console.log(`   ${rec.description}`);
    });
  }
}

// ------------ SCRIPT EXECUTION

if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeBundle().catch(console.error);
}

export {
  optimizeBundle,
  analyzeBundleComposition,
  identifyOptimizations,
  generateRecommendations
};
