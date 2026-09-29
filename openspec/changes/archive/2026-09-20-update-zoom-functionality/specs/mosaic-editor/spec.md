## MODIFIED Requirements

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

### Requirement: Written pattern can be viewed and copied
The system SHALL show a persistent handle on the edge of the written-pattern panel, visible whether the panel is collapsed or expanded, that toggles the panel open or closed when clicked. While the panel is open, the system SHALL let the user copy its displayed text to the clipboard. The panel SHALL NOT obscure the status bar; the status bar (including its zoom controls) SHALL remain fully visible and usable whether the panel is open or collapsed.

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

#### Scenario: The status bar stays visible while the panel is open
- **WHEN** the pattern panel is open
- **THEN** the status bar, including its zoom controls, remains fully visible below the canvas and panel, unobstructed by the panel

## ADDED Requirements

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
