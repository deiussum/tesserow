## Context

See `proposal.md` for motivation. Relevant current state:
- ESLint config is legacy `.eslintrc.json` (not flat config).
- `tsconfig.json` targets `ES6`, uses `module: "commonjs"`, `jsx: "react-jsx"`, no `strict` mode.
- jimp 0.5's `Jimp.read`/`Jimp.intToRGBA` default-export API is used directly in `src/dialogs-bridge.ts` for image import (greyscale + downscale + luminance conversion).
- No automated test suite exists (per `AGENTS.md`) — verification is manual.
- The app has one entry point (`src/renderer.ts`) and one React root render call; MUI components are used broadly across editor/dialog components.

## Goals / Non-Goals

**Goals:**
- Land every dependency (npm + Cargo) at its latest stable major, with the app building, linting, and running with unchanged user-facing behavior.
- Make each major-version migration a separately reviewable, revertible step rather than one large mixed commit.

**Non-Goals:**
- Not introducing a test suite as part of this change (out of scope; a follow-up change should address automated coverage separately).
- Not changing any user-facing feature, UI layout, or file format.
- Not re-architecting state management, the Mosaic domain model, or the Tauri plugin surface.

## Decisions

- **Upgrade in dependency-ordered stages, one major migration per commit**, in this order: (1) low-risk/non-breaking bumps first, (2) build tooling (TypeScript, then ESLint incl. flat-config migration), (3) jimp, (4) React, (5) MUI, (6) uuid, (7) Cargo/Rust via `cargo update` (independent, can run anytime).
  - *Why*: staging isolates which upgrade caused a given regression; a single "bump everything" commit would make bisection painful with no test suite to catch failures automatically. Tooling first because a broken lint/build config would otherwise mask errors introduced by later steps.
  - *Alternative considered*: one combined upgrade PR — rejected due to weak safety net (manual testing only) and higher blast radius per commit.

- **ESLint: migrate `.eslintrc.json` to flat config (`eslint.config.js`)** as part of the ESLint 8→10 bump, rather than using a compatibility shim.
  - *Why*: ESLint 9+ defaults to flat config and drops built-in support for `.eslintrc*`; a shim (`@eslint/eslintrc`) would just defer the migration. `@typescript-eslint` 8.x's flat-config presets are the maintained path going forward.
  - *Alternative considered*: keep `.eslintrc.json` with `ESLINT_USE_FLAT_CONFIG=false` — rejected as a temporary crutch that still needs to be paid down later.

- **TypeScript: raise `tsconfig.json` target/module settings only as far as needed** to compile cleanly under TS 7, rather than opportunistically modernizing (e.g. to `ES2022`/`ESNext`) in the same change.
  - *Why*: keeps this change focused on "same behavior, newer deps"; broader tsconfig modernization is a separate, judgment-heavy change better done on its own.
  - *Alternative considered*: modernize `target`/`module` now while touching the file anyway — rejected to keep this change's diff attributable to dependency versions, not tooling philosophy changes.

- **jimp 0.5 → 1.6: rewrite `src/dialogs-bridge.ts`'s image-loading helpers against jimp 1.x's API** (named exports, `Jimp.read`/instance-method equivalents, `intToRGBA` replacement), keeping the function signatures (`loadJimpImage`, threshold/greyscale/luminance output) unchanged so callers in `app.tsx` need no changes.
  - *Why*: isolates the breaking API surface to one file; the rest of the app depends on the existing return shape, not on jimp directly.

- **React 19 + MUI 9: upgrade together in adjacent commits**, verifying build/lint after each, since MUI 5's peer range doesn't support React 19 — MUI must reach a React-19-compatible major before or alongside the React bump.
  - *Why*: avoids an intermediate broken state where `npm install` reports peer conflicts.
  - *Alternative considered*: upgrade MUI first fully to v9 on React 18, then React 19 — viable too; either order is acceptable as long as both land compatible versions together. Left as an implementation-time call in tasks.md rather than over-specifying here.

- **Cargo/Rust: run `cargo update` for lockfile bumps within existing `Cargo.toml` ranges as the default**; only widen a `Cargo.toml` version constraint (e.g. `tauri = "2.11.3"` → a newer 2.x or a 3.x if released) when `cargo update` alone can't reach a materially newer version and the newer major is confirmed compatible with the Tauri plugin versions already in use.
  - *Why*: Tauri's plugin ecosystem versions plugins in lockstep with the core crate; bumping past a major without checking plugin compatibility risks a broken build that's hard to diagnose.

