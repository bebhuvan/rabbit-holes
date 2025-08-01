// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { remarkLinkEmbed } from './src/utils/remarkLinkEmbed.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://bhuvan.dev', // Replace with your actual domain
  output: 'static', // Static for better performance + Functions via /functions folder
  adapter: cloudflare({
    mode: 'directory', // Enable /functions directory support
    functionPerRoute: false
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
