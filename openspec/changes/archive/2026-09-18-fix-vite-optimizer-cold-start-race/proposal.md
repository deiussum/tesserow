## Why

A genuinely cold `npm start`/`vite:dev` (empty `node_modules/.vite`) reliably shows a Vite dependency-optimizer "reloading" event and a transient 404 in the dev console during the first page load. It self-heals (Vite auto-reloads and the second load is clean), but it was flagged as an open item during the `rename-to-tesserow` change's verification (see `openspec/changes/archive/2026-09-17-rename-to-tesserow/tasks.md`, "Blocker note") and reconfirmed unresolved as of the `update-dependencies` change. It's a bad first impression for anyone building from a fresh clone - relevant given the project is headed toward an open-source release, where cold clones are the norm rather than the exception.

## What Changes

- Add an `optimizeDeps.include` entry to `vite.config.ts` so the dependency that's currently discovered late (mid-session, forcing a re-optimize) is instead known during Vite's initial scan, eliminating the extra optimize pass and the full-reload it triggers.
- Verify by clearing `node_modules/.vite` and confirming a cold `npm run vite:dev` no longer logs `optimized dependencies changed. reloading`.
- No **BREAKING** changes - this only affects `vite.config.ts`, a dev-server-only config file.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
(none - pure dev-tooling fix, no spec-level behavior changes; `skip_specs: true` set in `.openspec.yaml`)

## Impact

- `vite.config.ts` (one config change)
- Dev experience only - `optimizeDeps` has no effect on production builds (`npm run package`/`npm run make`), so shipped app behavior is unaffected
