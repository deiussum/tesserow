## 1. Flatten repository structure

- [x] 1.1 `git mv` every file/directory under `Deiussum.PatternMaker.ElectronReact/` (`src/`, `src-tauri/`, `index.html`, `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, and any other tracked files) up to the repo root, then remove the now-empty `Deiussum.PatternMaker.ElectronReact/` directory; verify with `git status` that moved files show as renames, not delete+add pairs
- [x] 1.2 Move the untracked `node_modules/` and `dist/` directories (or just regenerate them post-move) so the app is runnable from the new root

## 2. Rebrand app identity

- [x] 2.1 In `package.json` (now at repo root): set `name` to `tesserow`, `productName` to `Tesserow`, and update `description`; verify by reading the file back
- [x] 2.2 In `src-tauri/tauri.conf.json`: set `productName` to `Tesserow`, `identifier` to `com.deiussum.tesserow`, and the window `title` to `Tesserow`; verify by reading the file back

## 3. Update documentation

- [x] 3.1 Rewrite `README.md`: new project name, updated description, and correct the stale "written using Electron and React" line to describe the current Tauri + React stack; verify by reading the file back
- [x] 3.2 Update `CLAUDE.md`: replace `Deiussum.PatternMaker.ElectronReact/` directory references with the flattened root-level layout throughout (Project overview, Commands, ElectronReact architecture sections); verify by reading the file back and confirming no stale directory-path references remain (`grep -n "ElectronReact" CLAUDE.md` returns nothing)

## 4. Verify the flattened app builds and runs

- [x] 4.1 From the repo root, run `npm install` and verify it completes without errors
- [x] 4.2 Run `npm start` and verify the Tauri window opens with the title "Tesserow"
  - Verified via config (`tauri.conf.json` `title`/`productName` = "Tesserow", confirmed in task 2.2) and process launch (`Finished \`dev\` profile`, `Running \`target/debug/app\``) rather than visual confirmation, per user decision — the dev-server webview UI doesn't render due to a pre-existing, unrelated Vite/MUI dependency-optimizer bug; see blocker note at the end of this file. Out of scope for this change.
- [x] 4.3 Run `npm run lint` and verify it passes
  - Does NOT pass as-is: 31 errors / 55 warnings, per user decision recorded as pre-existing and out of scope for this change; see lint note at the end of this file
- [x] 4.4 Run `npm run package` and verify the build completes successfully
  - Vite build succeeded (`✓ built in 717ms`), Cargo release build succeeded (`Finished \`release\` profile [optimized]`), binary produced at `src-tauri/target/release/app`

## 5. Commit and push local changes

- [ ] 5.1 Commit the flatten + rebrand + doc changes (still pushing to the existing `origin` URL, which continues to work until the Forgejo-side rename happens) and push; verify with `git log`/`git status` that the push succeeded and the working tree is clean

## 6. Rename the Forgejo repository (manual, server-side)

- [ ] 6.1 Rename the repository on Forgejo from `Deiussum.PatternMaker` to `tesserow` (done manually by the user via the Forgejo UI)
- [ ] 6.2 Run `git remote set-url origin <new-forgejo-url>` locally and verify with `git fetch` that the remote resolves correctly

## Blocker note (task 4.2)

`npm start` compiles and launches the Tauri window process successfully (`Finished \`dev\` profile`, `Running \`target/debug/app\``), but the webview's Vite dev session then hits a reproducible error before the UI can render:

```
[vite] (client) dependency optimized: vite-plugin-node-polyfills/shims/buffer
[vite] (client) optimized dependencies changed. reloading
[vite] (client) Pre-transform error: The file does not exist at
  ".../node_modules/.vite/deps/createSvgIcon-C4qvo7V2.js" which is in the
  optimize deps directory. The dependency might be incompatible with the
  dep optimizer. Try adding it to `optimizeDeps.exclude`.
```

Reproduced twice: once against a fresh `npm install` after the flatten, and again after clearing `node_modules/.vite` and restarting (second time the Rust side rebuilt in 2.36s from warm cache, ruling out a stale Cargo artifact as the cause). Root cause looks like Vite's dependency crawler missing an `@mui/icons-material` icon import (`createSvgIcon`) during its initial cold-start scan, then re-optimizing mid-session and racing the webview's in-flight module request — a known category of Vite+MUI issue, unrelated to the rename itself (no `vite.config.ts`, dependency, or icon-import code changed by this change).

This is likely latent, not new: `node_modules` on this machine had presumably been warm/long-lived until this change deleted and regenerated it (task 1.2), so this may be the first *truly cold* `npm install` + `npm start` in a while — meaning any fresh clone (exactly the scenario an open-source release puts this repo into) would likely hit the same thing, independent of the rename.

Not fixed as part of this change — fixing it would mean editing `vite.config.ts` (e.g. `optimizeDeps.include`/`exclude`), which is scope beyond what proposal.md/design.md describe. Flagging for a decision rather than silently expanding scope.

## Lint note (task 4.3)

`npm run lint` fails with 31 errors / 55 warnings across many files (`Mosaic.ts`, `app.tsx`, `dialogs-bridge.ts`, `ExportDialog.tsx`, `HelpDialog.tsx`, `ImagePreviewDialog.tsx`, `MosaicEditor.tsx`, `NewMosaicForm.tsx`, `FileSelector.tsx`, `StatusBar.tsx`). Confirmed pre-existing and unrelated to this change:

- The vast majority (code style: `no-var`, `prefer-const`, unnecessary semicolons, `@typescript-eslint/no-explicit-any`, unused vars) are generic pre-existing debt scattered across files this change never touched.
- The two `vite.config.ts` errors (`Unable to resolve path to module 'vite'`/`'@vitejs/plugin-react'`) are not location-related: both packages resolve fine directly (`node_modules/vite/package.json`, `node_modules/@vitejs/plugin-react/package.json` both present), and `eslint-plugin-import`'s Node-resolution logic (old `eslint-import-resolver-node`) doesn't fully understand Vite's modern `package.json` `exports` map — a dependency-version mismatch that would fail identically regardless of where `vite.config.ts` sits in the tree.

Per user decision, this is recorded as a known pre-existing issue rather than fixed here. A lint-cleanup pass (and possibly an `eslint`/`eslint-plugin-import` upgrade) is a separate change.
