#!/usr/bin/env node

/**
 * @file GENERATE-ICONS.JS
 * 
 * @version 1.0.0
 * @author Bleckwolf25
 * @contributors
 * @license MIT
 * 
 * @description
 * Script to generate all required icons from a base SVG.
 * Used for PWA, favicons, and touch icons.
 */

// ------------ IMPORTS
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// ------------ CONFIGURATION
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------ CONSTANTS
const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');

// ------------ ICONS
const REQUIRED_ICONS = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32x32.png', size: 32 },
];

// ------------ FUNCTIONS
async function generatePNG(svgPath, outputPath, size) {
  try {
    await sharp(svgPath)
      .resize(size, size)
      .png({ quality: 90 })
      .toFile(outputPath);
    console.log(`✅ Generated ${path.basename(outputPath)}`);
  } catch (err) {
    console.error(`❌ Failed to generate ${path.basename(outputPath)}`, err);
  }
}

// ------------ MAIN
async function main() {
  console.log('🎨 PWA Icon Generator');
  console.log('=====================');

  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
    console.log('✅ Created icons directory');
  }

  const svgPath = path.join(ICONS_DIR, 'icon.svg');
  if (!fs.existsSync(svgPath)) {
    console.error('❌ Base SVG not found at:', svgPath);
    process.exit(1);
  }
  console.log('✅ Found base SVG:', svgPath);

  // Generate each PNG
  for (const icon of REQUIRED_ICONS) {
    const outPath = path.join(ICONS_DIR, icon.name);
    await generatePNG(svgPath, outPath, icon.size);
  }

  console.log('\n✨ All icons generated! Place these in the `public/` root or reference them in the manifest.');
}

// ------------ RUN
main();
