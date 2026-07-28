// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { remarkLinkEmbed } from './src/utils/remarkLinkEmbed.js';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.rabbitholes.garden',
  output: 'server',
  image: {
    service: {
      entrypoint: 'astro/assets/services/noop'
    }
  },
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
    defaultStrategy: 'viewport', // More conservative than 'hover'
    prefetchAll: false
  },
  experimental: {
    contentIntellisense: true
  },
  markdown: {
    remarkPlugins: [remarkLinkEmbed]
  },
  vite: {
    build: {
      cssMinify: true
    },
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    }
  }
});