## Risks / Trade-offs

- [Six simultaneous major upgrades, no automated tests] → Mitigation: staged commits per migration (see Decisions), plus the manual verification checklist from `proposal.md` (image import → mosaic → save/load → PDF export → written pattern) run after each risky stage (jimp, React, MUI), not just once at the end.
- [MUI 5→9 spans multiple majors (6, 7, 8, 9) each with their own breaking changes] → Mitigation: read each major's migration guide in sequence rather than assuming v5→v9 is a single diff; budget for this being the largest single piece of work in tasks.md.
- [ESLint flat-config migration could change which rules apply, surfacing new lint errors unrelated to the dependency bump itself] → Mitigation: treat newly-surfaced lint errors as expected follow-up work within this change, not a sign something is broken.
- [jimp 1.x may have different default color/threshold behavior than 0.5.x] → Mitigation: manually compare image-import output (mosaic cell pattern) before/after on the same test image.
- [Widening a Cargo.toml constraint could pull in a Tauri major with breaking Rust API changes] → Mitigation: prefer `cargo update` within existing ranges (see Decisions); only widen `Cargo.toml` when checked against plugin compatibility, and verify `npm start`/`npm run package` still builds and runs after any Cargo.toml bump.
- [Realized in stage 1] pdfkit 0.14 → 0.20 was categorized as low-risk in the proposal, but 0.x versions treat minor bumps as breaking under semver: the `pdfkit/js/pdfkit.standalone` deep-import path the app relied on for its webview-safe browser build was removed. → Fixed by importing the bare `pdfkit` specifier instead; the package's own export conditions now resolve to a browser build automatically. No other 0.x dependency in this change is assumed low-risk without checking its actual diff.
- [Realized in stage 4] jimp's latest npm release (1.6.1) publishes a broken browser bundle (`dist/browser/index.js` is a stub, `export {};`) - a real upstream packaging bug, not a local misconfiguration, confirmed by diffing against 1.6.0's browser bundle (a complete, working build). → Pinned `jimp`/`@jimp/utils` to 1.6.0 instead of `latest`. Revisit the pin when a newer jimp release fixes this (check the published `dist/browser/index.js` isn't a stub before bumping past 1.6.0).
- [Realized in stage 2/3] The proposal assumed "latest major" for TypeScript and ESLint would land together cleanly. In practice, `typescript-eslint` (latest) doesn't yet support TypeScript 7.x (peer range `<6.1.0`), and `eslint-plugin-import` (latest) doesn't yet support ESLint 10.x (peer range `^9`). → User-approved resolution: cap each at the newest release its dependent tooling actually supports (TypeScript 5.9.3, ESLint 9.39.5) rather than force-install with `--legacy-peer-deps` against unverified combinations. "Latest stable major" is read as "latest major the toolchain can mutually support," not "latest major in isolation." React and MUI's compatibility should be checked the same way before assuming their pairing works (see the React+MUI decision above, which already anticipated one such conflict).

## Migration Plan

1. Non-breaking/low-risk npm bumps (emotion, fontsource, types packages, eslint-plugin-import, pdfkit, ts-node, cross-env, vite, vite-plugin-node-polyfills, @tauri-apps/* npm packages) — build + lint + manual smoke test.
2. TypeScript 4.5 → 7 — fix compiler errors, adjust `tsconfig.json` only as needed to compile — build + lint.
3. ESLint 8 → 10 + `@typescript-eslint` 5 → 8, migrate to flat config — lint passes.
4. jimp 0.5 → 1.6 — rewrite `dialogs-bridge.ts` image helpers — manual image-import smoke test.
5. React 18 → 19 and MUI 5 → 9 (adjacent commits, see Decisions) — full manual smoke test of all screens/dialogs.
6. uuid 9 → 14 — check import usage — build + smoke test.
7. `cargo update` in `src-tauri/` (and any confirmed-safe `Cargo.toml` bumps) — `npm run package` build check.
8. Final full manual pass through the verification checklist in `proposal.md`.

Rollback: each stage is its own commit; a regression found at any stage can be reverted independently without discarding later, unrelated stages, since stages are ordered by increasing risk/coupling.

## Open Questions

- Whether to widen any Cargo.toml constraints beyond what `cargo update` reaches, or leave that for a future change, is left to be decided during implementation based on what's actually available at that time — doesn't affect this change's scope or task breakdown either way.
