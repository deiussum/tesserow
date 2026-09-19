# file-persistence Specification

## Purpose

Covers saving a chart to, and loading a chart from, a JSON file on disk via native file dialogs — independent of the PDF export flow, which produces a different file format for a different purpose.

## Requirements

### Requirement: Loading a chart from a JSON file
The system SHALL let the user pick a previously saved JSON file through a native file picker from the home screen, and SHALL parse and load a successfully picked file as the current chart, opening the editor to show it.

#### Scenario: Successful load opens the editor
- **WHEN** the user picks a valid, previously saved JSON file
- **THEN** that file's chart data becomes the current chart and the mosaic editor opens showing it

#### Scenario: Cancelling the open dialog changes nothing
- **WHEN** the user cancels the file picker
- **THEN** the home screen remains shown and no chart is loaded

### Requirement: Saving a chart to a JSON file
The system SHALL let the user choose a destination file through a native save dialog from the editor, and SHALL write the current chart's complete save data (see the mosaic domain model's save/load format) to that file as JSON once a destination is chosen.

#### Scenario: Choosing a destination writes the file
- **WHEN** the user chooses a destination file in the save dialog
- **THEN** the current chart's save data is written to that file as JSON

#### Scenario: Cancelling the save dialog writes no file
- **WHEN** the user cancels the save dialog
- **THEN** no file is written, and the editor's save-completed status message is still shown once the save flow finishes
