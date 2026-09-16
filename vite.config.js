import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { cp } from 'node:fs/promises';

const pages = ['cursos', 'classroom', 'dashboard', 'inspiracoes', 'prompts', 'comunidade', 'login', 'admin-seed'];

export default defineConfig({
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
    async closeBundle() { await cp('IMG', 'dist/IMG', { recursive: true }); },
  }],
});
