## 1. Domain model

- [x] 1.1 Add `filePath: string | null = null` to the `Mosaic` class in `src/Mosaic.ts` and reset it to `null` in `initialize()` (so `load()`, New, and Import all start with no association); verify with a new case in `src/Mosaic.test.ts` that `initialize()`/`load()` clear a previously set `filePath`

## 2. Dialogs bridge

- [x] 2.1 In `src/dialogs-bridge.ts`, replace `save(data)` with `saveAs(data, defaultPath?)` (save dialog with `defaultPath`, then write; returns `{ success: true, filePath }` or `{ success: false, error: 'Save cancelled' }`) and `save(data, filePath)` (direct write, no dialog); let write errors reject. Update `DialogsApi` and add a `DialogSaveResult` type; verify `npx tsc --noEmit` reports only the expected errors at call sites/stubs fixed in later tasks
- [x] 2.2 Add `filePath` to `DialogOpenSuccess` and return it from `open()`; verify it type-checks

## 3. App flow

- [x] 3.1 In `src/app.tsx`, set `mosaic.filePath` from the open result right after `mosaic.load(...)` in `loadFile`, and clear it in `mosaicClosedClicked` next to `mosaic.isDirty = false`; verify via an `app.test.tsx` case that a Save after Open writes to the opened path without calling `saveAs`
- [x] 3.2 Rework `saveClicked` and add `saveAsClicked` over a shared helper: Save uses `dialogs.save(data, mosaic.filePath)` when a path is set, otherwise `dialogs.saveAs(data)`; Save As always calls `dialogs.saveAs(data, mosaic.filePath ?? undefined)`. On success set `mosaic.filePath` and clear `isDirty`, then "Saved"; on cancel still "Saved"; on rejection "Save failed: <message>" with `isDirty`/`filePath` untouched. Verify with `app.test.tsx` cases: new chart Save prompts then second Save doesn't; Save As prompts with the default path and re-associates; cancelled Save As keeps the old path; a rejected write shows "Save failed" and leaves the chart dirty
- [x] 3.3 In the keydown handler, check Ctrl/Cmd+Shift+S (→ `saveAsClicked`) before Ctrl/Cmd+S (→ `saveClicked`), both only while `mosaicEditorShown`; verify with `app.test.tsx` cases that Ctrl+Shift+S calls `saveAs` and not the plain save path, and that neither accelerator does anything on the home screen
- [x] 3.4 Update the `dialogsStub` in `src/app.test.tsx` for the new `DialogsApi` shape (`saveAs`, `save(data, path)`, `open` returning `filePath`); verify `npm test` passes

## 4. Menu

- [x] 4.1 In `src/AppShell.tsx`, add a `saveAsClicked` prop and a "Save As..." item (Ctrl+Shift+S hint) directly after Save, disabled when `!mosaicOpen`; relabel Save to "Save" (no ellipsis); pass `saveAsClicked` from `app.tsx`. Verify in the running app (`npm start`) that the File menu shows both items with their shortcuts
- [x] 4.2 Update `src/AppShell.test.tsx`: the `/Save/` name matchers must now target Save exactly (e.g. `/^Save/` would also match Save As — use an exact label match); extend the enabled/disabled tests to cover Save As, add a click test for `saveAsClicked`, and change the expected label list to `[ 'New...', 'Open...', 'Import Image...', 'Save', 'Save As...', 'Export to PDF...', 'Close', 'Exit' ]`; verify `npm test` passes

## 5. Verification

- [x] 5.1 Run `npm run lint` and `npm test`; both pass
- [x] 5.2 Manually in `npm start`: new chart → Save prompts; edit → Ctrl+S writes silently (file contents update); Ctrl+Shift+S prompts pre-filled with the current path and re-targets later Saves; Open a file → Save writes back to it; Close then New → Save prompts again
