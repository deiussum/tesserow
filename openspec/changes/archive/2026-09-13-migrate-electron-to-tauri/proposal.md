## Why

The `spike-tauri-shell-port` spike (archived at `openspec/changes/archive/2026-09-12-spike-tauri-shell-port/`) proved out a working Tauri port of ElectronReact's native shell: every piece of functionality (save/load, image import, chart-only and merged PDF export) works, and on Linux the chart itself renders pixel-identical to the existing Electron build. The user has reviewed the spike's code and decided to proceed with Tauri as the app's real foundation, ahead of the planned open-source release, primarily to shed Electron's install-size reputation and because the user wants to build more with Rust. All of that work currently sits uncommitted, side-by-side with the untouched Electron tooling, on branch `spike/tauri-shell-port` - it isn't shippable yet because Electron is still the actual entry point (`package.json`'s `main` still points at `.webpack/main`) and nothing has been verified on Windows or macOS.

## What Changes

- Make the Tauri build the app's actual shipped foundation: fold `src/renderer.tauri.ts` and `src/tauri-bridge.ts` into the primary entry points (replacing `src/renderer.ts`/`src/preload.ts`'s role), and make `src-tauri/` the thing `npm run package`/`make`-equivalent commands build.
- **BREAKING** (for anyone building from source): remove the Electron/electron-forge/webpack tooling (`forge.config.ts`, `webpack.*.config.ts`, `src/index.ts`, `src/preload.ts`, `src/renderer.ts`, the `electron`/`electron-squirrel-startup`/`@electron-forge/*` dependencies) once Tauri has reached confirmed parity - see the Windows/macOS gate below. Building the app now requires a Rust toolchain (and WebKitGTK dev headers on Linux) in addition to Node.
- Set up Tauri's packaging (`tauri build`, its bundler targets) to produce installers for Windows, macOS, and Linux, replacing electron-forge's `MakerSquirrel`/`MakerZIP`/`MakerRpm`/`MakerDeb`.
- Clean up the spike's rough edges: gitignore `dist/` (Vite's build output), resolve the unexpected `yarn.lock` diff from the spike session, and give the app a real icon set (the spike still has Tauri's default placeholder icons).
- Update `CLAUDE.md`'s "ElectronReact architecture" section to describe the Tauri-based structure once the migration lands.
- **Explicit gate, not assumed away**: Windows and macOS were never verified in the spike (only Linux). This change's tasks include verifying both before the Electron tooling is actually removed - if either platform reveals a real gap, that's a blocker for finishing this migration, not something to route around silently.
- Still out of scope, per the original exploration: rewriting any logic (e.g. image import) as a native Rust module. That remains a possible separate future change.

## Capabilities

No capability specs are created or modified — see `skip_specs: true` in `.openspec.yaml`. Like the spike it builds on, this change's entire premise is that the app's observable behavior (file save/open/import/export, chart editing, PDF export, cross-platform installers) stays identical; only the underlying framework changes. `openspec/specs/` has no existing capability specs to delta against, and this change isn't the right place to introduce one for the first time either, since its explicit goal is "no behavior change." If Windows/macOS verification (see above) surfaces a real, unavoidable behavior difference, that should be captured as its own follow-up rather than folded in here.

## Impact

- **Removed**: `forge.config.ts`, `webpack.main.config.ts`, `webpack.renderer.config.ts`, `webpack.rules.ts`, `webpack.plugins.ts`, `src/index.ts`, `src/preload.ts`, `src/renderer.ts`, and the `electron`, `electron-squirrel-startup`, `@electron-forge/*`, `@vercel/webpack-asset-relocator-loader`, `node-loader`, `ts-loader`, `css-loader`, `style-loader`, `url-loader`, `fork-ts-checker-webpack-plugin` dependencies (once the Windows/macOS gate clears).
- **Kept/renamed**: `src/tauri-bridge.ts` and `src/renderer.tauri.ts` become the primary bridge/entry point (likely renamed to drop the `tauri` qualifier once there's no Electron alternative to distinguish from); `src-tauri/`, `vite.config.ts`, and the root `index.html` become the primary build tooling.
- **Unaffected**: `src/Mosaic.ts`, `src/app.tsx`, all editor UI components, `ExportOptions.tsx`, and the JSON save format - none of these were touched by the spike and none need to change here either.
- **Build/contributor impact**: a Rust toolchain becomes a hard requirement to build the app at all, relevant given the upcoming open-source release's contributor experience (already flagged as a known trade-off in the spike's `design.md`).
- **New risk this change must resolve before completion**: Windows and macOS parity is currently unverified. This is a real dependency of "done," not a footnote.
