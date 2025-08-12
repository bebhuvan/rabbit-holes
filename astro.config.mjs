// @ts-check
import { defineConfig } from 'astro/config';
import { remarkLinkEmbed } from './src/utils/remarkLinkEmbed.js';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://bhuvan.dev', // Replace with your actual domain
  output: 'server', // Server mode for Cloudflare Workers
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  build: {
    inlineStylesheets: 'auto',
  },
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'viewport'
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
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['astro']
          }
        }
      }
    },
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    }
  }
});
