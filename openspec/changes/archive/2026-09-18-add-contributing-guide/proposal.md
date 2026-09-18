## Why

The project has no `CONTRIBUTING.md`, no `LICENSE` file (despite `package.json` claiming `MIT`), and its only agent-instructions file (`CLAUDE.md`) is named for one specific tool even though its content is entirely tool-agnostic and is already used from both Claude Code and OpenCode via matching `.claude/`/`.opencode/` scaffolding. The repo also lost its pre-Tauri-migration branch/PR convention (issue-numbered branches, PRs merged into `main`) in favor of direct-to-`main` commits, with no written policy either way. As the project is prepared for outside contributors and AI-assisted contributions become routine, these gaps need to be closed: contributors (human or AI-assisted) need a documented process and a licensing basis, and the growing set of coding agents used on this project need a home for shared instructions that isn't tied to one tool's branding.

## What Changes

- Add `CONTRIBUTING.md` documenting:
  - A simplified develop branch strategy: `main` holds tagged releases only; `develop` is the integration branch; feature branches (informal naming for now) merge into `develop`. No `release/*`/`hotfix/*` branches.
  - Both `main` and `develop` are protected — no direct pushes, including from the maintainer. (Branch protection itself is a Forgejo server setting, not a file in this repo; see Impact/tasks.)
  - Merge strategy: squash-merge feature branches into `develop`; merge or fast-forward `develop` into `main` when cutting a release.
  - Conventional Commits formalized as the required commit message standard (already the de facto style since the Tauri migration).
  - AI usage policy: AI-assisted contributions are welcome. Contributors are accountable for their diffs and must be able to explain any line if asked. Contributions are held to the engineering discipline documented in `AGENTS.md`; PRs that show signs of unreviewed/unexplainable AI output ("slop" — unnecessary abstraction, hallucinated APIs, unexplained sweeping changes, comments that just restate code) are grounds for rejection under that existing standard, not a new one. AI-assisted commits continue to be disclosed via the existing `Co-Authored-By` trailer — no new disclosure mechanism.
  - When to use the OpenSpec flow: required for changes that touch multiple files for a non-obvious reason, change user-facing behavior, or involve a design decision worth reviewing before code exists; not required for mechanically-scoped fixes (typos, a single obvious bug, dependency bumps), where a PR description is enough context on its own.
- Add `LICENSE`: MIT license text, matching `package.json`'s existing `"license": "MIT"` field and the author info already there.
- Add `AGENTS.md`: extract the tool-agnostic content currently in `CLAUDE.md` (project overview, commands, application architecture, OpenSpec workflow) into this generic file, following the emerging cross-tool convention that both Claude Code and OpenCode recognize.
- Rewrite `CLAUDE.md` as a short pointer to `AGENTS.md`, kept as a separate (not symlinked) file so Claude-specific notes can be added later without disturbing `AGENTS.md`.

Explicitly out of scope: actually configuring branch protection on the Forgejo server (manual, tracked as a task, not a file change), reviving issue-numbered branch naming (deferred — informal naming is fine for now), any CI/status-check requirements on the protected branches.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None — this is a pure documentation/tooling change with no application behavior change.

## Impact

- **New files**: `CONTRIBUTING.md`, `LICENSE`, `AGENTS.md`
- **Modified files**: `CLAUDE.md` (trimmed to a pointer at `AGENTS.md`)
- **No changes to**: `.claude/`, `.opencode/` scaffolding (both already point at OpenSpec skills only, and OpenCode already reads `AGENTS.md` natively), application source code
- **Manual/out-of-band**: branch protection rules for `main` and `develop` on `git.deiussum.com` (Forgejo) — the maintainer is doing this directly in the Forgejo UI, tracked here only as a follow-up task, not a file this change can produce
