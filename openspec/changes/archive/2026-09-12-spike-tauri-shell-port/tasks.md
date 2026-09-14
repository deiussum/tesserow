## 1. Spike setup

- [x] 1.1 Create a new branch off `main` for the spike; leave `Deiussum.PatternMaker.ElectronReact`'s Electron tooling untouched
- [x] 1.2 Scaffold a Tauri project pointed at the existing React/webpack (or Vite, if switching bundlers proves easier) frontend build output, and verify `tauri dev` launches the current UI unmodified
- [x] 1.3 Add `@tauri-apps/plugin-dialog` and `@tauri-apps/plugin-fs`, and verify the app builds with them registered

## 2. Port the native bridge

- [x] 2.1 Replace `window.dialogs.getFileName`/`open`/`save` calls with `@tauri-apps/plugin-dialog` + `@tauri-apps/plugin-fs` equivalents, and verify opening/saving a `.json` mosaic project round-trips correctly (verified manually by the user: saved in Tauri, loaded correctly in the Electron build)
- [x] 2.2 Replace the image `import`/`resize` native calls (`Jimp.read` from a file path) with the ported equivalent reading via the `fs` plugin, and verify importing a `.png`/`.jpg` produces the same luminance data as the current Electron build for a known test image (verified manually by the user: Import Image worked)
- [x] 2.3 Configure Tauri `capabilities` (permission allowlist) for dialog/fs access matching the app's actual usage (arbitrary user-chosen file paths for save/open/import/export), and verify no permission errors occur during normal use (found: `fs:allow-read-file`/`allow-write-file` don't cover the `readTextFile`/`writeTextFile` commands `open`/`save` use - added dedicated `fs:allow-read-text-file`/`allow-write-text-file` permissions; verified manually by the user after the fix)

## 3. Adapt PDF export

- [x] 3.1 Change `pdfkit` usage from piping to `fs.createWriteStream` to generating an in-memory buffer (e.g. via `blob-stream`), then writing it with the `fs` plugin, and verify a chart-only PDF export opens correctly and matches the current Electron output (verified manually by the user: chart-only export worked)
- [x] 3.2 Verify whether `pdf-merger-js` works unmodified for the "merge with additional cover PDF" export option; if it fails in the webview context, replace that step with direct `pdf-lib` calls, and verify the merged PDF's page order and content match the current Electron output (confirmed `pdf-merger-js` imports `fs/promises` at module load and cannot run in the webview; replaced with direct `pdf-lib` page-copy merge; verified manually by the user: merged export worked)

## 4. Cross-platform rendering verification

- [ ] 4.1 Build and run the ported app on Windows, and visually compare a non-trivial saved chart's rendering (grid lines, row/column number labels, X-stitch markers) against the current Electron build
- [ ] 4.2 Build and run the ported app on macOS, and perform the same visual comparison
- [x] 4.3 Build and run the ported app on Linux (WebKitGTK), and perform the same visual comparison, paying particular attention to HiDPI scaling and font/line rendering differences called out in design.md (verified manually by the user: chart grid, labels, and X-stitch markers rendered identically to Electron; only difference noted was scrollbar styling, which the user preferred on Tauri)

## 5. Spike wrap-up

- [x] 5.1 Write up findings (rendering fidelity results per platform, whether `pdf-merger-js` needed replacing, build/tooling friction encountered, rough Rust-toolchain burden for contributors) and record a go/no-go recommendation on adopting Tauri (see `findings.md`: cautiously positive, Linux verified clean, Windows/macOS deferred)
- [x] 5.2 Decide next step based on findings: archive this change with results noted, or propose a follow-up change to actually migrate the shipped app (decision: archive now with findings.md as the record; revisit as a reopened spike or a fresh migration change once Windows/macOS are tested)
