import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
  const isGitHubPages = process.env.PAGES_BUILD === 'true';
  return {
    site: isGitHubPages ? 'https://rrrwwwsss.github.io/rws_boke/' : 'https://example.com',
    output: 'static',
    integrations: [mdx(), sitemap()],
    markdown: {
      shikiConfig: { theme: 'github-dark-default', wrap: true }
    },
    vite: { plugins: [tailwindcss()] }
  };
});
