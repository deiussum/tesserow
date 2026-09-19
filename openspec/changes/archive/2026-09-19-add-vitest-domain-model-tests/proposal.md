## Why

There is no test framework configured for Tesserow at all (`AGENTS.md` says so explicitly), so the mosaic domain model's construction rules — numbering, alternating-color/edge-locking, toggle validity, written-pattern formatting, save/load round-tripping — have no automated check. `openspec/specs/mosaic-domain-model/spec.md` already documents these rules precisely, including two subtle corrections found while writing it (column-numbering direction, and that extra border rows are exempt from row alternation) that would be easy to silently regress without a test catching it.

## What Changes

- Add Vitest as the project's test framework, configured to run against the existing Vite/TypeScript setup (no separate build config needed).
- Add an `npm test` script.
- Add unit tests for `src/Mosaic.ts` (`MosaicChart`/`MosaicRow`/`MosaicCell`) covering every requirement in `openspec/specs/mosaic-domain-model/spec.md`.
- Out of scope (left for future changes): React component tests, `dialogs-bridge.ts` tests (would require mocking Tauri/Jimp/pdfkit), and CI wiring to run tests automatically.

## Capabilities

This is test-infrastructure/tooling work with no application-behavior change — it adds automated verification of behavior already documented in `openspec/specs/mosaic-domain-model/spec.md`, without altering that behavior. No capability specs are added or modified (`skip_specs: true` is set in this change's `.openspec.yaml`).

## Impact

- `package.json`: adds `vitest` (and any peer packages it needs) to `devDependencies`, adds a `test` script.
- New file: a Vitest config (likely `vite.config.ts`'s `test` block, or a separate `vitest.config.ts` if that proves cleaner alongside the Tauri/Vite setup).
- New file(s): `src/Mosaic.test.ts` (or split per class if that reads better).
- No changes to application source behavior, `src-tauri/`, or existing build/lint scripts.
