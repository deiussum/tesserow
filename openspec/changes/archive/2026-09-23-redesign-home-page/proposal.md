## Why

The Home screen (the no-mosaic state) is currently a static, non-interactive background image with no controls of its own — every action (New, Open, Import Image) is only reachable by discovering the File menu above it. The background image also still carries the app's pre-rename branding ("Deiussum's Pattern Maker"), even though the product has been renamed to Tesserow everywhere else (window title, About dialog, `package.json`). Since this change already touches `HomePage.tsx`, it's a good time to fix both.

## What Changes

- Home screen presents New Mosaic, Open, and Import Image as clickable actions directly on the page, calling the same handlers already wired to the File menu (`newMosaicClicked`, `loadMosaicClicked`, `importMosaicClicked` in `app.tsx`) rather than adding new logic.
- New Mosaic is styled as the primary action; Open and Import Image are secondary, mirroring the File menu's own ordering.
- The File menu continues to offer the same actions unchanged - the start screen is an additional entry point, not a replacement.
- The Home screen's background artwork/text is updated to reflect "Tesserow" branding, replacing the legacy "Deiussum's Pattern Maker" watermark.

## Capabilities

### New Capabilities
- `home-page`: The no-mosaic start screen - its branded background and its New Mosaic / Open / Import Image actions.

### Modified Capabilities
(none - the underlying New/Open/Import Image behaviors and the File menu are unchanged; this adds a second entry point to existing behavior)

## Impact

- `src/HomePage.tsx`, `src/HomePage.module.css` - add action buttons and layout
- `src/app.tsx` - pass `newMosaicClicked`/`loadMosaicClicked`/`importMosaicClicked` handlers down to `<HomePage>`
- `src/assets/Desktop-HomePage-Background.png` (and its `Resources/Images/` source) - rebranded artwork
- New `src/HomePage.test.tsx` using the existing jsdom + Testing Library component-test infrastructure
- No backend/Tauri, API, or save-format changes; no breaking changes
