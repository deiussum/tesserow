## Why

The menu bar added in `add-menu-bar` is still built as a contained MUI `ButtonGroup`. It renders as one raised pill with rounded outer corners, uppercase labels, and MUI's default dark-mode `primary` (#90caf9), a pastel blue that no other part of the app's navy palette uses. It looks like a toolbar widget rather than a desktop menu bar. The same default primary and the same contained `ButtonGroup` pattern also appear in every dialog, where Cancel and the confirming action (including the destructive Discard) are fused together with equal visual weight.

## What Changes

- Give the theme a real accent: `primary` becomes amber (`#f2b544`), chosen to contrast with the navy background and to stand out as the "action" color across buttons, checkboxes, sliders, text-field focus, and focus rings.
- Restyle the top bar as a conventional flat menu bar:
  - Plain text triggers (no pill, no uppercase, no fill) on the existing navy bar, with a subtle neutral hover/open highlight rather than the accent color.
  - **Help anchored to the right edge**, with File and View on the left.
  - Slightly shorter bar (~30px, down from ~37px today).
  - Opened menus attach to the bar: flush under their trigger with square top corners, sharing the open trigger's background so the trigger and menu read as one piece.
- Replace the contained `ButtonGroup` in dialog action rows:
  - Two-action dialogs (New Mosaic, Import Image, Export to PDF, Discard unsaved changes): Cancel becomes a secondary text button; the confirming action is a separate contained button.
  - The Discard confirmation's action uses the theme's error (red) color, so a destructive confirmation looks different from ordinary confirmations like Create, Import, and Export.
  - Single-action dialogs (About, contextual Help): Close becomes a text button.
- Button labels across the app render in their written case instead of MUI's default ALL CAPS (added after implementation review, to match the reviewed mockup).
- Commands that ask the user for more input before acting (a form dialog or a file picker) consistently end their label with an ellipsis, following the desktop convention. Today only Open... does. New, Import Image, Save, and Export to PDF in the File menu, and New Mosaic and Import Image on the Home screen, gain it too (added after implementation review).

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `app-shell`: the menu bar's layout (Help anchored at the far end from File/View) becomes a requirement; dialog action rows must visually distinguish dismissing from confirming, and destructive confirmations from ordinary ones; commands that ask for further input are labeled with an ellipsis.

## Impact

- `src/theme.ts`: add `palette.primary` (and possibly a deeper `palette.error`, see design.md).
- `src/AppShell.tsx`: replace the `ButtonGroup` with flat text triggers, a spacer, an explicit bar height, and attached-menu positioning/styling for the three `Menu`s.
- `src/DiscardChangesDialog.tsx`, `src/ExportDialog.tsx`, `src/ImagePreviewDialog.tsx`, `src/NewMosaicForm.tsx`, `src/AboutDialog.tsx`, `src/HelpDialog.tsx`: drop `ButtonGroup` from the action rows.
- `src/HomePage.tsx`: New Mosaic... and Import Image... labels. `src/AppShell.tsx`: File menu labels.
- `src/HomePage.tsx`, `src/WrittenPatternDialog.tsx`, `src/HelpButton.tsx`, and all checkboxes, sliders, and text fields pick up the new accent through the theme with no code change.
- Component tests (`AppShell.test.tsx`, `app.test.tsx`) query buttons by role and name, so they should keep passing; any tests that rely on `ButtonGroup` structure would need updating.
- No new dependencies, no Rust/Tauri changes.
