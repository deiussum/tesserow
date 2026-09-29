## ADDED Requirements

### Requirement: Chart tracks whether it has unsaved changes
The system SHALL track whether the current chart has changes since it was created, loaded, or last saved. A successful cell-color toggle SHALL mark the chart as having unsaved changes. Initializing a new chart, loading a chart, successfully saving a chart, or closing the editor (see the mosaic-editor capability) SHALL clear the unsaved-changes state - once a close (confirmed if it required discarding unsaved changes - see the app-shell capability's discard-confirmation requirement) actually proceeds, nothing remains for a later Exit or OS window-close to warn about.

#### Scenario: Toggling a cell marks the chart as having unsaved changes
- **WHEN** a cell's color is successfully toggled
- **THEN** the chart is marked as having unsaved changes

#### Scenario: A rejected toggle does not mark the chart dirty
- **WHEN** a cell-color toggle is rejected by the construction rules
- **THEN** the chart's unsaved-changes state is unchanged

#### Scenario: Creating or loading a chart clears the unsaved-changes state
- **WHEN** a new chart is initialized or an existing chart is loaded
- **THEN** the chart is marked as having no unsaved changes

#### Scenario: Saving a chart clears the unsaved-changes state
- **WHEN** the current chart is successfully saved to a file
- **THEN** the chart is marked as having no unsaved changes

#### Scenario: Closing the editor clears the unsaved-changes state
- **WHEN** the user closes the editor (File > Close) while the chart has unsaved changes
- **THEN** the chart is marked as having no unsaved changes, so a subsequent Exit or OS window-close does not prompt to discard changes that were already abandoned by Close
