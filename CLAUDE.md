# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Deiussum.PatternMaker is a mosaic crochet pattern generator, made up of three independent, separately-run sub-projects in one repo (no shared package manager workspace, no shared build):

- **`Deiussum.PatternMaker.ElectronReact/`** — the main desktop application (Electron + React + TypeScript). This is where nearly all product functionality lives and is the primary area of active development.
- **`Deiussum.PatternMaker.WebApi/`** — a .NET 8 Web API, currently a stub (only the default `WeatherForecastController` template exists). Intended eventually for license verification and serving data to the marketing site.
- **`Deiussum.PatternMaker.WebNext/`** — a Next.js 14 (App Router) marketing/info site (download links, registration, news), using MUI and NextAuth.

There is no top-level build script tying these together; each sub-project is built/run from its own directory.

## Commands

### ElectronReact (main app)
Run from `Deiussum.PatternMaker.ElectronReact/`:
- `npm install` — install dependencies (repo also has a `yarn.lock`, but `package-lock.json`/npm is the documented flow in the README)
- `npm start` — runs `electron-forge start` (dev mode with webpack + hot reload)
- `npm run lint` — ESLint over `.ts`/`.tsx` files
- `npm run package` — package the app without creating installers (`electron-forge package`)
- `npm run make` — build platform installers (`electron-forge make`)

There is no test suite configured for this project.

### WebApi
Run from `Deiussum.PatternMaker.WebApi/`:
- `dotnet run` — starts the API (also buildable via the `Deiussum.PatternMaker.sln` solution at the repo root, which currently only references this project)

### WebNext
Run from `Deiussum.PatternMaker.WebNext/`:
- `npm install`
- `npm run dev` — start the Next dev server (README says `npm start`, but `start` runs the production server — use `dev` for local development)
- `npm run build` — production build
- `npm run lint` — `next lint`

## ElectronReact architecture

This is a standard Electron Forge + Webpack + TypeScript app with a strict main/renderer split; all filesystem, dialog, image-processing, and PDF work happens in the main process and is exposed to the renderer only through a narrow `contextBridge` API.

- **`src/index.ts`** — Electron main process entry point. Creates the `BrowserWindow` and registers all `ipcMain.handle` channels (`getFileName`, `save`, `open`, `import`, `export`, `resize`). All of these simply delegate to `dialogs.ts`.
- **`src/preload.ts`** — the only bridge between main and renderer. Exposes a `window.dialogs` object via `contextBridge.exposeInMainWorld`, mirroring the IPC channels above. The renderer code accesses these as `(window as any).dialogs.*` (see `app.tsx`).
- **`src/dialogs.ts`** — all main-process business logic: native open/save dialogs, JSON save/load of a mosaic project, image import via Jimp (greyscale + downscale to a 300px threshold, converted into a 2D array of luminance values for thresholding), and PDF export via `pdfkit`/`pdf-merger-js` (draws the chart grid, written pattern text, page numbers, and optionally merges in a user-supplied cover PDF).
- **`src/renderer.ts`** — renderer process entry, loads `app.tsx`.
- **`src/app.tsx`** — top-level React component and application state machine. Owns which top-level screen is shown (`HomePage`, `NewMosaicForm`, `MosaicEditor`, `ImagePreviewDialog`) via boolean `useState` flags rather than a router. It also owns the image-import → threshold → mosaic-generation pipeline: import image via `dialogs.import`, preview/resize via `ImagePreviewDialog`, then paint `mosaic` cells based on a luminance threshold.
- **`src/Mosaic.ts`** — the core domain model, independent of React/Electron. Exports a singleton `mosaic: Mosaic` instance (not a class you instantiate yourself — most other code imports and mutates this singleton directly).
  - `Mosaic` — owns the `<canvas id="mosaic-canvas">` element, zoom/scale, and mouse event wiring (hover highlight, click-to-toggle).
  - `MosaicChart` — the width/height grid of `MosaicRow`s. Handles coordinate math, save/load (de)serialization, generating the printable PDF page layout (`getChartPageData`), and generating the written (text) pattern (`getWrittenPattern(s)`).
  - `MosaicRow` — alternates a base color per row and renders the written-pattern stitch-run-length text for that row (`SC`/`DC`/`JS`/`ES` codes).
  - `MosaicCell` — a single stitch. `color` is 0/1 (crochet's two mosaic colors), `type` encodes stitch kind (0=single crochet, 1=double crochet forming the "X" motif, 2/3=join/end stitch markers on row edges). `canToggleColor`/`toggleColor` enforce the mosaic-crochet construction rules (edge cells and cells that would break the alternating-row pattern can't be toggled), and toggling a cell also flips the stitch type of the cell above it (the "double stitch" square that visually connects two rows).
  - **Row/column numbering is inverted from array indices**: `rowNumber`/`columnNumber` count down from `height`/`width`, while `rows[]`/`cells[]` are indexed 0-based from the top/right. Coordinate helpers (`getCellByChartRowAndCol` vs `getCellByRowAndCol`) exist for both numbering systems — check which one a given caller expects before adding new lookups.
- Editor UI components (`MosaicEditor.tsx`, `NewMosaicForm.tsx`, `ExportDialog.tsx`, `ExportOptions.tsx`, `ImagePreviewDialog.tsx`, `WrittenPatternDialog.tsx`, `HelpDialog.tsx`/`HelpButton.tsx`, `StatusBar.tsx`, `FileSelector.tsx`) are mostly presentational MUI-based dialogs/panels that read/mutate the `mosaic` singleton and call into `window.dialogs` for file I/O; they hold little state of their own.
- Save files are plain JSON (`MosaicChart.getSaveData()`/`loadData()`); PDF export options are shaped by `ExportOptions.ts` and consumed both by the renderer (`ExportDialog.tsx`) and main process (`dialogs.ts#export`).

## WebNext architecture

Next.js App Router structure under `src/app/`: `page.tsx` (home), `Features/`, `News/`, `Register/`, and `Help/` are route segments, each with its own `page.tsx`. `Features/Cards.json` and `News/newsItems.json` are static content data read by their respective pages rather than being hardcoded in JSX. Auth is handled via NextAuth at `src/app/api/auth/[...nextauth]`. Styling uses Tailwind (`tailwind.config.ts`) alongside MUI components, and `src/components/navbar.tsx` is the shared nav shown across routes via `layout.tsx`.

## WebApi architecture

Minimal ASP.NET Core Web API (`Program.cs` + `Controllers/`). Currently only the scaffolded `WeatherForecastController` exists — there is no real endpoint implementation yet, so don't assume any licensing/data endpoints exist until they're added.

## OpenSpec (spec-driven workflow)

This repo uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) (the `opsx` experimental workflow) to plan and track non-trivial changes as specs before they're implemented, spanning all three sub-projects.

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
