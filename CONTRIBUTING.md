# Contributing to Tesserow

Thanks for your interest in contributing. This document covers branching, commits, and how AI-assisted contributions are handled. For project overview, commands, and architecture, see [`AGENTS.md`](./AGENTS.md).

## Branching

This project uses a simplified develop-branch strategy:

- **`main`** holds only tagged releases. It does not take direct commits or feature branches.
- **`develop`** is the integration branch. All feature branches merge here first.
- **Feature branches** branch off `develop`. Naming is informal for now (no required prefix or issue-number convention).

There are no `release/*` or `hotfix/*` branches — that machinery exists to coordinate stabilizing a release while patching an older one at the same time, which doesn't apply here yet. If that changes, this convention can grow to accommodate it.

Both `main` and `develop` are protected: nobody pushes directly, including the maintainer. All changes land through a pull request, even trivial ones. This isn't about requiring outside review — it's about holding every change, regardless of author, to the same process.

## Merging

- **Feature branch → `develop`**: squash-merge. Each feature branch collapses into a single, well-formed commit on `develop`, regardless of how messy its own history was.
- **`develop` → `main`**: merge or fast-forward when cutting a release. By this point `develop`'s history is already the curated sequence of changes for that release, so it isn't squashed again — that history is worth keeping in `main`'s permanent record.

## Commit messages

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/). Examples from this project's own history:

```
refactor!: rename project to Tesserow and flatten repo structure
chore(openspec): archive rename-to-tesserow change
docs(openspec): mark rename-to-tesserow tasks complete
chore!: remove WebApi and WebNext sub-projects
```

Use a `!` after the type (or a `BREAKING CHANGE:` footer) for breaking changes, and a scope in parentheses when it clarifies what part of the project the commit touches.

## When to use the OpenSpec workflow

This repo uses [OpenSpec](./AGENTS.md#openspec-spec-driven-workflow) to plan non-trivial changes as a proposal, design, and task breakdown before they're implemented.

- **Use it** when a change touches multiple files for a reason that isn't self-evident, changes user-facing behavior, or involves a design decision someone should be able to review before code exists.
- **Skip it** for mechanically-scoped fixes — typos, a single obvious bug, dependency bumps — where a clear PR description is enough context on its own.

When in doubt, err toward proposing a change — it's cheap to skip the formality for something that turns out to be simple, and expensive to unwind a design decision baked into code nobody reviewed first.

## AI usage

AI-assisted contributions are welcome. The expectation is accountability, not disclosure ceremony:

- **You are responsible for what you submit.** If asked to explain a line or a decision in your PR, you should be able to — "the AI wrote it that way" is not an explanation.
- **AI-assisted contributions are held to the same standard as any other contribution** — the engineering discipline described in [`AGENTS.md`](./AGENTS.md), which exists precisely to keep both AI agents and humans from generating unnecessary abstractions, defensive code for cases that can't happen, or comments that just restate what the code does.
- **Disclosure** happens naturally through the `Co-Authored-By` trailer that AI coding tools already add to commits — there's no separate checkbox or process for it.

A PR is fair to reject as low-effort AI output ("slop") when it shows signs like:

- Unnecessary abstraction or speculative generality beyond what the change needs
- APIs, functions, or config options that don't actually exist in this codebase or its dependencies
- Sweeping, unrelated changes bundled into what should be a focused diff
- Comments that describe *what* the code does rather than *why*, adding no information a reader couldn't get from the code itself
- A submitter who can't explain why the change was made a particular way when asked

None of this is AI-specific — it's the same bar a careless human contribution would fail too.

## License

By contributing, you agree that your contributions are licensed under the project's [MIT License](./LICENSE).
