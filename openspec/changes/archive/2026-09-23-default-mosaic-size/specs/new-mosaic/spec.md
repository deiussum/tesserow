## ADDED Requirements

### Requirement: Width and height default to a preset value
The system SHALL pre-fill the new-mosaic form's width and height fields with a default of 20 when the form opens, instead of leaving them blank. The user SHALL be able to edit either field before submitting, and the defaults SHALL NOT reappear once the user has changed a field's value for the current form session.

#### Scenario: Form opens with defaults
- **WHEN** the user opens the new-mosaic form
- **THEN** the width and height fields are pre-filled with 20

#### Scenario: User overrides a default before submitting
- **WHEN** the user opens the new-mosaic form and changes the width or height field to a different value, then submits
- **THEN** the chart is created using the values the user entered, not the defaults
