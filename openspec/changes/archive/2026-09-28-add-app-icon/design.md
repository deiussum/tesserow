## Context

- `src-tauri/icons/` holds the Tauri template's placeholder set: `32x32.png`, `128x128.png`, `128x128@2x.png` (256 px), `icon.png` (512 px), `icon.ico`, `icon.icns`, and the Windows Store `Square*Logo.png`/`StoreLogo.png`. `tauri.conf.json`'s `bundle.icon` lists `32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.icns`, and `icon.ico`. The Linux bundles use the listed PNGs, Windows uses `icon.ico`, and the default window icon comes from the same set at build time.
- The Flatpak manifest (`flatpak/com.deiussum.tesserow.yml`) installs `32x32.png`, `128x128.png`, `128x128@2x.png` and `icon.png` as hicolor 32/128/256/512 px.
- `npx tauri icon <source>` generates the full set, including `.ico`/`.icns`, from one square PNG. It downsamples every size from that source, which is what blurs a pixel-grid design at small sizes. It also writes `android/` and `ios/` folders, which this project doesn't use.
- Mosaic rules, as implemented in `MosaicCell.canToggleColor`/`toggleColor` (`src/Mosaic.ts`): rows alternate colour, numbered from the bottom. A cell can show the other colour only when the cell below is in its own row's colour and the cell above isn't already pulled. The first and last row and column can never change. The design direction chosen in exploration (1c) breaks these rules along its diagonal edges, so the icon can't also be the sample chart (see D4).

## Goals / Non-Goals

**Goals:**
- One committed, human-editable definition of the icon, and one command that regenerates every icon file from it, reproducibly.
- Small sizes are drawn on whole pixels, one cell per pixel at 16 px; large sizes keep the chart detail.
- No new dependencies; no changes to app code.

**Non-Goals:**
- Design exploration beyond 1c: the large-size "blanket" variant, and using the ripple or icon in the UI.
- macOS icon conventions (the inset squircle template), since macOS builds are out of scope.
- Android/iOS icons.
- Any in-app way to open the sample chart (File > Open is enough).

## Decisions

### D1: The source is a text grid
`Resources/Icon/icon-grid.txt` is a 16-line, 16-character grid (`#` = amber motif cell, `.` = navy background). Palette and styling constants (navy `#05405c` / lighter row shade `#0a5478`, amber `#f2b544` / darker X-mark `#c48a22`, corner radius) live at the top of the render script, matching `src/theme.ts`'s navy and amber.
- *Why text rather than XCF/SVG:* the design is literally a 16×16 cell grid. As text it's diffable, reviewable in a PR, and editable without GIMP, and the renderer turns it into both the detailed and the pixel-exact versions. An XCF would need the small sizes redrawn by hand whenever the design changes.
- *Why not the chart JSON:* the icon isn't a valid mosaic chart (see Context), and Tesserow's save format carries stitch types and row metadata the icon doesn't need.

### D2: Render script, `scripts/render-icon.mjs` (Node + Jimp), exposed as `npm run icon`
Steps:
1. Parse the grid.
2. Render the **1024 px master** into `Resources/Icon/icon-1024.png`: cells drawn with alternating row shades, X marks on motif cells, thin grid lines, and a rounded-square mask (radius ≈ 16% of the width) with transparent corners.
3. Render the **pixel-exact small sizes**: 16 px at one pixel per cell (corner pixels transparent); 32 px at 2×2; 48 px at 3×3; and 24 px as the 16 px art scaled 1× and centred with a 4 px transparent margin (1.5 px per cell would blur). Output goes to `Resources/Icon/icon-{16,24,32,48}.png`. Pixel-exact renders keep the alternating row shading but drop the grid lines and X marks (exploration showed those turn to haze below about 64 px), matching the approved small-size mockups. The rounded corners use a hard-edged version of the same mask, so at 16 px only the four corner pixels are transparent.
4. Run `npx tauri icon Resources/Icon/icon-1024.png -o <temp dir>` and copy only the files the project already has (`128x128.png`, `128x128@2x.png`, `icon.png`, `icon.icns`, `Square*Logo.png`, `StoreLogo.png`) into `src-tauri/icons/`. The `android/`/`ios/` output is dropped.
5. Overwrite `src-tauri/icons/32x32.png` with the pixel-exact 32 px render.
6. Write `src-tauri/icons/icon.ico` itself, as PNG-in-ICO entries: pixel-exact 16/24/32/48 px, plus 64 and 256 px downsampled from the master. ICO is a 6-byte header plus 16-byte directory entries followed by the PNG blobs, which takes a few lines of code.
- *Why Jimp:* it's already a dependency (image import), it does pixel-level drawing and resizing and writes PNG, and it runs in Node. Pillow would add a Python dependency to a Node project.
- *Alternative, a fully hand-drawn icon set:* rejected, because every future change would have to be redone at every size.

