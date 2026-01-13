// @ts-check
import { defineConfig } from 'astro/config';
import { remarkLinkEmbed } from './src/utils/remarkLinkEmbed.js';
import { remarkWikilinks } from './src/utils/remarkWikilinks.js';
import { getPostsForWikilinksSync } from './src/utils/postsLoader.js';
import cloudflare from '@astrojs/cloudflare';

// Load posts for wikilink resolution at build time
const postsForWikilinks = getPostsForWikilinksSync();

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
    inlineStylesheets: 'always',
    assetsInlineLimit: 8192,
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
    remarkPlugins: [
      remarkLinkEmbed,
      [remarkWikilinks, { posts: postsForWikilinks }]
    ],
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
