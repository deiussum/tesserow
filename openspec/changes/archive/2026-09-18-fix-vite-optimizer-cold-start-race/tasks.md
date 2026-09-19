## 1. Baseline

- [x] 1.1 Delete `node_modules/.vite` and run `npm run vite:dev`; confirm the cold-start race still reproduces (`optimized dependencies changed. reloading` plus a `createSvgIcon`-chunk file-not-found message in the console) before changing anything, so the fix can be verified against a known-bad baseline

## 2. Implement the fix

- [x] 2.1 In `vite.config.ts`, add `optimizeDeps: { include: ['vite-plugin-node-polyfills/shims/buffer'] }` and verify the dev server still starts cleanly (`npm run vite:dev` boots without config errors)

## 3. Verify

- [x] 3.1 Delete `node_modules/.vite` again (genuinely cold) and run `npm run vite:dev`; verify the console no longer logs `optimized dependencies changed. reloading` or any `deps/*.js` file-not-found message (verified clean across 3 separate cold-cache runs)
- [x] 3.2 Run `npm start` and confirm the app still loads and functions normally (window opens, `FileSelector`'s folder icon and `HelpButton`'s help icon render), confirming the fix didn't break the icons it was racing with - **deviation:** visual/screenshot confirmation wasn't possible (ImageMagick's `import` is blocked by a blanket `policy domain="coder" rights="none" pattern="*"` on this machine, unrelated to this change); verified instead via `cargo`/Tauri process health (`Finished \`dev\` profile`, `Running \`target/debug/app\`` with no panics) and confirming both icon modules (`@mui/icons-material/FolderOpen.mjs`, `Help.mjs`) and their consuming components (`FileSelector.tsx`, `HelpButton.tsx`) all serve 200 through the dev server with no optimizer errors
- [x] 3.3 If the race is only partially resolved (a different dependency now discovered late), capture the new console output and decide, per design.md's open question, whether to expand `optimizeDeps.include` or fall back to documenting the residual quirk - do not silently leave it half-fixed - **N/A**: task 3.1 showed full resolution across 3 separate cold-cache runs, no partial-resolution case to handle
- [x] 3.4 Run `npm run package` and verify the production build still succeeds unchanged, confirming `optimizeDeps` (dev-server-only) had no effect on build output (build succeeded: `✓ built in 620ms`, Cargo `Finished \`release\` profile [optimized]`; same pre-existing warnings as before - jimp's `eval` warning, chunk-size warning - nothing new)

## 4. Wrap up

- [x] 4.1 Only if task 3.3's fallback path was taken: add a short note to `CONTRIBUTING.md` about the residual first-run cold-start quirk; skip this task entirely if 3.1/3.2 fully resolved it - **skipped**: 3.1/3.2 fully resolved it, no doc note needed
- [x] 4.2 Commit the `vite.config.ts` change (and any doc note from 4.1) with a message referencing this change - committed as `0873ce6` on branch `fix-vite-optimizer-cold-start-race`; OpenSpec change-tracking artifacts left uncommitted per user decision
