import { defineConfig } from 'vitest/config';

// Standalone from vite.config.ts, which is tuned for the Tauri/browser build
// (node polyfills, Tauri-facing optimizeDeps) that Node-environment unit
// tests don't need - see design.md under add-vitest-domain-model-tests.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
