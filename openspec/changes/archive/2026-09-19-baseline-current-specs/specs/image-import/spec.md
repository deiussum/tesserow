## Purpose

Covers turning a user-supplied image into a starting mosaic chart: picking the file, previewing it with an adjustable black/white threshold and optional resize, and converting the thresholded pixels into chart cells.

## ADDED Requirements

### Requirement: Selecting an image file to import
The system SHALL let the user pick an image file (PNG, JPEG, or GIF) through a native file picker, and SHALL leave the application state unchanged if the picker is cancelled.

#### Scenario: Successful selection opens the preview
- **WHEN** the user picks a supported image file
- **THEN** the image preview screen opens showing that image

#### Scenario: Cancelling the picker aborts import
- **WHEN** the user cancels the file picker
- **THEN** no preview is shown and the application stays on its current screen

### Requirement: Oversized images are downscaled before preview
The system SHALL automatically downscale an imported image whose width or height exceeds the application's maximum working size, preserving its aspect ratio, before showing it in the preview.

#### Scenario: Large image is downscaled
- **WHEN** an imported image's width or height is larger than the maximum working size
- **THEN** the image is resized down to fit within that maximum while keeping its original aspect ratio

#### Scenario: Small image is left as-is
- **WHEN** an imported image's width and height are both within the maximum working size
- **THEN** the image is previewed at its original dimensions

### Requirement: Adjustable brightness threshold with live preview
The system SHALL show a threshold slider (spanning the full brightness range) on the preview screen and SHALL redraw the image so pixels at or above the threshold render as the light chart color and pixels below it render as the dark chart color.

#### Scenario: Moving the threshold updates the preview
- **WHEN** the user moves the threshold slider
- **THEN** the preview image redraws, showing pixels at or above the new threshold as light and pixels below it as dark

### Requirement: Resizing the preview keeps aspect ratio linked
The system SHALL link the preview's width and height fields by the image's aspect ratio, recalculating one when the other changes, and SHALL regenerate the underlying pixel data at exactly the requested dimensions when a resize is applied.

#### Scenario: Changing width recalculates height
- **WHEN** the user changes the width field
- **THEN** the height field updates automatically to preserve the original aspect ratio

#### Scenario: Applying a resize updates the working image
- **WHEN** the user applies a resize with a given width and height
- **THEN** the image data used for preview and import is regenerated at exactly that width and height

### Requirement: Optional extra starting rows on import
As with creating a blank mosaic, the system SHALL let the user optionally add a matching number of extra border rows to the top and bottom of the imported chart, in the same starting color, off by default.

#### Scenario: Extra rows added on import
- **WHEN** the user enables the extra-rows option with a count and completes the import
- **THEN** the resulting chart includes that many additional rows on both the top and bottom, beyond the image's height

### Requirement: Import converts thresholded pixels into chart cells
On completing the import, the system SHALL create a chart sized to the (possibly resized) image, with extra rows if requested, and SHALL set each cell's color from the corresponding pixel's brightness relative to the chosen threshold — light for pixels at or above the threshold, dark for pixels below it — except that the chart's construction rules (see the mosaic domain model's edge and alternating-color rules) SHALL take precedence over the image data when they lock a cell's color.

#### Scenario: Interior cells follow the thresholded image
- **WHEN** the import is completed with a given threshold
- **THEN** each interior cell's color is set to light or dark according to whether its corresponding pixel's brightness is at/above or below the threshold

#### Scenario: Locked cells ignore the image
- **WHEN** the import is completed and a cell's position is locked by the chart's construction rules (an edge cell, or a cell whose toggle would break the alternating construction)
- **THEN** that cell keeps its construction-determined color regardless of what the corresponding pixel's brightness would otherwise indicate
