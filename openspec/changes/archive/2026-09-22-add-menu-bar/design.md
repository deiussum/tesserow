## Context

See `proposal.md` - Why. Today `AppShell.tsx` renders a single `ButtonGroup` with two mutually-exclusive sets of buttons, swapped via `props.mosaicOpen`; there is no menu, no keyboard-driven File actions besides zoom, no unsaved-changes tracking anywhere in the codebase, and no use of `@tauri-apps/api` in `src/` (window close/quit today only happens via the OS titlebar). `app.tsx` owns all editor state as a flat set of `useState` flags and already has one `window.addEventListener('keydown', ...)` effect, scoped to `mosaicEditorShown`, for the existing zoom shortcuts.

## Goals / Non-Goals

**Goals:**
- Replace the top bar's button group with a File/View/Help menu bar, contextual items disabled rather than removed.
- Add unsaved-changes tracking to the `mosaic` singleton and gate New/Open/Import/Exit/OS-close on it with a shared confirmation dialog.
- Add File > Exit and mirror it on the OS window-close event.
- Add functional keyboard accelerators for New/Open/Save, and View-menu equivalents for zoom/pattern-panel toggle that reuse the existing behavior rather than reimplementing it.

**Non-Goals:**
- No native Tauri OS menu (`Menu`/`MenuBuilder` in `src-tauri/`) - the menu bar stays an in-webview MUI component, per the earlier decision to extend the existing React-driven top bar rather than introduce a second, OS-level actions surface.
- No general "recent files" list, preferences, or other menu items beyond what's specified.
- No multi-document support - "discard and proceed" still means the app has exactly one chart open at a time.

Revised during manual QA: File > Close was originally scoped as staying unconditional (no confirmation prompt), matching its pre-change behavior. Testing showed this was inconsistent with every other discard path (New/Open/Import/Exit/OS-close all prompt) and surprising in practice, so Close is now gated by the same discard-confirmation dialog - see the Decisions section and the app-shell delta spec.

## Decisions

**Menu bar: MUI `Menu`/`MenuItem` inside `AppShell`, not a native Tauri menu.**
The current top bar is already a React component tree driven by props from `app.tsx`; swapping `ButtonGroup` for MUI menu buttons keeps the same data flow (`app.tsx` passes callbacks and enabled/disabled/checked booleans down as props) with no new Rust code, no new IPC surface, and consistent cross-platform behavior. A native menu would mean building the menu in `src-tauri/src/lib.rs`, bridging clicks back into React via Tauri's menu-event API, and losing the top bar entirely as a place to hang UI - a much larger change for the same requirements.

**Unsaved-changes tracking: a plain flag on the `Mosaic` singleton, not an observable/event system.**
`MosaicCell.toggleColor()` (`src/Mosaic.ts:431`) already reaches the module-level `mosaic` singleton directly (e.g. `mosaic.canvas`), so it can set `mosaic.isDirty = true` inline after a successful toggle. `Mosaic.initialize`/`load` clear it; `app.tsx#saveClicked` clears it after a successful save. Because the flag is only ever *read* at the moment a gated menu action fires (never rendered reactively), it doesn't need to trigger a React re-render or live in `useState` - a plain synchronous read is enough, avoiding a pub/sub layer for a single boolean.

**One shared discard-confirmation dialog, gating six entry points.**
New, Open, Import Image, Close, Exit, and the OS window-close event all funnel through the same "would discard unsaved changes" check and the same confirmation dialog component, rather than six separate dialogs or six copies of the same logic. Each entry point's handler in `app.tsx` becomes: check `mosaic.isDirty` -> if dirty, open the shared dialog with the pending action; if not, run the pending action immediately. The dialog's confirm button re-invokes the pending action. (Close was added to this list after manual QA - see Non-Goals.)

**Exit and OS window-close share one code path.**
`File > Exit` simply calls `getCurrentWindow().close()` from `@tauri-apps/api/window` - the same call Tauri's own window-close control triggers under the hood - so both paths emit the same `closeRequested` event and are handled by one listener, registered once in `app.tsx`. That listener calls `event.preventDefault()` only when `mosaic.isDirty` (per Tauri's own documented pattern for this API - see the `onCloseRequested` example in `@tauri-apps/api/window`'s d.ts), opening the shared confirmation dialog with a pending action of `getCurrentWindow().destroy()`. `destroy()` is used rather than calling `close()` again on confirm, because `close()` re-emits `closeRequested` and would loop; `destroy()` force-closes without re-triggering the event. When the chart isn't dirty, the listener does nothing and the close proceeds natively. This is the first use of `@tauri-apps/api` in `src/`; `core:default` in `src-tauri/capabilities/default.json` is expected to cover window close/close-requested, but this should be verified against a real build during implementation (see Risks).

**Keyboard accelerators extend the existing `keydown` listener rather than adding a second one.**
`app.tsx` already has one `window.addEventListener('keydown', ...)` effect for zoom, scoped to `mosaicEditorShown`. The New/Open/Save accelerators join the same handler (scoped to the whole app, since New/Open apply on the Home screen too), checking the same enabled/disabled logic the menu items use so a disabled accelerator is a no-op rather than needing separate guard logic.

## Risks / Trade-offs

- [`core:default` may not include window close-requested listening] -> Confirmed by manual QA: listening itself needs no extra permission (the event is Rust-pushed, not a gated invoke), but the `close`/`destroy` commands the confirm/no-op paths call are not in `core:window`'s default set and were silently rejected. Fixed by adding `core:window:allow-close` and `core:window:allow-destroy` to `src-tauri/capabilities/default.json`.
- [Disabled-not-hidden menu items make the File menu longer at all times, even when half its items never apply on the current screen] -> Accepted trade-off per the earlier decision (matches conventional desktop menu behavior); no mitigation needed.
- [A second accelerator scope (whole-app for File actions vs. editor-only for zoom) inside one `keydown` handler adds a small amount of branching] -> Keep the two concerns as clearly separated `if` blocks (or early-return guards) inside the single handler rather than merging their conditions, so each stays easy to read independently.
