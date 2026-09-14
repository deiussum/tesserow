## Why

Electron's reputation for bloated installs (bundling a full Chromium + Node runtime per app, often 80-150MB+) is a concern for PatternMaker's upcoming open-source release, even though no bloat has actually been observed yet (the app has only been installed once, for local testing). The ElectronReact app has zero native Node modules in its dependencies — every piece of business logic (image processing via Jimp, PDF generation via pdfkit/pdf-merger-js, the whole `Mosaic.ts` domain model and canvas rendering) is pure, browser-portable JS/TS. Only `dialogs.ts`/`preload.ts`/`index.ts` touch Electron/Node APIs directly (native open/save dialogs and filesystem reads/writes). That makes now — pre-release, with no installed user base — the cheapest possible point to validate whether a lighter-weight shell (Tauri, which uses the OS's own webview instead of bundling Chromium) is a viable foundation, before any migration would need to consider existing users.

## What Changes

- Spike: port the Electron shell (`src/index.ts`, `src/preload.ts`, the native-facing parts of `src/dialogs.ts`) to Tauri, using Tauri's official `dialog` and `fs` plugins — no custom Rust required for this spike.
- Keep the React/MUI UI, `Mosaic.ts` domain model, canvas rendering, Jimp-based image import, and pdfkit/pdf-merger-js PDF export entirely unchanged; only the native bridge layer changes.
- Replace `electron-forge` build/package tooling (`forge.config.ts`, webpack configs) with Tauri's build tooling (`tauri.conf.json`, Cargo scaffold) for this spike, without committing to removing the Electron tooling from the repo until the spike's outcome is evaluated.
- Verify the ported app renders the mosaic chart canvas correctly on Windows, macOS, and Linux — with particular attention to WebKitGTK on Linux, which is the platform webview most likely to diverge from Chromium's rendering.
- Explicitly **out of scope**: rewriting the image-import pipeline (`getImageData` in `dialogs.ts`) as a native Rust module. That is a distinct, separable follow-up to consider only after this shell spike proves viable — tracked as a future idea, not part of this change.

## Capabilities

No capability specs are created or modified — see `skip_specs: true` in `.openspec.yaml`. This change is a build/tooling spike; the app's observable behavior (file save/open/import/export, chart editing, PDF export) is intended to remain identical to the current Electron version. If the spike reveals a genuine behavior change (e.g., a capability the chosen webview can't support), that should be captured as a follow-up change once known.

## Impact

- **Affected code**: `Deiussum.PatternMaker.ElectronReact/src/index.ts`, `src/preload.ts`, `src/dialogs.ts` (native-facing portions only), `forge.config.ts`, `package.json` (dependencies/scripts), webpack config files.
- **Unaffected**: `src/Mosaic.ts`, `src/app.tsx`, all editor UI components (`MosaicEditor.tsx`, `NewMosaicForm.tsx`, `ExportDialog.tsx`, etc.), `ExportOptions.ts`, the JSON save format, and the PDF export logic in `dialogs.ts` other than its file-writing calls.
- **New build dependency**: a Rust toolchain becomes required to build the app (even though this spike writes no custom Rust code), which is a new requirement for anyone building from source — relevant given the upcoming open-source release and its contributor experience.
- **Reversible**: if the spike reveals rendering or tooling problems, the existing Electron setup is untouched in git history and can remain the shipped foundation.
