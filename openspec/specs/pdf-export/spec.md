# pdf-export Specification

## Purpose

Covers exporting the current chart to a PDF: choosing what to include, generating the printable chart pages and written-pattern pages, numbering them, and optionally merging in a user-supplied cover PDF.

## Requirements

### Requirement: Export options are chosen before generating the PDF
The system SHALL let the user choose, in the export dialog before generation: whether to include the printable chart pages, whether to include the written-pattern pages, the starting page number used for footer numbering, an optional additional ("cover") PDF to prepend, and the destination file for the exported PDF.

#### Scenario: Chart and written pattern are included by default
- **WHEN** the export dialog is opened
- **THEN** both "include chart" and "include written pattern" are selected by default

#### Scenario: Destination file is required
- **WHEN** the user submits the export dialog without choosing a destination file
- **THEN** the destination field is marked as an error and no export is performed

#### Scenario: Cover PDF file is required only when enabled
- **WHEN** the user enables the additional-PDF option without choosing a file for it
- **THEN** that file field is marked as an error and no export is performed
- **AND** when the additional-PDF option is left disabled, no file is required for it

### Requirement: Chart pages print the mosaic as a grid with row/column labels
When chart pages are included, the system SHALL split the chart across as many pages as needed to fit its full width and height, and SHALL draw each page's cells as colored squares (matching each cell's light/dark color) with a diagonal "X" mark on cells using the double-crochet motif stitch, and with row and column number labels along the page's edges.

#### Scenario: Large charts span multiple pages
- **WHEN** a chart is larger than fits on a single printable page
- **THEN** the chart is divided into multiple pages, each showing its portion of the grid with row/column labels for that portion

#### Scenario: Double-crochet cells are marked
- **WHEN** a chart page includes a cell using the double-crochet motif stitch
- **THEN** that cell is drawn with a diagonal "X" mark in addition to its color

#### Scenario: Chart-only export leaves one trailing blank page
- **WHEN** chart pages are included and written-pattern pages are not
- **THEN** the exported PDF contains one extra blank page (still counted and numbered by the page footer) after the last chart page

### Requirement: Written pattern pages print the text pattern
When written-pattern pages are included, the system SHALL print the chart's written pattern text (see the mosaic domain model's written-pattern format) in a fixed-width font, one row's text per line, appearing after the chart pages when both are included.

#### Scenario: Written pattern follows chart pages
- **WHEN** both chart pages and written-pattern pages are included in an export
- **THEN** the written-pattern pages appear after all chart pages in the generated PDF

### Requirement: Every generated page is numbered from the configured start
The system SHALL show a "Page X of Y" footer on every page of the generated content (chart pages and written-pattern pages together), where X starts counting from the export dialog's configured starting page number.

#### Scenario: Page numbering starts at the configured value
- **WHEN** the user sets a starting page number in the export dialog and generates a PDF with multiple pages
- **THEN** the first generated page's footer shows that starting number, and each subsequent page's footer increments by one

### Requirement: An optional cover PDF is merged ahead of the generated pages
When the additional-PDF option is enabled, the system SHALL place all pages of the user-chosen file before the generated chart/written-pattern pages in a single combined PDF written to the destination file. When disabled, the system SHALL write only the generated pages to the destination file.

#### Scenario: Cover PDF pages come first
- **WHEN** the user enables the additional-PDF option and selects a cover file
- **THEN** the exported file contains every page of the cover file, followed by the generated chart/written-pattern pages

#### Scenario: No cover PDF means generated pages only
- **WHEN** the user leaves the additional-PDF option disabled
- **THEN** the exported file contains only the generated chart/written-pattern pages
