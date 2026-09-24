## Context

`HomePage.tsx` today is a single `<div>` with a CSS `background-image` (`src/assets/Desktop-HomePage-Background.png`, sourced from `Resources/Images/Desktop-HomePage-Background.xcf`). The "Deiussum's Pattern Maker" wordmark seen on Home is baked into that raster image itself, not rendered as HTML/CSS text - there is no separate text layer to simply restyle.

All three actions this page needs to expose (New Mosaic, Open, Import Image) already exist as handlers in `app.tsx` (`newMosaicClicked`, `loadMosaicClicked`, `importMosaicClicked`), currently passed only to `<AppShell>` for the File menu. `HomePage` is rendered with no props today (`{homePageShown ? <HomePage /> : null}`).

See proposal.md for motivation.

## Goals / Non-Goals

**Goals:**
- Make Home a start screen: New Mosaic / Open / Import Image are clickable directly on the page.
- Replace the pre-rename "Deiussum's Pattern Maker" wordmark with "Tesserow" branding.
- Reuse existing handlers and MUI/theme conventions rather than introducing new state or styling patterns.

**Non-Goals:**
- Recent files, a rotating gallery, or any other Home-page enhancement raised during exploration - deliberately deferred to a future change.
- Redesigning the illustration itself (the wolf-head mosaic artwork) - only the wordmark/branding portion changes.
- Any change to the File menu, keyboard accelerators, or the New/Open/Import Image flows themselves.

## Decisions

**Handlers passed as props, matching `AppShellProps`.** `HomePage` gains `newMosaicClicked`, `loadMosaicClicked`, and `importImageClicked` props with the same names/signatures already used on `AppShellProps` in `AppShell.tsx`, and `app.tsx` passes its existing handler functions to both components. Alternative considered: importing the `mosaic` singleton or dirty-guard logic directly into `HomePage` - rejected, since `app.tsx` already owns that orchestration (dirty guard, session reset) for every other entry point to these actions, and duplicating it would create a second source of truth.

**Wordmark replaced with real HTML/CSS text, not a re-rendered image.** Since "Deiussum's Pattern Maker" is baked into the PNG, the fix is to stop relying on the image for text: crop/reposition the background (`background-position`/a masked crop) so the old wordmark is no longer in view, and render "Tesserow" as an actual styled `<Typography>`/heading element positioned in its place. This keeps the illustration (wolf-head mosaic) intact, avoids needing pixel-level image editing, and makes the app name themeable/consistent with the rest of the UI (same font stack as `theme.ts`) instead of frozen in a raster.

**Card-based action layout using existing MUI conventions.** The three actions render inside a `Paper`/`ButtonGroup`-based card centered over the background, styled with `variant='contained'` the same way `AppShell`'s menu bar and the app's dialogs already do, rather than introducing a new button style. New Mosaic is the visually primary action (first, default-emphasis button); Open and Import Image are secondary - same ordering as the File menu.

**No new component-level state.** `HomePage` stays a presentational component (props in, JSX out); it does not track its own open/loading state - clicking a button simply invokes the prop callback, identical to how `AppShell`'s menu items do today.

## Risks / Trade-offs

- **Cropping the background to hide the old wordmark may also crop or reposition part of the wolf-head illustration** → verify visually against the actual image dimensions during implementation; if cropping alone can't cleanly remove the wordmark without cutting into the artwork, fall back to covering that corner with a solid/gradient scrim behind the new "Tesserow" text instead of cropping the image itself.
- **Duplicating handler wiring between `AppShell` and `HomePage` is two call sites for the same three actions** → acceptable since both already exist independently in `app.tsx`'s render tree; no shared behavior is at risk of drifting since both call the exact same functions, not copies.

## Open Questions

None - the layout, wiring, and branding-asset approach are all decided above.
