#!/usr/bin/env node
/**
 * Automated Image Optimization Script
 * 
 * Usage:
 * - npm run optimize-images          (optimize all images)
 * - npm run optimize-images --dry    (preview what would be optimized)
 * - npm run optimize-images --force  (re-optimize even if already optimized)
 */

import { execSync } from 'child_process';
import { readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';

const IMAGES_DIR = 'public/images';
const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.webp'];
const MAX_WIDTH = 800; // Maximum width for web display
const QUALITY = 5; // JPEG quality (1-31, lower is better)
const SIZE_THRESHOLD = 50 * 1024; // Only optimize images larger than 50KB

// Configuration
const config = {
  dryRun: process.argv.includes('--dry'),
  force: process.argv.includes('--force'),
  verbose: process.argv.includes('--verbose') || process.argv.includes('-v')
};

class ImageOptimizer {
  constructor() {
    this.stats = {
      processed: 0,
      optimized: 0,
      skipped: 0,
      totalSavings: 0
    };
  }

  log(message, force = false) {
    if (config.verbose || force) {
      console.log(message);
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  getOptimizedPath(filePath) {
    const ext = extname(filePath);
    const base = basename(filePath, ext);
    const dir = filePath.replace(basename(filePath), '');
    return join(dir, `${base}-optimized${ext}`);
  }

  isAlreadyOptimized(filePath) {
    // Check if this is already an optimized file
    if (basename(filePath).includes('-optimized')) {
      return true;
    }

    // Check if an optimized version exists
    const optimizedPath = this.getOptimizedPath(filePath);
    if (existsSync(optimizedPath)) {
      const originalStat = statSync(filePath);
      const optimizedStat = statSync(optimizedPath);
      
      // If optimized file is newer, consider original as already processed
      return optimizedStat.mtime > originalStat.mtime;
    }

    return false;
  }

  async optimizeImage(filePath) {
    const originalSize = statSync(filePath).size;
    const ext = extname(filePath).toLowerCase();
    const optimizedPath = this.getOptimizedPath(filePath);

    // Skip if already optimized and not forcing
    if (!config.force && this.isAlreadyOptimized(filePath)) {
      this.log(`⏭️  Skipping ${filePath} (already optimized)`);
      this.stats.skipped++;
      return;
    }

    // Skip small images
    if (originalSize < SIZE_THRESHOLD) {
      this.log(`⏭️  Skipping ${filePath} (${this.formatBytes(originalSize)} - too small)`);
      this.stats.skipped++;
      return;
    }

    this.log(`🔄 Processing ${filePath} (${this.formatBytes(originalSize)})`);
    this.stats.processed++;

    try {
      let command;
      
      if (ext === '.png') {
        // PNG optimization with scaling and compression
        command = `ffmpeg -y -i "${filePath}" -vf "scale=${MAX_WIDTH}:-1" -compression_level 9 "${optimizedPath}"`;
      } else if (['.jpg', '.jpeg'].includes(ext)) {
        // JPEG optimization with scaling and quality
        command = `ffmpeg -y -i "${filePath}" -vf "scale=${MAX_WIDTH}:-1" -q:v ${QUALITY} "${optimizedPath}"`;
      } else if (ext === '.webp') {
        // WebP optimization
        command = `ffmpeg -y -i "${filePath}" -vf "scale=${MAX_WIDTH}:-1" -quality 80 "${optimizedPath}"`;
      }

      if (!config.dryRun) {
        execSync(command, { stdio: 'pipe' });
        
        // Check if optimization was successful
        if (existsSync(optimizedPath)) {
          const optimizedSize = statSync(optimizedPath).size;
          const savings = originalSize - optimizedSize;
          const savingsPercent = ((savings / originalSize) * 100).toFixed(1);

          if (optimizedSize < originalSize) {
            // Replace original with optimized version
            execSync(`mv "${optimizedPath}" "${filePath}"`);
            
            this.stats.optimized++;
            this.stats.totalSavings += savings;
            
            this.log(`✅ Optimized ${filePath}: ${this.formatBytes(originalSize)} → ${this.formatBytes(optimizedSize)} (${savingsPercent}% reduction)`, true);
          } else {
            // Optimized version is larger, keep original
            execSync(`rm "${optimizedPath}"`);
            this.log(`⚠️  ${filePath}: Optimized version was larger, keeping original`);
            this.stats.skipped++;
          }
        } else {
          throw new Error('Optimization failed - no output file created');
        }
      } else {
        this.log(`📋 Would optimize: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Failed to optimize ${filePath}:`, error.message);
    }
  }

  async findImages(dir) {
    const images = [];
    
    try {
      const entries = readdirSync(dir);
      
      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        
        if (stat.isDirectory()) {
          // Recursively search subdirectories
          images.push(...await this.findImages(fullPath));
        } else if (stat.isFile()) {
          const ext = extname(entry).toLowerCase();
          if (SUPPORTED_FORMATS.includes(ext)) {
            images.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
    
    return images;
  }

  async run() {
    console.log('🖼️  Image Optimization Script');
    console.log('============================');
    
    if (config.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified');
    }
    
    if (!existsSync(IMAGES_DIR)) {
      console.error(`❌ Images directory not found: ${IMAGES_DIR}`);
      process.exit(1);
    }

    // Check if ffmpeg is available
    try {
      execSync('which ffmpeg', { stdio: 'pipe' });
    } catch {
      console.error('❌ ffmpeg not found. Please install ffmpeg:');
      console.error('   Ubuntu/Debian: sudo apt install ffmpeg');
      console.error('   macOS: brew install ffmpeg');
      console.error('   Windows: Download from https://ffmpeg.org/download.html');
      process.exit(1);
    }

    console.log(`📂 Scanning ${IMAGES_DIR} for images...`);
    const images = await this.findImages(IMAGES_DIR);
    
    if (images.length === 0) {
      console.log('ℹ️  No images found to optimize');
      return;
    }

    console.log(`🔍 Found ${images.length} image${images.length !== 1 ? 's' : ''}`);
    console.log(`⚙️  Configuration: Max width: ${MAX_WIDTH}px, Size threshold: ${this.formatBytes(SIZE_THRESHOLD)}`);
    console.log('');

    // Sort by size (largest first) for better progress visibility
    images.sort((a, b) => statSync(b).size - statSync(a).size);

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      console.log(`[${i + 1}/${images.length}]`);
      await this.optimizeImage(image);
    }

    // Print summary
    console.log('');
    console.log('📊 Optimization Summary');
    console.log('========================');
    console.log(`📁 Total images found: ${images.length}`);
    console.log(`✅ Successfully optimized: ${this.stats.optimized}`);
    console.log(`⏭️  Skipped: ${this.stats.skipped}`);
    console.log(`❌ Failed: ${this.stats.processed - this.stats.optimized - this.stats.skipped}`);
    
    if (this.stats.totalSavings > 0) {
      console.log(`💾 Total space saved: ${this.formatBytes(this.stats.totalSavings)}`);
    }

    if (config.dryRun) {
      console.log('');
      console.log('🚀 Run without --dry to apply optimizations');
    }
  }
}

// Run the optimizer
const optimizer = new ImageOptimizer();
optimizer.run().catch(console.error);