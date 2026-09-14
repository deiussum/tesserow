## 1. Remove sub-project directories

- [x] 1.1 Delete the `Deiussum.PatternMaker.WebApi/` directory and verify `git status` shows it removed
- [x] 1.2 Delete the `Deiussum.PatternMaker.WebNext/` directory and verify `git status` shows it removed

## 2. Update solution file

- [x] 2.1 Remove the `Deiussum.PatternMaker.WebApi` project entry (the `Project(...)...EndProject` block and its `GlobalSection(ProjectConfigurationPlatforms)` build-config lines keyed by its GUID `{55975F84-31D4-4C9B-A97B-34EEC1CFC6E3}`) from `Deiussum.PatternMaker.sln`, and verify `dotnet sln Deiussum.PatternMaker.sln list` reports no projects

## 3. Update documentation

- [x] 3.1 Update `README.md` to remove the "Deiussum.PaternMaker.WebApi" and "Deiussum.PatternMaker.WebNext" sections, and verify `grep -iE "webapi|webnext" README.md` returns no matches
- [x] 3.2 Update `CLAUDE.md`'s "Project overview" section to drop WebApi/WebNext as sub-projects, and remove their dedicated "Commands" (WebApi, WebNext) and "Architecture" (WebApi architecture, WebNext architecture) sections, and verify `grep -iE "webapi|webnext" CLAUDE.md` returns no matches

## 4. Verify remaining project is unaffected

- [x] 4.1 Confirm `Deiussum.PatternMaker.ElectronReact/` is untouched (`git status` shows no changes under that directory) and that `npm run lint` still succeeds from within it (note: lint already failed with the same 86 problems on `main` before this change — pre-existing debt, unaffected by this removal)
