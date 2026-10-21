# Changelog

## 2.1.0 – 2026-10-21

Design system v2.1 (the system is now named "Teachers app design system").

- New tokens: `inline-h` 28px and `text-line` 48px (inline elements and lines of exercise text in the
  teacher editor, CSS variables only), `radius-xs` 3px (checkboxes, `rounded-xs`), type style
  `student-score` 56/62/700 (`text-student-score`).
- Tailwind preset: colours are functions, so opacity modifiers work (`bg-text/40`, `bg-accent/50`) through
  `color-mix`. Without a modifier the output is unchanged (`var(--x)`), so apps on 2.0.0 keep their CSS.
- README: opacity support, bundling Source Sans 3 under a strict CSP, the new tokens.

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
