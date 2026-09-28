## Why

File > Save always opens a native save dialog, even when the chart was opened from (or already saved to) a file. Saving repeatedly while editing means re-picking the same file every time, and there is no way to deliberately write a copy to a new location that differs from the normal save. Splitting the command into the conventional Save / Save As pair fixes both.

## What Changes

- The app remembers the file the open chart is associated with: the file it was opened from, or the file it was last saved to. New, Import Image, and Close clear that association.
- **File > Save** writes straight to the associated file with no dialog. If the chart has no associated file yet (new or imported chart), Save behaves exactly like Save As.
- New **File > Save As...** item always opens the native save dialog (pre-filled with the associated file's path when there is one), writes the chart to the chosen file, and makes that the chart's associated file from then on.
- New **Ctrl/Cmd+Shift+S** accelerator for Save As; Ctrl/Cmd+S stays on Save. Both do nothing while no mosaic is open.
- Save As is enabled/disabled alongside Save (only while a mosaic is open).
- The File menu's Save label drops its ellipsis ("Save"), since it asks for input only conditionally; "Save As..." keeps one, following the existing ellipsis rule.
- A failed file write now shows a "Save failed: ..." status message (mirroring export) instead of leaving the status bar stuck on "Saving...", and does not clear the unsaved-changes state. This matters more once Save writes silently to a remembered path that may have become unwritable.

Out of scope: showing the file name in the window title, a recent-files list, and changing the existing "Saved" status message that is shown after a cancelled save dialog.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `file-persistence`: the chart gains an associated file; Save writes to it directly, Save As always prompts; opening sets the association and New/Import/Close clear it; write failures are reported.
- `app-shell`: File menu gains Save As (enabled only with a mosaic open), a Ctrl/Cmd+Shift+S accelerator, and the Save/Save As ellipsis labeling changes.
- `mosaic-editor`: the editor's save action requirement covers both Save and Save As, including the failure status message.

## Impact

- `src/dialogs-bridge.ts`: `window.dialogs.save` splits into a direct write to a known path and a dialog-driven save-as that returns the chosen path (`DialogsApi` shape changes; the only consumers are `app.tsx` and test stubs).
- `src/Mosaic.ts`: the `mosaic` singleton tracks the associated file path, cleared by `initialize()`.
- `src/app.tsx`: `saveClicked` / new `saveAsClicked` handlers, Ctrl/Cmd+Shift+S handling, setting the path after Open, clearing it on Close.
- `src/AppShell.tsx`: new Save As menu item and `saveAsClicked` prop; Save label change.
- Tests: `src/AppShell.test.tsx` (menu labels/enablement), `src/app.test.tsx` (save flows and dialog stub), `src/Mosaic.test.ts` if path clearing is covered there.
- No new dependencies; no Tauri capability changes (`write_text_file` is already granted).
