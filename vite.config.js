import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { cp, writeFile } from 'node:fs/promises';

const pages = ['cursos', 'classroom', 'dashboard', 'inspiracoes', 'prompts', 'comunidade', 'login', 'admin-seed'];
const basePath = (process.env.VITE_BASE_PATH || '').trim().replace(/^\/+|\/+$/g, '');
const siteBase = basePath ? `/${basePath}/` : '/';
let outputDirectory;

export default defineConfig({
  // Project sites on GitHub Pages are published under /<repository>/.
  base: siteBase,
  publicDir: false,
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  build: {
    rolldownOptions: {
      input: { home: resolve('index.html'), ...Object.fromEntries(pages.map(p => [p, resolve(`public/pages/${p}.html`)])) },
    },
  },
  plugins: [{
    name: 'original-brand-assets',
    configResolved(config) {
      outputDirectory = resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      // Keep generated source pages usable locally after a production build.
      return html.replace('<base href="/">', `<base href="${siteBase}">`);
    },
    async closeBundle() {
      await cp('IMG', resolve(outputDirectory, 'IMG'), { recursive: true });
      // Harmless on Actions deployments and useful if dist is ever served directly.
      await writeFile(resolve(outputDirectory, '.nojekyll'), '');
    },
  }],
});
