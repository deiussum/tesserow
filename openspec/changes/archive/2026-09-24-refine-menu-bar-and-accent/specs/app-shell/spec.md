## ADDED Requirements

### Requirement: Menu bar places Help at the trailing edge
The system SHALL lay out the menu bar with File and View grouped at the leading (left) edge and Help at the trailing (right) edge, with the remaining width of the bar between them. This layout SHALL hold whether or not a mosaic is open.

#### Scenario: Menu bar layout on the Home screen
- **WHEN** no mosaic is open
- **THEN** File and View appear at the left edge of the menu bar and Help appears at the right edge

#### Scenario: Menu bar layout in the editor
- **WHEN** a mosaic is open
- **THEN** File and View appear at the left edge of the menu bar and Help appears at the right edge

### Requirement: Dialog actions distinguish dismissing from confirming
The system SHALL render a dialog's dismiss action (Cancel, or Close on a dialog with no other action) as a visually secondary control, separate from and less prominent than the dialog's confirming action. A confirming action that discards the user's work SHALL be styled as destructive (the theme's error color), distinct from the styling of non-destructive confirming actions.

#### Scenario: Two-action dialog
- **WHEN** a dialog offers both Cancel and a confirming action (for example Create, Import, or Export)
- **THEN** Cancel is shown as a secondary control and the confirming action as a separate, more prominent control in the theme's accent color

#### Scenario: Destructive confirmation
- **WHEN** the discard-unsaved-changes confirmation is shown
- **THEN** its Discard action is styled in the theme's error color, not the accent color used by non-destructive confirmations
- **AND** Cancel is shown as a secondary control

#### Scenario: Single-action dialog
- **WHEN** a dialog's only action is Close (for example About or contextual Help)
- **THEN** Close is shown as a secondary control

### Requirement: Commands that ask for further input are labeled with an ellipsis
The system SHALL end the label of a menu item or button with an ellipsis ("...") when choosing it always asks the user for more input (a form dialog or a file picker) before the action completes. It SHALL NOT use an ellipsis on commands that act immediately, show only information, or ask only for a confirmation that appears conditionally (for example Close and Exit, which prompt only when there are unsaved changes). In the File menu this means New..., Open..., Import Image..., Save..., and Export to PDF... carry an ellipsis while Close and Exit do not; on the Home screen, New Mosaic..., Open..., and Import Image... carry one.

#### Scenario: File menu labels
- **WHEN** the user opens the File menu
- **THEN** New, Open, Import Image, Save, and Export to PDF are labeled with a trailing ellipsis
- **AND** Close and Exit are labeled without one

#### Scenario: Home screen labels
- **WHEN** the Home screen is displayed
- **THEN** its New Mosaic, Open, and Import Image actions are labeled with a trailing ellipsis

#### Scenario: Information-only command
- **WHEN** the user opens the Help menu
- **THEN** About Tesserow is labeled without an ellipsis
