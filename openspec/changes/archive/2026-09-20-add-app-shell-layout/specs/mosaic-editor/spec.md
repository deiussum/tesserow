## MODIFIED Requirements

### Requirement: Written pattern can be viewed and copied
The system SHALL show a persistent handle on the edge of the written-pattern panel, visible whether the panel is collapsed or expanded, that toggles the panel open or closed when clicked. While the panel is open, the system SHALL let the user copy its displayed text to the clipboard.

#### Scenario: Opening the written pattern dialog
- **WHEN** the user clicks the panel's handle while the panel is collapsed
- **THEN** the panel opens displaying the current chart's written pattern text alongside the canvas

#### Scenario: Hiding the pattern panel
- **WHEN** the user clicks the panel's handle while the panel is open
- **THEN** the panel closes and the canvas regains the width it freed

#### Scenario: Copying the pattern
- **WHEN** the user clicks "Copy" while the pattern panel is shown
- **THEN** the displayed pattern text is placed on the system clipboard

#### Scenario: The canvas stays interactive while the panel is open
- **WHEN** the pattern panel is open
- **THEN** the user can still view and click cells on the canvas without closing the panel
