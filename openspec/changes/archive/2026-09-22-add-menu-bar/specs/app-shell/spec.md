## MODIFIED Requirements

### Requirement: Top bar actions are contextual to whether a mosaic is open
The system SHALL present the top bar as a menu bar with File, View, and Help menus. The File menu SHALL always contain New, Open, Import Image, Save, Export to PDF, Close, and Exit. New, Open, Import Image, and Exit SHALL always be enabled, regardless of whether a mosaic is open - choosing one while a mosaic is open goes through the discard-confirmation flow rather than being blocked (see the Discarding requirement below). Save, Export to PDF, and Close SHALL be enabled only while a mosaic is open, and disabled (not removed from the menu) otherwise, since there is no current chart for them to act on. The View menu SHALL be disabled in its entirety when no mosaic is open. Zoom controls continue to live primarily in the status bar, and showing/hiding the written pattern continues to be handled primarily by the handle on the pattern panel itself (see the mosaic-editor capability); the View menu adds equivalent entry points for both without replacing them.

#### Scenario: No mosaic open
- **WHEN** no mosaic is currently open
- **THEN** the File menu shows New, Open, Import Image, and Exit as enabled and Save, Export to PDF, and Close as disabled
- **AND** the View menu is disabled

#### Scenario: Mosaic open
- **WHEN** a mosaic is currently open
- **THEN** the File menu shows New, Open, Import Image, Save, Export to PDF, Close, and Exit all as enabled
- **AND** the View menu is enabled

## ADDED Requirements

### Requirement: File menu actions have keyboard accelerators
The system SHALL let the user trigger New, Open, and Save via keyboard accelerators (Ctrl/Cmd+N, Ctrl/Cmd+O, Ctrl/Cmd+S respectively) in addition to selecting them from the File menu. New and Open SHALL work regardless of whether a mosaic is open (going through the same discard-confirmation flow as their menu items - see the Discarding requirement below); Save's accelerator SHALL have no effect while no mosaic is open, matching its disabled menu item.

#### Scenario: Accelerator triggers an enabled action
- **WHEN** the user presses Ctrl/Cmd+S while a mosaic is open
- **THEN** the same save flow runs as if File > Save had been clicked

#### Scenario: Accelerator for a disabled action does nothing
- **WHEN** the user presses Ctrl/Cmd+S while no mosaic is open
- **THEN** nothing happens, the same as clicking the disabled Save menu item

#### Scenario: New/Open accelerators work while a mosaic is already open
- **WHEN** the user presses Ctrl/Cmd+N or Ctrl/Cmd+O while a mosaic is open
- **THEN** the same discard-confirmation flow runs as choosing File > New or File > Open would

### Requirement: Discarding an open chart with unsaved changes is confirmed
The system SHALL show a confirmation dialog before discarding the currently open chart's unsaved changes when the user chooses File > New, File > Open, File > Import Image, or File > Close while the chart has unsaved changes (see the mosaic-domain-model capability's unsaved-changes tracking). New, Open, and Import Image apply this check whether or not a mosaic is currently open - they are never disabled based on mosaic-open state (see the Top bar requirement above). If the user confirms, the chosen action proceeds as it would with no unsaved changes; if the user cancels, the chart remains open and unchanged. When the chart has no unsaved changes, the chosen action proceeds immediately without prompting.

#### Scenario: Choosing New with unsaved changes prompts for confirmation
- **WHEN** the user chooses File > New while the open chart has unsaved changes
- **THEN** a confirmation dialog appears before the new-mosaic flow starts

#### Scenario: New/Open/Import Image are available even while a mosaic is open
- **WHEN** a mosaic is currently open (dirty or not) and the user chooses File > New, File > Open, or File > Import Image
- **THEN** the menu item is enabled and clickable - it is never blocked just because a mosaic is already open, unlike the pre-menu-bar top bar which hid these actions entirely while editing

#### Scenario: Choosing Close with unsaved changes prompts for confirmation
- **WHEN** the user chooses File > Close while the open chart has unsaved changes
- **THEN** a confirmation dialog appears before the editor closes and the home screen is shown

#### Scenario: Confirming discards the chart and proceeds
- **WHEN** the user confirms the discard-confirmation dialog
- **THEN** the current chart's unsaved changes are discarded and the originally chosen action (new, open, import, or close) proceeds

#### Scenario: Cancelling leaves the chart untouched
- **WHEN** the user cancels the discard-confirmation dialog
- **THEN** the currently open chart remains open and unchanged, and no new/open/import/close flow starts

#### Scenario: No prompt when there are no unsaved changes
- **WHEN** the user chooses File > New, File > Open, File > Import Image, or File > Close while the open chart has no unsaved changes
- **THEN** the chosen action proceeds immediately without a confirmation dialog

### Requirement: Exiting the application is available from the File menu
The system SHALL let the user exit the application via File > Exit, using the same close path as the operating system's window-close control, and SHALL apply the same unsaved-changes confirmation to both File > Exit and the OS window-close control.

#### Scenario: Exit with no unsaved changes closes immediately
- **WHEN** the user chooses File > Exit while there are no unsaved changes (or no mosaic is open)
- **THEN** the application window closes

#### Scenario: Exit with unsaved changes prompts for confirmation
- **WHEN** the user chooses File > Exit while the open chart has unsaved changes
- **THEN** a confirmation dialog appears before the application window closes

#### Scenario: The OS window-close control is gated the same way
- **WHEN** the user clicks the operating system's window-close control while the open chart has unsaved changes
- **THEN** the same confirmation dialog appears, and the window closes only if the user confirms

### Requirement: Replacing an open mosaic resets editor session state
The system SHALL reset the zoom level, the written-pattern panel's open/closed state and width, the status bar's message, and the export dialog's shown state whenever File > New, File > Open, or File > Import Image successfully replaces the currently open mosaic - whether or not a discard confirmation was needed first - matching what File > Close already does when returning to the home screen, rather than carrying the previous mosaic's session state into the new one.

#### Scenario: Replacing a zoomed-in mosaic resets zoom to 100%
- **WHEN** the user has zoomed the chart away from 100% and then successfully replaces the mosaic via File > New, File > Open, or File > Import Image
- **THEN** the new mosaic opens at 100% zoom, the same as it would after File > Close and reopening

#### Scenario: Replacing a mosaic with the pattern panel open closes it
- **WHEN** the written-pattern panel is open and the user successfully replaces the mosaic via File > New, File > Open, or File > Import Image
- **THEN** the new mosaic opens with the pattern panel closed, the same as it would after File > Close and reopening

### Requirement: Help menu provides a global About dialog
The system SHALL provide a Help menu with an "About Tesserow" item that opens a dialog showing the application's name and version, distinct from the existing per-dialog contextual help (see `HelpButton`/`HelpDialog` usages elsewhere in the app, which are unchanged).

#### Scenario: Opening the About dialog
- **WHEN** the user chooses Help > About Tesserow
- **THEN** a dialog opens showing the application's name and version
