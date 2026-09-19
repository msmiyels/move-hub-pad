import { defineConfig } from 'vite';

// Relative base so the build works from GitHub Pages' project subpath
// (https://<user>.github.io/<repo>/) without hardcoding the repo name,
// and equally from a custom domain or `vite preview`.
export default defineConfig({
  root: 'src',
  base: './',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
