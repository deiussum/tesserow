# app-shell Specification

## Purpose

Defines the app's persistent shell — a top bar with contextual actions that wraps both the no-mosaic (Home) and mosaic-open (Editor) states instead of each owning separate full-screen chrome — along with the app-wide visual theme and window title it establishes.

## Requirements

### Requirement: A persistent shell wraps both the Home and Editor states
The system SHALL show the same top bar across both the no-mosaic (Home) and mosaic-open (Editor) states, rather than replacing it when switching between them.

#### Scenario: Opening a mosaic keeps the shell
- **WHEN** the user creates, loads, or imports a mosaic from the no-mosaic state
- **THEN** the same top bar remains visible as the content area switches to the editor view

#### Scenario: Closing a mosaic keeps the shell
- **WHEN** the user closes an open mosaic
- **THEN** the same top bar remains visible as the content area switches back to the no-mosaic state

### Requirement: Top bar actions are contextual to whether a mosaic is open
The system SHALL show actions to create a new mosaic, load a saved file, or import an image in the top bar when no mosaic is open, and SHALL show actions to save, export, zoom, and close when one is open, without mixing the two sets. Showing and hiding the written pattern is handled by a handle on the pattern panel itself (see the mosaic-editor capability), not a top bar action.

#### Scenario: No mosaic open
- **WHEN** no mosaic is currently open
- **THEN** the top bar shows the new/open/import actions and does not show actions that require an open mosaic

#### Scenario: Mosaic open
- **WHEN** a mosaic is currently open
- **THEN** the top bar shows the save/export/zoom/close actions and does not show the no-mosaic actions

### Requirement: App-wide visual theme is consistent
The system SHALL apply one consistent visual theme across the page background and all UI components, rather than mixing a custom page background with a UI toolkit's unrelated default theme.

#### Scenario: Components match the page's visual style
- **WHEN** any screen is displayed
- **THEN** UI components (buttons, dialogs, panels, the top bar) render using the same color scheme as the surrounding page background, rather than an unrelated default theme

### Requirement: Window title identifies the app
The system SHALL set the application window's title to "Tesserow".

#### Scenario: Launching the app
- **WHEN** the application window opens
- **THEN** its title reads "Tesserow"
