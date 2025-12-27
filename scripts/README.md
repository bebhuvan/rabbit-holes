# Image Optimization Scripts

This directory contains automated tools for optimizing images in your Astro blog to improve performance.

## 🚀 Quick Start

```bash
# Optimize all images automatically
npm run optimize-images

# Preview what would be optimized (dry run)
npm run optimize-images:dry

# Force re-optimization of all images
npm run optimize-images:force

# Run with verbose output
npm run optimize-images:verbose
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run optimize-images` | Optimize all images larger than 50KB |
| `npm run optimize-images:dry` | Preview optimization without making changes |
| `npm run optimize-images:force` | Re-optimize all images, even if already processed |
| `npm run optimize-images:verbose` | Show detailed output during optimization |

## ⚙️ Configuration

The optimization script uses these settings:

- **Max Width**: 800px (images wider than this are scaled down)
- **Size Threshold**: 50KB (smaller images are skipped)
- **JPEG Quality**: 5 (high quality, range 1-31)
- **PNG Compression**: Level 9 (maximum compression)
- **Supported Formats**: PNG, JPEG, WebP

## 🔧 How It Works

1. **Scans** `public/images/` directory recursively
2. **Identifies** images larger than 50KB
3. **Optimizes** using FFmpeg:
   - Scales down to max 800px width
   - Applies format-specific compression
   - Preserves aspect ratio
4. **Replaces** original only if smaller
5. **Reports** savings and statistics

## 🎯 Typical Results

- **Large Images (>1MB)**: 80-90% size reduction
- **Medium Images (100-500KB)**: 60-80% size reduction
- **Small Images (<100KB)**: 30-60% size reduction

## 🛠️ Requirements

- **FFmpeg** must be installed on your system
  - Ubuntu/Debian: `sudo apt install ffmpeg`
  - macOS: `brew install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

## 🔄 Git Integration

The system includes a pre-commit hook that automatically optimizes images when you commit:

1. **Install the hook**:
   ```bash
   git config core.hooksPath .githooks
   ```

2. **How it works**:
   - Detects staged image files
   - Runs optimization automatically
   - Re-stages optimized files
   - Proceeds with commit

3. **Skip if needed**:
   ```bash
   git commit --no-verify  # Skip image optimization
   ```

## 📊 Performance Impact

This optimization system directly addresses PageSpeed Insights issues:

- ✅ **Reduces image download sizes** (improves LCP)
- ✅ **Eliminates oversized images** 
- ✅ **Maintains visual quality** at web-appropriate sizes
- ✅ **Automatic optimization** prevents regression

## 🔍 Troubleshooting

### "ffmpeg not found"
```bash
# Install FFmpeg first
sudo apt install ffmpeg  # Ubuntu/Debian
brew install ffmpeg       # macOS
```

### "Permission denied"
```bash
chmod +x scripts/optimize-images.js
chmod +x .githooks/pre-commit
```

### Large images not optimizing
- Check if image is already optimized (has `-optimized` in filename)
- Use `--force` flag to re-optimize
- Ensure image is larger than 50KB threshold

## 💡 Best Practices

1. **Run before deployment**: `npm run optimize-images`
2. **Use dry run first**: Check what will be optimized
3. **Commit hook**: Let Git optimize automatically
4. **Monitor savings**: Check the summary report
5. **Backup originals**: Keep source images elsewhere if needed

## 🚨 Important Notes

- **Irreversible**: Original images are replaced (backup elsewhere if needed)
- **Quality loss**: Some quality loss is expected for size savings
- **Skip small images**: Images under 50KB are left untouched
- **Preserves metadata**: Image EXIF data is preserved where possible

## 📈 Monitoring

The script provides detailed statistics:
- Files processed vs. skipped
- Size reductions achieved
- Total space saved
- Failed optimizations

Use `--verbose` flag for detailed per-file information.