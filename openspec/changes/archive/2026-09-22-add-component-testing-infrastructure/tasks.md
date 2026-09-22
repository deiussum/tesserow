## 1. Dependencies

- [x] 1.1 Add `jsdom`, `@testing-library/react`, and `@testing-library/jest-dom` to `devDependencies` and verify `npm install` succeeds
- [x] 1.2 Confirm the installed `@testing-library/jest-dom` version ships the `@testing-library/jest-dom/vitest` subpath (or find the equivalent for the installed version) before wiring it up in task 2.2

## 2. Vitest configuration

- [x] 2.1 Update `vitest.config.ts`'s `include` from `src/**/*.test.ts` to `src/**/*.test.{ts,tsx}` and verify a placeholder `.tsx` test file is picked up by `npm test` (verified for real by the `.tsx` proof test in section 3, run in section 4)
- [x] 2.2 Add `src/test/setup.ts` importing `@testing-library/jest-dom/vitest` (extends `expect` with DOM matchers) and registering `afterEach(cleanup)` from `@testing-library/react`; wire it into `vitest.config.ts` via `test.setupFiles`
- [x] 2.3 Verify the existing `src/Mosaic.test.ts` domain-model suite still runs unchanged (same `node` environment, same pass/fail results) after the config changes

## 3. Proof test

- [x] 3.1 Add `src/WrittenPatternDialog.test.tsx` with a `// @vitest-environment jsdom` magic comment at the top, rendering `WrittenPatternDialog` via `@testing-library/react`
- [x] 3.2 Test: with a long written pattern (enough rows to overflow the panel), the Copy button is visible and clickable without scrolling — jsdom has no layout engine so scroll/visibility can't be measured geometrically; verified structurally instead (Copy is asserted to live outside the pattern text's scrollable container — the actual invariant that keeps it in view in a real browser) plus `toBeVisible()`/`toBeEnabled()`. `document.execCommand` isn't implemented by jsdom at all (no property to spy on), so it's assigned directly as a mock in its own test and asserted to have been called with `'copy'`; `window.getSelection`/`document.createRange` are implemented by jsdom and needed no mocking
- [x] 3.3 Test: dragging the resize handle (simulate `mousedown`/`mousemove`/`mouseup` on `window`) calls the `onResize` prop with a width clamped to [240, 720], including the over-drag-past-bounds case from both directions
- [x] 3.4 If mounting `WrittenPatternDialog` or its MUI dependencies throws on a missing browser API (e.g. `window.matchMedia`), add the minimal stub to `src/test/setup.ts` per design.md's Risks section, and verify the test passes after the stub is added — not needed: MUI mounted cleanly under jsdom with no missing-API errors

## 4. Verification

- [x] 4.1 Run `npm test` and verify all tests pass (existing domain-model suite plus the new component tests) with no environment cross-contamination
- [x] 4.2 Run `npx tsc --noEmit` and `npm run lint` and verify both pass with the new files and dependencies in place