### D3: Flatpak gets the extra hicolor sizes
The manifest installs `Resources/Icon/icon-16.png`, `icon-24.png` and `icon-48.png` as hicolor 16/24/48 px, next to the existing 32/128/256/512 px. `Resources/Icon/` isn't in the manifest's `skip:` list, so the files are available in the sandbox build.

### D4: The sample chart is a separate, valid design
`Resources/Samples/diamond.json` is a 17×17 Tesserow chart of the stepped "wider ring" diamond from exploration (diamond-distance bands 0–2 and 5–7), with every vertical run of amber snapped so it starts and ends on an amber row (an even offset from the centre row), inside the fixed striped outer ring. It's generated through the domain model itself, starting from a blank chart and calling `toggleColor()` on the target cells from the bottom row up, then taking `getSaveData()`. That way the colour and stitch-type fields are exactly what the editor would produce, rather than hand-written JSON. The generator is a Vitest test (`src/samples.test.ts`) that:
- builds the chart this way and asserts it matches the committed `diamond.json`. When the `UPDATE_SAMPLES=1` environment variable is set, it writes the file instead. Vitest already resolves `src/Mosaic.ts` with the right environment, so no TS runner has to be added;
- independently loads the committed JSON and checks every cell against the mosaic rules. This covers the spec's "obeys the mosaic rules" scenario.
- *Alternative, a hand-written JSON:* rejected, because the `type` (SC/DC) field of each cell depends on toggles in the row below and is easy to get wrong.

### D5: Where files live
- `Resources/Icon/`: `icon-grid.txt` (source), `icon-1024.png` and `icon-{16,24,32,48}.png` (generated, committed so the Flatpak and bundler don't need to run the script).
- `scripts/render-icon.mjs`: the generator, the repo's first `scripts/` entry.
- `Resources/Samples/diamond.json`: the sample.
- The maintainer's untracked `Resources/Images/Icon.xcf` draft isn't touched.

## Risks / Trade-offs

- [`tauri icon` output isn't byte-identical between runs, which would break the "regenerating reproduces the committed icons" requirement] → Checked during implementation: its PNGs are deterministic, but it writes `.icns` entries in a different order on each run (the entries' bytes are identical). The script sorts the `.icns` entries into a fixed order after copying, which ICNS allows because there's no `TOC ` entry (the script refuses if one appears). With that, regeneration is byte-for-byte reproducible and the spec needs no exception.
- [Jimp's downsampling of the master to 64–512 px looks softer than Pillow's LANCZOS did in the mockups] → The sizes that matter for sharpness are pixel-exact anyway. If 64/128 px look muddy, render those directly at size with the detailed renderer instead of downsampling.
- [The window icon picks an unexpected size on some desktop environments] → Visual check on Linux (niri/GNOME) and Windows is a task. The files keep their names, so Tauri's selection logic doesn't change.
- [The icon and the sample chart diverge if someone edits one] → That's accepted: they're related but deliberately different. The sample's test only enforces mosaic validity, not resemblance.
- [ICO written by hand is malformed] → Validate by opening it in the Windows installer build (CI) and checking with `file`/ImageMagick `identify` locally.

## Migration Plan

Additive except for the replaced binaries in `src-tauri/icons/`. Rollback means restoring the previous files from git. The next release built by CI carries the new icon; no release process changes.

## Open Questions

- Whether the Home screen or Help dialog should show the icon or the ripple pattern. Deferred to a UI change, and doesn't affect this one.
