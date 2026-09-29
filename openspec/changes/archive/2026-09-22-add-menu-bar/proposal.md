## Why

The top bar's `ButtonGroup` already swaps between two sets of three buttons depending on whether a mosaic is open, and doesn't have room to grow — there's no home for zoom/pattern-panel access outside the editor, no way to exit the app besides the OS window controls, and no general "About" entry. A traditional File/View/Help menu bar gives the app conventional desktop-app structure with room for these and future actions, without cluttering the top bar with more buttons.

## What Changes

- Replace the top bar's contextual `ButtonGroup` with a menu bar of three top-level menus: **File**, **View**, **Help**.
- **File**: New, Open..., Import Image, Save, Export to PDF, Close, Exit. All items are always present. New, Open, Import Image, and Exit are always enabled - choosing one while a mosaic is open goes through the discard-confirmation flow rather than being blocked. Save, Export to PDF, and Close are disabled (not hidden) while no mosaic is open, since there's no current chart for them to act on. Functional keyboard accelerators (Ctrl/Cmd+N, +O, +S) are wired the same way the existing zoom shortcuts are, and New/Open work regardless of whether a mosaic is open, matching their menu items.
- **View**: Zoom In, Zoom Out, Reset Zoom, and a checked "Written Pattern" toggle — additional entry points to the zoom and pattern-panel behavior that already exists in the status bar and the panel's own handle (neither of which is removed). The whole View menu is disabled while no mosaic is open.
- **Help**: a new "About Tesserow" item showing the app name and version — the first *global* help entry; the existing per-dialog contextual `HelpButton`/`HelpDialog` usages are unchanged.
- **New**: track whether the current chart has unsaved changes (set on a successful cell-color toggle, cleared on new/load/save/close). When File > New, Open, Import, Close, Exit, or the OS window-close button is used while the chart is dirty, show a confirm dialog before discarding; proceed immediately if not dirty.
- **New**: File > Exit and the OS titlebar close button both go through the same close path (`@tauri-apps/api` window close), gated by the same discard check.

## Capabilities

### New Capabilities
(none — this extends the existing shell, editor, and domain-model capabilities rather than introducing a new one)

### Modified Capabilities
- `app-shell`: top bar becomes a File/View/Help menu bar; contextual actions are disabled rather than hidden; adds Exit, the discard-confirmation flow (covering File actions and the OS close button), and the About dialog.
- `mosaic-editor`: the existing toolbar-based save/export/close requirement moves to the File menu; adds View-menu access to zoom and the written-pattern toggle alongside their existing entry points.
- `mosaic-domain-model`: adds unsaved-changes (dirty) tracking to the chart, used by the app-shell's discard-confirmation flow.

## Impact

- `src/AppShell.tsx` — replace `ButtonGroup` with a menu bar (MUI `Menu`/`MenuItem`), add disabled-state wiring for contextual items.
- `src/app.tsx` — new callbacks/state for Exit, About, and the discard-confirmation dialog; extend the existing keydown listener for the new accelerators.
- `src/Mosaic.ts` — add a dirty flag on the `Mosaic` singleton, set in `MosaicCell.toggleColor()`, cleared in `Mosaic.initialize`/`load` and after a successful save.
- New: a discard-confirmation dialog component and an About dialog component.
- `@tauri-apps/api` (already a dependency, currently unused in `src/`) — first use, for window close (`getCurrentWindow().close()`) and intercepting the close-requested event; may need a capability permission check in `src-tauri/capabilities/default.json` if window-close events aren't already covered by `core:default`.
- `openspec/specs/app-shell/spec.md`, `openspec/specs/mosaic-editor/spec.md`, `openspec/specs/mosaic-domain-model/spec.md` — requirement changes per above.
