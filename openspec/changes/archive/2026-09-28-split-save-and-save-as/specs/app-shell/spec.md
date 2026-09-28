## MODIFIED Requirements

### Requirement: Top bar actions are contextual to whether a mosaic is open
The system SHALL present the top bar as a menu bar with File, View, and Help menus. The File menu SHALL always contain New, Open, Import Image, Save, Save As, Export to PDF, Close, and Exit, with Save As placed directly after Save. New, Open, Import Image, and Exit SHALL always be enabled, regardless of whether a mosaic is open - choosing one while a mosaic is open goes through the discard-confirmation flow rather than being blocked (see the Discarding requirement below). Save, Save As, Export to PDF, and Close SHALL be enabled only while a mosaic is open, and disabled (not removed from the menu) otherwise, since there is no current chart for them to act on. The View menu SHALL be disabled in its entirety when no mosaic is open. Zoom controls continue to live primarily in the status bar, and showing/hiding the written pattern continues to be handled primarily by the handle on the pattern panel itself (see the mosaic-editor capability); the View menu adds equivalent entry points for both without replacing them.

#### Scenario: No mosaic open
- **WHEN** no mosaic is currently open
- **THEN** the File menu shows New, Open, Import Image, and Exit as enabled and Save, Save As, Export to PDF, and Close as disabled
- **AND** the View menu is disabled

#### Scenario: Mosaic open
- **WHEN** a mosaic is currently open
- **THEN** the File menu shows New, Open, Import Image, Save, Save As, Export to PDF, Close, and Exit all as enabled
- **AND** the View menu is enabled

#### Scenario: File menu order
- **WHEN** the user opens the File menu
- **THEN** its items appear in the order New, Open, Import Image, Save, Save As, Export to PDF, Close, Exit

### Requirement: File menu actions have keyboard accelerators
The system SHALL let the user trigger New, Open, Save, and Save As via keyboard accelerators (Ctrl/Cmd+N, Ctrl/Cmd+O, Ctrl/Cmd+S, and Ctrl/Cmd+Shift+S respectively) in addition to selecting them from the File menu, and the File menu SHALL display each of these accelerators beside its item. New and Open SHALL work regardless of whether a mosaic is open (going through the same discard-confirmation flow as their menu items - see the Discarding requirement below); the Save and Save As accelerators SHALL have no effect while no mosaic is open, matching their disabled menu items.

#### Scenario: Accelerator triggers an enabled action
- **WHEN** the user presses Ctrl/Cmd+S while a mosaic is open
- **THEN** the same save flow runs as if File > Save had been clicked

#### Scenario: Save As accelerator
- **WHEN** the user presses Ctrl/Cmd+Shift+S while a mosaic is open
- **THEN** the same flow runs as if File > Save As had been clicked, and the plain Save flow does not also run

#### Scenario: Accelerator for a disabled action does nothing
- **WHEN** the user presses Ctrl/Cmd+S or Ctrl/Cmd+Shift+S while no mosaic is open
- **THEN** nothing happens, the same as clicking the disabled Save or Save As menu item

#### Scenario: New/Open accelerators work while a mosaic is already open
- **WHEN** the user presses Ctrl/Cmd+N or Ctrl/Cmd+O while a mosaic is open
- **THEN** the same discard-confirmation flow runs as choosing File > New or File > Open would

### Requirement: Commands that ask for further input are labeled with an ellipsis
The system SHALL end the label of a menu item or button with an ellipsis ("...") when choosing it always asks the user for more input (a form dialog or a file picker) before the action completes. It SHALL NOT use an ellipsis on commands that act immediately, show only information, or ask for input only conditionally (for example Save, which prompts only when the chart has no associated file, and Close and Exit, which prompt only when there are unsaved changes). In the File menu this means New..., Open..., Import Image..., Save As..., and Export to PDF... carry an ellipsis while Save, Close, and Exit do not; on the Home screen, New Mosaic..., Open..., and Import Image... carry one.

#### Scenario: File menu labels
- **WHEN** the user opens the File menu
- **THEN** New, Open, Import Image, Save As, and Export to PDF are labeled with a trailing ellipsis
- **AND** Save, Close, and Exit are labeled without one

#### Scenario: Home screen labels
- **WHEN** the Home screen is displayed
- **THEN** its New Mosaic, Open, and Import Image actions are labeled with a trailing ellipsis

#### Scenario: Information-only command
- **WHEN** the user opens the Help menu
- **THEN** About Tesserow is labeled without an ellipsis
