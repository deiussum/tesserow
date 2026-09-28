## Why

Tesserow still ships Tauri's default placeholder icon (the yellow/cyan rings) in every installer, the Flatpak, and the window/taskbar. It's the first thing a user sees and it says nothing about the app. The chosen replacement is a navy and amber diamond drawn as a mosaic crochet chart (direction "1c" from exploration): a solid centre diamond inside one ring, on striped navy rows, using the app's existing theme colours (`#05405c` navy, `#f2b544` amber). Exploration showed that small sizes decide whether an icon reads, and that versions drawn with one chart cell per pixel at 16 and 32 px stay crisp where downscaled ones blur. So the small sizes are part of this change, not an afterthought.

## What Changes

- Replace the placeholder icon set in `src-tauri/icons/` with the Tesserow diamond icon: PNGs, Windows `.ico`, macOS `.icns`, and the Windows Store `Square*Logo` files `tauri icon` generates.
- Define the icon once, as a 16×16 cell grid in a committed source file, and render it with a script:
  - a detailed 1024 px master (chart grid lines and double-crochet X marks) for large sizes;
  - small sizes (16, 24, 32, 48 px) drawn one cell per whole pixel, without grid or X marks, so they stay sharp.
- Add an npm script that regenerates every icon file from that source in one command, so the icon can be changed later without hand-editing binaries.
- Install the new small sizes (16/24/48 px) in the Flatpak's hicolor theme alongside the existing 32/128/256/512 px.
- Add a sample chart, `Resources/Samples/diamond.json`: the stepped, workable version of the icon's diamond, which opens in Tesserow and follows the mosaic crochet construction rules. The icon itself is a stylised mark and is not a workable chart; the sample is what the motif looks like crocheted.

Out of scope: a different large-size "blanket" icon variant; using the icon or the zigzag/ripple pattern elsewhere in the UI (Home screen, Help/About); a dev-server favicon; macOS-specific icon insets (macOS builds are still out of scope); bundling the sample chart into installers or adding UI to open it; the untracked `Resources/Images/Icon.xcf` "T" draft (the maintainer keeps or deletes it).

## Capabilities

### New Capabilities
- `app-icon`: Tesserow's application icon: that it replaces the placeholder everywhere the app is shown, stays legible at small sizes, can be regenerated from its committed source, and has a companion sample chart that is a valid mosaic pattern.

### Modified Capabilities
None. `release-builds` already requires the Flatpak to install the Tesserow icon in the hicolor theme; adding more sizes doesn't change that requirement.

## Impact

- **Replaced files**: everything in `src-tauri/icons/` (same file names, so `tauri.conf.json`'s `bundle.icon` list is unchanged).
- **New files**: the icon source and render script (e.g. `Resources/Icon/`), the generated hand-tuned small PNGs, `Resources/Samples/diamond.json`, and a unit test that checks the sample chart against the mosaic rules.
- **Modified files**: `flatpak/com.deiussum.tesserow.yml` (install 16/24/48 px icons), `package.json` (an `icon` npm script), and `README.md`/`AGENTS.md` (how to regenerate the icon).
- **Dependencies**: none new. The render script uses Jimp, which is already a dependency, plus the Tauri CLI's `tauri icon` command for `.icns`/`Square*Logo`.
- **No changes to**: application behaviour, `src/` UI code, or the release workflow (CI picks up the new icon files automatically).
