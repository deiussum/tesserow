## Context

See proposal.md for the motivation. Currently `src/theme.ts` sets only `background` and `text.primary` on a dark palette, so `primary` falls back to MUI's dark-mode default (#90caf9). `AppShell.tsx` renders the menu triggers as a `ButtonGroup variant='contained'` placed directly inside the `AppBar` (there is no `Toolbar`), so the bar's height is the height of the buttons (~37px). The three `Menu`s use MUI's default floating popover. Six dialogs wrap their action buttons in a `ButtonGroup variant='contained'`.

The accent color was chosen by comparing candidates (amber, coral, aqua, bright cyan) against the real navy, using mockups of the menu bar, Home card, Discard dialog, and form controls. Amber (`#f2b544`, about 7:1 contrast against `#05405c`) was picked because it is warm against the cool navy, so it signals "action" without being mistaken for another shade of the background.

## Goals / Non-Goals

**Goals:**
- One theme-level accent that every MUI component picks up, with no per-component color overrides.
- A menu bar that looks like desktop app chrome: flat, compact, with menus attached to the bar.
- Dialog action rows that make the primary action obvious and a destructive action unmistakable.

**Non-Goals:**
- No change to menu contents, enabled/disabled rules, accelerators, or the discard flow. `add-menu-bar` defined those, and they stay as they are.
- No restyle of the status bar, pattern panel, or Home layout beyond what the new `primary` color changes automatically.
- No light theme or theme switching.
- No native OS menu (still ruled out by `add-menu-bar`'s design).

## Decisions

**Accent via `palette.primary.main` only.**
Set `primary: { main: '#f2b544' }` and let MUI derive `light`/`dark`/`contrastText`. Its contrast rule picks dark text (`rgba(0,0,0,0.87)`) on amber, which is correct. We considered overriding colors per component (`sx` on each button) and rejected it: the Home card, Copy button, checkboxes, slider, text-field focus, and `HelpButton` would all need touching, and new components would keep inheriting the pastel default.

**Menu triggers are `color='inherit'` text buttons, not primary-colored.**
The menu bar is chrome, not an action surface. Triggers use `variant='text'`, `color='inherit'`, `textTransform: 'none'`, and small horizontal padding with `minWidth` unset. Hover uses a translucent white overlay (`action.hover`); an open trigger gets the same background as the menu paper. The accent stays reserved for actions. We considered accent-colored triggers or an accent underline for the open menu and rejected both: they would compete with the Home card's New Mosaic button right below them.

**Help is pushed right by a flex spacer.**
Put the triggers in a flex row and place a `Box sx={{ flexGrow: 1 }}` between View and Help. This matches the right-aligned zoom controls in `StatusBar.tsx` (`marginLeft: 'auto'`), so the top and bottom bars follow the same layout convention. Either technique works; use whichever reads more naturally in `AppShell.tsx`.

**Bar height set explicitly (~30px), not via `Toolbar variant='dense'`.**
MUI's dense `Toolbar` has a minimum height of 48px, which would make the bar taller than it is today. Instead, set an explicit `minHeight`/`height` of about 30px on the flex row, with triggers stretched to the full height so the hover/open background fills the bar vertically.

**AppBar elevation overlay removed (found during implementation).**
In dark mode, MUI's `AppBar` adds an elevation overlay (`backgroundImage`) that lightens the bar by about the same amount as the open-menu background (`background.paper` lightened by 8%). Screenshots showed the open trigger was indistinguishable from the rest of the bar. Setting `backgroundImage: 'none'` on the `AppBar` makes the bar exactly `background.paper`, which is also the color the mockup was reviewed with. The open trigger and its menu are then one step lighter than the bar.

**Attached menus through `Menu` props and paper styling.**
Each `Menu` uses `anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}` and `transformOrigin={{ vertical: 'top', horizontal: 'left' }}` so it opens flush under its trigger. Its paper gets `borderRadius: 0`, no top margin, and the same background as the open trigger. Help's menu can use `horizontal: 'right'` for both origins so it doesn't overflow the window edge. Keep a light shadow so the menu separates from the content below, and consider trimming the list's vertical padding to match the tighter bar. We considered a shared styled `Menu` wrapper or theme-level `MuiMenu` overrides. A local constant for the shared props/`sx` in `AppShell.tsx` is enough for three menus, and theme overrides would also affect any future non-menu-bar menus (for example, context menus).

**Dialog actions: plain `Button`s, not `ButtonGroup`.**
`DialogActions` already spaces its children, so the fix is to remove the `ButtonGroup` wrapper. Dismiss actions (Cancel, and Close on single-action dialogs) become `variant='text'` (they inherit `primary`, so they render as amber text). Confirming actions become `variant='contained'`. Discard adds `color='error'`. This applies to six components: `DiscardChangesDialog`, `ExportDialog`, `ImagePreviewDialog`, `NewMosaicForm` (two actions each) and `AboutDialog`, `HelpDialog` (Close only).

**Button text case set once in the theme (added after implementation review).**
`components.MuiButton.styleOverrides.root.textTransform: 'none'` in `theme.ts` removes MUI's uppercase on every button, including Home, dialog actions, and Copy. The menu triggers' own `textTransform: 'none'` then becomes redundant but harmless; it's removed so the theme is the single source. We considered per-button `sx` and rejected it for the same reason `primary` is set in the theme.

**Ellipsis rule: "always asks for more input before acting" (added after implementation review).**
Save gets an ellipsis because it always opens the native save dialog (there is no remembered file path to save to silently). Close and Exit don't, because their discard confirmation only appears when there are unsaved changes, and by convention a confirmation isn't "more input". About doesn't, because it only shows information. Labels use three ASCII periods (`...`) to match the existing Open... label rather than the single `…` character. Tests that match labels exactly (`'Import Image'`, `'Export to PDF'`, `'New Mosaic'`) are updated. Tests that match by regex (`/New/`, `/Save/`) keep working.

## Risks / Trade-offs

- [MUI's dark-mode `error.main` (`#f44336`) only reaches ~3.7:1 against the white label MUI puts on it, below WCAG AA for normal-size text] → Resolved during implementation: `palette.error.main` is set to `#d32f2f` (~5:1).
- [Amber everywhere could be loud: outlined buttons, focus rings, text Cancel buttons all turn amber] → This is intended (one accent), and it was reviewed in the mockup. If a surface turns out too loud in practice, tone that surface down rather than changing the accent.
- [Attached menus with `borderRadius: 0` differ from MUI's popover look elsewhere (for example, `Select` dropdowns in dialogs)] → Accepted. The menu bar is app chrome and dialog selects are form controls, so the difference matches what they are. The styling stays local to `AppShell` so selects are unaffected.
- [Component tests could depend on the removed `ButtonGroup` markup] → Existing tests query by role and accessible name (`getByRole('button', { name: ... })`), which don't change. Run the suite to confirm.
