## Context

`src/Mosaic.ts` exports only the `mosaic` singleton (`const mosaic = new Mosaic(); export default mosaic;`) and a handful of save-data/page-data interfaces — `MosaicChart`, `MosaicRow`, and `MosaicCell` themselves have no `export` keyword and cannot be imported or constructed directly from a test file. **Correction found while implementing this change**: the original design draft assumed tests could bypass the singleton with `new MosaicChart(width, height)` for the non-toggle requirements; that isn't possible at all, since the class isn't exported. Every test, not just toggle-rule tests, must go through `mosaic.initialize(width, height, extraRows)` and then read/act on `mosaic.data` (whose shape is available structurally via TypeScript's inference even though its class name can't be written in a test file).

This also means the earlier singleton-coupling concern is universal rather than toggle-specific:

- `MosaicChart`'s own methods (`getCellByChartRowAndCol`, `getCellByRowAndCol`, `getWrittenPattern(s)`, `getChartPageData`, `getSaveData`, `loadData`, `addExtraRows`) only reference `this.*`, so once a chart is obtained via `mosaic.data`, calling these needs no further singleton wiring.
- `MosaicCell.canToggleColor()`, `toggleColor()`, `getCellAbove()`, `getCellBelow()`, `getX()`, and `getY()` additionally read `mosaic.data`/`mosaic.scale` directly (not a reference to `this.row`'s own owning chart), so these only behave correctly when the cell under test actually is a cell of the chart currently assigned to `mosaic.data` — which `mosaic.initialize()` guarantees, since it's the only way to get a chart at all.
- `MosaicCell.draw()`/`highlight()` need a `CanvasRenderingContext2D`, but `draw()` guards with `if (!ctx) return;` and `toggleColor()` already passes `null` when `mosaic.canvas` isn't set up. No DOM/canvas is needed to exercise the color/toggle logic itself.

The project has no test framework yet (see proposal.md - Why) and `tsconfig.json` targets `module: "commonjs"` while the existing Vite tooling is ESM-based; Vitest bridges both without extra config.

## Goals / Non-Goals

**Goals:**
- Get a working `npm test` command with no manual wiring beyond `npm install`.
- Cover every requirement in `openspec/specs/mosaic-domain-model/spec.md` with at least one test.
- Make the `mosaic`-singleton coupling explicit and safe to write tests against, so future contributors don't get silently-wrong toggle-rule results.

**Non-Goals:**
- Testing `draw()`/`highlight()` pixel output or canvas interaction — the domain-model spec has no requirements about rendering, only about state/data, so there's nothing spec-level to assert here.
- jsdom/browser environment setup — nothing in the tested code paths touches `document` (confirmed above), so Vitest's default `node` environment is sufficient and faster.
- React component tests, `dialogs-bridge.ts` tests, or CI wiring (explicitly deferred in proposal.md).

## Decisions

**Vitest config lives in a standalone `vitest.config.ts`, not merged into `vite.config.ts`.**
`vite.config.ts` carries `vite-plugin-node-polyfills` and other app-bundling/Tauri-oriented setup that has no bearing on running Node-environment unit tests and could introduce unrelated resolution issues. A separate minimal config (default `node` environment, `include: ['src/**/*.test.ts']`) keeps the test runner decoupled from the app's build pipeline.
*Alternative considered*: adding a `test` block to `vite.config.ts` (Vitest's usual single-config pattern). Rejected here because this project's Vite config is tuned for the Tauri build, not a generic app build — bringing test config into the same file risks coupling that isn't needed for a Node-only unit-test suite.

**Every test builds its chart via `mosaic.initialize(width, height, extraRows)` and asserts through `mosaic.data`, since `MosaicChart` cannot be constructed any other way from outside the module.**
There is no alternative to consider here — it's the only exported path to a chart instance at all, not a preference between two workable options.

**Each test starts from a fresh `mosaic.initialize(...)` call rather than relying on state left by a previous test.**
`mosaic` is a module-level singleton shared across every test in the file (and across files, if the test runner shares a module registry). `initialize()` fully replaces `mosaic.data` with a new `MosaicChart`, which is sufficient isolation — no separate reset/teardown mechanism is needed as long as every test (or a `beforeEach`) calls it before asserting.

## Risks / Trade-offs

- [A future contributor adds a test that reads/mutates `mosaic.data` left over from a previous test instead of calling `mosaic.initialize(...)` first, getting a silently wrong result] → Every test (or a shared `beforeEach`) calls `mosaic.initialize(...)` as its first step, consistently, so it's the obvious thing to copy.
- [Vitest and the project's `commonjs`-targeted `tsconfig.json` disagree on module semantics for some edge case] → Vitest transpiles TS itself (via esbuild) independently of `tsconfig.json`'s `module` setting for test execution, so this hasn't been an issue in practice for `noImplicitAny`/type-only settings; if it surfaces, scope a `tsconfig` override to test files rather than changing the app's own compile target.
