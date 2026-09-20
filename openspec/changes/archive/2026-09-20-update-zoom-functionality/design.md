## Context

Zoom state (`zoomLevel`, `zoomString`) and its two handlers (`zoomInClicked`/`zoomOutClicked`) currently live in `src/app.tsx` and are wired to buttons rendered by `AppShell.tsx`'s top bar. `StatusBar.tsx` only renders passed-in text (`leftText`/`middleText`/`rightText`) and has no interactive elements or click handlers today. `Mosaic.draw(zoomLevel)` (`src/Mosaic.ts:58`) just multiplies `defaultScale` by whatever `zoomLevel` it's given — it has no awareness of bounds. See `proposal.md` for why this is changing.

`StatusBar` is currently rendered as a child inside `AppShell`'s `.content` pane (`src/app.tsx`, alongside `<MosaicEditor>`), but styled with `position: fixed; bottom: 0; width: 100%` (`src/StatusBar.tsx`). Because the written-pattern `Drawer` is a sibling of `.content` that spans the full height of `.body` (`src/AppShell.tsx`, `AppShell.module.css`), neither reserves room for the fixed status bar, so it overlaps the bottom of the drawer when the pattern panel is open instead of sitting beside it.

## Goals / Non-Goals

**Goals:**
- Move zoom's interactive controls from the top bar to the status bar without changing `Mosaic`'s draw/scale mechanics.
- Centralize the zoom-range clamp in one place so buttons, scroll, and keyboard shortcuts can't disagree on bounds.
- Add scroll and keyboard zoom without interfering with normal page/canvas scrolling or the OS/webview's own shortcut handling.

**Non-Goals:**
- Zoom-to-fit (computing a scale from the canvas's visible area) — the proposal scopes this to a fixed reset-to-100% control, not a fit calculation.
- Changing the 10%-per-step increment size for button clicks or keyboard shortcuts (only scroll gets a separate, finer step — see below).
- Persisting zoom level across editor sessions (out of scope; resets to 100% on open, as today).
- Redesigning the status bar's overall visual style beyond fixing the overlap and adding zoom controls.

## Decisions

**Clamp lives in one helper in `app.tsx`, not in `Mosaic`.** All three input paths (buttons, scroll, keyboard) funnel through the same `setZoom(next: number)` helper that clamps to `[0.25, 4.0]` before calling `setZoomLevel`/`setZoomStringFromZoom`. Alternative considered: push the clamp into `Mosaic.draw()` itself — rejected because `Mosaic` is the plain domain/canvas model (per `AGENTS.md`, independent of React) and the displayed percentage is React state; clamping in one place upstream keeps the state and the rendered percentage always consistent, whereas clamping only inside `draw()` would let `zoomString` show a value the canvas didn't actually apply.

**Scroll zoom listens on the canvas element, not `window`, and only acts when Ctrl/Cmd is held.** The listener is attached (in `MosaicEditor.tsx`, alongside the existing hover/click wiring) directly to `#mosaic-canvas` with `{ passive: false }` so `preventDefault()` can suppress the browser/webview's native page-zoom on Ctrl+scroll. Plain scroll (no modifier) is left alone since the canvas doesn't currently scroll independently of the page. Alternative considered: a global `window` listener gated on "mouse is over the canvas" — rejected as more state to track for no benefit, since the interaction is inherently canvas-scoped.

**Scroll zoom uses a smaller per-tick step (2%) than the button/keyboard step (10%).** Wheel/trackpad events fire many times per gesture; using the 10% button step would make scroll zoom feel extremely coarse. Both steps run through the same clamping helper, so this is purely a step-size choice, not a second code path.

**Keyboard shortcuts are bound while the editor is mounted, via a `keydown` listener in `app.tsx` scoped to when a mosaic is open.** Ctrl/Cmd `+`/`-`/`0` are intercepted with `preventDefault()` before they reach the webview's default handling (relevant on Windows/Linux builds where the host chrome may otherwise treat them as page-zoom shortcuts). The listener is added/removed alongside the existing mount/unmount of the editor view rather than living inside `MosaicEditor.tsx`, since the shortcuts should work regardless of whether the pattern panel or canvas has focus.

**Status bar controls are plain icon buttons next to the existing percentage text, added as new `StatusBarProps` (e.g. `onZoomIn`/`onZoomOut`/`onZoomReset`), rendered only when provided.** This keeps `StatusBar` reusable for contexts with no zoom (e.g. if the no-mosaic state ever used it) without conditional logic inside the component beyond a presence check, matching the existing optional-prop pattern (`leftText`/`middleText`/`rightText` are all optional today).

**The zoom preset menu is an MUI `Menu` anchored to the zoom percentage text, populated from a single `ZOOM_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0, 4.0]` constant whose first and last entries equal the clamp bounds.** Selecting a preset calls the same `setZoom` helper as every other input path, so it can't produce an out-of-range value even though the list's own endpoints already match the bounds. Alternative considered: a `<select>`-style dropdown — rejected in favor of MUI `Menu` for visual consistency with the rest of the app's MUI-based UI (per `AGENTS.md`, the editor's dialogs/panels are MUI-based).

**`AppShell` gains a `statusBar` prop and reserves layout space for it as a fixed-height row below `.body`, replacing `StatusBar`'s `position: fixed`.** `.shell` becomes a three-row flex column (AppBar, `.body` at `flex: 1`, then the status bar row), so `.body` — and the Drawer inside it — naturally shrinks to leave room, and the status bar can never overlap the drawer. The row is only rendered when `props.mosaicOpen`, matching today's conditional mount of `StatusBar`. Alternative considered: give `StatusBar` a higher `z-index` so it paints on top of the drawer — rejected because it would still visually cover the bottom of the drawer's scrollable pattern text/Copy button; reserving layout space avoids any overlap rather than just controlling which element wins it.

## Risks / Trade-offs

- [Ctrl+scroll over the canvas could still trigger OS/webview page zoom if `preventDefault()` isn't reliably called in Tauri's WebKitGTK/WebView2 backends] → Verify manually on Linux (WebKitGTK) and, if available, Windows during implementation; fall back to a non-Ctrl modifier (e.g. plain scroll while hovering the canvas) if Ctrl+scroll proves unreliable to intercept.
- [Moving zoom out of the top bar is a visible UI change existing users will notice] → Called out as **BREAKING (UI)** in the proposal; no migration needed since it's a desktop app with no saved UI state referencing the old buttons.
- [Keyboard shortcuts could collide with future editor shortcuts (e.g. undo/redo) if those are added later] → Keep the shortcut set minimal (`+`/`-`/`0`) and centralized in one listener so future additions have one place to check for conflicts.
- [Restructuring `AppShell`'s layout into a three-row flex column could shift the status bar's height/appearance on the no-mosaic screen if the new row isn't scoped correctly] → Render the status-bar row only when `props.mosaicOpen`, mirroring the existing conditional mount of `StatusBar` in `app.tsx`.
