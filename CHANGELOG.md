# Changelog

## 2.0.0 – 2026-10-20

First release of the package, from design system v2.

Design system v2: rules shared with the Anki card generator (from its redesign, artboard D1).

- Radius unified to 8px: `radius-sm` (6) and `radius-md` (10) become `radius-md` 8. Practice
  Module screens follow.
- New tokens: `control-lg` 44 for the main panel action on desktop, `dialog-sm|md|lg`
  560 / 640 / 1040, type style `heading-3` 18/24/700 for sections and tabs.
- Selected state: `accent-soft` fill, `accent` text, 2px `accent` ring, never an accent fill.
  `border-strong` is the 3:1 boundary of every control.
- Rules in the design system README: the primary button follows the state, destructive bulk
  actions, `:focus-visible` and Esc, status pill with a "not set up" state, empty state.
- New components in the design system: Dialog, SegmentedControl, Tabs, StatusPill, EmptyState.
