# home-page Specification

## Purpose

Defines the no-mosaic Home screen's own content: a start screen that presents New Mosaic, Open, and Import Image as direct actions over Tesserow-branded background art, rather than a purely decorative static image.

## Requirements

### Requirement: Home screen presents primary actions directly on the page
The system SHALL present New Mosaic, Open, and Import Image as clickable actions on the Home screen (the no-mosaic state), in addition to their existing File menu equivalents.

#### Scenario: Home screen actions are visible
- **WHEN** no mosaic is open
- **THEN** the Home screen displays New Mosaic, Open, and Import Image as clickable controls

### Requirement: Home screen actions trigger the same behavior as their File menu equivalents
The system SHALL route each Home screen action through the same flow as its corresponding File menu item, including the discard-confirmation check for unsaved changes described in the app-shell capability.

#### Scenario: Clicking New Mosaic on the Home screen
- **WHEN** the user clicks New Mosaic on the Home screen
- **THEN** the same new-mosaic flow starts as choosing File > New, including any discard confirmation if a mosaic with unsaved changes is currently open

#### Scenario: Clicking Open on the Home screen
- **WHEN** the user clicks Open on the Home screen
- **THEN** the same file-open flow starts as choosing File > Open, including any discard confirmation if a mosaic with unsaved changes is currently open

#### Scenario: Clicking Import Image on the Home screen
- **WHEN** the user clicks Import Image on the Home screen
- **THEN** the same image-import flow starts as choosing File > Import Image, including any discard confirmation if a mosaic with unsaved changes is currently open

### Requirement: New Mosaic is the visually primary action
The system SHALL visually distinguish New Mosaic as the primary action on the Home screen, with Open and Import Image presented as secondary actions.

#### Scenario: Visual hierarchy of Home screen actions
- **WHEN** the Home screen is displayed
- **THEN** New Mosaic is styled as the primary action and Open and Import Image are styled as secondary actions

### Requirement: Home screen displays current app branding
The system SHALL display "Tesserow" as the product name on the Home screen, and SHALL NOT display the legacy "Deiussum's Pattern Maker" name.

#### Scenario: Home screen branding
- **WHEN** the Home screen is displayed
- **THEN** the visible product name reads "Tesserow"
- **AND** the legacy "Deiussum's Pattern Maker" text is not shown
