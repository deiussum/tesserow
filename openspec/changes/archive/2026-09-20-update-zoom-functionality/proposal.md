## Why

Zoom today is a pair of top-bar buttons that step scale by a fixed 10% with no floor or ceiling, no way to jump back to 100%, and no input method besides clicking the buttons. Users working on larger charts want faster, finer-grained control (scroll/keyboard) and a guarantee the chart can't be zoomed into an unusable state. The zoom percentage is already shown in the status bar, so consolidating the controls there removes the split between "readout in the status bar, controls in the top bar."

## What Changes

- **BREAKING (UI)**: Remove the "Zoom In" / "Zoom Out" buttons from the top bar.
- Add zoom controls (zoom in, zoom out, reset) to the status bar, next to the existing zoom percentage readout.
- Clamp zoom to a fixed range (25%–400%); zoom in/out/scroll/keyboard actions that would exceed the range instead stop at the nearest bound.
- Add a reset control that returns zoom to 100%.
- Support mouse scroll / trackpad zoom: holding Ctrl (Cmd on macOS) while scrolling over the chart canvas zooms in/out, respecting the same clamped range.
- Support keyboard shortcuts while the editor is focused: Ctrl/Cmd `+` zooms in, Ctrl/Cmd `-` zooms out, Ctrl/Cmd `0` resets to 100%.
- Make the status bar's zoom percentage clickable, opening a menu of common presets (25%, 50%, 75%, 100%, 150%, 200%, 300%, 400%) to jump to directly.
- Fix the written pattern panel overlapping the status bar so the status bar (including its new zoom controls) stays visible and usable while the panel is open.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `app-shell`: the top bar's mosaic-open action set no longer includes zoom controls.
- `mosaic-editor`: the "chart is rendered on a zoomable canvas" requirement is replaced with zoom controls living in the status bar, a clamped zoom range, a reset-to-100% control, scroll/trackpad zoom, and keyboard shortcuts.

## Impact

- `src/AppShell.tsx` — remove the Zoom In/Out buttons and their props from the mosaic-open action set; add a `statusBar` prop and render it as a fixed-height row below `.body` instead of letting it float as a viewport-fixed overlay.
- `src/StatusBar.tsx` — add zoom in/out/reset controls alongside the existing zoom text; make the zoom text clickable to open a preset menu; drop `position: fixed`/`width: 100%` now that `AppShell` places it.
- `src/app.tsx` — move zoom state/handlers to feed the status bar instead of the top bar; add clamping, reset, scroll, keyboard-shortcut, and preset-selection logic; pass `StatusBar` to `AppShell` via the new `statusBar` prop instead of rendering it inside the content pane.
- `src/MosaicEditor.tsx` / `src/Mosaic.ts` — no change to draw/scale mechanics, only to how zoom level changes are triggered and bounded.
