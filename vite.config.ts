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
  // pdfkit's standalone browser bundle references the global `Buffer`, which
  // vite-plugin-node-polyfills supplies via an esbuild inject - but that inject
  // only fires during the optimizer's real build pass, one phase after Vite's
  // initial dependency scan. Declaring it here upfront avoids the mid-session
  // re-optimize + full-reload that otherwise races in-flight chunk requests
  // (e.g. the @mui/icons-material shared createSvgIcon chunk) on a cold start.
  optimizeDeps: {
    include: ['vite-plugin-node-polyfills/shims/buffer'],
  },
});
