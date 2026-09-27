## Purpose

Defines how Tesserow's release artifacts are produced and published: a sandboxed Flatpak built from source (with the desktop integration and permissions the app needs for its existing workflows to keep working), the native Linux and Windows installers, and the CI workflow that builds all of them and attaches them to GitHub releases.

## ADDED Requirements

### Requirement: The Flatpak is built from source without network access
The project SHALL provide a Flatpak manifest that compiles both the frontend and the Tauri host from the repository's source inside the Flatpak build sandbox. All npm and cargo dependencies SHALL be supplied to the build as pre-declared, checksummed sources derived from the committed lockfiles (`package-lock.json` and `src-tauri/Cargo.lock`), so that the build steps themselves run with no network access. The build SHALL NOT depend on a prebuilt Tesserow binary or on a `.deb`/`.rpm`/AppImage produced outside the sandbox.

#### Scenario: Clean offline build succeeds
- **WHEN** the Flatpak is built from a clean checkout with the required runtime, SDK, and SDK extensions installed
- **THEN** the build completes and produces an installable Tesserow Flatpak without any build step fetching from the network

#### Scenario: Dependency sources track the lockfiles
- **WHEN** a dependency in `package-lock.json` or `src-tauri/Cargo.lock` is added, removed, or bumped
- **THEN** the next Flatpak build uses the updated dependency set without anyone hand-editing the manifest's dependency list

### Requirement: The Flatpak uses the app's existing identity
The Flatpak SHALL use `com.deiussum.tesserow` as its application ID, matching the Tauri `identifier`, and SHALL report the same version as `tauri.conf.json`. It SHALL target the GNOME runtime so that WebKitGTK (the webview Tauri uses on Linux) is provided by the runtime rather than bundled.

#### Scenario: Installed app ID and version
- **WHEN** the Flatpak bundle is installed and `flatpak info com.deiussum.tesserow` is run
- **THEN** it reports application ID `com.deiussum.tesserow` and the version from `tauri.conf.json`

### Requirement: The Flatpak integrates with the desktop
The Flatpak SHALL install a desktop entry that launches Tesserow and is named "Tesserow", the Tesserow application icon in the hicolor icon theme, and AppStream metainfo that validates and describes the app (name, summary, description, license, and the current release), so the app appears with its name and icon in application launchers and software centers.

#### Scenario: App appears in the launcher
- **WHEN** the Flatpak is installed on a desktop session
- **THEN** a "Tesserow" entry with the Tesserow icon appears in the application launcher, and choosing it opens the Tesserow window

#### Scenario: Metainfo validates
- **WHEN** the installed metainfo is checked with the AppStream validator
- **THEN** it passes validation with no errors

### Requirement: The sandboxed app keeps its existing file workflows
The Flatpak SHALL grant the sandbox the display, GPU, and filesystem access needed for the app to behave the same as the non-Flatpak builds. In particular, from inside the Flatpak the user SHALL be able to open and save mosaic files, import an image, and export a PDF (including merging a cover PDF) to and from locations in their home directory using the app's file dialogs. The Flatpak SHALL NOT be granted access beyond what these workflows and rendering require (for example, no network access and no access to the host filesystem outside the user's home directory).

#### Scenario: Save and reopen a mosaic
- **WHEN** the user saves a mosaic to a folder in their home directory from the Flatpak, then opens it again
- **THEN** the file is written to that location and reopens with the same chart

#### Scenario: Import an image from the home directory
- **WHEN** the user chooses File > Import Image in the Flatpak and selects an image in their home directory
- **THEN** the image preview/threshold flow runs the same as in the non-Flatpak build

#### Scenario: Export a PDF with a cover
- **WHEN** the user exports a PDF with a cover PDF selected, both in their home directory, from the Flatpak
- **THEN** the merged PDF is written to the chosen location in their home directory

#### Scenario: Runs on Wayland and X11
- **WHEN** the Flatpak is launched in a Wayland session, or in an X11 session
- **THEN** the Tesserow window opens and renders in either case

