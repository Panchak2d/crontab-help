import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Absolute base path for GitHub Pages subdirectory deployment
  base: '/crontab-help/',
  build: {
    outDir: 'dist',
    // sourcemaps expose full TS source in production DevTools and bloat the bundle
    // by ~15x. Use 'hidden' here if you upload maps to an error tracker (e.g. Sentry).
    sourcemap: false,
  },
});