## Context

`dialogs.ts` currently mixes two kinds of calls: (1) OS-facing ones (`dialog.showOpenDialog`/`showSaveDialog`, `fs.readFileSync`/`createWriteStream`) that only exist because Electron/Node provide them, and (2) pure computation (Jimp image decode/resize/greyscale, pdfkit page drawing) that happens to run in the Electron main process today but has no Electron-specific dependency. See `proposal.md - Why` for why this split matters: it's what makes a shell swap tractable instead of a rewrite.

The renderer talks to this logic only through `window.dialogs.*`, exposed by `preload.ts`'s `contextBridge`. That's the seam this spike replaces.

## Goals / Non-Goals

**Goals:**
- Get the existing ElectronReact app (unmodified UI/domain code) running under Tauri, using only Tauri's official `dialog` and `fs` plugins — no hand-written Rust commands.
- Preserve identical on-disk formats: the same JSON save/load shape, the same PDF output.
- Produce a concrete answer on canvas/text rendering fidelity across Windows, macOS, and Linux (WebKitGTK), since that's the biggest unknown a "just swap the shell" plan glosses over.

**Non-Goals:**
- Rewriting any business logic in Rust (image import, PDF generation) — tracked as a possible future change, not attempted here.
- Reaching a shippable/signed release build, auto-update wiring, or installer polish — this is a feasibility spike, not a migration.
- Removing the Electron/electron-forge setup from the repo. It stays untouched until the spike's outcome is evaluated.

## Decisions

**Do the spike on a separate branch, Electron tooling untouched.** Keeps this fully reversible (per proposal's Impact section) and lets both builds be compared side by side if desired, rather than committing to Tauri before the rendering question is answered.

**Use `@tauri-apps/plugin-dialog` and `@tauri-apps/plugin-fs` from the frontend directly, replacing `window.dialogs.*`.** Alternative considered: write custom Rust `#[tauri::command]`s mirroring today's IPC shape 1:1. Rejected for this spike — the official plugins cover open/save dialogs and file read/write with less code, and the proposal's whole premise is validating the *minimum-effort* path first. Custom commands are only worth it once/if the future Rust image-module work happens.

**Move PDF/file writing from direct `fs.createWriteStream` piping to generate-then-write.** `pdfkit` can be driven in a browser-like context to produce output as a buffer (e.g. via `blob-stream`) instead of piping to a Node stream; that buffer is then written with the `fs` plugin's `writeFile`. This is a required code change (not just a plugin swap) because `PDFDocument.pipe(fs.createWriteStream(...))` has no equivalent without Node's `fs` module in the webview.

**Treat `pdf-merger-js`'s webview-compatibility as something the spike verifies, not assumes.** It's used today for merging a user-supplied cover PDF and wraps `pdf-lib` (isomorphic), but its own file-loading code paths haven't been checked for a Node-`fs`-less environment. If it doesn't work as-is, the fallback is calling `pdf-lib` directly for the merge step — that's a small enough change to absorb inside this spike rather than needing its own change.

**Success criterion for the rendering question is manual visual comparison, not automated.** Open a save file with a non-trivial chart on Windows, macOS, and Linux builds and compare against the current Electron rendering, specifically: grid line crispness, row/column number label alignment, and the "X" double-crochet stitch markers. There's no existing visual regression tooling in this repo to automate this, and building one is out of scope for a spike.

## Risks / Trade-offs

- **WebKitGTK (Linux) may render the canvas chart differently than Chromium** (font metrics, line width rendering, HiDPI scaling) → Mitigation: this is the spike's primary question to answer; if it fails the manual comparison, that's a valid spike outcome ("Tauri isn't a good fit yet") rather than a blocker to work around.
- **`pdf-merger-js` may not run in a Node-less webview** → Mitigation: fall back to driving `pdf-lib` directly for the merge step (see Decisions above); confirm one way or the other during the spike.
- **Contributors need a Rust toolchain to build from source once/if this lands**, raising the bar versus today's Node-only setup → Mitigation: not solved by this spike; a real trade-off to weigh against the open-source contributor experience if/when deciding whether to actually adopt Tauri.
- **Scope creep toward the Rust image-module idea** while already in the code → Mitigation: explicitly out of scope per the proposal; if the itch shows up, note it and defer rather than expanding this change.

## Open Questions

- Does `pdf-merger-js` work unmodified in the Tauri webview, or does the merge step need to move to direct `pdf-lib` calls? Resolved by trying it during implementation; either outcome fits within this spike's scope (see Decisions).
- Are there Tauri `capabilities` (permission allowlist) configuration gotchas specific to this app's file-open/save/import patterns (e.g. arbitrary user-chosen paths vs. a scoped directory)? To be discovered while wiring the plugins; expected to be config-only, not an approach change.
