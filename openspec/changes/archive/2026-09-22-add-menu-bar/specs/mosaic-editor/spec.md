## MODIFIED Requirements

### Requirement: Editor provides save, export, and close actions
The system SHALL let the user save the current chart to a file, open the PDF export options, or close the editor and return to the home screen, from the File menu (see the app-shell capability).

#### Scenario: Saving shows progress feedback
- **WHEN** the user chooses File > Save
- **THEN** the status bar shows a saving-in-progress message, then updates to a completed message once the save flow finishes (see the file-persistence capability for whether a file was actually written)

#### Scenario: Export opens the export options dialog
- **WHEN** the user chooses File > Export to PDF
- **THEN** the export options dialog opens

#### Scenario: Closing returns to the home screen
- **WHEN** the user chooses File > Close
- **THEN** the editor closes and the home screen is shown

## ADDED Requirements

### Requirement: View menu mirrors zoom and written-pattern controls
The system SHALL let the user zoom in, zoom out, reset zoom, and toggle the written-pattern panel from the View menu (see the app-shell capability), in addition to the status bar's zoom controls and the panel's own handle. Menu-triggered zoom actions SHALL have the same effect and respect the same 25%-400% clamped range as the status bar's zoom controls, and the View menu's written-pattern item SHALL show a checked state that matches whether the panel is currently open.

#### Scenario: View menu zoom actions match the status bar
- **WHEN** the user chooses Zoom In, Zoom Out, or Reset Zoom from the View menu
- **THEN** the chart redraws exactly as it would from the equivalent status bar control, and the displayed zoom percentage updates to match

#### Scenario: View menu zoom respects the clamped range
- **WHEN** the user chooses Zoom In from the View menu while already at 400%, or Zoom Out while already at 25%
- **THEN** the zoom level stays at that bound and the chart is unchanged

#### Scenario: View menu toggles the written-pattern panel
- **WHEN** the user chooses the Written Pattern item from the View menu
- **THEN** the pattern panel opens or closes exactly as it would from clicking the panel's handle

#### Scenario: View menu reflects the panel's current state
- **WHEN** the written-pattern panel is open
- **THEN** the View menu's Written Pattern item shows a checked state
