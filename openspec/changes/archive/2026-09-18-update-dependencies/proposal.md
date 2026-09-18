## Why

The project's npm dependencies are significantly behind: React 18→19, MUI 5→9, TypeScript 4.5→7, ESLint 8→10, jimp 0.5→1.6, uuid 9→14, and several others each have major releases available, some pinned by narrow semver ranges that block even patch updates. Staying this far behind means missing security fixes and bug fixes, and the gap will only get harder to close the longer it's deferred. Rust crates (Tauri and its plugins) should also be brought current via `cargo update`.

## What Changes

- Upgrade all npm dependencies and devDependencies to their latest major versions, including the code changes each breaking change requires:
  - **BREAKING (dev-only impact)**: React 18 → 19 (`react`, `react-dom`, `@types/react`, `@types/react-dom`) — adopt any required migration steps (e.g. `ReactDOM.createRoot` usage, removed/changed APIs, updated JSX runtime expectations).
  - **BREAKING (dev-only impact)**: MUI 5 → 9 (`@mui/material`, `@mui/icons-material`) — update theme/component API usage for any removed or renamed props, `Grid`/`Grid2` and other component changes introduced across MUI 6/7/8/9.
  - **BREAKING (build tooling)**: TypeScript 4.5 → 5.9 — resolve new type-checking errors surfaced by newer compiler versions; update `tsconfig.json` if needed. (Capped below latest 7.x: `typescript-eslint` doesn't support TS7 yet as of this change - see design.md.)
  - **BREAKING (build tooling)**: ESLint 8 → 9, swap to the unified `typescript-eslint` flat-config package — migrate to ESLint's flat config format (`eslint.config.js`) if still on the legacy `.eslintrc` format, and update lint scripts/rules accordingly. (Capped below latest 10.x: `eslint-plugin-import` doesn't support ESLint 10 yet as of this change - see design.md.)
  - **BREAKING (runtime)**: jimp 0.5 → 1.6.0 — jimp's API changed substantially between 0.x and 1.x; update the image-import code in `src/dialogs-bridge.ts` (greyscale + downscale + luminance-array conversion) to the new API. (Pinned to 1.6.0, one patch below latest: 1.6.1's published browser bundle is a broken stub - see design.md.)
  - **BREAKING (runtime)**: uuid 9 → 14 — verify import style still matches (ESM-only in recent majors) and update usage if needed.
  - Non-breaking or low-risk updates: `@emotion/react`, `@emotion/styled`, `@fontsource/roboto`, `@types/node`, `@types/pdfkit`, `@types/uuid`, `eslint-plugin-import`, `pdfkit`, `ts-node`, `cross-env`, `vite`, `vite-plugin-node-polyfills`, `@tauri-apps/*` packages — bump to latest and confirm no regressions.
- Run `cargo update` in `src-tauri/` to bring Rust crate lockfile versions (Tauri core/CLI, `tauri-plugin-dialog`, `tauri-plugin-fs`, `tauri-plugin-log`, `serde`, `serde_json`, `log`) current within their existing `Cargo.toml` version constraints; bump `Cargo.toml` version constraints themselves where a newer major is available and low-risk.
- Manually verify the app's core flows still work after the upgrade: image import → threshold → mosaic generation, mosaic editing (cell toggling), save/load, PDF export, and written pattern generation — since this upgrade touches rendering (React/MUI) and image processing (jimp) directly.

## Capabilities

This is a dependency-maintenance change: its goal is to keep existing application behavior identical while updating underlying libraries and toolchain versions. No user-facing behavior or requirement is intended to change. `skip_specs: true` is set in `.openspec.yaml`; no spec deltas are included.

### New Capabilities
(none)

### Modified Capabilities
(none)

## Impact

- **Affected files**: `package.json`/`package-lock.json`, `src-tauri/Cargo.toml`/`Cargo.lock`, `tsconfig.json` (if TS config needs updates), ESLint config (`.eslintrc*` → possibly `eslint.config.js`), `src/dialogs-bridge.ts` (jimp API usage), any component using MUI APIs removed/changed between v5 and v9, `src/renderer.ts`/`app.tsx` if React 19 root API requires changes.
- **Affected systems**: build (Vite, TypeScript, ESLint), image import pipeline (jimp), UI rendering (React, MUI), Tauri Rust host (via `cargo update`).
- **Risk**: Several simultaneous major upgrades (React, MUI, TypeScript, ESLint, jimp, uuid) increase the chance of subtle regressions; no automated test suite exists for this project (per `AGENTS.md`), so verification relies on manual exercise of the app's flows listed above.
