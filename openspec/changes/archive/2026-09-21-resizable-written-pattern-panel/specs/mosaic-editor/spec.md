## MODIFIED Requirements

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
