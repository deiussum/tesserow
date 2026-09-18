## Context

See `proposal.md` - Why. Two things shape the approach: this project has been solo-maintained with commits landing directly on `main`, but an earlier (pre-Tauri-migration) history shows a real branch/PR convention (issue-numbered branches, PRs merged in) that lapsed rather than was deliberately abandoned; and `CLAUDE.md` currently holds 100% tool-agnostic content even though it's read by both Claude Code and OpenCode today via separate `.claude/`/`.opencode/` scaffolding.

## Goals / Non-Goals

**Goals:**
- Document a branching/commit/merge convention that fits a project moving from solo-maintainer to occasional outside contributors, without adopting process the project doesn't need yet.
- State an AI-contribution policy that's enforceable using standards the project already has, not new machinery.
- Give the repo's project knowledge a tool-neutral home that any coding agent (current or future) can read directly.

**Non-Goals:**
- Configuring branch protection itself (Forgejo server setting, done manually by the maintainer — tracked as a task).
- Reviving formal issue-numbered branch naming (explicitly deferred).
- Introducing CI, required status checks, or any automated enforcement of the AI-contribution policy.
- Full git-flow (`release/*`, `hotfix/*` branches) — not justified without multiple concurrently-supported release versions.

## Decisions

**Simplified develop strategy over full git-flow.** `main` (tagged releases) ← `develop` (integration) ← feature branches. No `release/*`/`hotfix/*` branches. Full git-flow's extra branch types exist to coordinate stabilizing a release while also patching an older one concurrently — this project has cut zero releases so far (no git tags exist) and has one maintainer plus occasional contributors. The simplified form gets the main benefit sought (protecting `main` from direct pushes, giving contributors a stable integration point) without ceremony that has no current use.

**Both `main` and `develop` protected, including for the maintainer.** Chosen explicitly so the same standard applies regardless of who or what (including AI-assisted work) produced the change — reviewing your own PR is still going through the PR path, not bypassing it.

**Squash-merge feature → develop; merge/fast-forward develop → main.** Squashing keeps `develop`'s history one-commit-per-change, which pairs with Conventional Commits (each squashed commit gets one well-formed conventional-commit message regardless of how messy the feature branch's history was). `develop → main` uses merge/fast-forward rather than squash because at that point `develop`'s history is already the curated commit sequence for the release — squashing it again would collapse per-change traceability that's worth keeping in `main`'s permanent history.

**Conventional Commits formalized, old `#N:`-prefix style retired.** The project already drifted to Conventional Commits (`refactor!:`, `chore(openspec):`) since the Tauri migration; this makes it the documented standard rather than an accident of habit. The pre-migration `#N: description` style (tied to issue numbers) is not revived, consistent with deferring issue-numbered branch naming — both can be reconsidered together later if the project starts requiring every change to reference a tracked issue.

**AI policy reuses `AGENTS.md`'s engineering-discipline section as the rejection rubric, rather than writing a new one.** `AGENTS.md` (post-extraction) already states the standard the project holds AI-assisted (and human) code to — no speculative abstractions, no comments that restate code, no unnecessary error handling, etc. Writing a second, PR-focused version of the same rules in `CONTRIBUTING.md` would drift from `AGENTS.md` over time. Instead, `CONTRIBUTING.md` states the accountability norm ("you must be able to explain any line you submit") and points at `AGENTS.md` for the substantive quality bar.

**AI disclosure stays on the existing `Co-Authored-By: Claude Sonnet 5` commit trailer.** No PR template field or separate disclosure step is added — the trailer already answers "was AI involved," and duplicating that as a second mechanism would just be two places that can disagree.

**`AGENTS.md` extraction: separate file, not a symlink from `CLAUDE.md`.** A symlink would guarantee zero drift, but leaves no room for Claude Code-specific content later without breaking the symlink. Since `CLAUDE.md` today has zero Claude-specific content, a thin prose pointer (`CLAUDE.md` → "see `AGENTS.md`; Claude-specific notes go here") is preferred so the file structure doesn't have to change again the first time Claude Code-specific guidance is needed.

**When-to-use-OpenSpec rule grounded in the project's own commit history rather than invented from scratch.** Since OpenSpec was introduced (`2b26502`), every multi-file/structural change (`migrate-electron-to-tauri`, `remove-webapi-webnext`, `rename-to-tesserow`) went through proposal → design → tasks → archive, while the one genuinely mechanical cleanup in that window (`1617df1`, removing an empty `.sln` file) landed as a direct commit with no change folder. The rule documents what the project already does rather than introducing new judgment: OpenSpec is required when a change touches multiple files for a non-obvious reason, changes user-facing behavior, or involves a design decision worth reviewing before code exists; skipped for mechanically-scoped fixes where a PR description alone gives enough context. Note for future revisits: `openspec/specs/` is currently empty (no capability specs written yet for the app's actual behavior), so this precedent is drawn entirely from structural/infrastructure changes — the rule should hold once specs exist, but hasn't been tested against a real "this changes documented app behavior" case yet.

**`LICENSE` file added with plain MIT text.** `package.json` already declares `"license": "MIT"` with the author's name/email; the file was simply never created. No alternative license was considered — this closes an existing gap, not a new choice.

## Risks / Trade-offs

- [Simplified develop strategy may need retrofitting to full git-flow if the project later needs to support multiple concurrent release versions] → Migration path is additive (add `release/*`/`hotfix/*` conventions later); nothing in this change forecloses it.
- [Stating an AI policy with no enforcement mechanism relies on the maintainer actually applying the "can you explain this line" test] → Accepted for now per explicit direction; revisit if slop PRs actually show up and the norm proves insufficient.
- [Both branches protected including for the maintainer adds friction to solo trivial fixes (typos, lint)] → Accepted trade-off — deliberately chosen to hold the maintainer to the same bar as outside contributors.
