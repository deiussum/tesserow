## MODIFIED Requirements

### Requirement: Top bar actions are contextual to whether a mosaic is open
The system SHALL show actions to create a new mosaic, load a saved file, or import an image in the top bar when no mosaic is open, and SHALL show actions to save, export, and close when one is open, without mixing the two sets. Showing and hiding the written pattern is handled by a handle on the pattern panel itself (see the mosaic-editor capability), not a top bar action. Zoom controls live in the status bar (see the mosaic-editor capability), not the top bar.

#### Scenario: No mosaic open
- **WHEN** no mosaic is currently open
- **THEN** the top bar shows the new/open/import actions and does not show actions that require an open mosaic

#### Scenario: Mosaic open
- **WHEN** a mosaic is currently open
- **THEN** the top bar shows the save/export/close actions and does not show the no-mosaic actions or zoom controls
