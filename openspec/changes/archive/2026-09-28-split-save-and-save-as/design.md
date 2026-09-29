## Context

Today `window.dialogs.save(data)` in `src/dialogs-bridge.ts` both shows the save dialog and writes the file, returning only `{ success }` — the chosen path is thrown away, and `open()` likewise discards the path it read from. `app.tsx#saveClicked` sets "Saving..." / "Saved" around it and clears `mosaic.isDirty` on success; a thrown write error is unhandled and leaves the status on "Saving...".

The Ctrl/Cmd+S handler lives in a `useEffect` whose dependency list is `[mosaicEditorShown, zoomLevel]`, so any value it reads from React state other than those can be stale inside the handler.

File access permissions are not a constraint: `src-tauri/capabilities/default.json` grants `write_text_file` on `**`, and the Flatpak runs with `--filesystem=home` and in-process GTK dialogs (no document-portal paths), so writing back to a path obtained from the Open dialog works the same as one from the Save dialog.

## Goals / Non-Goals

**Goals:**
- Keep the associated-file path somewhere every save entry point (menu and keyboard) reads the current value of.
- Keep file I/O in `dialogs-bridge.ts` and flow control in `app.tsx`, as today.

**Non-Goals:**
- Persisting the path across app restarts, or storing it inside the save JSON.
- Detecting that the associated file was changed or deleted on disk by something else.
- Reworking the stale-closure pattern of the keyboard `useEffect` beyond what this change needs.

## Decisions

**Store the path on the `mosaic` singleton (`filePath: string | null`), next to `isDirty`.**
`Mosaic.initialize()` resets it to `null`, which covers New and Import for free (both go through `initialize`), and `load()` goes through `initialize` too, so `app.tsx` sets it right after `mosaic.load(...)` succeeds. Close clears it explicitly alongside `mosaic.isDirty = false`. Reading it from the singleton sidesteps the keyboard handler's stale closure.
*Alternatives:* React `useState` in `app.tsx` — would need adding to the keydown effect's deps or a ref mirror, and would be separate from the chart lifecycle it's tied to. A `useRef` works but duplicates what the singleton already models (per-chart session state like `isDirty`).

**Split the bridge API into `saveAs` and `save`, and return the path from `open`.**
- `saveAs(data, defaultPath?)` → shows the save dialog (passing `defaultPath` to `@tauri-apps/plugin-dialog`'s `save`), writes the file, returns `{ success: true, filePath }` or `{ success: false, error: 'Save cancelled' }`.
- `save(data, filePath)` → writes to `filePath` with no dialog, returns `{ success: true, filePath }`.
- `open()` success result gains `filePath`.
- Write errors propagate as rejections (as `export` does today) rather than being folded into `{ success: false }`, so `app.tsx` can tell "cancelled" (still shows "Saved", per existing spec) from "failed".

`app.tsx` then does: `saveClicked` → `mosaic.filePath ? dialogs.save(data, mosaic.filePath) : dialogs.saveAs(data)`; `saveAsClicked` → `dialogs.saveAs(data, mosaic.filePath ?? undefined)`. Both share one helper that sets "Saving...", awaits the call, on success sets `mosaic.filePath` and clears `isDirty`, sets "Saved", and in `catch` sets `Save failed: <message>` (same format as the export failure message).
*Alternative:* a single `save(data, filePath?, forcePrompt?)` — fewer functions, but boolean-flag APIs read poorly at call sites.

**Ctrl/Cmd+Shift+S is checked before Ctrl/Cmd+S.** With Shift held, `e.key` is `'S'`, which the current handler already accepts for plain save; the handler must branch on `e.shiftKey` first so Save As doesn't also trigger Save. Both stay inside the `mosaicEditorShown` block so they are inert with no mosaic open.

**Menu labels:** "Save" (no ellipsis, Ctrl+S) and "Save As..." (Ctrl+Shift+S), per the updated ellipsis requirement in the app-shell delta spec. Save As gets a new optional `saveAsClicked` prop on `AppShell`, wired like `saveClicked`.

## Risks / Trade-offs

- [Silent Save overwrites a file the user edited elsewhere since opening it] → Accepted; this is standard Save semantics and out of scope (see Non-Goals).
- [The associated path becomes unwritable (drive unmounted, permissions changed)] → Write error surfaces as "Save failed: ..." and the chart stays dirty; the user can recover with Save As.
- [Tests that stub `window.dialogs` (`src/app.test.tsx`) break on the `DialogsApi` shape change] → Update the stub to include `saveAs`; this is a compile-time error, so it can't be missed.
- [AppShell tests assert the exact File menu label list including `'Save...'`] → Update that expectation along with the new Save As item.
