# new-mosaic Specification

## Purpose

Covers the "create a new, blank mosaic" flow: the form the user fills in to choose a chart's size and optional starting border rows before an empty chart is generated.

## Requirements

### Requirement: Width and height are required to create a chart
The system SHALL require a width and a height on the new-mosaic form before a chart can be created; it SHALL flag either field as an error and SHALL NOT create a chart while either is blank.

#### Scenario: Missing width or height blocks submission
- **WHEN** the user submits the new-mosaic form with the width or height field empty
- **THEN** the empty field is marked as an error
- **AND** no chart is created

#### Scenario: Valid width and height create a chart
- **WHEN** the user submits the form with a width and a height provided
- **THEN** a new, blank chart of that width and height is created and the form closes

### Requirement: Optional extra starting rows
The system SHALL let the user optionally request a number of extra border rows, added in matching pairs to the top and bottom of the chart, all in the same starting color. This option SHALL be off by default and SHALL only take effect when explicitly enabled.

#### Scenario: Extra rows disabled by default
- **WHEN** the user creates a chart without enabling the extra-rows option
- **THEN** the chart is created with no extra border rows

#### Scenario: Extra rows enabled
- **WHEN** the user enables the extra-rows option and specifies a count, then submits the form
- **THEN** the created chart includes that many additional rows added to both the top and bottom, beyond the requested height

### Requirement: Cancelling closes the form without creating a chart
The system SHALL let the user cancel the new-mosaic form at any point before submitting, and SHALL leave the application state unchanged when they do.

#### Scenario: Cancel discards the form
- **WHEN** the user cancels the new-mosaic form
- **THEN** the form closes and no chart is created

### Requirement: Width and height default to a preset value
The system SHALL pre-fill the new-mosaic form's width and height fields with a default of 20 when the form opens, instead of leaving them blank. The user SHALL be able to edit either field before submitting, and the defaults SHALL NOT reappear once the user has changed a field's value for the current form session.

#### Scenario: Form opens with defaults
- **WHEN** the user opens the new-mosaic form
- **THEN** the width and height fields are pre-filled with 20

#### Scenario: User overrides a default before submitting
- **WHEN** the user opens the new-mosaic form and changes the width or height field to a different value, then submits
- **THEN** the chart is created using the values the user entered, not the defaults
