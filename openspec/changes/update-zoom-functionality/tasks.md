## 1. Fix written pattern panel covering the status bar

- [ ] 1.1 Add a `statusBar` prop to `AppShell` in `src/AppShell.tsx` and render it as a fixed-height row below `.body` (a new sibling row in `.shell`, only when `props.mosaicOpen`), updating `AppShell.module.css` so `.shell` is a three-row flex column; verify the pattern panel's `Drawer` no longer extends behind where the status bar renders
- [ ] 1.2 Remove `position: fixed`/`bottom`/`width: 100%` from `StatusBar.tsx`'s styles now that `AppShell` places it in normal flow; verify `npm run lint` passes
- [ ] 1.3 Update `src/app.tsx` to pass `<StatusBar .../>` via the new `AppShell` `statusBar` prop instead of rendering it as a child alongside `<MosaicEditor>`; verify the status bar sits fully visible below the canvas both with the pattern panel open and closed

## 2. Status bar zoom controls

- [ ] 2.1 Add `onZoomIn`/`onZoomOut`/`onZoomReset` optional props to `StatusBarProps` in `src/StatusBar.tsx` and render zoom-in/zoom-out/reset buttons next to the zoom text only when provided; verify `npm run lint` passes and the status bar renders unchanged when the props are omitted (e.g. on the no-mosaic screen)
- [ ] 2.2 Remove the "Zoom In"/"Zoom Out" buttons and their props from `AppShell.tsx`'s mosaic-open action set; verify the top bar no longer shows zoom controls when a mosaic is open
- [ ] 2.3 Wire `src/app.tsx`'s zoom handlers to the new `StatusBar` props instead of `AppShell`; verify clicking the status bar's zoom-in/zoom-out buttons redraws the chart and updates "Zoom: N%" as before
- [ ] 2.4 Make the zoom percentage text in `StatusBar.tsx` clickable, opening an MUI `Menu` populated from a shared `ZOOM_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0]` constant, with selection routed through `setZoom`; verify clicking a preset sets that exact zoom level, updates the displayed percentage, and closes the menu, and that clicking outside the menu closes it without changing zoom

## 3. Clamped zoom range and reset

- [ ] 3.1 Add a single `setZoom(next: number)` helper in `src/app.tsx` that clamps to `[0.25, 4.0]` before updating `zoomLevel`/`zoomString`, and route the existing zoom-in/zoom-out handlers through it; verify clicking zoom-in repeatedly stops redrawing past 400% and zoom-out stops past 25%
- [ ] 3.2 Add a reset handler that calls `setZoom(1.0)` and wire it to the status bar's reset button; verify clicking reset from any zoom level returns the chart to 100% and the status bar shows "Zoom: 100%"

## 4. Scroll-wheel zoom

- [ ] 4.1 Add a `wheel` listener on the `#mosaic-canvas` element in `MosaicEditor.tsx` (registered with `{ passive: false }`) that calls `preventDefault()` and adjusts zoom by a 2% step per event only when Ctrl (Cmd on macOS) is held, routed through `setZoom`; verify Ctrl+scroll over the canvas zooms in/out and plain scroll does nothing
- [ ] 4.2 Manually verify on Linux (WebKitGTK, via `npm start`) that Ctrl+scroll over the canvas does not trigger the webview's native page zoom; note the result in the PR description, and if unreliable, flag it before merging per design.md's fallback note

## 5. Keyboard zoom shortcuts

- [ ] 5.1 Add a `keydown` listener scoped to when the editor is mounted in `src/app.tsx` that intercepts Ctrl/Cmd `+`, Ctrl/Cmd `-`, and Ctrl/Cmd `0`, calls `preventDefault()`, and calls the zoom-in/zoom-out/reset handlers respectively; verify each shortcut redraws the chart and updates the displayed percentage
- [ ] 5.2 Verify the listener is removed when the editor unmounts (e.g. closing the mosaic) so the shortcuts don't fire on the home screen

## 6. Spec sync check

- [ ] 6.1 Manually walk through every scenario in `specs/mosaic-editor/spec.md` and `specs/app-shell/spec.md` in the running app (`npm start`) and confirm each passes as written, including the status-bar-stays-visible and preset-menu scenarios
