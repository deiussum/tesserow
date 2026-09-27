## 1. Tooling prerequisites

- [x] 1.1 Confirm the SDK extensions exist for the freedesktop `25.08` branch (`flatpak remote-info flathub org.freedesktop.Sdk.Extension.rust-stable//25.08` and `…node24//25.08`, falling back to `node22`) and verify the chosen names/branches are recorded in design D1.
- [x] 1.2 Ensure a Flatpak builder is available locally (system `flatpak-builder`, or `flatpak install flathub org.flatpak.Builder`) and verify `flatpak-builder --version` (or `flatpak run org.flatpak.Builder --version`) prints a version.
- [x] 1.3 Pick and record a pinned `flatpak-builder-tools` commit, and verify both the cargo generator and `flatpak-node-generator` from that commit run (`--help`) inside a throwaway venv.

## 2. Desktop integration files

- [x] 2.1 Add `flatpak/com.deiussum.tesserow.desktop` per design D5 and verify `desktop-file-validate flatpak/com.deiussum.tesserow.desktop` reports no errors.
- [x] 2.2 Add `flatpak/com.deiussum.tesserow.metainfo.xml` (name, summary, description, MIT license, CC0 metadata license, developer, homepage, launchable, OARS rating, `<release version="0.1.0">`) and verify `appstreamcli validate --no-net` reports no errors.

## 3. Build script and source generation

- [x] 3.1 Add `flatpak/build.sh` with the `generate` subcommand (pinned generator venv under `flatpak/.build/`, writes `flatpak/generated/cargo-sources.json` and `node-sources.json`) and verify both files are produced from the current lockfiles.
- [x] 3.2 Add the version-consistency check to `generate` and verify it fails with a clear message when the metainfo lacks a `<release>` for the `tauri.conf.json` version, and passes when it matches.
- [x] 3.3 Update `.gitignore` for `flatpak/.build/`, `flatpak/generated/`, `flatpak/dist/`, `.flatpak-builder/`, and verify `git status` stays clean after running `generate`.

## 4. Manifest

- [x] 4.1 Add `flatpak/com.deiussum.tesserow.yml` (GNOME 50 runtime/SDK, rust-stable + node SDK extensions, `command: tesserow`, finish-args from design D4, app module with `type: dir` source + `skip:` list + both generated source files) and verify `flatpak-builder --show-manifest` parses it.
- [x] 4.2 Write the offline build commands (`npm ci --offline`, `npm run tauri -- build --no-bundle` with vendored `CARGO_HOME`/`CARGO_NET_OFFLINE`), install the binary as `/app/bin/tesserow` plus the desktop file, metainfo, and the four icon sizes from `src-tauri/icons/`, and run `appstreamcli validate --no-net` on the installed metainfo; verify a `flatpak-builder --force-clean` build completes with no network fetches during build commands (if `npm ci`/the Tauri CLI can't work offline, switch to the D3 raw-cargo fallback and note it in design.md).
- [x] 4.3 Add the `build` subcommand to `flatpak/build.sh` (builder detection, `--install-deps-from=flathub`, export to repo, `flatpak build-bundle --runtime-repo=…` → `flatpak/dist/Tesserow_<version>_x86_64.flatpak`), add an `npm run flatpak` script, and verify one command from a clean clone produces the bundle.

## 5. Local verification of the bundle

- [x] 5.1 Install the bundle with `flatpak install --user flatpak/dist/Tesserow_0.1.0_x86_64.flatpak` and verify `flatpak info com.deiussum.tesserow` shows the app ID and version `0.1.0`, and that the Tesserow launcher entry with its icon appears and opens the app (and that the running window is associated with that icon, per the StartupWMClass risk).
- [ ] 5.2 Inside the Flatpak, save a mosaic to a folder in `~`, reopen it, import an image from `~`, and export a PDF with a cover PDF to `~`; verify each works the same as the non-Flatpak build.
- [x] 5.3 Launch the Flatpak under Wayland and under X11 (e.g. `flatpak run --nosocket=wayland com.deiussum.tesserow`) and verify the window renders in both.
- [x] 5.4 Verify the sandbox has no network and no filesystem access outside home: `flatpak info --show-permissions com.deiussum.tesserow` lists only the finish-args from design D4.

## 6. CI workflow

- [ ] 6.1 Add `.github/workflows/release.yml` with the triggers and `paths:` filter from design D7, workflow-level `permissions: contents: read`, and the `flatpak` job (gnome-50 builder container, `build.sh generate`, `flatpak-builder` action with lockfile-hash cache key and bundle name); verify with a `workflow_dispatch` run on the branch that the `.flatpak` bundle is uploaded as a workflow artifact.
- [ ] 6.2 Add the `linux` job per design D8 (`ubuntu-22.04`, apt prerequisites, Node/Rust setup + caches, `npm ci`, `npm run make`, upload the `.deb`/`.rpm`/AppImage); verify via `workflow_dispatch` that all three files are uploaded with the expected Tauri names.
- [ ] 6.3 Add the `windows` job per design D8 (`windows-latest`, Node/Rust setup + caches, `npm ci`, `npm run make`, upload the `.msi` and `-setup.exe`); verify via `workflow_dispatch` that both files are uploaded with the expected names.
- [ ] 6.4 Download the CI-built `.deb` or AppImage and verify it installs/launches on Linux and can save/open a mosaic, the same as a hand-built release.
- [ ] 6.5 (Maintainer, on Windows) Run the CI-built `-setup.exe` and `.msi` and verify each installs and launches Tesserow (past the expected SmartScreen warning) and can save/open a mosaic.
- [ ] 6.6 Add the tag-only `release` job (`needs: [flatpak, linux, windows]`, `contents: write`, download all artifacts, `gh release view || gh release create --draft`, `gh release upload --clobber`); verify by pushing a throwaway tag (e.g. `v0.0.0-ci-test`, with the maintainer's go-ahead) that all six files land on a draft release, then delete that tag and release.
- [ ] 6.7 Verify release gating and preservation: confirm from the workflow graph that `release` cannot run unless all three build jobs succeed, and (re-running the throwaway tag build against a release with hand-edited notes) that the notes/title/draft state are unchanged after upload.
- [ ] 6.8 Verify the PR trigger: the PR for this change runs the workflow (it touches `flatpak/**` and `.github/workflows/`), and confirm from the `paths:` filter that a `src/`-only PR would not.

## 7. Documentation

- [x] 7.1 Add a Flatpak section to `README.md` (installing a downloaded bundle, the `--filesystem=home` note and `flatpak override` tip for `/media`, building locally with `npm run flatpak`), a note that Windows installers are unsigned and trigger SmartScreen, and add `npm run flatpak` to the Commands list in `AGENTS.md`; verify the documented commands match the script.
- [x] 7.2 Document the CI-based release steps in `CONTRIBUTING.md` (bump version in `package.json`/`tauri.conf.json` and add a `<release>` entry to `flatpak/com.deiussum.tesserow.metainfo.xml`, merge to `main`, push the tag, then write notes and publish the release once assets are attached) and verify the `build.sh` version-check error message points to it.
- [ ] 7.3 Run `openspec validate add-release-ci --strict` and verify it passes.