### Requirement: The Flatpak can be built locally as a single-file bundle
The project SHALL provide one documented command that, given `flatpak-builder` and the required runtimes, regenerates the offline dependency sources from the lockfiles, runs the Flatpak build, and produces a single-file `.flatpak` bundle that can be installed with `flatpak install`.

#### Scenario: Local build produces an installable bundle
- **WHEN** a developer runs the documented Flatpak build command from the repo root
- **THEN** a `.flatpak` bundle file is produced, and `flatpak install --user <bundle>` installs a runnable Tesserow

### Requirement: CI builds the Linux and Windows installers
The project SHALL build the native installers in CI from the checked-out commit, using the same build command the project uses locally (`npm run make`), with no code-signing secrets required. The Linux build SHALL produce a `.deb`, an `.rpm`, and an AppImage; the Windows build SHALL produce an `.msi` and an NSIS `-setup.exe`. Artifact file names SHALL follow the existing Tauri naming used by past releases (for example `Tesserow_<version>_amd64.deb`, `Tesserow-<version>-1.x86_64.rpm`, `Tesserow_<version>_amd64.AppImage`, `Tesserow_<version>_x64_en-US.msi`, `Tesserow_<version>_x64-setup.exe`). Windows installers are unsigned, the same as manually built releases today.

#### Scenario: Linux installers are produced
- **WHEN** the CI workflow runs for a commit whose `tauri.conf.json` version is `0.2.0`
- **THEN** it produces `Tesserow_0.2.0_amd64.deb`, `Tesserow-0.2.0-1.x86_64.rpm`, and `Tesserow_0.2.0_amd64.AppImage`

#### Scenario: Windows installers are produced
- **WHEN** the CI workflow runs for a commit whose `tauri.conf.json` version is `0.2.0`
- **THEN** it produces `Tesserow_0.2.0_x64_en-US.msi` and `Tesserow_0.2.0_x64-setup.exe`

#### Scenario: CI-built installers install and run
- **WHEN** a CI-built Linux installer (`.deb` or AppImage) is installed/run on Linux, or a CI-built Windows installer is run on Windows
- **THEN** Tesserow installs and launches the same as a manually built release

### Requirement: CI builds and publishes all release artifacts
The project SHALL have a GitHub Actions workflow that builds the Flatpak bundle and the Linux and Windows installers from the checked-out commit. The workflow SHALL run when a version tag (`v*`) is pushed, when manually dispatched, and on pull requests that change the Flatpak packaging files, the Tauri host (`src-tauri/`), frontend build configuration (`package.json`, `vite.config.ts`), the lockfiles, or the workflow itself. Every successful platform build SHALL make its artifacts available as downloadable workflow artifacts. A run triggered by a version tag SHALL additionally attach every artifact to the GitHub release for that tag, but only after all platform builds have succeeded, so a release is never left with a partial set of artifacts. It SHALL create that release as a draft if it does not exist yet, and SHALL NOT overwrite an existing release's title, notes, or draft/published state.

#### Scenario: Tag push publishes to the release
- **WHEN** a tag such as `v0.2.0` is pushed to GitHub and all platform builds succeed
- **THEN** the `.flatpak` bundle, `.deb`, `.rpm`, AppImage, `.msi`, and `-setup.exe` all appear as assets on the `v0.2.0` GitHub release

#### Scenario: A failed platform build publishes nothing
- **WHEN** a version tag is pushed and any one platform build fails
- **THEN** no artifacts from that run are attached to the release

#### Scenario: Existing release notes are preserved
- **WHEN** a version tag is pushed for which the maintainer has already created a GitHub release with notes
- **THEN** the artifacts are attached to that release and its title, notes, and draft/published state are unchanged

#### Scenario: Packaging change is checked on a PR
- **WHEN** a pull request modifies the Flatpak manifest, anything under `src-tauri/`, `package-lock.json`, or `src-tauri/Cargo.lock`
- **THEN** the workflow builds all platform artifacts for that PR and the PR shows a failing check if any build fails

#### Scenario: Unrelated PR does not trigger the build
- **WHEN** a pull request changes only files unrelated to packaging, the Tauri host, build configuration, or dependencies (for example, only `src/` components)
- **THEN** the release workflow does not run for that PR
