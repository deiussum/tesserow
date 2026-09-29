## Context

The written-pattern panel (`src/WrittenPatternDialog.tsx`) is rendered inside a MUI `Drawer` in `src/AppShell.tsx`, at a fixed width set by `WrittenPatternDialog.module.css`'s `.panel` class (`width: 360px`). `AppShell.tsx` duplicates that number as a `PATTERN_PANEL_WIDTH` constant so the show/hide handle can position itself flush against the drawer's edge — the two files are kept in sync by hand (see the comment above the constant). See proposal.md for why this is being changed.

## Goals / Non-Goals

**Goals:**
- Let the user drag-resize the panel's width while it's open, within a fixed min/max range.
- Keep the "Copy" button visible at all times, independent of pattern text length or scroll position.
- Keep the show/hide handle and the status-bar-unobstructed guarantee correct as the width becomes variable.

**Non-Goals:**
- Persisting the chosen width across app restarts or between mosaics. Each editor session starts at the default 360px; this can be added later if requested.
- Resizing height, or making the panel float/detach from the right edge.
- Touch/pointer-gesture resize affordances beyond a standard mouse drag.

## Decisions

**Width state lives in `app.tsx` and flows down as props to both `AppShell` and `WrittenPatternDialog`.** `AppShell` doesn't instantiate `WrittenPatternDialog` itself — it receives it pre-built as the `rightPanelContent` prop from `app.tsx` — so it can't own the width state and inject it into that element. `app.tsx` (which already owns `patternPanelOpen`) also owns `patternPanelWidth` as `useState` (default 360, clamped to [240, 720] by `WrittenPatternDialog`'s drag handler), passing it to `AppShell` as `rightPanelWidth` (for the show/hide handle's position) and to `WrittenPatternDialog` as `width`/`onResize`. `WrittenPatternDialog` remains a controlled component that renders the drag handle and reports width deltas up rather than tracking width itself, and `AppShell` still exposes `PATTERN_PANEL_DEFAULT_WIDTH` as its fallback if `rightPanelWidth` is omitted — this avoids the two files re-diverging the way the fixed constant already warned about, just one level up from where this decision originally placed it.
- *Alternative considered*: keep width state inside `WrittenPatternDialog` and have it publish the current width via a ref/callback for the handle's position. Rejected — `AppShell` needs the value synchronously for the handle's `right` offset on every drag frame, so lifting state up is simpler than plumbing a second communication channel back.
- *Correction from the original design*: this decision originally said `AppShell` would own the state directly; that assumed `AppShell` instantiates `WrittenPatternDialog`, which it doesn't (see above). Behavior is unaffected — this is purely about which component's `useState` holds the value.

**Resize handle is a plain `mousedown`/`mousemove`/`mouseup` drag on a thin absolutely-positioned div at the panel's left edge**, not a UI-kit component (MUI has no built-in resizable-drawer primitive). Width updates are clamped in the mousemove handler so the drag can never push the panel outside [240, 720]px.
- *Alternative considered*: a resize library (e.g. `re-resizable`). Rejected as unnecessary dependency weight for a single-axis, single-handle drag.

**Copy button moves outside the scrollable region.** `.panel` currently applies `overflow: auto` to the whole panel (title + description + text + button). The fix restructures the panel into a non-scrolling header/footer and a scrolling middle region that contains only the pattern text, so `.writtenPatternText`'s own overflow (not the panel's) is what scrolls, and the Copy button sits in the non-scrolling footer.

## Risks / Trade-offs

- **Dragging past the max width leaves less room for the canvas on small windows** → mitigated by the 720px cap; canvas remains scrollable/zoomable regardless of available width per the existing zoom requirements.
- **Rapid mousemove events during drag could cause layout thrash** → width updates are simple state writes driving CSS width, no measurement/reflow loop, so this is not expected to be perceptible; can revisit with `requestAnimationFrame` batching if it is.
