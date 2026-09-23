## Why

The new-mosaic form's width and height fields open blank, so every new chart requires the user to type both values even though most mosaics start near a common size. Pre-filling sensible defaults saves a step on the most common path while still letting the user change either value before creating the chart.

## What Changes

- The new-mosaic form's width and height fields are pre-filled with a default of 20 x 20 when the form opens, instead of blank.
- The user can still edit either field before submitting; editing does not change the other field or the default.
- The "extra starting rows" option and its behavior are unchanged (still off by default).

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `new-mosaic`: the width and height fields now start pre-filled with a default value (20 x 20) instead of blank when the form opens.

## Impact

- `src/NewMosaicForm.tsx`: default the `width`/`height` props used to seed form state.
- `src/app.tsx`: pass the default width/height into `<NewMosaicForm>` (or the form supplies its own defaults when no props are given).
