## Context

See proposal.md for motivation. The root cause, traced during exploration:

1. `src/renderer.ts` -> `dialogs-bridge.ts` -> `pdfkit/js/pdfkit.standalone.js` (the webview-safe browser bundle chosen in the original `spike-tauri-shell-port` design). This bundle references the global `Buffer`, not an ES import - it wasn't written with a bundler's dependency graph in mind.
2. `vite-plugin-node-polyfills` supplies `Buffer` by injecting an import via esbuild's `inject` API (`@rollup/plugin-inject` under the hood), applied during esbuild's real *build* step.
3. Vite's dependency optimizer runs in two phases: a fast scan (regex/AST walk of source, no plugin transforms/injects applied) that seeds the initial `optimizeDeps` bundle, then the real esbuild build. The scan phase can't see the injected Buffer import - only the build phase discovers it, one step after the scan-seeded bundle has already started being served to the browser.
4. Discovering it there counts as a "new dependency," so Vite reruns the optimizer mid-session and re-hashes every chunk - including unrelated bystanders already in flight, such as the shared `createSvgIcon` chunk pulled in by the app's two `@mui/icons-material` deep imports (`FolderOpen` in `FileSelector.tsx`, `Help` in `HelpButton.tsx`). Any request already issued against the first pass's file names 404s against the regenerated deps directory.
5. Vite then sends a full-reload over its HMR socket; the next load matches the now-stable manifest and works cleanly. Hence: transient, cosmetic, self-healing, cold-start-only.

## Goals / Non-Goals

**Goals:**
- Make the Buffer polyfill shim visible to Vite's optimizer *before* the mid-session discovery happens, so the extra optimize pass + reload doesn't fire on a cold cache.

**Non-Goals:**
- Not revisiting the decision to use pdfkit's standalone browser bundle (a deliberate, already-verified choice from the original spike).
- Not attempting to eliminate every hypothetical late-discovered dependency in general - only this specific, reproduced pdfkit/Buffer case.

## Decisions

**Add `'vite-plugin-node-polyfills/shims/buffer'` to `optimizeDeps.include` in `vite.config.ts`**, rather than including `pdfkit` itself.

- The shim is the actual module esbuild's build-phase inject discovers late - declaring it directly targets the root cause precisely.
- Alternative considered: include `pdfkit` in `optimizeDeps.include` instead. Likely also resolves it (scanning pdfkit eagerly would surface its Buffer need during the same pass), but forces Vite to eagerly prebundle pdfkit's large standalone bundle on every dev-server start rather than only when a PDF-export code path is actually reached. Rejected as less targeted.
- Alternative considered: leave it undocumented/unfixed, since it self-heals. Rejected - root cause is now understood and the fix is a one-line, low-risk config change worth trying before falling back to "just document it."

## Risks / Trade-offs

- **[Hypothesis is unverified against actual runtime behavior]** -> Mitigate by testing with a genuinely cold `node_modules/.vite` (deleted, not just stale) both before and after the change, diffing dev-server console output for the `optimized dependencies changed. reloading` message.
- **[Fix may reduce but not fully eliminate the race, if another late-discovered inject exists (e.g. `global`/`process` shims from some other dependency)]** -> If the include doesn't fully resolve it, capture whatever is still discovered late from the console output and either expand the include list or fall back to documenting the residual quirk as a known first-run cold-start note.
- **Low blast radius**: `optimizeDeps` only affects the dev server, not production builds (`npm run package`/`npm run make`) - safe to revert immediately if it doesn't help, with no risk to shipped app behavior.

## Open Questions

- If pre-declaring the shim doesn't fully eliminate the reload, is documenting the residual quirk in `CONTRIBUTING.md` (rather than chasing it further) an acceptable fallback? Deferrable - doesn't change the chosen approach or task breakdown, only what happens after the verification task runs.
