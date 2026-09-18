## Context

See proposal.md - Why. The relevant constraints: this is a solo-maintainer repo with no CI pipeline and no external consumers yet (pre-open-source), hosted on a self-hosted Forgejo instance (not GitHub), so there's no PR-review gate or third-party integration to coordinate around. `Deiussum.PatternMaker.ElectronReact/` is the only sub-project left in the repo after the prior `WebApi`/`WebNext` removal.

## Goals / Non-Goals

**Goals:**
- Preserve git history (blame, log) for every moved/renamed file
- Sequence the work so the repo is left in a working, buildable state after each logical step (no stretch where `npm start` is broken for reasons unrelated to the rename itself)
- Make the Forgejo-side rename and the local flatten/rebrand independent of each other in order, so a delay on one doesn't block the other

**Non-Goals:**
- Icon/wordmark design (deferred to a later change, per proposal.md)
- Any change to application behavior, dependencies, or the Rust crate names in `Cargo.toml`
- Setting up CI/release automation as part of this change

## Decisions

**Flatten via `git mv`, not delete-and-recreate.**
Moving files with `git mv` (or an editor/IDE move that stages as a rename) keeps `git log --follow` and blame working across the move. A delete+recreate would sever history for every file in the app, which matters for a repo about to go public with its full history visible.

**Do the local flatten + rebrand before the Forgejo rename, not after.**
The file-level changes (moving directories, editing `package.json`/`tauri.conf.json`/docs) are fully local and reversible right up until pushed. The Forgejo rename is a one-way, server-side action outside version control. Doing the local work first means it can be reviewed/tested (`npm start`, `npm run lint`, `npm run package`) before committing to the hosting-level rename. Once the local work is verified, push it, then rename the Forgejo repo, then run `git remote set-url` locally to match. This ordering also means if the Forgejo rename is delayed for any reason, the code/doc changes aren't blocked on it.

**Bundle identifier: `com.deiussum.tesserow`, not a `tesserow.dev`-based identifier.**
Per the user's explicit decision: keeps the personal-namespace `com.deiussum.*` convention rather than committing to a `dev.tesserow.*`-style identifier tied to a domain (`tesserow.dev`) that hasn't been registered yet. Cheap to revisit later — the Tauri `identifier` field is a config value, not something baked into already-published installers at this stage (no installers have shipped under the old identifier).

**Window title matches `productName` exactly (`"Tesserow"`).**
No separate tagline in the title bar. Simplest option, consistent with `productName`, and avoids the title going stale if the tagline in `package.json`'s `description` changes later.

**Leave `openspec/changes/archive/**` untouched.**
These are a historical record of already-completed changes (the Electron→Tauri migration, the WebApi/WebNext removal). Editing them to retroactively reflect the new name would misrepresent what was true when those changes were written and archived.

**Directory layout after flatten: contents move to repo root as-is, no restructuring beyond that.**
`src/`, `src-tauri/`, `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `node_modules/`, `dist/` all move up one level with their existing internal structure unchanged. No opportunity taken here to otherwise reorganize `src/` — that's a separate concern from the rename.

## Risks / Trade-offs

- **Risk:** A tool or config has a path baked in with an assumption about being one level deep (e.g. a relative path with an extra `../`) that only breaks after the flatten.
  → **Mitigation:** Run `npm start`, `npm run lint`, and `npm run package` locally after the flatten and before pushing, to catch this before it's committed.

- **Risk:** Local `origin` remote silently points at the old URL after the Forgejo-side rename, causing a confusing push failure later.
  → **Mitigation:** `git remote set-url` immediately after the Forgejo rename is one of the explicit tasks below, not left implicit.

- **Risk:** Forgejo's rename may leave the old repo path unresolvable (no redirect), which matters if the old URL is bookmarked or linked anywhere (e.g. in the user's own notes, or a browser bookmark).
  → **Mitigation:** Out of this change's control to guarantee a redirect; flagging it here so the user can check Forgejo's rename behavior before doing it, since this is a manual step they perform themselves.

## Migration Plan

1. Local flatten (`git mv` contents of `Deiussum.PatternMaker.ElectronReact/` to repo root) + rebrand edits (`package.json`, `tauri.conf.json`, `README.md`, `CLAUDE.md`) in the working tree.
2. Verify locally: `npm install` (if needed after the move), `npm start`, `npm run lint`, `npm run package`.
3. Commit and push to `origin` (still pointing at the old Forgejo URL at this point — that's fine, Forgejo renames preserve the same repo, just its path/URL).
4. Rename the repository on Forgejo (manual, server-side, done by the user).
5. `git remote set-url origin <new-url>` locally to match.

No rollback beyond standard git revert is needed — nothing here is a one-way data migration; it's file moves and config edits.
