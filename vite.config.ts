import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// Tauri frontend build/dev config (spike-tauri-shell-port).
// Separate from webpack.*.config.ts, which remain Electron's build tooling.
// nodePolyfills: blob-stream (used for PDF export) needs Node's `stream`/`util`
// at runtime, which Vite otherwise externalizes to empty stubs - see design.md.
export default defineConfig({
  plugins: [react(), nodePolyfills()],
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
  },
});
