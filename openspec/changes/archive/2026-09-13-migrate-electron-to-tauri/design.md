## Context

See `proposal.md - Why` for the motivation. Concretely, the repo right now (on `spike/tauri-shell-port`, uncommitted) has *two* parallel, working native shells: the original Electron one (`forge.config.ts`, `webpack.*.config.ts`, `src/index.ts`, `src/preload.ts`, `src/renderer.ts`) and the spike's Tauri one (`src-tauri/`, `vite.config.ts`, root `index.html`, `src/renderer.tauri.ts`, `src/tauri-bridge.ts`). `package.json`'s `main` still points at `.webpack/main`, so Electron is still what actually ships. This design is about safely retiring one and promoting the other, not about building anything new - the spike's `findings.md` already worked out the hard technical problems (pdfkit fonts, `pdf-merger-js` incompatibility, blob-stream's Node deps, the fs plugin's split text/byte permissions).

## Goals / Non-Goals

**Goals:**
- Make Tauri the only shipped shell, with Electron's tooling fully removed, once Linux parity is confirmed (superseded 2026-09-13: the user decided not to gate this on Windows/macOS - see the updated Decisions entry below).
- Leave a clean rollback point: Electron tooling removal happens as its own isolated step.
- End up with one clearly-named bridge/entry point instead of the spike's `*.tauri.*`-suffixed files sitting alongside now-dead Electron equivalents.

**Non-Goals:**
- Re-deciding anything the spike already settled (pdfkit's standalone build, the `pdf-lib` merge fallback, the fs capability set) - carry those forward as-is unless Windows/macOS verification finds a new problem with them.
- Rust rewrites of any business logic (still explicitly deferred, per the original exploration).
- Auto-update wiring - out of scope for this migration; the app doesn't have it today under Electron either.

## Decisions

**Stage the migration in two parts, Part A (promote Tauri) then Part B (remove Electron).** Originally gated Part B on Windows *and* macOS both passing the same manual verification Linux already passed. **Superseded 2026-09-13:** the user has no Mac access at all and isn't concerned with pre-verifying Windows or macOS parity - they're fine proceeding once Linux works, testing Windows themselves later, and fixing forward whatever issues turn up (on either platform, including via future bug reports for macOS). Part B now proceeds directly after Part A/Linux verification. The two-part structure itself is kept (Electron removal stays its own isolated, revertible commit - see Rollback) since that costs nothing and preserves a clean revert point regardless of the testing gate.

**Rename the spike's `*.tauri.*`-suffixed files once there's no Electron alternative to disambiguate from.** `src/renderer.tauri.ts` → `src/renderer.ts` (replacing the old Electron one), `src/tauri-bridge.ts` → `src/dialogs-bridge.ts` (matching the existing `dialogs.ts` naming convention it replaces). Do this rename as part of Part B (alongside the Electron removal), not Part A - keeps Part A's diff purely additive/parity-focused, and avoids a confusing intermediate state where the "real" entry point has a name suggesting it's still the experimental one.

**Regenerate `yarn.lock` back to its pre-spike state rather than reconciling the spike's unexplained diff.** CLAUDE.md documents `npm install`/`package-lock.json` as the actual flow; nothing in this project relies on `yarn.lock` being current. The spike's session produced a 1000+ line diff to it that wasn't intentional or investigated. Simplest safe move: `git checkout main -- Deiussum.PatternMaker.ElectronReact/yarn.lock` to discard the drift, then confirm `npm install` still works cleanly off `package-lock.json` alone.

**Add `dist/` to a new `Deiussum.PatternMaker.ElectronReact/.gitignore`.** There currently isn't one in that directory (only the repo-root Visual-Studio-oriented `.gitignore`); Vite's build output shouldn't be committed.

**Generate real app icons via `tauri icon <source>` instead of shipping the scaffold's placeholder set.** Need a source image at least 1024x1024; check `src/assets/` for an existing high-res logo/icon before asking the user to supply one.

## Risks / Trade-offs

- **Windows/macOS parity is unverified, and Electron is being removed anyway** (per the user's 2026-09-13 decision - see Decisions) → Mitigation: none pre-emptive; accepted risk. Windows will be tested by the user later and issues fixed forward; macOS has no owner or test hardware right now, so bugs there will be handled reactively (e.g. via future issue reports) rather than caught before this migration lands.
- **Running two build toolchains side by side during Part A adds temporary complexity** (contributors need to know which one is "real") → Mitigation: keep Part A short in duration; document in the PR/README during the transition that Tauri is the target and Electron is being phased out.
- **Tauri's per-OS bundler targets (NSIS/MSI on Windows, dmg on macOS, deb/rpm/AppImage on Linux) generally require building on each target OS**, same constraint electron-forge already had with its makers → not a new risk introduced by this migration, just carried forward; worth confirming CI/build-machine access for Windows and macOS if there isn't any yet.

## Migration Plan

1. **Part A - promote Tauri without removing Electron:**
   - Verify the spike's ported functionality still works after any dependency updates since the spike (`npm install`, `tauri dev` smoke test).
   - Generate real app icons.
   - Confirm `tauri build` produces a working Linux package (deb/rpm/AppImage) as a packaging sanity check, independent of the earlier `tauri dev` testing.
   - Clean up `yarn.lock` and add `.gitignore` for `dist/`.
2. ~~Windows/macOS verification gate~~ - dropped as a blocking gate per the user's 2026-09-13 decision. Windows/macOS verification (tasks 2.x/3.x) remains in tasks.md as follow-up work the user does when able, not a prerequisite for Part B.
3. **Part B - remove Electron:**
   - Delete Electron/electron-forge/webpack tooling and dependencies, as one dedicated commit.
   - Rename `renderer.tauri.ts` → `renderer.ts` and `tauri-bridge.ts` → `dialogs-bridge.ts`; update `package.json`'s `main`/scripts accordingly.
   - Update `CLAUDE.md`'s ElectronReact architecture section.
4. **Rollback:** before Part B's commit, rollback is trivial (the branch simply isn't merged, or Part A's commits are reverted with zero product impact since Electron still ships). After Part B, rollback means reverting that single dedicated commit - kept isolated specifically so this stays simple.

## Open Questions

- Exact per-OS bundler target choices (e.g. NSIS vs MSI for Windows, whether to also produce a macOS `.app` zip alongside the `.dmg`) - decide during the Windows/macOS verification tasks; doesn't change the staged approach above.
- Whether to drop `yarn.lock` entirely (given `npm`/`package-lock.json` is the documented flow) rather than just resetting it - worth revisiting whenever open-source contributor docs/CI are decided; not required for this migration to land.
