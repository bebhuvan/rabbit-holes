#!/usr/bin/env node

/**
 * Validates blog posts before committing to prevent build failures
 * Run: node scripts/validate-post.js [filename]
 * Or validate all: node scripts/validate-post.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const POSTS_DIR = path.join(__dirname, '../src/content/posts');

// ANSI color codes
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateFrontmatter(content, filename) {
  const errors = [];
  const warnings = [];
  
  // Check if frontmatter exists
  if (!content.startsWith('---')) {
    errors.push('Missing frontmatter (should start with ---)');
    return { errors, warnings };
  }
  
  // Extract frontmatter
  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    errors.push('Incomplete frontmatter (missing closing ---)');
    return { errors, warnings };
  }
  
  const frontmatter = content.substring(3, endIndex);
  
  // Required fields
  const requiredFields = ['title', 'date', 'description'];
  for (const field of requiredFields) {
    const regex = new RegExp(`^${field}:`, 'm');
    if (!regex.test(frontmatter)) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate date format
  const dateMatch = frontmatter.match(/^date:\s*(.+)$/m);
  if (dateMatch) {
    const dateStr = dateMatch[1].trim();
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      errors.push(`Invalid date format: ${dateStr}`);
    }
  }
  
  // Check for problematic characters in title
  const titleMatch = frontmatter.match(/^title:\s*["']?(.+?)["']?$/m);
  if (titleMatch) {
    const title = titleMatch[1];
    if (title.includes('`') || title.includes('${')) {
      warnings.push('Title contains backticks or template literals which might cause issues');
    }
  }
  
  // Check for extremely long descriptions
  const descMatch = frontmatter.match(/^description:\s*["']?(.+?)["']?$/m);
  if (descMatch) {
    const desc = descMatch[1];
    if (desc.length > 160) {
      warnings.push(`Description is ${desc.length} characters (recommended: < 160 for SEO)`);
    }
  }
  
  return { errors, warnings };
}

function validateContent(content, filename) {
  const errors = [];
  const warnings = [];
  
  // Check for common markdown issues
  const lines = content.split('\n');
  
  // Check for unclosed code blocks
  let codeBlockCount = 0;
  for (const line of lines) {
    if (line.startsWith('```')) {
      codeBlockCount++;
    }
  }
  if (codeBlockCount % 2 !== 0) {
    errors.push('Unclosed code block (odd number of ``` found)');
  }
  
  // Check for broken image references
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    const imagePath = match[2];
    if (imagePath.startsWith('/') || imagePath.startsWith('./')) {
      // Local image - check if it exists
      const fullPath = path.join(__dirname, '..', 'public', imagePath.replace(/^\//, ''));
      if (!fs.existsSync(fullPath) && !imagePath.includes('http')) {
        warnings.push(`Image not found: ${imagePath}`);
      }
    }
  }
  
  // Check for very large files
  const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
  if (sizeKB > 100) {
    warnings.push(`Large file size: ${sizeKB.toFixed(1)}KB (consider optimizing images)`);
  }
  
  // Check for suspicious patterns that might break the build
  if (content.includes('import ') && !content.includes('```')) {
    warnings.push('Contains "import" statement outside code block');
  }
  
  if (content.includes('<script') && !content.includes('```')) {
    errors.push('Contains <script tag outside code block - this could break the build');
  }
  
  return { errors, warnings };
}

function validateFile(filepath) {
  const filename = path.basename(filepath);
  log(`\nValidating: ${filename}`, 'blue');
  
  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    
    // Validate frontmatter
    const frontmatterResult = validateFrontmatter(content, filename);
    
    // Validate content
    const contentResult = validateContent(content, filename);
    
    const errors = [...frontmatterResult.errors, ...contentResult.errors];
    const warnings = [...frontmatterResult.warnings, ...contentResult.warnings];
    
    // Display results
    if (errors.length > 0) {
      log('❌ Errors found:', 'red');
      errors.forEach(err => log(`   - ${err}`, 'red'));
    }
    
    if (warnings.length > 0) {
      log('⚠️  Warnings:', 'yellow');
      warnings.forEach(warn => log(`   - ${warn}`, 'yellow'));
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      log('✅ No issues found!', 'green');
    }
    
    return { errors, warnings, filename };
  } catch (error) {
    log(`❌ Error reading file: ${error.message}`, 'red');
    return { errors: [`Failed to read file: ${error.message}`], warnings: [], filename };
  }
}

function main() {
  const args = process.argv.slice(2);
  
  let files = [];
  
  if (args.length > 0) {
    // Validate specific file(s)
    files = args.map(arg => {
      if (path.isAbsolute(arg)) {
        return arg;
      }
      // Check if file exists in posts directory
      const inPostsDir = path.join(POSTS_DIR, path.basename(arg));
      if (fs.existsSync(inPostsDir)) {
        return inPostsDir;
      }
      return path.resolve(arg);
    });
  } else {
    // Validate all posts
    try {
      files = fs.readdirSync(POSTS_DIR)
        .filter(f => f.endsWith('.md'))
        .map(f => path.join(POSTS_DIR, f));
    } catch (error) {
      log(`Error reading posts directory: ${error.message}`, 'red');
      process.exit(1);
    }
  }
  
  log('🔍 Blog Post Validator', 'blue');
  log('=' . repeat(50));
  
  let totalErrors = 0;
  let totalWarnings = 0;
  
  for (const file of files) {
    if (!fs.existsSync(file)) {
      log(`\n❌ File not found: ${file}`, 'red');
      totalErrors++;
      continue;
    }
    
    const result = validateFile(file);
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
  }
  
  // Summary
  log('\n' + '='.repeat(50));
  log('📊 Summary:', 'blue');
  log(`   Files checked: ${files.length}`);
  log(`   Total errors: ${totalErrors}`, totalErrors > 0 ? 'red' : 'green');
  log(`   Total warnings: ${totalWarnings}`, totalWarnings > 0 ? 'yellow' : 'green');
  
  if (totalErrors > 0) {
    log('\n❌ Validation failed! Fix errors before committing.', 'red');
    process.exit(1);
  } else if (totalWarnings > 0) {
    log('\n⚠️  Validation passed with warnings.', 'yellow');
  } else {
    log('\n✅ All posts are valid!', 'green');
  }
}

main();