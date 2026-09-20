## Why

The app currently swaps between two visually unrelated full-screen views (`HomePage`'s branded background, `MosaicEditor`'s own toolbar) with no persistent chrome connecting them, a Home layout that's already larger than the app's default window size, and MUI components rendering in their default light theme against a hand-styled dark page background. Now that 0.1.0 is out and more UI work is planned, this is the moment to give the app a coherent shell before adding further screens or tools (a left-side toolbox is explicitly anticipated as later, separate work).

## What Changes

- Introduce a persistent app shell: a top bar that wraps both the Home and Editor views, showing contextual actions (New/Open/Import when no mosaic is loaded; Save/Export/Show Pattern/Zoom/Close once one is) instead of each screen owning its own separate chrome.
- Convert the written-pattern view from a blocking modal dialog into a toggleable right-side panel that can stay open alongside the canvas, opened and closed via a handle attached to the panel's edge rather than a top-bar button.
- Reserve the shell's left side structurally for a future toolbox (not built in this change).
- Apply a consistent MUI theme across the app so components no longer default to MUI's light palette against the app's dark page background.
- Fix the window title, which still reads "Deiussum's Pattern Maker" instead of "Tesserow".
- No breaking changes: save/load file format, PDF export, and the mosaic domain model's behavior are all unaffected.

## Capabilities

### New Capabilities
- `app-shell`: The persistent top bar wrapping Home and Editor, its contextual action set, the toggleable written-pattern side panel, app-wide theme consistency, and the window title.

### Modified Capabilities
- `mosaic-editor`: The "Written pattern can be viewed and copied" requirement changes from opening a blocking dialog to showing/hiding a persistent side panel.

## Impact

- `src/app.tsx`: screen-switching changes from swapping entire full-screen views to swapping content within a persistent shell.
- `src/HomePage.tsx` + `HomePage.module.css`: loses its own full-screen background/button chrome; becomes shell content.
- `src/MosaicEditor.tsx`: loses its own `AppBar`; its actions move into the shell's contextual action set.
- `src/WrittenPatternDialog.tsx`: becomes a panel component rather than a MUI `Dialog`.
- New shell component(s) (top bar + right panel host), plus a new MUI theme definition.
- `index.html`: window `<title>` fix.
- No changes to `src-tauri/`, save/load file formats, or PDF export.
