## MODIFIED Requirements

### Requirement: Editor provides save, export, and close actions
The system SHALL let the user save the current chart to its associated file (Save), save it to a newly chosen file (Save As), open the PDF export options, or close the editor and return to the home screen, from the File menu (see the app-shell capability).

#### Scenario: Saving shows progress feedback
- **WHEN** the user chooses File > Save or File > Save As
- **THEN** the status bar shows a saving-in-progress message, then updates to a completed message once the save flow finishes (see the file-persistence capability for whether a file was actually written)

#### Scenario: A failed save is shown in the status bar
- **WHEN** the user chooses File > Save or File > Save As and writing the file fails
- **THEN** the status bar shows a save-failed message including the reason, instead of the completed message

#### Scenario: Export opens the export options dialog
- **WHEN** the user chooses File > Export to PDF
- **THEN** the export options dialog opens

#### Scenario: Closing returns to the home screen
- **WHEN** the user chooses File > Close
- **THEN** the editor closes and the home screen is shown
