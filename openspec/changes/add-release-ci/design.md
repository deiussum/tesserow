## Context

All installers are built today by hand with `npm run make` (`cross-env NO_STRIP=true tauri build`, bundle targets `all`): `.deb`/`.rpm`/AppImage on the maintainer's Linux machine against the host's toolchain and WebKitGTK, and `.msi`/NSIS `-setup.exe` separately on a Windows machine. Nothing is signed. There is no CI in the repo (no `.github/`). Relevant facts about the app that shape the Flatpak:

- `src-tauri/Cargo.toml`'s package is named `app`, so `tauri build --no-bundle` leaves the binary at `src-tauri/target/release/app`; the installers rename it via `productName`. The Flatpak has to do that rename itself.
- File access is entirely `tauri-plugin-dialog` (→ `rfd` 0.16, GTK3 backend, i.e. an in-process `GtkFileChooserDialog`, **not** the XDG file-chooser portal) plus `tauri-plugin-fs` reading/writing the returned absolute paths. Capabilities already allow `**`.
- Frontend deps include native optional packages (Vite 8's rolldown bindings, esbuild) that npm resolves per-platform from `package-lock.json`.
- Icons already exist at 32, 128, 256 (`128x128@2x.png`) and 512 (`icon.png`) px.
- Verified locally: `org.gnome.Platform//50` ships `libwebkit2gtk-4.1` (WebKitGTK 2.50-era) and `libsoup-3.0`, which is what Tauri 2 links against. GNOME 50 is built on freedesktop-sdk `25.08`.

## Goals / Non-Goals

**Goals:**
- A manifest that a from-scratch `flatpak-builder` run can build offline, where dependency updates flow from the lockfiles automatically.
- The same build path locally and in CI for every artifact (`flatpak/build.sh` for the Flatpak, `npm run make` for the installers), so CI failures are reproducible on a dev machine.
- A tag push yields a complete set of release assets, or none.
- Zero changes to `src/` and `src-tauri/`.

**Non-Goals:**
- Flathub compliance (portal-only file access, committed generated sources, screenshots, `flathub.json`, Flathub's own build infra).
- aarch64 bundles; a hosted Flatpak repo/remote with automatic updates; signing bundles with GPG.
- macOS builds (never built or tested so far; a separate change).
- Code signing/notarization for Windows (Authenticode) or anything else; no secrets in the workflow.
- Auto-generating release notes or auto-publishing releases — the maintainer still writes notes and publishes.
- Tauri's built-in updater artifacts (`.sig`, `latest.json`).

## Decisions

### D1: Runtime — `org.gnome.Platform`/`org.gnome.Sdk` branch `50`
WebKitGTK 4.1 comes from the runtime instead of being built as a module (building WebKit is a multi-hour build). GNOME 50 is a currently-supported branch and was verified to ship `webkit2gtk-4.1`. SDK extensions must match its freedesktop base: `org.freedesktop.Sdk.Extension.rust-stable//25.08` and `org.freedesktop.Sdk.Extension.node24//25.08` (Node 24 satisfies Vite 8's engine range; fall back to `node22` if `node24` isn't published for 25.08).
- *Alternative: freedesktop runtime + WebKitGTK module* — rejected, build time and maintenance.
- *Alternative: GNOME 48* — works, but is the older/expiring branch.
- Runtime bumps are a one-line manifest change; not automated.

### D2: Build from source with `flatpak-builder-tools` generators, generated at build time (not committed)
`flatpak-cargo-generator.py` turns `src-tauri/Cargo.lock` into `cargo-sources.json` (vendored crates + a cargo config pointing at them), and `flatpak-node-generator npm package-lock.json` turns the npm lockfile into `node-sources.json` (tarballs pre-seeded into an npm cache). Both are listed as `sources` of the app module, so flatpak-builder downloads and checksums everything *before* the sandboxed, network-less build commands run.

The generated JSON is written to `flatpak/generated/` (gitignored) by `flatpak/build.sh` on every build rather than committed.
- *Why not commit them (Flathub style)?* They're large (the node list is thousands of entries), churn on every dependency bump, and go stale silently. The lockfiles already pin exact versions + integrity hashes, so regenerating is deterministic. If Flathub is pursued later, committing them is an additive switch.
- `flatpak-builder-tools` is pinned to a specific commit; the script installs the node generator (a Python package) and the cargo generator's deps (`aiohttp`, `tomlkit`) into a venv under the gitignored build directory, so no global Python state is touched.

### D3: Build with the Tauri CLI inside the sandbox
Build commands (sketch):
```
npm ci --offline                # from the pre-seeded npm cache
npm run tauri -- build --no-bundle   # runs vite:build, then cargo build --release (offline, vendored)
install -Dm755 src-tauri/target/release/app /app/bin/com.deiussum.tesserow
```
with `CARGO_HOME` pointed at the generator's vendored config, `CARGO_NET_OFFLINE=true`, and npm configured for offline/cache use. This is identical to `npm run package`, so the webview gets the production `custom-protocol` build and embedded `dist/` exactly as the installers do.
- *Alternative: `vite build` + raw `cargo build --release --features tauri/custom-protocol`* — kept as the fallback if the CLI's native npm binary (`@tauri-apps/cli-linux-x64-gnu`) causes trouble offline, but not the default because it duplicates what the CLI decides for us.
- *Alternative: repackage the `.deb`* — rejected per the chosen direction (reproducible, sandbox-built artifact; also a prerequisite for any future Flathub attempt).

The app module's source is `type: dir, path: ..` with `skip:` for `node_modules/`, `dist/`, `src-tauri/target/`, `src-tauri/gen/`, `.flatpak-builder/`, and the Flatpak build/output directories, so local builds use the working tree (including uncommitted changes) without copying gigabytes of build output into the sandbox.

### D4: Sandbox permissions
```
--socket=wayland  --socket=fallback-x11  --share=ipc  --device=dri  --filesystem=home
```
`--device=dri` is for WebKit's GPU compositing. No `--share=network` (the app is offline). `--filesystem=home` is required because `rfd`'s GTK3 dialog runs in-process and can only see paths the sandbox can see, and `tauri-plugin-fs` then opens those paths directly; a portal-based chooser would hand back `/run/user/…/doc/…` paths but needs `rfd`'s `xdg-portal` backend, which isn't selectable through `tauri-plugin-dialog` without Rust changes that would also alter the non-Flatpak Linux builds. That's the right move for Flathub, deferred.

WebKitGTK's own web-process sandbox works inside Flatpak via the Flatpak portal's sub-sandbox support with no extra permissions (as in GNOME Web).

### D5: Desktop integration files live in `flatpak/`
- `com.deiussum.tesserow.desktop` — `Name=Tesserow`, `Exec=com.deiussum.tesserow`, `Icon=com.deiussum.tesserow`, `Categories=Graphics;`. The binary is installed as `/app/bin/com.deiussum.tesserow` (manifest `command:` too) because GTK derives the Wayland app_id from the binary name: installed as `tesserow`, the window reported app_id `tesserow` (verified under niri), which doesn't match the desktop file ID, so shells that match on app_id can't associate the window with its launcher icon. `StartupWMClass=tesserow` was tried first and dropped — it only helps shells that consult it.
- Icons: `32x32.png`, `128x128.png`, `128x128@2x.png` (as 256×256), and `icon.png` (as 512×512) installed as `/app/share/icons/hicolor/<size>/apps/com.deiussum.tesserow.png` — reused from `src-tauri/icons/`, not duplicated.
- `com.deiussum.tesserow.metainfo.xml` — AppStream `desktop-application` with `launchable`, `project_license` MIT, `metadata_license` CC0-1.0, developer, homepage (GitHub), OARS content rating, and a `<releases>` list. `flatpak info` reports the version from the newest `<release>`, so:
- **Version consistency check**: `flatpak/build.sh` fails early if the `version` in `src-tauri/tauri.conf.json` has no matching `<release version="…">` in the metainfo. This keeps the spec's "reports the same version" requirement enforced at release time rather than by memory. (Adds one line to the release checklist: add a `<release>` entry.)
- The build runs `appstreamcli validate --no-net` against the installed metainfo (available in the GNOME SDK) so metainfo errors fail the build.

### D6: One script for local and CI — `flatpak/build.sh`
Subcommands:
- `generate` — set up the pinned generator venv, regenerate `flatpak/generated/{cargo,node}-sources.json`, run the version check.
- `build` (default) — `generate`, then `flatpak-builder --force-clean --repo=<repo> <builddir> flatpak/com.deiussum.tesserow.yml`, then `flatpak build-bundle --runtime-repo=https://flathub.org/repo/flathub.flatpakrepo <repo> Tesserow_<version>_x86_64.flatpak com.deiussum.tesserow`. `--runtime-repo` lets `flatpak install` on a user's machine fetch the GNOME runtime from Flathub automatically.

It uses a system `flatpak-builder` if present, otherwise `flatpak run org.flatpak.Builder` (the Flathub-packaged builder), and passes `--install-deps-from=flathub` so the runtime/SDK/extensions are installed on demand. Build state and output go in gitignored `flatpak/.build/` and the bundle in `flatpak/dist/` (naming matches Tauri's `Tesserow_0.1.0_amd64.deb` style). Exposed as `npm run flatpak`.

### D7: CI — one workflow, `.github/workflows/release.yml`
All release artifacts come from one workflow so a tag produces one coherent set and the release job can gate on every platform.
- **Triggers**: `push` of tags `v*`; `workflow_dispatch`; `pull_request` with `paths:` `flatpak/**`, `src-tauri/**`, `package.json`, `package-lock.json`, `vite.config.ts`, `index.html`, `.github/workflows/release.yml`. Frontend-only (`src/`) PRs don't trigger it — those can't break packaging — and a full three-platform build per UI tweak would be slow.
- **Jobs**: `flatpak`, `linux`, `windows` run in parallel; `release` (tag pushes only) has `needs: [flatpak, linux, windows]`, so any failed build means nothing is attached.
- **`flatpak` job**: runs in `ghcr.io/flathub-infra/flatpak-github-actions:gnome-50` (`options: --privileged`, required for bubblewrap). Steps: checkout → `flatpak/build.sh generate` → `flatpak/flatpak-github-actions/flatpak-builder` action with the manifest, `bundle: Tesserow_<version>_x86_64.flatpak`, and a `cache-key` including the hashes of both lockfiles. The action uploads the bundle as a workflow artifact. Using the action (rather than `build.sh build`) buys flatpak-builder state caching between runs; generation is still shared, so manifest/source logic stays in one place.
- **`linux` / `windows` jobs**: see D8.
- **`release` job** (`ubuntu-latest`, `permissions: contents: write`): download all workflow artifacts, then `gh release view "$TAG" || gh release create "$TAG" --draft --title "$TAG" --notes ""`, then `gh release upload "$TAG" <all 6 files> --clobber`. This never edits an existing release's title/notes or draft state; `--clobber` makes re-running a tag build idempotent. Kept separate from the build jobs so only this job holds write permission, and because the Flatpak builder container lacks `gh`.
- Default `permissions: contents: read` at the workflow level; only `release` elevates.
- Tags come from `main` per the branch model in `CONTRIBUTING.md`; the workflow doesn't care which branch the tag is on.
- *Alternative: `softprops/action-gh-release`* — rejected; on an existing release it can rewrite draft/prerelease flags, which conflicts with hand-written releases.
- *Alternative: separate workflows per platform* — rejected; cross-workflow gating ("publish only if all succeeded") needs `workflow_run` chaining, which is clumsier than `needs:`.

### D8: Installer jobs run the existing `npm run make`
Both jobs: checkout → `actions/setup-node` (Node 24, `cache: npm`) → `dtolnay/rust-toolchain@stable` → `Swatinem/rust-cache` (`workspaces: src-tauri`) → `npm ci` → `npm run make` → upload the installer files from `src-tauri/target/release/bundle/` as workflow artifacts (only the installers, not the whole bundle dir's intermediate files).
- **`linux` on `ubuntu-22.04`**: apt-installs `libwebkit2gtk-4.1-dev`, `librsvg2-dev`, `libxdo-dev`, `libssl-dev`, `patchelf`, `file` (Tauri's documented Linux prerequisites). 22.04 rather than `ubuntu-latest` because the AppImage/`.deb` are linked against the build host's glibc, and an older base keeps them runnable on older distros. `npm run make` already sets `NO_STRIP=true` for the `linuxdeploy` strip issue. Produces `.deb`, `.rpm` (Tauri's rpm bundler doesn't need `rpmbuild`), and AppImage.
- **`windows` on `windows-latest`**: no extra setup — WebView2 is on the runner, and the Tauri bundler downloads its pinned WiX and NSIS toolsets itself. Produces `.msi` and `-setup.exe`. `cross-env` in `npm run make` keeps the script portable to `cmd`/PowerShell.
- File names come from Tauri unchanged, so they match the v0.1.0 assets (`Tesserow_0.1.0_amd64.deb`, `Tesserow-0.1.0-1.x86_64.rpm`, `Tesserow_0.1.0_amd64.AppImage`, `Tesserow_0.1.0_x64_en-US.msi`, `Tesserow_0.1.0_x64-setup.exe`).
- *Alternative: `tauri-apps/tauri-action`* — rejected. It bundles building with creating/uploading to releases (which we want gated on the Flatpak too, and not to touch existing release notes), and it diverges from the local `npm run make` path that the maintainer and AGENTS.md document.
- *Alternative: a Linux build matrix (22.04 + 24.04)* — unnecessary; one older-glibc build covers newer distros.

## Risks / Trade-offs

- [`--filesystem=home` is broader than portal-based access; no access to `/media`/`/mnt` drives] → Acceptable for a self-distributed bundle and documented in the README (users can `flatpak override --user --filesystem=/media com.deiussum.tesserow`). Portals are the Flathub follow-up.
- [Node generator mishandles a lockfile entry (e.g. a native optional dep such as rolldown's binding) and `npm ci --offline` fails] → Pinned generator commit; fallback of adding the specific tarball as an explicit manifest source; D3 raw-cargo fallback covers `@tauri-apps/cli`'s native binary specifically.
- [Generators fetch from crates.io/npm registry at generation time, outside the sandbox] → That's by design (sources are resolved before the offline build); lockfile hashes still guarantee integrity. CI network hiccups just fail the run.
- [Cold CI builds are slow (full Rust release build per platform, ~10–20 min each, run in parallel)] → flatpak-builder cache keyed on lockfiles, `rust-cache` + npm cache for the installer jobs; PR runs limited by `paths:`.
- [Unsigned Windows installers trigger SmartScreen "Windows protected your PC" warnings] → Same as today's manual builds; documented in the README (More info → Run anyway). Signing is a future change.
- [Runner image drift (e.g. `ubuntu-22.04` retirement, WiX/NSIS or WebView2 changes)] → Tauri pins its own WiX/NSIS downloads; runner labels are one-line changes, and PR/`workflow_dispatch` runs surface breakage before a release tag.
- [CI-built installers differ subtly from past hand-built ones (different toolchain versions)] → Manual smoke-test tasks for a Linux installer and the Windows installer before relying on it for a release.
- [Window not grouped with launcher/icon missing in the taskbar on Wayland because the app_id differs from the desktop file ID] → Observed during implementation; resolved by installing the binary under the app ID (D5).
- [The Flathub-packaged `org.flatpak.Builder` is itself sandboxed and can't see `/tmp`, so `npm run flatpak` fails for a checkout under `/tmp`] → Noted in the README; a system `flatpak-builder` has no such limit, and CI uses the builder container.
- [WebKitGTK rendering glitches on some GPU drivers inside the sandbox (e.g. DMA-BUF renderer on NVIDIA)] → Same issue exists for host builds; document `flatpak override --env=WEBKIT_DISABLE_DMABUF_RENDERER=1` if encountered, don't bake it in.
- [Metainfo `<releases>` forgotten on version bump] → build.sh version check fails the build (D5).
- [GNOME 50 runtime reaches end of life] → Bump `runtime-version` and the extension branches together; CI will show breakage.

## Migration Plan

Purely additive. The next version tag after this merges is the first release built entirely by CI; from then on the release process is: bump the version (in `package.json`, `tauri.conf.json`, and a new metainfo `<release>`), merge `develop` → `main`, tag, push the tag, then write notes on and publish the (draft or existing) release. v0.1.0 can optionally get a Flatpak via `workflow_dispatch` + manual upload. Rollback is deleting the workflow/`flatpak/` directory and going back to manual builds — nothing else depends on them.

## Open Questions

- Desktop `Categories`/`Keywords` fine-tuning (e.g. adding `Crochet;Knitting;Pattern;` keywords) — cosmetic, can be adjusted anytime.
