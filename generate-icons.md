# PWA Icon Generation Guide

Your PWA needs icons in various sizes. Here's how to generate them:

## Option 1: Use PWA Asset Generator (Recommended)
1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your favicon.svg or a high-res logo (512x512px minimum)
3. Download the generated icon package
4. Extract to `/public/icons/` folder

## Option 2: Manual Creation
Create these icon sizes from your logo/favicon:
- icon-16x16.png
- icon-32x32.png  
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Option 3: Using ImageMagick (if installed)
```bash
# Convert favicon.svg to different sizes
for size in 16 32 72 96 128 144 152 192 384 512; do
  convert favicon.svg -resize ${size}x${size} public/icons/icon-${size}x${size}.png
done
```

## Screenshots (Optional)
For better PWA store listing:
- Take screenshot of homepage on mobile (375x812px)
- Take screenshot of homepage on desktop (1920x1080px)
- Save as `/public/screenshots/homepage-mobile.png` and `/public/screenshots/homepage-desktop.png`

The PWA will work without these, but they improve the installation experience.