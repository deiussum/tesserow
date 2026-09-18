## Why

The project is being prepared for open-source release, and the current name carries baggage that no longer fits: `Deiussum` is a personal-namespace prefix the author is retiring, and `PatternMaker` is generic enough to collide with countless other tools. `Tesserow` (an invented blend of "tessera," the individual tile in mosaic art, and "row," reflecting the app's row-based `MosaicChart`/`MosaicRow` generation model) was checked for name collisions (npm, `.dev` domain, existing software/companies) and came back clean, unlike two other candidates considered (`Tesseraic`, already used by a registered LLC; `Tesserly`, already a live `.dev` app).

Since only one sub-project (`Deiussum.PatternMaker.ElectronReact/`) remains after the prior removal of `WebApi`/`WebNext`, this is also the moment to flatten the repo rather than carry the nested-subfolder structure forward under a new name.

## What Changes

- Rename the Forgejo repository from `Deiussum.PatternMaker` to `tesserow` (manual, server-side action; not covered by this change's file edits)
- **BREAKING**: Flatten `Deiussum.PatternMaker.ElectronReact/` — move its contents (`src/`, `src-tauri/`, `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, etc.) up to the repo root
- Rebrand app identity:
  - `package.json`: `name`/`productName` → `tesserow`/`Tesserow`, updated `description`
  - `tauri.conf.json`: `productName` → `Tesserow`, `identifier` → `com.deiussum.tesserow`, window `title` → `Tesserow`
- Rewrite `README.md` for the new name and to fix the stale "written using Electron and React" line (already inaccurate post-Tauri-migration, independent of this rename)
- Update `CLAUDE.md` directory-structure references from `Deiussum.PatternMaker.ElectronReact/` to the flattened root layout
- Leave `openspec/changes/archive/**` untouched — those are a historical record of past changes, not live documentation

Explicitly out of scope: a new app icon/wordmark (deferred to a later change).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None — this is a pure rename/restructure with no change to application behavior.

## Impact

- **Repo structure**: every file currently under `Deiussum.PatternMaker.ElectronReact/` moves to the repo root; all relative imports/configs (`tsconfig.json`, `vite.config.ts`, `src-tauri` paths) move with it and should continue to resolve unchanged since relative structure inside the app is preserved
- **Build/package identity**: `package.json` name, Tauri `productName`/`identifier`/window title — affects installer output names and the OS-level bundle ID (macOS bundle ID, Android `applicationId`, etc.)
- **Git hosting**: Forgejo repo URL changes; local `origin` remote needs `git remote set-url` after the server-side rename
- **Docs**: `README.md`, `CLAUDE.md`
- **No changes to**: application source code/logic, `Cargo.toml` (already uses generic `app`/`app_lib` names), `openspec/` archive history
