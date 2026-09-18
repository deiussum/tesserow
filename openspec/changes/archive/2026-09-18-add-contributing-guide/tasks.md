## 1. AGENTS.md extraction

- [x] 1.1 Create `AGENTS.md` at the repo root containing the tool-agnostic content currently in `CLAUDE.md` (project overview, commands, application architecture, OpenSpec workflow section) and verify it reads standalone (no references back to `CLAUDE.md` for context a reader would need)
- [x] 1.2 Rewrite `CLAUDE.md` to a short pointer at `AGENTS.md` and verify no project-specific guidance (commands, architecture, OpenSpec workflow) remains duplicated in both files

## 2. LICENSE

- [x] 2.1 Add `LICENSE` at the repo root with standard MIT license text, using the author name/email/year from `package.json`, and verify it matches `package.json`'s `"license": "MIT"` field

## 3. CONTRIBUTING.md

- [x] 3.1 Write the branching section: simplified develop strategy (`main` = tagged releases, `develop` = integration, feature branches informal naming), both branches protected including for the maintainer, no `release/*`/`hotfix/*`
- [x] 3.2 Write the merge-strategy section: squash-merge feature→develop, merge/fast-forward develop→main
- [x] 3.3 Write the commit-message section: Conventional Commits formalized as the standard, with examples drawn from the project's existing post-migration commits (`refactor!:`, `chore(scope):`, etc.)
- [x] 3.4 Write the AI-usage section: AI-assisted contributions welcome, submitter accountable and must be able to explain any line if asked, contributions held to `AGENTS.md`'s engineering discipline (link to it), disclosure via existing `Co-Authored-By` commit trailer, and name concrete slop indicators (unexplained/unnecessary abstraction, hallucinated APIs, sweeping unrelated changes, comments that restate code) as rejection grounds
- [x] 3.5 Write the "when to use OpenSpec" section: required for multi-file changes with a non-obvious reason, user-facing behavior changes, or design decisions worth reviewing first; not required for mechanically-scoped fixes (typos, a single obvious bug, dependency bumps)
- [x] 3.6 Verify `CONTRIBUTING.md` cross-references `AGENTS.md` rather than duplicating its content, and that all internal links (to `AGENTS.md`, `LICENSE`) resolve to real files in this repo

## 4. Manual follow-up (not a file change)

- [x] 4.1 Configure branch protection for `main` and `develop` on the Forgejo repo (git.deiussum.com) to block direct pushes — done outside this repo by the maintainer; verify by confirming the protection rules are visible in the Forgejo UI
