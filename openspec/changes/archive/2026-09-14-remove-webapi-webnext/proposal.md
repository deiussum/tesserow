## Why

The user is preparing to open-source Deiussum.PatternMaker. `Deiussum.PatternMaker.WebApi/` (a .NET stub with no real endpoints beyond the scaffolded `WeatherForecastController`) and `Deiussum.PatternMaker.WebNext/` (a Next.js marketing/registration site) existed to support a commercial/marketing angle — license verification and a download/registration site — that doesn't apply to an open-source release. Carrying two unused, unmaintained sub-projects adds confusion and upkeep burden for outside contributors with no offsetting value.

## What Changes

- **BREAKING**: Remove the `Deiussum.PatternMaker.WebApi/` sub-project (directory, project files, and its reference from `Deiussum.PatternMaker.sln`).
- **BREAKING**: Remove the `Deiussum.PatternMaker.WebNext/` sub-project (directory and all its files).
- Update `CLAUDE.md`'s "Project overview" section to drop references to WebApi/WebNext as sub-projects, and remove their "Commands" and "Architecture" sections.
- Update the root `README.md` if it references WebApi/WebNext (verify during implementation).
- No changes to `Deiussum.PatternMaker.ElectronReact/` (the actual app) or its behavior.

## Capabilities

No spec-level behavior changes — WebApi was never functionally implemented (stub only) and WebNext's marketing/registration behavior was never captured as an OpenSpec capability. This is a repository-structure removal, not a behavior change to any specified capability. `skip_specs: true` is set in this change's `.openspec.yaml`.

### New Capabilities
None.

### Modified Capabilities
None.

## Impact

- **Removed code**: `Deiussum.PatternMaker.WebApi/` (all files), `Deiussum.PatternMaker.WebNext/` (all files).
- **Solution file**: `Deiussum.PatternMaker.sln` — remove the WebApi project reference (it currently only references this project).
- **Documentation**: `CLAUDE.md` project overview, commands, and architecture sections for both sub-projects; root `README.md` if applicable.
- **No impact** to `Deiussum.PatternMaker.ElectronReact/`, which remains the sole active sub-project.
- **History**: git history for the removed directories is preserved via version control; this change removes them from the working tree going forward, not from history.
