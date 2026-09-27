## Why

Every Tesserow release is currently built by hand: the Linux `.deb`/`.rpm`/AppImage on the maintainer's Linux machine, and the Windows `.msi`/`.exe` separately on a work machine, then uploaded manually. That makes releases slow, easy to leave incomplete, and dependent on whatever toolchains those machines happen to have. Linux users on immutable/atomic distros (Fedora Silverblue, SteamOS, Bazzite, etc.) also have no good install path, since Flatpak is the expected format there and the AppImage depends on the host's WebKitGTK/glibc. Building every release artifact in CI — including a new, sandboxed Flatpak built from source — makes releases repeatable and complete from a single tag push.

## What Changes

- Add a Flatpak manifest (`flatpak/com.deiussum.tesserow.yml`) that builds Tesserow **from source** inside `flatpak-builder`: the frontend (Vite) and the Rust/Tauri host are both compiled in the sandbox against the GNOME runtime, with no network access during the build — npm and cargo dependencies come from offline source lists generated from `package-lock.json` and `src-tauri/Cargo.lock`.
- Add the desktop-integration files the Flatpak installs: a `.desktop` entry, hicolor icons (reusing `src-tauri/icons/`), and an AppStream metainfo file, all keyed to the existing app identifier `com.deiussum.tesserow`.
- Grant the Flatpak sandbox the permissions the app needs to work unchanged: a display (Wayland with X11 fallback), GPU access for WebKit, and read/write access to the user's home directory so the existing file dialogs, save/open, image import, and PDF export keep working without code changes.
- Add a local build script that regenerates the offline dependency lists and runs `flatpak-builder`, producing a single-file `.flatpak` bundle.
- Add a GitHub Actions workflow (`.github/workflows/release.yml`) that builds **all** release artifacts from the checked-out commit:
  - the Flatpak bundle (in the official Flatpak builder container),
  - the Linux `.deb`, `.rpm`, and AppImage (via the existing `npm run make`, on an Ubuntu runner),
  - the Windows `.msi` and NSIS `-setup.exe` (via the existing `npm run make`, on a Windows runner).

  It runs on pushed version tags (attaching every artifact to that tag's GitHub release, only once all platform builds succeed), on manual dispatch, and on pull requests that touch packaging, build config, the Tauri host, or lockfiles.
- Document building and installing the Flatpak, and the unsigned-installer warnings, in `README.md`; add the new command to `AGENTS.md`; update the release steps in `CONTRIBUTING.md` to rely on CI instead of manual builds.

No application source changes are planned. Out of scope: macOS builds; code signing or notarization for any platform (installers stay unsigned, as today); submitting to Flathub (would additionally require portal-only file access, committed generated sources, screenshots, and Flathub review); non-x86_64 architectures; hosting a Flatpak repository/remote.

## Capabilities

### New Capabilities
- `release-builds`: How Tesserow's release artifacts are produced and published — the Flatpak (offline from-source build, app identity and desktop integration, sandbox permissions required for the app's file workflows) and the Linux/Windows installers, and the CI workflow that builds all of them and attaches them to GitHub releases.

### Modified Capabilities
None — the application's own behavior is unchanged; the Flatpak must preserve existing file-persistence, image-import, and PDF-export behavior rather than altering those specs.

## Impact

- **New files**: `flatpak/com.deiussum.tesserow.yml` (manifest), `flatpak/com.deiussum.tesserow.desktop`, `flatpak/com.deiussum.tesserow.metainfo.xml`, `flatpak/build.sh` (local build helper), `.github/workflows/release.yml`.
- **Modified files**: `README.md` (install/build instructions, unsigned-installer notes), `AGENTS.md` (commands), `CONTRIBUTING.md` (release steps), `.gitignore` (flatpak-builder state, build dirs, generated source lists, bundle output), `package.json` (a `flatpak` npm script wrapping `flatpak/build.sh`).
- **Build dependencies (not runtime deps of the app)**: `flatpak-builder`; the `org.gnome.Platform`/`org.gnome.Sdk` runtime (branch 50, which ships `webkit2gtk-4.1`); the `org.freedesktop.Sdk.Extension.rust-stable` and `node` SDK extensions (branch 25.08); `flatpak-builder-tools`' cargo and node generators (Python), fetched at build time.
- **CI**: First GitHub Actions workflow in the repo. Uses GitHub-hosted `ubuntu-22.04`, `ubuntu-latest` (Flatpak container), and `windows-latest` runners; needs `contents: write` on tag builds to attach artifacts to a release. No secrets required (nothing is signed).
- **Release process**: Manual building/uploading of installers is replaced by pushing a version tag; the maintainer still writes release notes and publishes the release.
- **No changes to**: `src/`, `src-tauri/` source or config, the local `npm run make` / `npm run package` commands.
