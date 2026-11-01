# Changelog

## 3.1.1 – 2026-11-01

- **Animated mark:** 4 s loop (was 4.4 s). After the fade the next loop starts in 0.25 s, about the
  pause between two ribbons, instead of an empty second, so the loop reads as one motion.
- **Mark, logos, lockups and icons:** the bottom ribbon is one shape drawn over the vertical ribbons
  instead of a masked ribbon with two patches; the patch edges showed as light hairlines across the
  bottom ribbon at small sizes. The look is otherwise the same.
- README: a wait for the AI of unknown length shows the animated mark at once, with the usual time
  and Cancel under it.

## 3.1.0 – 2026-10-31

- **Flashcards amber:** `module-flashcards` light is `#D48A19` (was `#E3B23C`, 1.9:1 on `raised`, now
  2.75:1), so the top ribbon, the favicon and the module's fills no longer fade on light
  backgrounds. Dark stays `#EBC25A`. Text on it stays `#221E19` (5.9:1). Logo, mark, app icons and
  favicon are rebuilt with it.
- **Header lockups** `brand/lockups/{module}-{light,dark}.svg`: mark, wordmark and under it the module
  name on a tag in the module colour. They replace the module icon and name beside the logo.
- Module names are outlined from Outfit 600 into `brand/src/modules.json`.

## 3.0.0 – 2026-10-31

Design system v3.0.0: LessonWeave. Breaking – the package is renamed and two tokens are removed.

- **Renamed** to `lessonweave-design-system` (repo `Tesik1/lessonweave-design-system`). Apps change
  the dependency and every import (`…/base.css`, `…/tailwind-preset`, `…/brand/*`).
- **Removed** `brand` and `on-brand` (`bg-brand`, `text-on-brand`). Placeholder logos become the files
  in `brand/`, avatars use `neutral-soft` with `text`, empty-state illustrations use `module`.
- **Module colours:** `module-flashcards`, `module-practice`, `module-planner`, `module-insights` and
  their `on-module-*`. Identity only, never text, controls, borders or status.
- **Current module:** `module` and `on-module` are aliases. `base.css` points them at Practice and has
  a `[data-module="…"]` rule per module; apps set `data-module` on `<html>`. The build now resolves
  `"{token}"` values in `tokens.json` to `var(--token)`.
- `ribbon-muted` (`#D3C8B6` / `#423C33`): the other ribbons in a module icon.
- `brand/mark-animated.svg` and `-dark.svg`: the animated mark for page loading (4.4 s loop, still with
  reduced motion). Colours follow the module tokens when inlined.

LessonWeave logo and icons (first on the branch before the version was set):

- `brand/`: horizontal and stacked logo and the mark in colour, dark, mono, mono-dark and inverse;
  module icons (light and dark) for Flashcards, Practice, Planner and Insights; app icons
  (iOS 1024 and 180, manifest 192 / 512 / maskable 512, dark 512) and favicon (SVG, ICO 16/32/48).
- The wordmark is outlined from Outfit 600 (letter-spacing −0.02em, kerned), so apps do not load the
  font. Gaps between ribbons are a mask, so the files work on any background.
- `npm run build:brand` rebuilds the files; a test fails when the SVGs are out of date.
- `.gitattributes` keeps LF line endings, so that test also passes on Windows checkouts.

## 2.3.0 – 2026-10-23

Design system v2.3.0: the field error.

- The message about one field or a group of fields sits directly under it, with `alert-circle` and the
  text in `danger` at the `label` style (`text-label text-danger`). Before, it was `caption` text in
  `text`. Messages inside a `danger-soft` box keep `text`.
- No token values changed: `tokens.json` is the design system's again, with the `danger` usage note and the
  usage notes of `focus` and `control-md` from design system 2.2. The version follows the
  design system (2.2.x changed components only, so the package skipped it).

## 2.1.1 – 2026-10-21

- `radius-xs` 3px → 2px (`rounded-xs`), measured against the native 18px checkbox of the Anki generator.

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
