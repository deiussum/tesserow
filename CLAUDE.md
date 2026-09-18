# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Tesserow is a mosaic crochet pattern generator. It's a single Tauri + React + TypeScript desktop application living at the repo root.

## Commands

Despite some lingering internal naming (see "Application architecture" below), this is a Tauri app, not Electron. Building it requires a Rust toolchain (`cargo`) in addition to Node, plus WebKitGTK dev headers on Linux.

Run from the repo root:
- `npm install` — install dependencies (`package-lock.json`/npm is the flow; there is no `yarn.lock`)
- `npm start` — runs `tauri dev` (Vite dev server + a Tauri window, with Vite HMR)
- `npm run lint` — ESLint over `.ts`/`.tsx` files
- `npm run package` — build the app binary without bundling installers (`tauri build --no-bundle`)
- `npm run make` — build platform installers (`tauri build`, via `cross-env NO_STRIP=true` — the `linuxdeploy` tool used for AppImage bundling ships a `strip` too old for some systems' newer ELF sections, so stripping is skipped)

There is no test suite configured for this project.

## Application architecture

This is a Tauri + Vite + React + TypeScript app (migrated off Electron Forge/Webpack — see the `migrate-electron-to-tauri`/`spike-tauri-shell-port` OpenSpec change history under `openspec/changes/archive/` for why and how). Almost none of the app's own logic runs in the Rust host process: `src-tauri/` registers only Tauri's official `dialog` and `fs` plugins (no custom Rust commands), and all the business logic that used to live in Electron's main process — native dialogs, image import, PDF export — now runs in the webview/renderer, calling those plugins directly.

- **`src-tauri/`** — the Rust host (Cargo project). `src/lib.rs` registers `tauri-plugin-dialog` and `tauri-plugin-fs`. `capabilities/default.json` grants the actual permissions used — note that Tauri scopes byte-level commands (`read_file`/`write_file`) and text-level commands (`read_text_file`/`write_text_file`) as *separate* permissions even though the app treats them as the same kind of file access; both need their own grant. `tauri.conf.json` holds `productName`/`version`/window config and bundler targets.
- **`vite.config.ts`** (+ the root `index.html`) — frontend dev/build tooling, replacing the old webpack configs. Includes `vite-plugin-node-polyfills`, needed because `blob-stream` (used for PDF export) expects Node's `stream`/`util` modules.
- **`src/renderer.ts`** — renderer entry point. Imports `dialogs-bridge.ts` (installing `window.dialogs`) before rendering `app.tsx`.
- **`src/dialogs-bridge.ts`** — replaces the old `dialogs.ts` + `preload.ts` pair. Installs `window.dialogs` (`getFileName`, `save`, `open`, `import`, `resize`, `export`) directly via `@tauri-apps/plugin-dialog`/`@tauri-apps/plugin-fs`, so the rest of the renderer code is unchanged from the Electron version. Image import still uses Jimp (browser build) for greyscale + downscale-to-300px + luminance-array conversion. PDF export uses `pdfkit`'s standalone (browser-safe) build — the default Node build reads its fonts via `fs`, which doesn't exist in a webview — piped through `blob-stream` into an in-memory buffer, then written via the `fs` plugin. Merging in a user-supplied cover PDF is done with direct `pdf-lib` page-copying rather than `pdf-merger-js`, which imports `fs/promises` at module load and can't run in a webview at all.
- **`src/app.tsx`** — top-level React component and application state machine. Owns which top-level screen is shown (`HomePage`, `NewMosaicForm`, `MosaicEditor`, `ImagePreviewDialog`) via boolean `useState` flags rather than a router. It also owns the image-import → threshold → mosaic-generation pipeline: import image via `dialogs.import`, preview/resize via `ImagePreviewDialog`, then paint `mosaic` cells based on a luminance threshold.
- **`src/Mosaic.ts`** — the core domain model, independent of React/Tauri. Exports a singleton `mosaic: Mosaic` instance (not a class you instantiate yourself — most other code imports and mutates this singleton directly).
  - `Mosaic` — owns the `<canvas id="mosaic-canvas">` element, zoom/scale, and mouse event wiring (hover highlight, click-to-toggle).
  - `MosaicChart` — the width/height grid of `MosaicRow`s. Handles coordinate math, save/load (de)serialization, generating the printable PDF page layout (`getChartPageData`), and generating the written (text) pattern (`getWrittenPattern(s)`).
  - `MosaicRow` — alternates a base color per row and renders the written-pattern stitch-run-length text for that row (`SC`/`DC`/`JS`/`ES` codes).
  - `MosaicCell` — a single stitch. `color` is 0/1 (crochet's two mosaic colors), `type` encodes stitch kind (0=single crochet, 1=double crochet forming the "X" motif, 2/3=join/end stitch markers on row edges). `canToggleColor`/`toggleColor` enforce the mosaic-crochet construction rules (edge cells and cells that would break the alternating-row pattern can't be toggled), and toggling a cell also flips the stitch type of the cell above it (the "double stitch" square that visually connects two rows).
  - **Row/column numbering is inverted from array indices**: `rowNumber`/`columnNumber` count down from `height`/`width`, while `rows[]`/`cells[]` are indexed 0-based from the top/right. Coordinate helpers (`getCellByChartRowAndCol` vs `getCellByRowAndCol`) exist for both numbering systems — check which one a given caller expects before adding new lookups.
- Editor UI components (`MosaicEditor.tsx`, `NewMosaicForm.tsx`, `ExportDialog.tsx`, `ExportOptions.tsx`, `ImagePreviewDialog.tsx`, `WrittenPatternDialog.tsx`, `HelpDialog.tsx`/`HelpButton.tsx`, `StatusBar.tsx`, `FileSelector.tsx`) are mostly presentational MUI-based dialogs/panels that read/mutate the `mosaic` singleton and call into `window.dialogs` for file I/O; they hold little state of their own.
- Save files are plain JSON (`MosaicChart.getSaveData()`/`loadData()`); PDF export options are shaped by `ExportOptions.tsx` and consumed both by `ExportDialog.tsx` and `dialogs-bridge.ts#exportPdf`.

## OpenSpec (spec-driven workflow)

This repo uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) (the `opsx` experimental workflow) to plan and track non-trivial changes as specs before they're implemented.

- **`openspec/config.yaml`** — workflow config (schema, optional project context/rules).
- **`openspec/specs/`** — the current, agreed-upon behavior ("what is true now"), organized by capability.
- **`openspec/changes/`** — active change proposals (design + spec deltas + task breakdown) that haven't been merged into `specs/` yet.
- **`openspec/changes/archive/`** — completed changes, archived after their deltas are synced into `specs/`.

Typical flow: propose a change → implement its tasks → sync the delta specs into `openspec/specs/` → archive the change. Use the matching skill/slash command for each step rather than editing `openspec/` files by hand:

- `openspec-propose` / `/opsx:propose` — draft a new change proposal (design + specs + tasks) from a description of what to build.
- `openspec-explore` / `/opsx:explore` — think through an idea or requirement before (or during) writing a proposal.
- `openspec-update-change` / `/opsx:update` — revise an existing change's proposal/design/tasks and keep them coherent.
- `openspec-apply-change` / `/opsx:apply` — implement the tasks in a change.
- `openspec-sync-specs` / `/opsx:sync` — sync a change's delta specs into `openspec/specs/` without archiving.
- `openspec-archive-change` / `/opsx:archive` — archive a change once implementation is complete.

Both `.claude/` (Claude Code) and `.opencode/` (opencode) have matching skill/command definitions for this workflow, since the repo is used from both tools.
