// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { remarkLinkEmbed } from './src/utils/remarkLinkEmbed.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.rabbitholes.garden',
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  build: {
    inlineStylesheets: 'always',
    assetsInlineLimit: 8192,
  },
  compressHTML: true,
  prefetch: {
    defaultStrategy: 'viewport', // More conservative than 'hover'
    prefetchAll: false
  },
  experimental: {
    contentIntellisense: true
  },
  markdown: {
    remarkPlugins: [remarkLinkEmbed],
    extendDefaultPlugins: true
  },
  vite: {
    build: {
      cssMinify: true,
      assetsInlineLimit: 8192,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['astro']
          },
          assetFileNames: (assetInfo) => {
            // Inline small CSS files
            if (assetInfo.name?.endsWith('.css') && assetInfo.source?.length < 8192) {
              return 'assets/inline-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      }
    },
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    },
    css: {
      preprocessorOptions: {
        css: {
          charset: false
        }
      }
    }
  }
});
