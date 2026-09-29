## 1. Wire existing handlers into HomePage

- [x] 1.1 Add `newMosaicClicked`, `loadMosaicClicked`, and `importImageClicked` props to `HomePage` (matching the names/signatures already used on `AppShellProps`), and pass `app.tsx`'s existing `newMosaicClicked`/`loadMosaicClicked`/`importMosaicClicked` handlers into `<HomePage>` alongside the existing `<AppShell>` wiring; verify `npm run lint` passes with no unused-handler or type errors

## 2. Build the start-screen UI

- [x] 2.1 Add a centered `Paper`/`ButtonGroup` card to `HomePage.tsx` containing New Mosaic, Open, and Import Image buttons wired to the props from 1.1; verify via `npm start` that all three buttons appear on the Home screen and each triggers its respective flow (new-mosaic form, file-open dialog, image-import dialog)
- [x] 2.2 Style New Mosaic as the primary action (e.g. `variant='contained'`) and Open/Import Image as secondary (e.g. `variant='outlined'`), consistent with the dark theme and the button styling already used in `AppShell.tsx` and the app's dialogs; verify visually
- [x] 2.3 Confirm (by code review, since Home is only ever shown while `mosaic.isDirty` is false) that the Home screen buttons call the identical handler functions passed to `AppShell`'s File menu, so the existing discard-confirmation guard and session-reset behavior apply automatically with no duplicated logic

## 3. Rebrand the background

- [x] 3.1 Update `HomePage.module.css`/`HomePage.tsx` to crop, reposition, or scrim the background image so the baked-in "Deiussum's Pattern Maker" wordmark is no longer visible, per the fallback in design.md's Risks section if a clean crop isn't possible without cutting into the illustration; verify visually via `npm start`
- [x] 3.2 Render "Tesserow" as a real `Typography`/heading element positioned where the old wordmark was, styled with the app theme (`theme.ts` palette/typography); verify visually
- [x] 3.3 Not needed - the illustration itself is unchanged; 3.1 removed the wordmark by editing the exported PNGs directly (both `src/assets/Desktop-HomePage-Background.png` and `Resources/Images/Desktop-HomePage-Background.png` updated). Note: the `.xcf` design source was not hand-edited to match (no scriptable way to do so here) - a follow-up for whoever next opens it in GIMP

## 4. Tests

- [x] 4.1 Add `src/HomePage.test.tsx` using the existing jsdom + Testing Library setup: render `HomePage` with mock callbacks and assert clicking New Mosaic, Open, and Import Image each calls its respective prop
- [x] 4.2 In the same test file, assert "Tesserow" is present and "Deiussum's Pattern Maker" is absent from the rendered output
- [x] 4.3 Run `npm run lint` and `npm test` (vitest) and confirm both pass with no regressions in existing suites (e.g. `AppShell.test.tsx`) - both pass (46/46 tests); required updating `app.test.tsx`'s discard-confirmation tests, which queried the `NewMosaicForm` dialog by its "New Mosaic" text - now ambiguous since the Home screen's new button has the same label. Rescoped those assertions to `getByRole('heading', { name: 'New Mosaic' })`, since the dialog's title is an `h2` and the button is not
