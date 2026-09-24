## 1. Theme accent

- [x] 1.1 Add `palette.primary.main: '#f2b544'` to `src/theme.ts` (updating its comment to explain the choice) and verify in `npm start` that the Home card's New Mosaic button renders amber with dark text

## 2. Menu bar

- [x] 2.1 In `src/AppShell.tsx`, replace the `ButtonGroup` with `variant='text'`, `color='inherit'`, `textTransform: 'none'` File/View/Help triggers in a ~30px flex row, with a flex spacer pushing Help to the right edge; verify View is still disabled with no mosaic open and existing `AppShell.test.tsx` / `app.test.tsx` pass (`npm test`)
- [x] 2.2 Give each `Menu` bottom-left anchor / top-left transform origins (right-aligned for Help), `borderRadius: 0` paper with no top gap, and a background matching the open trigger; highlight the trigger while its menu is open; verify in `npm start` that every menu opens flush under its trigger with square corners and the Help menu stays inside the window
- [x] 2.3 Add an `AppShell.test.tsx` case asserting Help is the last menu trigger in DOM order after File and View (the layout the spec requires; jsdom can't check pixel positions) and verify it passes with `npm test`

## 3. Dialog action rows

- [x] 3.1 In `DiscardChangesDialog.tsx`, remove the `ButtonGroup`; Cancel becomes `variant='text'` and Discard becomes `variant='contained' color='error'`; verify the discard-flow tests in `app.test.tsx` still pass
- [x] 3.2 In `ExportDialog.tsx`, `ImagePreviewDialog.tsx`, and `NewMosaicForm.tsx`, remove the `ButtonGroup`; Cancel becomes `variant='text'` and Export/Import/Create become `variant='contained'` (keeping `type='submit'` where present); verify `NewMosaicForm.test.tsx` passes and each dialog still submits via its confirm button in `npm start`
- [x] 3.3 In `AboutDialog.tsx` and `HelpDialog.tsx`, remove the `ButtonGroup` and make Close `variant='text'`; verify both dialogs still close in `npm start`
- [x] 3.4 Add a component test that the Discard button in `DiscardChangesDialog` uses the error color (for example, the MUI `MuiButton-colorError` class) and Cancel uses the text variant; verify with `npm test`

## 4. Label polish (added after implementation review)

- [x] 4.1 Add `components.MuiButton.styleOverrides.root.textTransform: 'none'` to `src/theme.ts` and drop the now-redundant `textTransform` from `AppShell`'s trigger styles; verify in a screenshot that Home and dialog buttons render in their written case
- [x] 4.2 Add a trailing `...` to File > New, Import Image, Save, and Export to PDF in `AppShell.tsx`, and to New Mosaic and Import Image in `HomePage.tsx`; update exact-name queries in `AppShell.test.tsx`, `HomePage.test.tsx`, and `app.test.tsx`; add an `AppShell.test.tsx` case asserting the File menu labels (ellipsis on New/Open/Import Image/Save/Export to PDF, none on Close/Exit) and verify with `npm test`

## 5. Verification

- [x] 5.1 Run `npm test` and `npm run lint` and confirm both pass
- [x] 5.2 Manually check in `npm start`: the menu bar on Home and in the editor, each menu open, all six dialogs, and the Import/Export checkboxes, slider, and text-field focus in amber. Check the Discard button's red for legibility and, if it looks washed out, set a deeper `palette.error.main` in `theme.ts` (see design.md Risks)

  Partially verified: screenshots of the Vite dev server in headless Chromium (Tauri internals stubbed) covered the Home menu bar with File and Help open, the editor with View open, About, New Mosaic, and the Discard dialog. They showed the open trigger wasn't highlighted because of the AppBar's dark-mode elevation overlay, which is now removed (see design.md), and that the default error red failed AA contrast, so `error.main` is now `#d32f2f`. The Import Image and Export to PDF dialogs (checkboxes, slider, text-field focus, and submitting via Import/Export) were then checked manually in `npm start` (Tauri).
