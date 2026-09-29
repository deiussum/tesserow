## 1. Panel layout restructure

- [x] 1.1 Restructure `WrittenPatternDialog.tsx`/`.module.css` into a non-scrolling header (title + description), a scrolling middle region containing only the pattern text, and a non-scrolling footer containing the "Copy" button; verify by rendering a very long pattern and confirming the Copy button stays visible without scrolling the panel itself
- [x] 1.2 Verify the existing copy-to-clipboard behavior (`document.execCommand('copy')` on `#written-pattern-text`) still works unchanged after the restructure

## 2. Resizing

- [x] 2.1 Lift panel width state into `app.tsx` (`useState`, default 360, clamped to [240, 720] by the drag handler) and pass it down to `AppShell` (for handle positioning) and `WrittenPatternDialog` (as a controlled prop) — see design.md's corrected Decisions section for why this lives in `app.tsx` rather than `AppShell`
- [x] 2.2 Add a resize handle to the left edge of `WrittenPatternDialog` that reports drag deltas via an `onResize` callback; verify dragging left/right changes the panel width and the canvas area resizes to fill the remaining space
- [x] 2.3 Clamp resize updates to the [240, 720] range and verify dragging past either bound stops at that bound instead of exceeding it
- [x] 2.4 Update the show/hide handle's positioning in `AppShell.tsx` to use the live width instead of the `PATTERN_PANEL_WIDTH` constant; verify the handle stays flush against the panel's edge at the default width, after resizing, and after toggling closed and reopened
- [x] 2.5 Verify the status bar (including zoom controls) remains fully visible and unobstructed at the minimum width, the maximum width, and the default width

## 3. Tests

- [ ] 3.1 Add/update component tests (or existing test suite equivalent) covering: Copy button visibility with a long pattern, resize clamping at both bounds, and the handle's position tracking the current width
- [ ] 3.2 Run the full test suite and verify it passes

**Deliberately deferred (2026-09-21):** this project has no component-testing infrastructure (`vitest.config.ts` runs in a plain `node` environment, only globs `src/**/*.test.ts`, and there's no `@testing-library/react`/`jsdom`). Writing 3.1 would mean introducing that infrastructure, which is scope beyond this change. The user chose to skip 3.1/3.2 here and track adding component-testing infrastructure as separate follow-up work.
Behavior was instead verified manually via a headless-browser run against `vite:dev`: a 30x200 mosaic's pattern panel opened, scrolled (Copy button position unchanged), resized wider/narrower, over-dragged past both the 240px and 720px bounds (clamped correctly), and toggled closed/reopened (width persisted, handle tracked the live edge). `tsc --noEmit`, `eslint`, and the existing 14 Vitest tests (`Mosaic.test.ts`) all pass unaffected.
