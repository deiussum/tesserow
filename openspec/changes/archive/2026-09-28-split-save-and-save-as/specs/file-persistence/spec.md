## ADDED Requirements

### Requirement: The open chart remembers its associated file
The system SHALL associate the open chart with at most one JSON file on disk: the file it was loaded from, or the file it was most recently saved to. Creating a new chart, importing an image as a new chart, or closing the editor SHALL clear the association, so a chart that has not yet been loaded from or saved to a file has no associated file. A cancelled or failed save SHALL leave the existing association unchanged.

#### Scenario: Loading a chart sets its associated file
- **WHEN** the user successfully loads a chart from a JSON file
- **THEN** that file becomes the chart's associated file

#### Scenario: New and imported charts have no associated file
- **WHEN** the user creates a new chart or imports an image as a new chart
- **THEN** the chart has no associated file, even if the previously open chart had one

#### Scenario: Closing clears the association
- **WHEN** the user closes the editor and later opens a new or imported chart
- **THEN** that chart has no associated file carried over from the closed one

#### Scenario: Cancelling Save As keeps the existing association
- **WHEN** a chart has an associated file and the user cancels the Save As dialog
- **THEN** the chart's associated file is unchanged

### Requirement: Save As always asks for a destination
The system SHALL provide a Save As action that always opens a native save dialog, pre-filled with the associated file's path when the chart has one. Once a destination is chosen, the system SHALL write the current chart's complete save data (see the mosaic domain model's save/load format) to that file as JSON, and that file SHALL become the chart's associated file.

#### Scenario: Save As writes to the chosen file and re-associates the chart
- **WHEN** the user chooses Save As and picks a destination file
- **THEN** the current chart's save data is written to that file as JSON
- **AND** that file becomes the chart's associated file, so a later Save writes there

#### Scenario: Save As prompts even when the chart has an associated file
- **WHEN** the chart already has an associated file and the user chooses Save As
- **THEN** the save dialog opens, pre-filled with the associated file's path

#### Scenario: Cancelling the Save As dialog writes no file
- **WHEN** the user cancels the Save As dialog
- **THEN** no file is written, and the editor's save-completed status message is still shown once the save flow finishes

### Requirement: A failed file write is reported and does not count as saved
The system SHALL report a failure to write the chart's file (for example, the destination is no longer writable) to the user, SHALL leave the chart's unsaved-changes state and associated file unchanged, and SHALL NOT report the save as completed.

#### Scenario: Write failure during Save
- **WHEN** the chart has an associated file, the user chooses Save, and writing that file fails
- **THEN** the user is shown that the save failed
- **AND** the chart still has unsaved changes if it had them before

## MODIFIED Requirements

### Requirement: Loading a chart from a JSON file
The system SHALL let the user pick a previously saved JSON file through a native file picker from the home screen, and SHALL parse and load a successfully picked file as the current chart, opening the editor to show it. The picked file SHALL become the loaded chart's associated file.

#### Scenario: Successful load opens the editor
- **WHEN** the user picks a valid, previously saved JSON file
- **THEN** that file's chart data becomes the current chart and the mosaic editor opens showing it
- **AND** that file becomes the chart's associated file

#### Scenario: Cancelling the open dialog changes nothing
- **WHEN** the user cancels the file picker
- **THEN** the home screen remains shown and no chart is loaded

### Requirement: Saving a chart to a JSON file
The system SHALL provide a Save action. When the chart has an associated file, Save SHALL write the current chart's complete save data (see the mosaic domain model's save/load format) to that file as JSON without showing any dialog. When the chart has no associated file, Save SHALL behave exactly like Save As: open a native save dialog, write to the chosen file, and make it the chart's associated file.

#### Scenario: Save with an associated file writes without prompting
- **WHEN** the chart has an associated file and the user chooses Save
- **THEN** the current chart's save data is written to that file as JSON
- **AND** no save dialog is shown

#### Scenario: Choosing a destination writes the file
- **WHEN** the chart has no associated file, the user chooses Save, and picks a destination in the save dialog that opens
- **THEN** the current chart's save data is written to that file as JSON
- **AND** that file becomes the chart's associated file

#### Scenario: Subsequent saves reuse the chosen file
- **WHEN** the user saves a new chart once (choosing a destination), makes further changes, and chooses Save again
- **THEN** the second save writes to the same file without showing a dialog

#### Scenario: Cancelling the save dialog writes no file
- **WHEN** Save shows the save dialog (because the chart has no associated file) and the user cancels it
- **THEN** no file is written, the chart still has no associated file, and the editor's save-completed status message is still shown once the save flow finishes
