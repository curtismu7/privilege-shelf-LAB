import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The SPA lives in web/ (web/index.html + web/src); the vendored shared components are web/src/top-menu.
export default defineConfig({
  root: 'web',
  plugins: [react()],
  build: { outDir: '../dist', emptyOutDir: true },
});
