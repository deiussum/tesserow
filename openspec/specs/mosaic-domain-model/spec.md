# mosaic-domain-model Specification

## Purpose

Defines the mosaic crochet chart's data model — its row/column numbering, the construction rules that govern which cells can change color, the written (text) pattern format, and the save/load data shape that every other capability (creation, editing, import, export) builds on.

## Requirements

### Requirement: Row and column numbering counts down from the chart's size
The system SHALL number a chart's rows and columns starting at the chart's height/width and counting down to 1, so row 1 and column 1 always identify the bottom-most row and right-most column regardless of the chart's overall size.

#### Scenario: Numbering a freshly created chart
- **WHEN** a chart is created with a given width and height
- **THEN** the topmost row is numbered equal to the chart's height and the bottom row is numbered 1
- **AND** within every row, the rightmost cell is numbered 1 and the leftmost cell is numbered equal to the chart's width

#### Scenario: Numbering after adding extra rows
- **WHEN** extra rows are added to the top and bottom of an existing chart
- **THEN** every row is renumbered so row 1 is still the new bottom-most row and the top row's number equals the chart's new total height

### Requirement: Rows alternate a base color, with locked edge cells
The system SHALL give each row of a chart's core width/height grid a base color that differs from the row below it, and SHALL lock the first and last cell of every row to that row's base color so they can never change color. Extra border rows added via the extra-rows option are all given the same single fixed base color and are exempt from this alternation (see the extra-rows requirements in the new-mosaic and image-import capabilities) — they may share their color with each other and with the core row they sit next to.

#### Scenario: Adjacent rows alternate within the core grid
- **WHEN** a chart is generated with no extra rows
- **THEN** each row's base color differs from the row immediately below it

#### Scenario: Extra rows are not required to alternate
- **WHEN** a chart is generated with extra border rows
- **THEN** those extra rows all share the same base color, which may also match the core row immediately adjacent to them

#### Scenario: Edge cells are fixed to the row color
- **WHEN** the first or last cell of any row is inspected
- **THEN** its color equals that row's base color, regardless of any toggle attempts

### Requirement: Cell color toggling preserves the two-color construction
The system SHALL allow only interior cells whose toggle would not break the alternating, two-color mosaic construction to change color. It SHALL reject a toggle when the cell sits on the chart's outer edge (top row, bottom row, first column, or last column); when the cell already matches its own row's base color and the cell directly below it also currently has that same color; or when the cell already matches its own row's base color and the cell directly above it exists but does not match its own row's base color.

#### Scenario: Edge cells cannot be toggled
- **WHEN** a cell in the top row, bottom row, first column, or last column is toggled
- **THEN** its color does not change

#### Scenario: Toggle rejected when it would break construction
- **WHEN** an interior cell whose color matches its row's base color is toggled, and the cell directly below it also currently matches that row's base color
- **THEN** the toggle has no effect and the cell's color is unchanged

#### Scenario: Valid toggle also updates the stitch above
- **WHEN** an interior cell is toggled and the toggle is allowed
- **THEN** the cell's color flips
- **AND** the stitch marker of the cell directly above it also flips between the plain stitch and the "X" motif stitch that visually joins the two rows

### Requirement: Written pattern text lists rows bottom to top with run-length stitch counts
The system SHALL render the written pattern as a text representation of the chart, one line (or wrapped set of lines) per row, ordered starting at row 1 (bottom) and proceeding up through the top row. Each row's line SHALL be labeled with its row number and color, followed by comma-separated run-length counts of consecutive same-type stitches, reading from the row's rightmost cell (column 1) toward its leftmost cell (the column numbered equal to the chart's width). The row's edge/join stitches SHALL be rendered as a marker instead of a count.

#### Scenario: Row ordering
- **WHEN** the written pattern is generated for a chart
- **THEN** its rows appear in order starting at row 1 (bottom) and ending at the highest row number (top)

#### Scenario: Run-length stitch counts
- **WHEN** a row contains a run of consecutive cells of the same stitch type
- **THEN** that run appears as a single count-plus-type entry (for example, a run of 12 plain stitches appears as one entry combining the count and stitch type)

#### Scenario: Edge/join stitches render without a count
- **WHEN** a row's first or last stitch (a join or end marker) is written
- **THEN** it is rendered using its marker alone, without a numeric run-length prefix

#### Scenario: Long rows wrap
- **WHEN** a row's written line would exceed the pattern's configured line width
- **THEN** the remaining stitches for that row continue on a new line, indented to align with the start of the stitch list

### Requirement: Save data captures everything needed to reconstruct a chart
The system SHALL represent a chart's save data as a JSON-serializable structure containing the chart's width, height, extra-row count, and every row's cells (each cell's position, color, and stitch type), such that loading that data into a chart of the same width and height SHALL reproduce the original chart exactly.

#### Scenario: Round-trip save and load
- **WHEN** a chart's save data is generated and then loaded into a newly initialized chart of the same width and height
- **THEN** every cell in the loaded chart has the same color and stitch type as the corresponding cell in the original chart
