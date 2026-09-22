# mosaic-editor Specification

## Purpose

Covers the mosaic editing screen: viewing and zooming the chart, toggling cells by clicking, viewing the written pattern, and the save/export/close actions available from the editor's toolbar.

## Requirements

### Requirement: Chart is rendered on a zoomable canvas
The system SHALL render the current chart on a canvas at a default zoom of 100%, with zoom-in, zoom-out, and reset controls in the status bar, and SHALL keep the displayed zoom percentage in sync with the canvas's current scale. Zoom SHALL be clamped to a range of 25% to 400%.

#### Scenario: Editor opens at default zoom
- **WHEN** the mosaic editor is opened
- **THEN** the chart is rendered at 100% zoom and the status bar shows "Zoom: 100%"

#### Scenario: Zoom buttons change scale
- **WHEN** the user clicks the zoom-in or zoom-out control in the status bar
- **THEN** the chart redraws at the new scale and the displayed zoom percentage updates to match

#### Scenario: Zooming in stops at the maximum
- **WHEN** the user zooms in while already at 400%
- **THEN** the zoom level stays at 400% and the chart is unchanged

#### Scenario: Zooming out stops at the minimum
- **WHEN** the user zooms out while already at 25%
- **THEN** the zoom level stays at 25% and the chart is unchanged

#### Scenario: Resetting zoom returns to 100%
- **WHEN** the user clicks the reset control in the status bar
- **THEN** the chart redraws at 100% zoom and the status bar shows "Zoom: 100%"

### Requirement: Chart zoom can be set from a menu of common presets
The system SHALL let the user click the status bar's zoom percentage to open a menu of common zoom presets (25%, 50%, 75%, 100%, 150%, 200%, 300%, 400%), and SHALL apply the selected preset as the new zoom level, redrawing the chart and updating the displayed percentage to match.

#### Scenario: Opening the preset menu
- **WHEN** the user clicks the zoom percentage text in the status bar
- **THEN** a menu listing the common zoom presets appears

#### Scenario: Selecting a preset
- **WHEN** the user selects a preset from the menu
- **THEN** the chart redraws at that zoom level, the status bar shows the matching percentage, and the menu closes

#### Scenario: Dismissing the menu without selecting
- **WHEN** the user clicks outside the open preset menu
- **THEN** the menu closes and the zoom level is unchanged

### Requirement: Chart supports scroll-wheel zoom
The system SHALL let the user zoom the chart by holding Ctrl (Cmd on macOS) while scrolling the mouse wheel or trackpad over the canvas, respecting the same 25%-400% clamped range and keeping the displayed zoom percentage in sync.

#### Scenario: Ctrl+scroll zooms in and out
- **WHEN** the user holds Ctrl (Cmd on macOS) and scrolls over the canvas
- **THEN** the chart redraws at the new scale and the displayed zoom percentage updates to match

#### Scenario: Ctrl+scroll respects the clamped range
- **WHEN** the user holds Ctrl (Cmd on macOS) and scrolls past what would exceed 400% or fall below 25%
- **THEN** the zoom level stops at the nearest bound instead of exceeding it

### Requirement: Chart supports keyboard zoom shortcuts
The system SHALL let the user zoom in, zoom out, and reset zoom to 100% via keyboard shortcuts (Ctrl/Cmd `+`, Ctrl/Cmd `-`, and Ctrl/Cmd `0` respectively) while the editor is open, respecting the same 25%-400% clamped range.

#### Scenario: Keyboard shortcut zooms in
- **WHEN** the user presses Ctrl/Cmd `+` while the editor is open
- **THEN** the chart redraws at the next zoom step and the displayed zoom percentage updates to match

#### Scenario: Keyboard shortcut zooms out
- **WHEN** the user presses Ctrl/Cmd `-` while the editor is open
- **THEN** the chart redraws at the previous zoom step and the displayed zoom percentage updates to match

#### Scenario: Keyboard shortcut resets zoom
- **WHEN** the user presses Ctrl/Cmd `0` while the editor is open
- **THEN** the chart redraws at 100% zoom and the status bar shows "Zoom: 100%"

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
The system SHALL show a persistent handle on the edge of the written-pattern panel, visible whether the panel is collapsed or expanded, that toggles the panel open or closed when clicked. While the panel is open, the system SHALL let the user copy its displayed text to the clipboard, and the "Copy" control SHALL remain visible at all times regardless of how long the pattern text is or how far the user has scrolled it. While the panel is open, the system SHALL let the user drag a resize handle on the panel's left edge to change its width, clamped between 240px and 720px. The panel SHALL NOT obscure the status bar; the status bar (including its zoom controls) SHALL remain fully visible and usable whether the panel is open or collapsed, at any width the panel is resized to.

#### Scenario: Opening the written pattern dialog
- **WHEN** the user clicks the panel's handle while the panel is collapsed
- **THEN** the panel opens displaying the current chart's written pattern text alongside the canvas

#### Scenario: Hiding the pattern panel
- **WHEN** the user clicks the panel's handle while the panel is open
- **THEN** the panel closes and the canvas regains the width it freed

#### Scenario: Copying the pattern
- **WHEN** the user clicks "Copy" while the pattern panel is shown
- **THEN** the displayed pattern text is placed on the system clipboard

#### Scenario: Copy button stays visible while scrolling a long pattern
- **WHEN** the pattern text is long enough that the panel's text area scrolls
- **THEN** the "Copy" button remains visible and clickable at all scroll positions, without the user needing to scroll to find it

#### Scenario: Resizing the panel
- **WHEN** the user drags the panel's resize handle
- **THEN** the panel's width follows the drag and the canvas area shrinks or grows to fill the remaining space

#### Scenario: Resize is clamped to a minimum and maximum width
- **WHEN** the user drags the resize handle past 240px narrower or 720px wider than allowed
- **THEN** the panel's width stops at the nearest bound instead of exceeding it

#### Scenario: The canvas stays interactive while the panel is open
- **WHEN** the pattern panel is open
- **THEN** the user can still view and click cells on the canvas without closing the panel

#### Scenario: The status bar stays visible while the panel is open
- **WHEN** the pattern panel is open, at any width it has been resized to
- **THEN** the status bar, including its zoom controls, remains fully visible below the canvas and panel, unobstructed by the panel

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
