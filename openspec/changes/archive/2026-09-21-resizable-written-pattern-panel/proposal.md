## Why

The written-pattern panel has a fixed 360px width, so longer pattern lines wrap or force horizontal scrolling with no way for the user to widen the panel. The "Copy" button also sits below the pattern text inside the panel's scrollable area, so it scrolls out of view once the pattern is long enough to overflow — the one action the panel exists to offer becomes hard to reach.

## What Changes

- The written-pattern panel gains a drag handle on its left edge that lets the user resize its width while it's open, clamped to a sensible min/max range.
- The "Copy" button moves out of the scrollable pattern-text area so it stays visible at all times, regardless of pattern length or scroll position.
- The show/hide handle and the status bar's unobstructed-visibility guarantee continue to work with the new variable panel width (the handle tracks the panel's current width instead of the old fixed constant).

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `mosaic-editor`: the "Written pattern can be viewed and copied" requirement gains resizing behavior and a stronger guarantee that the Copy action stays visible while the panel is open.

## Impact

- `src/WrittenPatternDialog.tsx` / `WrittenPatternDialog.module.css`: split the panel into a scrollable text region and a fixed action area; add resize-drag handling.
- `src/AppShell.tsx` / `AppShell.module.css`: replace the hardcoded `PATTERN_PANEL_WIDTH` constant with the panel's live width so the show/hide handle and layout stay aligned while resizing.
- No API, data model, or persistence changes; purely presentational/interaction behavior confined to the editor's right panel.
