## 1. Test infrastructure

- [x] 1.1 Add `vitest` as a devDependency and an `npm test` script (`vitest run`) to `package.json`, and verify `npm install` completes with no peer-dependency errors (installed vitest@5.0.1 cleanly, `npm test` script added)
- [x] 1.2 Create `vitest.config.ts` (default `node` environment, `include: ['src/**/*.test.ts']`) and verify `npx vitest run` executes cleanly with zero tests collected (no config/resolution errors) (config resolved correctly; the only output was Vitest's expected "No test files found" before any test file exists)

## 2. Row/column numbering (mosaic-domain-model: "Row and column numbering counts down from the chart's size")

Per design.md, every test obtains its chart via `mosaic.initialize(width, height, extraRows)` and asserts through `mosaic.data` — `MosaicChart` isn't exported, so there's no other way to get one.

- [x] 2.1 Test that a chart freshly created via `mosaic.initialize(width, height, 0)` numbers its top row `height`, its bottom row `1`, and within a row numbers the rightmost cell `1` and the leftmost cell `width`
- [x] 2.2 Test that after `mosaic.data.addExtraRows(count)`, row `1` is still the bottom-most row and the top row's number equals the chart's new total height

## 3. Alternating color and locked edges (mosaic-domain-model: "Rows alternate a base color, with locked edge cells")

- [x] 3.1 Test that adjacent rows have different base colors in a chart created with no extra rows
- [x] 3.2 Test that extra border rows added via `addExtraRows` all share one base color, which may match the adjacent core row's color
- [x] 3.3 Test that the first and last cell of every row equal that row's base color

## 4. Cell-toggle construction rules (mosaic-domain-model: "Cell color toggling preserves the two-color construction")

- [x] 4.1 Test that cells in the top row, bottom row, first column, and last column cannot be toggled (color unchanged after `toggleColor()`)
- [x] 4.2 Test that toggling an interior cell is rejected when the cell already matches its row's base color and the cell below it also currently matches that color
- [x] 4.3 Test that a valid toggle flips the cell's color and flips the stitch type (plain ↔ "X" motif) of the cell directly above it

## 5. Written pattern text (mosaic-domain-model: "Written pattern text lists rows bottom to top with run-length stitch counts")

- [x] 5.1 Test that `getWrittenPattern()`'s rows appear starting at row 1 (bottom) and ending at the top row
- [x] 5.2 Test that a run of consecutive same-type stitches within a row collapses into one count-plus-type entry
- [x] 5.3 Test that join/end-marker stitches render without a numeric run-length prefix
- [x] 5.4 Test that a row whose text exceeds the configured line width wraps onto an indented continuation line

## 6. Save/load round trip (mosaic-domain-model: "Save data captures everything needed to reconstruct a chart")

- [x] 6.1 Test that `getSaveData()` output loaded via `loadData()` into a new chart of the same width/height reproduces every cell's color and stitch type

## 7. Verify

- [x] 7.1 Run `npm test` and verify every test passes (14/14 passed)
- [x] 7.2 Run `npm run lint` and verify the new test file(s) pass with no new ESLint errors (0 errors across the whole repo, including `src/Mosaic.test.ts` and `vitest.config.ts`)
