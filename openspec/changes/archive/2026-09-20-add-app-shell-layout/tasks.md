## 1. Theme

- [x] 1.1 Add a `createTheme`/`ThemeProvider`/`CssBaseline` setup (e.g. `src/theme.ts`) with `palette.mode: 'dark'`, background/text colors derived from the existing `#05405c`/`#dcdcdc` in `index.css`, and wrap the app root in it; verify existing MUI components (buttons, dialogs) now render with dark surfaces instead of MUI's light default (also found and fixed that MUI's default dark-mode AppBar uses `primary`, not the theme's background colors, so it's pinned to `background.paper` explicitly in `AppShell`)
- [x] 1.2 Audit component-level custom styles that assumed the old unthemed look (`StatusBar`'s inline style, `WrittenPatternDialog.module.css`, `index.css`'s body background) and remove/reconcile any now made redundant by the theme; verify `npm run lint` still passes with no new errors (removed `index.css`'s now-redundant body `background-color`/`color`; `StatusBar` now reads `background.paper` from the theme instead of a hardcoded hex; `lint` passes clean)

## 2. Shell component and lifted state

- [x] 2.1 Create an `AppShell` component owning the top bar markup and a right-side content slot, accepting props for "is a mosaic open" plus the relevant action handlers; verify it renders standalone with both a no-mosaic and a mosaic-open prop combination (e.g. via a quick manual check with `npm start`)
- [x] 2.2 Move zoom level, save/export status text, and written-pattern-panel open/closed state from `MosaicEditor` up into `app.tsx`; verify `MosaicEditor` no longer holds this state and `app.tsx` passes it down instead (also moved the export-dialog-open state and all the handlers that mutate this state, since they're driven by buttons that now live in the shell rather than inside `MosaicEditor` — required by the same lift, not separate scope; `app.tsx` also resets this state on close so a freshly opened mosaic still starts at 100% zoom, matching the unchanged "Editor opens at default zoom" requirement that used to hold via unmount/remount)
- [x] 2.3 Wire `app.tsx` to render `AppShell` once, with content (Home welcome content or the editor's canvas) swapped inside it instead of swapping full-screen components; verify the top bar remains visible and unchanged while moving between the no-mosaic and mosaic-open states

## 3. Top bar contextual actions

- [x] 3.1 Wire the no-mosaic action set (New/Open/Import) into `AppShell`, sourced from the handlers already in `app.tsx`; verify each still triggers its existing behavior (new-mosaic form opens, file picker opens, image import opens)
- [x] 3.2 Wire the mosaic-open action set (Save/Export/Zoom In/Zoom Out/Close — no "Show Pattern"; that's now the panel's own handle, see section 4) into `AppShell`; verify each still triggers its existing behavior and that the two action sets never render at the same time (verified by screenshot: exactly 5 buttons render in the mosaic-open state, no "Show Written Pattern")

## 4. Written pattern panel

- [x] 4.1 Convert `WrittenPatternDialog` from a MUI `Dialog` into a MUI `Drawer` (`variant="persistent"`, anchored right) driven by the lifted open/closed state, with the paper positioned `relative` (not MUI's default `fixed`) so it sits below the top bar rather than overlapping it; verify the canvas stays clickable while the panel is open (found and fixed a real bug via click-through testing: MUI's `Drawer` paper defaults to `position: fixed` spanning the full viewport even for the `persistent` variant, which overlapped the `AppBar` and hid the Zoom/Close buttons behind the panel. Fixed with `slotProps={{ paper: { sx: { position: 'relative' } } }}`, confirmed by screenshot that the panel now sits below the top bar and the canvas stays clickable while it's open)
- [x] 4.2 Add a persistent handle (a small icon button) attached to the panel's edge, rendered whenever a mosaic is open regardless of the panel's own open/closed state, that toggles the panel when clicked; remove the top bar's "Show Written Pattern" button and the panel's internal "Close" button, since the handle now covers both; verify the handle is visible and clickable both when the panel is collapsed and expanded (verified by click-through: chevron-left handle at the content's right edge when collapsed, chevron-right handle flush against the drawer's left edge when expanded, top bar and drawer positioning both correct in both states)
- [x] 4.3 Verify the panel's "Copy" button still copies the pattern text to the clipboard, and that toggling the panel closed and back open via the handle still shows the current chart's pattern (verified via a real X11 clipboard read after clicking Copy in the running app — clipboard contained the exact displayed pattern text; also verified opening → closing → reopening via the handle keeps showing the same chart's pattern)

## 5. Home screen layout

- [x] 5.1 Remove `HomePage`'s full-screen absolute-positioned background/button layout in favor of content rendered inside `AppShell`'s content area; verify the New/Open/Import actions now live in the top bar rather than as large centered buttons
- [x] 5.2 Change the background image's CSS from a fixed `min-width`/`min-height` box to a `background-size: cover` treatment scoped to the content area; verify the default 800×600 window no longer shows the background overflowing or requiring scroll

## 6. Small fixes

- [x] 6.1 Fix `index.html`'s `<title>` from "Deiussum's Pattern Maker" to "Tesserow"; verify by checking the window/tab title when the app runs

## 7. Verify

- [x] 7.1 Run `npm run lint`, `npx tsc --noEmit`, and `npm test`, and verify all three pass with no new errors (0 lint errors, clean typecheck, 14/14 tests pass)
- [x] 7.2 Run the app (`npm start` or the `run` skill) and manually walk through: launch → shell visible on Home → create/load/import a mosaic → shell persists into the editor with the mosaic-open action set → toggle the written pattern panel open and closed via its handle while the canvas stays interactive → close the mosaic → shell persists back to Home (fully verified end-to-end under Xvfb with synthesized X11 input via `python-xlib`: Home → Create New → filled form → editor with 5-button action set → opened panel via handle → clicked a canvas cell (still interactive) → copied pattern (clipboard verified) → closed panel via handle → closed editor → back to Home with shell intact. No errors in the app's log throughout)
