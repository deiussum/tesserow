## 1. Icon source and renderer

- [x] 1.1 Add `Resources/Icon/icon-grid.txt` with the 16×16 "1c" grid (solid-centre diamond: diamond distance ≤ 3 or 6–7 from the centre) and verify it has 16 lines of 16 `#`/`.` characters that match the exploration mockup.
- [x] 1.2 Add `scripts/render-icon.mjs` (Jimp) that renders the 1024 px master to `Resources/Icon/icon-1024.png` per design D2 step 2, and verify by viewing it that it matches the 1c mockup (row shading, X marks, grid, rounded transparent corners).
- [x] 1.3 Add the pixel-exact renders `Resources/Icon/icon-{16,24,32,48}.png` per D2 step 3, and verify with a quick script or `magick` that the 16 px file is 16×16 with every pixel either transparent (the corners only) or exactly a palette colour, matching the grid one to one.
- [x] 1.4 Wire D2 steps 4–6: run `tauri icon` into a temp dir, copy only the kept files into `src-tauri/icons/`, overwrite `32x32.png`, and write `icon.ico` with pixel-exact 16/24/32/48 px entries plus 64/256 px. Verify `magick identify src-tauri/icons/icon.ico` lists all six sizes, and that no `android/` or `ios/` folders appear under `src-tauri/icons/`.
- [x] 1.5 Add `"icon": "node scripts/render-icon.mjs"` to `package.json` (keeping its CRLF line endings), run `npm run icon` twice, and verify the second run leaves `git status` clean. If `tauri icon` output isn't deterministic, apply the fallback in design Risks and update the spec scenario.

## 2. Packaging

- [x] 2.1 Add hicolor 16/24/48 px installs from `Resources/Icon/` to `flatpak/com.deiussum.tesserow.yml`, run `npm run flatpak`, install the bundle, and verify `~/.local/share/flatpak/app/com.deiussum.tesserow/current/active/export/share/icons/hicolor/` has 16, 24, 32, 48, 128, 256 and 512 px icons.
- [x] 2.2 Verify on Linux that the Flatpak's launcher entry and running window show the diamond icon (not the Tauri rings), and that `npm start` shows it as the window icon.
- [ ] 2.3 On the PR, verify the CI release jobs pass, then (maintainer, on Windows) install the CI-built `-setup.exe` and check that the Start menu entry, the executable and the taskbar show the diamond icon.

## 3. Sample chart

- [x] 3.1 Add `src/samples.test.ts` that builds the 17×17 stepped "wider ring" diamond (bands 0–2 and 5–7, per design D4) through the domain model (`initialize` + `toggleColor()` bottom-up) and, with `UPDATE_SAMPLES=1`, writes `Resources/Samples/diamond.json`. Run it once in write mode and verify the file is created.
- [x] 3.2 In the same test, assert that the built chart equals the committed `diamond.json`, and that every cell of the loaded JSON obeys the mosaic rules (a non-row-colour cell has a row-colour cell of its colour directly below and above, and no edge cell differs from its row colour). Verify the test passes, and that it fails if one cell in the JSON is hand-edited to break a rule.
- [x] 3.3 Open `Resources/Samples/diamond.json` in the running app and verify the chart shows the stepped diamond, the written pattern panel shows row instructions, and PDF export succeeds.

## 4. Docs and checks

- [x] 4.1 Document `npm run icon` in `AGENTS.md` (Commands) and add a short "Icon" note to `README.md` (source: `Resources/Icon/icon-grid.txt`; the sample chart lives in `Resources/Samples/`). Verify the commands shown match `package.json`.
- [x] 4.2 Run `npm run lint`, `npm test` and `openspec validate add-app-icon --strict`, and verify all pass.
