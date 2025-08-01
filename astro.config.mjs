// @ts-check
import { defineConfig } from 'astro/config';
import { remarkLinkEmbed } from './src/utils/remarkLinkEmbed.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://bhuvan.dev', // Replace with your actual domain
  output: 'static', // Static site with separate Cloudflare Functions
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
