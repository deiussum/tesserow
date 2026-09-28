## Purpose

Defines Tesserow's application icon: that it replaces the framework placeholder everywhere the app is shown, stays legible down to the smallest sizes desktops use, can be regenerated from a single committed source, and is accompanied by a sample chart showing its motif as a workable mosaic crochet pattern.

## ADDED Requirements

### Requirement: Tesserow uses its own icon everywhere it is shown
The system SHALL use the Tesserow diamond icon (a solid centre amber diamond inside one amber ring, on a navy chart background with alternating row shading, in a rounded-square tile) instead of the Tauri placeholder icon. The same icon SHALL be used in every release artifact (the Flatpak, the `.deb`, the `.rpm`, the AppImage, and the Windows `.msi` and `-setup.exe`) and for the running app's window/taskbar icon. No release artifact SHALL contain the Tauri placeholder icon.

#### Scenario: Linux desktop shows the Tesserow icon
- **WHEN** Tesserow is installed from the Flatpak or `.deb` and appears in the application launcher
- **THEN** its launcher entry shows the diamond icon, not the Tauri rings

#### Scenario: Windows shows the Tesserow icon
- **WHEN** Tesserow is installed from the `.msi` or `-setup.exe` on Windows
- **THEN** its Start menu entry, installed executable, and taskbar button show the diamond icon

#### Scenario: Running window shows the Tesserow icon
- **WHEN** the app is running
- **THEN** the window/taskbar icon is the diamond icon

### Requirement: Small icon sizes are drawn on whole pixels
The icon SHALL be provided at 16, 24, 32, and 48 px as versions drawn so that every chart cell covers a whole number of pixels, with no chart grid lines or stitch marks, so the motif stays sharp instead of blurring. At 16 px each chart cell SHALL be exactly one pixel. These versions SHALL be the ones used wherever those sizes are shown: the Windows `.ico`, the listed 32 px PNG, and the Flatpak's 16/24/32/48 px hicolor icons. Sizes of 64 px and above SHALL be rendered from the detailed master artwork.

#### Scenario: 16 px icon is pixel-exact
- **WHEN** the 16 px icon file is inspected
- **THEN** it is 16×16 pixels, each pixel is exactly one of the icon's palette colours (or transparent at the rounded corners), and the diamond's cells match the source grid one to one

#### Scenario: Flatpak installs every hicolor size
- **WHEN** the Flatpak is installed
- **THEN** the Tesserow icon exists in the hicolor theme at 16, 24, 32, 48, 128, 256, and 512 px

#### Scenario: Windows icon contains the pixel-exact sizes
- **WHEN** the Windows `.ico` is inspected
- **THEN** its 16, 24, 32, and 48 px entries are the pixel-exact versions, not downscaled copies of the master

### Requirement: Icon files are regenerated from one committed source
The icon's design SHALL be defined once, in a committed source file that describes the chart grid. The project SHALL provide one command that regenerates every icon file from that source: the detailed master, the pixel-exact small sizes, and all platform formats in `src-tauri/icons/`. Running the command on an unchanged source SHALL reproduce the committed icon files.

#### Scenario: Regenerating reproduces the committed icons
- **WHEN** a developer runs the documented icon command without changing the source
- **THEN** the files in `src-tauri/icons/` and the other generated icon files are unchanged according to `git status`

#### Scenario: Changing the design updates every format
- **WHEN** a developer edits the icon's source grid and runs the icon command
- **THEN** every generated icon file, at every size and in every format, reflects the edit

### Requirement: A sample chart shows the icon's motif as a workable pattern
The project SHALL include a sample chart file, `Resources/Samples/diamond.json`, in Tesserow's save format. It SHALL depict the icon's diamond motif, adapted as needed so that it is a valid mosaic crochet chart: every cell's colour can be produced under Tesserow's mosaic construction rules (the same rules that decide which cells the editor lets you toggle). The sample chart SHALL open in Tesserow like any other saved chart, and its written pattern and PDF export SHALL work.

#### Scenario: Sample chart opens in Tesserow
- **WHEN** the user opens `Resources/Samples/diamond.json` with File > Open
- **THEN** the chart loads and shows the stepped diamond, and the written pattern panel shows its row-by-row instructions

#### Scenario: Sample chart obeys the mosaic rules
- **WHEN** the sample chart is checked against Tesserow's mosaic construction rules
- **THEN** every cell that differs from its row's colour is one the editor could have produced by toggling, and no fixed edge cell differs from its row's colour
