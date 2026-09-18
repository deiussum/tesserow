## 1. Non-breaking / low-risk npm bumps

- [x] 1.1 Bump `@emotion/react`, `@emotion/styled`, `@fontsource/roboto`, `@types/node`, `@types/pdfkit`, `@types/uuid`, `eslint-plugin-import`, `pdfkit`, `ts-node`, `cross-env`, `vite`, `vite-plugin-node-polyfills`, and all `@tauri-apps/*` npm packages to latest and verify `npm install` completes with no peer-dependency errors
- [x] 1.2 Run `npm run lint` and `npm run package` and verify both succeed with no new errors (lint: 86 pre-existing problems, unchanged from baseline, confirmed via `npm ci` on the original lockfile; build: succeeds. Also fixed an unflagged breaking change: pdfkit 0.14→0.20 dropped the `pdfkit/js/pdfkit.standalone` export subpath used for the webview-safe browser build — updated `src/dialogs-bridge.ts` to import the bare `pdfkit` specifier, which now resolves to the browser build via the package's own export conditions)
- [x] 1.3 Run `npm start` and verify no errors (no GUI in this sandbox - no window manager or xdotool available, and installing one needs sudo; verified via dev-server/Rust logs only, per user direction. Vite serves cleanly, `target/debug/app` runs with no panics. Visual/interactive verification deferred to the user)

## 2. TypeScript 4.5 → 5.9 (capped below latest 7.x - see note)

- [x] 2.1 Bump `typescript` to latest in `package.json` and run `npm run package`, fixing any new type errors surfaced by the compiler. **Deviation from proposal/design (user-approved):** TypeScript 7.0.2 (latest) is not yet supported by `typescript-eslint` (peer range `<6.1.0` on both the classic and unified packages, confirmed for real, not just an overly-conservative range) - capped at TypeScript 5.9.3, the newest release the lint toolchain actually supports, to keep the whole toolchain mutually compatible. Also set `"strict": false` explicitly in `tsconfig.json`, since TS may default `strict` to `true` when unset in some newer releases - preserves pre-upgrade type-checking looseness rather than fixing ~20 latent null-safety errors across the codebase, consistent with design.md's "no opportunistic modernization" decision. Also added `@types/blob-stream`, a real gap `noImplicitAny` should have caught pre-upgrade too
- [x] 2.2 Adjust `tsconfig.json` only as far as needed to compile cleanly and verify `npm run package` succeeds (removed `baseUrl`/`moduleResolution: "node"`/the `paths` node_modules mapping - redundant with standard node resolution, and `baseUrl`+`moduleResolution: "node"` are invalid/removed under newer TypeScript major-version policy)
- [x] 2.3 Run `npm run lint` and verify it still passes (deferred: old `@typescript-eslint` 5.x crashes outright against a newer TS type API - not a lint regression fixable in isolation, required stage 3's bump first. Verified together with 3.3 below.)

## 3. ESLint 8 → 9 (capped below latest 10.x - see note) + flat config migration

- [x] 3.1 Bump `eslint`, and swap `@typescript-eslint/eslint-plugin`+`@typescript-eslint/parser` for the unified `typescript-eslint` flat-config package, to latest. **Deviation from proposal/design (same class of issue as 2.1, same resolution, not re-asked):** `eslint-plugin-import` (latest 2.32.0) peer-caps at `eslint ^9`, doesn't support ESLint 10 yet - capped `eslint`/`@eslint/js` at 9.39.5, the newest release the import-linting toolchain actually supports
- [x] 3.2 Replace `.eslintrc.json` with a flat `eslint.config.js` covering the same rule set and file scoping (`.ts`/`.tsx`), removing the old config file. Added `eslint-import-resolver-typescript` (the default resolver couldn't follow modern `exports`-map packages like `pdfkit`) and explicit `ignores` for build/vendor paths (flat config, unlike `.eslintrc.json`, doesn't auto-ignore dotfiles - added `.pnp.*` to keep linting the pre-existing, unrelated `.pnp.cjs`/`.pnp.loader.mjs` files out of scope)
- [x] 3.3 Run `npm run lint` and verify it runs under flat config with no unexpected new violations (diffed baseline vs. current lint output by file+rule: 74 problems remain, all pre-existing violations at shifted line numbers or the same rule reclassified `warn`→`error` by the newer `recommended` preset's own defaults - zero genuinely new violation sites after fixing 3.2's resolver/ignores gaps)

## 4. jimp 0.5 → 1.6

- [x] 4.1 Bump `jimp` to 1.x and rewrite `loadJimpImage` and the greyscale/downscale/luminance-array conversion logic in `src/dialogs-bridge.ts` against jimp 1.x's API, keeping existing function signatures unchanged. Changes: `Jimp` is now a named export (not default); pixel decoding moved to `intToRGBA` from the separate `@jimp/utils` package; `.resize(w, h)` positional args became `.resize({ w, h })`. **Deviation (discovered, not pre-approved):** jimp's *latest* npm tag is 1.6.1, but that release's published browser bundle (`dist/browser/index.js`, selected by the package's `exports["."].browser` condition, which Vite uses) is a broken stub (`export {};` - a real upstream publishing bug, confirmed by comparing against 1.6.0's browser bundle, which is a real, complete build). Pinned `jimp`/`@jimp/utils` to exactly `1.6.0` (not `^1.6.0`) in `package.json`, so a future `npm install`/`npm update` can't silently resolve back to the broken 1.6.1
- [x] 4.2 Run `npm run package` and verify the project builds with no jimp-related type errors (clean `tsc --noEmit`; `npm run package` succeeds - jimp's own bundled code emits a benign build-time `eval` warning from Rolldown, not an error, not something in this app's control)
- [x] 4.3 Manually verify the image-import code path (no GUI in this sandbox, per the earlier user decision to verify via logs/build only) - `npm run package` and `tsc --noEmit` both pass cleanly against the rewritten `loadJimpImage`/`getImageData` functions; full interactive image-import verification deferred to the user

## 5. React 18 → 19 and MUI 5 → 9

- [x] 5.1 Bump `react`, `react-dom`, `@types/react`, `@types/react-dom` to latest and update `src/renderer.ts`/root-render code for any React 19 API changes (no change needed: `src/app.tsx` already used the React 18+ `createRoot` API, not the legacy `ReactDOM.render`)
- [x] 5.2 Bump `@mui/material`, `@mui/icons-material` to latest (9.4.0, confirmed React-19-compatible via its peer range before installing) and fix breaking changes found by `tsc`:
  - `ExportDialog.tsx`: removed a dead `import { Unstable_NumberInput } from '@mui/base/...'` - unused (the file actually renders a plain `TextField`), and `@mui/base` is no longer a dependency in MUI 6+
  - `FileSelector.tsx`, `ImagePreviewDialog.tsx`: `@mui/material/Unstable_Grid2` was stabilized into `@mui/material/Grid` in MUI 6 - updated the import, and `<Grid xs={6}>` became `<Grid size={{ xs: 6 }}>` (the breakpoint props were unified into one `size` prop)
  - `FileSelector.tsx`: `TextField`'s `inputProps`/`InputLabelProps` were deprecated in favor of the slots API - now `slotProps={{ htmlInput: {...}, inputLabel: {...} }}`
  - `ExportDialog.tsx`, `Help/*.tsx`, `NewMosaicForm.tsx`, `ImagePreviewDialog.tsx`: `Box`'s direct spacing shorthand props (`my`, `mx`) are no longer part of its typed props in MUI 9 (only `sx` is) - converted every `<Box my={n}>`/`<Box mx={n}>` to `<Box sx={{ my: n }}>`/`<Box sx={{ mx: n }}>` (same visual spacing, just moved into `sx`)
- [x] 5.3 Run `npm run lint` and `npm run package` and verify both succeed (both pass; lint diffed against baseline by file+rule - zero new violation types, same 73 pre-existing problems)
- [x] 5.4 Manually verify every screen and dialog renders (no GUI in this sandbox, per the earlier user decision) - `tsc --noEmit` and `npm run package` both pass cleanly across every touched component; full interactive verification deferred to the user

## 6. uuid 9 → 14

- [x] 6.1 Bump `uuid` and `@types/uuid` to latest and verify `npm run package` succeeds (`grep -rn "uuid" src/` found zero usages anywhere in the codebase - `uuid` is an unused dependency, so there was no import style to update. Flagging for the user: worth a separate cleanup PR to drop `uuid`/`@types/uuid` entirely, out of scope for this dependency-update change)
- [x] 6.2 Verify UUID-dependent behavior still works via manual test (n/a - confirmed unused, nothing to verify)

## 7. Rust / Cargo dependency updates

- [x] 7.1 Run `cargo update` in `src-tauri/` and verify `Cargo.lock` updates with no version conflicts (12 transitive crates updated cleanly, no conflicts)
- [x] 7.2 Evaluate whether any `Cargo.toml` version constraints should be widened (no changes made: the only newer major, Tauri 3.x, is alpha-only on crates.io - not a stable release to adopt; `serde`/`serde_json`/`log`/the `tauri-plugin-*` crates are all already on their current stable major with unpinned floors, so `cargo update` alone already reaches the newest compatible version of each)
- [x] 7.3 Run `npm run package` and verify the Tauri app builds and launches successfully (succeeds)

## 8. Final verification

- [x] 8.1 Run the full manual verification checklist end-to-end (no GUI in this sandbox, per the earlier user decision to verify via logs/build only). What was verified: `npm start` launches cleanly under a virtual display with no runtime/console errors after the vite dep-cache stabilizes (a transient cold-start optimizer race, reproducible even before any dependency changes, self-resolves on relaunch); `tsc --noEmit` and `npm run package` (a from-scratch release build, `target/release` cleared first) both pass on the fully-upgraded tree. Interactive verification of image import, mosaic editing, save/load, PDF export, and written pattern generation is deferred to the user
- [x] 8.2 Run `npm run lint` and `npm run package` one final time on the fully-upgraded tree and verify both succeed with no errors (lint: 73 problems, all pre-existing per the running baseline diff kept through every stage, zero new violation types introduced by this change; build: succeeds from a clean `target/release`)
