## Context

See proposal.md - Why. Relevant current-state details:

- `app.tsx` currently swaps *entire* top-level components (`HomePage` vs `MosaicEditor`) via boolean `useState` flags, with no shared chrome between them. `MosaicEditor` owns its own `AppBar` and local state for zoom, save/export status, and the written-pattern dialog's open/closed flag.
- `HomePage`'s action handlers (new/load/import) already live in `app.tsx`, passed down as props. `MosaicEditor`'s action handlers (save/export/zoom/show-pattern) are local to `MosaicEditor` itself.
- No `ThemeProvider`/`createTheme` exists anywhere (confirmed by grep) — MUI components render in MUI's default light theme while `index.css` paints the page dark navy (`#05405c` background, `#dcdcdc` text).
- `HomePage.module.css`'s `.background` uses `position: absolute` with `min-height: 785px; min-width: 1100px` (the background image's native size) against a default window size of 800×600 (`tauri.conf.json`) — already larger than the window on first launch.

## Goals / Non-Goals

**Goals:**
- A single place in the component tree owns the shell chrome (top bar, right panel host) and the state needed to drive its contextual actions.
- The written-pattern panel's open/closed state persists correctly across being toggled, without becoming a second source of truth alongside the mosaic-editor's other state.
- The left side of the shell is structurally available for a future toolbox without requiring a rework of the top bar/content/right-panel layout when that lands.

**Non-Goals:**
- Building the toolbox itself, undo/redo, or any of the other tool ideas discussed while exploring this (separate future proposals).
- Native/frameless window chrome changes (custom OS-level titlebar) — this is scoped to the in-content shell below the OS's own title bar.
- General responsive/fluid reflow for arbitrary window sizes — the goal is "the default layout no longer overflows its own default window," not a fully responsive redesign.

## Decisions

**Shell-relevant state (zoom level, save/export status text, pattern-panel open/closed) moves up from `MosaicEditor` into `app.tsx`, rather than being shared via React Context or exposed through a portal.**
The shell's top bar needs to render different actions (and wire them to working handlers) depending on whether a mosaic is open — and those handlers currently live inside whichever screen component is mounted. Lifting this state to `app.tsx` (which already owns the screen-selection booleans and the Home-side handlers) keeps one consistent pattern for "who owns cross-cutting state" rather than introducing a second one (Context) for just the editor side. The chrome itself (top bar markup, right-panel host) is factored into its own component (e.g. `AppShell.tsx`) that `app.tsx` renders and passes the relevant state/handlers into, so `app.tsx` doesn't turn into a monolith of JSX — only the *state* moves up, not the rendering.
*Alternative considered*: a React Context provided by `MosaicEditor` that the shell reads from. Rejected because it would mean two different state-sharing mechanisms in a small app for what is conceptually the same problem (Home's actions vs. Editor's actions) that `app.tsx` already solves one way.

**The written-pattern panel is a MUI `Drawer` with `variant="persistent"`, anchored right; the left side is left empty (no placeholder component) for now.**
`persistent` is the variant built for exactly this — a toggleable panel that sits alongside content rather than overlaying it (`temporary`) or being permanently fixed open (`permanent`). The shell's content row is laid out so the canvas area and the right drawer are siblings in a flex row; a future left toolbox slots in as another sibling on the other side without restructuring this row. No placeholder is built for it now — an empty reserved column would just be dead space with nothing to show.

**The pattern panel is opened and closed via a persistent handle attached to its edge, not a top-bar button.**
A small always-rendered affordance (an icon button) sits on the panel's edge — attached to the content area's right edge when the panel is collapsed, and to the drawer's own left edge when expanded — so it's visible and clickable in both states. Clicking it toggles the panel. This replaces the top bar's "Show Written Pattern" action entirely (see the `app-shell` delta) and removes the panel's own internal "Close" button, since the handle already serves as the close affordance while the panel is open. It's rendered whenever a mosaic is open, independent of the panel's own open/closed state.
*Alternative considered*: keep the top-bar button and add the handle as a second way to toggle. Rejected as redundant — the handle sits exactly where a user's attention already is when they want the pattern, and two controls for one toggle adds clutter without adding capability.

**Theme: add a real MUI theme via `createTheme`/`ThemeProvider`/`CssBaseline`, built around the app's existing colors rather than new ones.**
`palette.mode: 'dark'`, with `background.default`/`background.paper` and text colors derived from the current `#05405c`/`#dcdcdc` already in `index.css`, so MUI components (buttons, dialogs, the top bar, the new drawer) pick up a matching dark surface instead of their light-theme default. This preserves the app's existing visual identity instead of introducing a new one as a side effect of fixing the inconsistency.
*Alternative considered*: drop the custom dark background and let the whole app use MUI's default light theme. Rejected — no one asked for the app's look to change, only for it to be *consistent*; matching MUI to the existing dark background is less disruptive than the reverse.

**`HomePage`'s background image is kept, but its CSS changes from a fixed-size absolute box (`min-width`/`min-height` matching the image's native pixels) to a `background-size: cover` treatment scoped to the shell's content area.**
This directly fixes the "already bigger than the default window" problem without dropping the existing branding art or requiring a new asset.
*Alternative considered*: drop the background image entirely in favor of a plain themed welcome panel. Rejected as a bigger visual change than this proposal's scope called for — the complaint was the sizing behavior, not the artwork itself.

**No spec delta for `mosaic-editor`'s "Editor provides save, export, and close actions" requirement.**
Those actions move from `MosaicEditor`'s own `AppBar` into the shell's top bar, but the requirement is written at the behavior level (the actions exist and work "from the editor's toolbar") — the top bar *is* the editor's toolbar now, so the observable contract is unchanged. Same reasoning applies to the zoom requirement. Only the written-pattern requirement changes behavior (dialog → panel), which is why it's the only `mosaic-editor` delta in this change.

## Risks / Trade-offs

- [Lifting editor state into `app.tsx` grows that file's responsibility] → Mitigated by keeping the shell's *rendering* in a separate `AppShell` component; `app.tsx` holds state and screen selection, `AppShell` holds markup.
- [The new MUI dark theme could clash with existing hand-picked component styles — `StatusBar`'s inline dark-blue style, `WrittenPatternDialog`'s monospace text block] → These need auditing during implementation; some inline styles may become redundant with the theme and should be removed rather than left to fight it.
- [Reusing the exact scenario heading text required by the spec-delta tooling for the written-pattern requirement (see `specs/mosaic-editor/spec.md`) leaves a scenario titled "Opening the written pattern dialog" describing panel behavior] → Its body text is accurate; the heading is a stable identifier across the requirement's revisions, not prose. Not worth fighting the tooling over for a heading that's only read alongside its own body text.
