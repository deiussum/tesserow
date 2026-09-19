## Purpose

Covers the mosaic editing screen: viewing and zooming the chart, toggling cells by clicking, viewing the written pattern, and the save/export/close actions available from the editor's toolbar.

## ADDED Requirements

### Requirement: Chart is rendered on a zoomable canvas
The system SHALL render the current chart on a canvas at a default zoom of 100%, with buttons to zoom in and out, and SHALL keep the displayed zoom percentage in sync with the canvas's current scale.

#### Scenario: Editor opens at default zoom
- **WHEN** the mosaic editor is opened
- **THEN** the chart is rendered at 100% zoom and the toolbar shows "Zoom: 100%"

#### Scenario: Zoom buttons change scale
- **WHEN** the user clicks the zoom-in or zoom-out button
- **THEN** the chart redraws at the new scale and the displayed zoom percentage updates to match

### Requirement: Hovering a cell highlights it
The system SHALL highlight the cell currently under the cursor as the pointer moves over the chart, distinguishing it from the rest of the chart.

#### Scenario: Hover highlight follows the pointer
- **WHEN** the user moves the pointer from one cell to another over the chart
- **THEN** the newly hovered cell is highlighted and the previously hovered cell returns to its normal appearance

### Requirement: Clicking a cell attempts to toggle its color
The system SHALL attempt to toggle a clicked cell's color, subject to the mosaic domain model's construction rules (edge cells and cells that would break the alternating construction cannot be toggled).

#### Scenario: Clicking a togglable cell flips its color
- **WHEN** the user clicks an interior cell that is allowed to change color
- **THEN** the cell's color flips and the display updates immediately

#### Scenario: Clicking a locked cell has no effect
- **WHEN** the user clicks a cell that the construction rules do not allow to change color
- **THEN** the cell's color is unchanged

### Requirement: Written pattern can be viewed and copied
The system SHALL let the user open a dialog showing the full written (text) pattern for the current chart, and SHALL let them copy that text to the clipboard.

#### Scenario: Opening the written pattern dialog
- **WHEN** the user clicks "Show Written Pattern"
- **THEN** a dialog opens displaying the current chart's written pattern text

#### Scenario: Copying the pattern
- **WHEN** the user clicks "Copy" in the written pattern dialog
- **THEN** the displayed pattern text is placed on the system clipboard

### Requirement: Editor provides save, export, and close actions
The system SHALL let the user save the current chart to a file, open the PDF export options, or close the editor and return to the home screen, from the editor's toolbar.

#### Scenario: Saving shows progress feedback
- **WHEN** the user clicks "Save"
- **THEN** the status bar shows a saving-in-progress message, then updates to a completed message once the save flow finishes (see the file-persistence capability for whether a file was actually written)

#### Scenario: Export opens the export options dialog
- **WHEN** the user clicks "Export to PDF"
- **THEN** the export options dialog opens

#### Scenario: Closing returns to the home screen
- **WHEN** the user clicks "Close"
- **THEN** the editor closes and the home screen is shown
