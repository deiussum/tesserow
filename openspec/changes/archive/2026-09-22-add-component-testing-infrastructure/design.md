## Context

`vitest.config.ts` currently sets `environment: 'node'` and `include: ['src/**/*.test.ts']` — deliberately, per its own comment, because the existing domain-model tests (`src/Mosaic.test.ts`) don't touch the DOM. There is no `jsdom`/`happy-dom`, no `@testing-library/*`, and `.tsx` test files aren't even picked up by the `include` glob. See proposal.md for why this gap matters now.

## Goals / Non-Goals

**Goals:**
- Let a test file render a React component and interact with it (click, read text, etc.) via `@testing-library/react`.
- Keep the existing domain-model tests exactly as they are — same environment, same speed, no jsdom overhead for tests that don't need it.
- Land one real component test as proof, not just inert config.

**Non-Goals:**
- Switching the project's default Vitest environment to jsdom — the domain-model tests have no reason to pay that cost.
- Coverage reporting/thresholds, CI wiring, or a visual-regression/screenshot testing tool — none of that exists for the domain-model tests either, and it's a separate concern from "can a component test run at all."
- Retrofitting tests onto every existing component. One proof test is in scope; a full test-writing pass is future work.
- Browser/e2e testing (Playwright etc.) — component tests run against jsdom, not a real browser.

## Decisions

**Per-file `// @vitest-environment jsdom` magic comment, not a global environment switch or a multi-project config.** Vitest reads a `@vitest-environment <name>` comment at the top of a test file and uses it for just that file, overriding the config's default. This keeps `vitest.config.ts`'s existing `environment: 'node'` untouched for `.ts` domain-model tests, and only `.tsx` component test files opt into jsdom, file by file.
- *Alternative considered*: split into two Vitest projects (one `node`, one `jsdom`) via `test.projects` (or `environmentMatchGlobs`, deprecated). Rejected as more moving parts than this project needs for one component test file — a magic comment is a one-line addition per test file with no config restructuring, and is simple to revisit if the number of component tests grows enough to want blanket jsdom-for-all-`.tsx` behavior later.

**`jsdom` as the DOM implementation**, over `happy-dom`. `jsdom` is the long-established default the React testing ecosystem (`@testing-library/react`, Create React App, Next.js) is written against and tested with; `happy-dom` is faster but a smaller, less complete DOM implementation, which is the wrong trade for a project's *first* component test — likelier to hit an unimplemented API than to hit a speed problem at this scale.

**`include` glob becomes `src/**/*.test.{ts,tsx}`.** The current `src/**/*.test.ts` silently would not run a `.tsx` test file at all.

**`@testing-library/jest-dom` matchers wired through a `setupFiles` entry (`src/test/setup.ts`), imported via its `@testing-library/jest-dom/vitest` subpath.** This is the officially documented Vitest integration path and extends `expect` with DOM-specific matchers (`toBeVisible()`, `toHaveTextContent()`, etc.) globally, once, rather than per test file.

**Explicit `afterEach(cleanup)` in the same setup file**, importing `cleanup` from `@testing-library/react` and `afterEach` from `vitest`. The project doesn't set `test.globals: true` (existing tests explicitly `import { describe, test, expect } from 'vitest'`), so `@testing-library/react`'s auto-cleanup — which relies on detecting a global `afterEach` — won't fire on its own; registering it explicitly in `setupFiles` is the equivalent that matches this project's no-globals style.

**First component test targets `WrittenPatternDialog`**, covering what the resizable-written-pattern-panel change had to verify manually: the Copy button stays visible/clickable regardless of scroll position within a long pattern, and the resize handle reports clamped width changes via `onResize`. This is chosen because it's the concrete case that motivated this change and already has known expected behavior to assert against.

## Risks / Trade-offs

- **jsdom doesn't implement `document.execCommand` or a full `Selection` API**, and `WrittenPatternDialog`'s copy handler calls both → the component test mocks `document.execCommand` and `window.getSelection` directly rather than relying on jsdom's (absent) implementation; this tests that the component *calls* the copy mechanism correctly, not that the browser's copy mechanism itself works (which no unit-test environment can verify).
- **MUI components can probe browser APIs jsdom doesn't provide** (e.g., `window.matchMedia`) and throw on mount → if this surfaces while writing the proof test, add a minimal stub for the specific missing API to `src/test/setup.ts` rather than working around it in the test file, so later component tests get the same baseline.
- **Two environments in one Vitest run adds a small amount of config surface** → mitigated by keeping the split to a one-line per-file comment instead of parallel config files, so there's only one `vitest.config.ts` to reason about.
