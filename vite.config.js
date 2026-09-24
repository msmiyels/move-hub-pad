import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';

// Injects the SEO block (meta tags, Open Graph, JSON-LD) from seo/head.html
// into index.html at build and dev time. The source HTML stays short while
// the served HTML still contains everything statically for crawlers.
const SEO_MARKER = '<!-- seo-head -->';

const seoHead = () => ({
  name: 'seo-head',
  transformIndexHtml(html) {
    if (!html.includes(SEO_MARKER)) {
      throw new Error(`seo-head: marker "${SEO_MARKER}" not found in index.html`);
    }
    const head = readFileSync(new URL('./src/seo/head.html', import.meta.url), 'utf8');
    return html.replace(SEO_MARKER, head.trim());
  }
});

// Relative base so the build works from GitHub Pages' project subpath
// (https://<user>.github.io/<repo>/) without hardcoding the repo name,
// and equally from a custom domain or `vite preview`.
export default defineConfig({
  root: 'src',
  base: './',
  plugins: [seoHead()],
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});