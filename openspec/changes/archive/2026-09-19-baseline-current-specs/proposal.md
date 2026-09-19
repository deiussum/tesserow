## Why

`openspec/specs/` is empty even though Tesserow is a fully working, shipped application — every prior change (`spike-tauri-shell-port` through `fix-vite-optimizer-cold-start-race`) was archived with `skip_specs: true`, since each was scoped as an implementation/infra change rather than a spec-bearing one. Without a baseline, there is nothing for future changes to diff their spec deltas against, and no single place that states what the app currently does. This change closes that gap by writing baseline specs for the behavior that already exists in `src/`, with no code changes.

## What Changes

- Document the existing, shipped behavior as capability specs under `openspec/specs/`, derived directly from the current `src/` implementation.
- No application behavior changes. No files under `src/` are touched.

## Capabilities

### New Capabilities
- `mosaic-domain-model`: The `MosaicChart`/`MosaicRow`/`MosaicCell` model — inverted row/column numbering, the alternating two-color/double-stitch construction rules (`canToggleColor`/`toggleColor`), the written-pattern text format, and the JSON save/load data shape.
- `new-mosaic`: Creating a blank mosaic from a width/height/extra-rows form.
- `image-import`: Importing an image file, previewing it with an adjustable black/white threshold and resize controls, and converting the thresholded pixels into an initial mosaic.
- `mosaic-editor`: The editing screen — canvas rendering/zoom, cell toggling, the written-pattern viewer dialog, and the save/export/close actions.
- `file-persistence`: Saving and loading a mosaic chart to/from a JSON file via native file dialogs.
- `pdf-export`: The export options dialog and PDF generation — printable chart pages, written-pattern text pages, page numbering, and optionally merging in a user-supplied cover PDF.

### Modified Capabilities
- (none — nothing currently in `openspec/specs/` to modify)

## Impact

- Affected: `openspec/specs/` only (new files). No changes to `src/`, `src-tauri/`, or any build/config files.
- This establishes the baseline that future proposals will write delta specs against.
