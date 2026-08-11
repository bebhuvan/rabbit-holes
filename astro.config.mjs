// @ts-check
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import mdx from '@astrojs/mdx';
import { remarkLinkEmbed } from './src/utils/remarkLinkEmbed.js';
import { remarkSubheadStrong } from './src/utils/remarkSubheadStrong.js';
import { remarkLazyImages } from './src/utils/remarkLazyImages.js';

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
  // MDX carries the explainers only. Folios stay plain markdown, authored
  // through Pages CMS, and are unaffected by this.
  integrations: [mdx()],
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
    remarkPlugins: [remarkLinkEmbed, remarkSubheadStrong, remarkLazyImages]
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
