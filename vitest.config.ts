import { defineConfig } from 'vitest/config';

// No react() plugin here — importing @vitejs/plugin-react (built against Vite 6)
// into vitest's defineConfig (which bundles Vite 5 internally) causes a TS2769
// plugin type conflict. Vitest handles JSX/TSX transformation natively for tests.
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
});
