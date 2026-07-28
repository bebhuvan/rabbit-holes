import { defineConfig } from 'astro/config';
import { remarkLinkEmbed } from './src/utils/remarkLinkEmbed.js';

export default defineConfig({
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  markdown: { remarkPlugins: [remarkLinkEmbed] },
});
