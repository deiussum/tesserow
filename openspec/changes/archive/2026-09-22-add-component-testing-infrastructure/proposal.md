## Why

Tesserow has Vitest wired up for the domain model (`src/Mosaic.test.ts`), but nothing that can render and interact with a React component — `vitest.config.ts` runs in a plain `node` environment and only picks up `src/**/*.test.ts`. That gap surfaced concretely in the resizable-written-pattern-panel change: the tasks for testing Copy-button visibility, resize clamping, and handle-position tracking had to be deferred and verified manually (a one-off Playwright script against a running dev server) because there was no way to mount `WrittenPatternDialog`/`AppShell` in a test. The original Vitest-adoption change (`add-vitest-domain-model-tests`) explicitly scoped React component tests out as future work — this is that follow-up.

## What Changes

- Add the dependencies needed to render and interact with React components in Vitest: a DOM environment (`jsdom`) and `@testing-library/react` (plus `@testing-library/jest-dom` for DOM-specific matchers).
- Extend the Vitest setup so `.tsx` test files can opt into a DOM environment per-file, without changing the existing domain-model tests' `node` environment or `.ts` file matching.
- Add a first real component test (for `WrittenPatternDialog`, covering the behavior that had to be manually verified in the resizable-written-pattern-panel change) to prove the setup end-to-end, not just wire config that nothing exercises.
- Out of scope: retrofitting tests onto every existing component, CI wiring to run tests automatically (neither exists for the domain-model tests either), and end-to-end/browser-driven testing (Playwright et al.) — this is unit/component-level only.

## Capabilities

This is test-infrastructure/tooling work with no application-behavior change — it adds a way to automatically verify component behavior that already exists, without altering that behavior. No capability specs are added or modified (`skip_specs: true` is set in this change's `.openspec.yaml`).

## Impact

- `package.json`: adds `jsdom`, `@testing-library/react`, `@testing-library/jest-dom` (and any peer packages they need) to `devDependencies`.
- `vitest.config.ts`: extended to support a DOM test environment for `.tsx` files alongside the existing `node`-environment `.ts` domain-model tests.
- New file: `src/WrittenPatternDialog.test.tsx` (or similar), the first component test.
- No changes to application source behavior, `src-tauri/`, or existing build/lint scripts.
