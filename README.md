# lessonweave-design-system

Design tokens and brand files shared by the modules of LessonWeave: Flashcards (the Anki card
generator), Practice (the Practice Module) and the modules that follow. One package, so the apps
cannot drift apart.

The source of truth is the Design System artifact
["LessonWeave design system"](https://claude.ai/artifact/KwNUchhYiqXnfj1BKiQTKb). This package only
carries its tokens and the logo files; the rules for components, states and copy live in the
design system's README and component pages. Components are shared later, when the apps merge.

| File | What it is |
|---|---|
| `tokens.json` | Copy of the design system's tokens, unchanged |
| `dist/base.css` | CSS custom properties named as the tokens (`--accent`, `--border-strong` …), dark values under `[data-theme="dark"]`, the current module under `[data-module]`, type styles as `--type-*`, focus ring and body defaults |
| `dist/tailwind-preset.js` / `.cjs` | Tailwind 3.4 preset that maps the tokens to those CSS variables |
| `brand/` | Logo, module icons, app icons and the animated mark ([below](#logo-and-icons)) |

## Install

From git, pinned to a version tag:

```bash
npm install github:Tesik1/lessonweave-design-system#v3.0.0
```

Up to v2.3.0 the package was `teachers-app-design-system`. Moving to v3 means changing the
dependency's name and every import (`…/base.css`, `…/tailwind-preset`, `…/brand/*`).

Upgrading to a new design system version means changing the tag in `package.json`.

## Use

```js
// tailwind.config.js
import preset from 'lessonweave-design-system/tailwind-preset';

export default {
  presets: [preset],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
};
```

```css
/* src/index.css */
@import 'lessonweave-design-system/base.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Load Source Sans 3 (400, 600, 700) from Google Fonts, or bundle it (e.g. `@fontsource/source-sans-3`) when the app has a strict CSP.

Dark theme: set `data-theme="dark"` on `<html>` (per device, from Settings › Appearance).

Current module: set `data-module="flashcards"` (or `practice`, `planner`, `insights`) on `<html>`.
`--module` and `--on-module` (`bg-module`, `text-on-module`) then point at that module's colour;
without the attribute they point at Practice. It also works on a container, for a page that shows
several modules. Module colours are identity only (module icon, empty-state illustrations, start
screens) – never text, controls, borders or status.

Without Tailwind, use the variables directly: `font: var(--type-heading-3)`,
`height: var(--control-md)`, `border-radius: var(--radius-md)`.

### Tailwind class names

| Tokens | Classes |
|---|---|
| Colours | `bg-accent`, `text-text-muted`, `border-border-strong`, `bg-accent-soft` … (`border` alone uses `--border`) |
| Type styles | `text-heading-1` … `text-caption`, `text-student-body`, `text-student-score` (size, line height and weight) |
| Radius | `rounded-xs` (2px), `rounded-md` (8px), `rounded-lg` (14px), `rounded-pill` |
| Shadow | `shadow-sm`, `shadow-md` |
| Control heights | `h-control-lg`, `h-control-md`, `h-control-sm`, `min-h-touch-min`, `size-control-sm` |
| Dialog widths | `max-w-dialog-sm`, `max-w-dialog-md`, `max-w-dialog-lg` |
| Icons | `size-icon-sm`, `size-icon-md`, `size-icon-lg` |
| Exercise text | `--inline-h` (28px, height of every inline element) and `--text-line` (48px, line height of exercise text) are CSS variables only, no Tailwind classes: `h-[var(--inline-h)]`, `leading-[var(--text-line)]` |
| Spacing | `p-space-16`, `gap-space-8` … |

Colours are CSS variables holding hex values. The preset wraps them in functions, so Tailwind's
opacity modifiers work: `bg-accent/50` becomes `color-mix(in srgb, var(--accent) 50%, transparent)`
(browsers from 2023). Without a modifier the colour stays a bare `var(--accent)`.

## Logo and icons

`brand/` holds the LessonWeave logo files, built by `npm run build:brand` from the branding
boards. Use them as files; do not redraw the logo or set the wordmark in a font.

| File | What it is |
|---|---|
| `logo-{color,dark,mono,mono-dark,inverse}.svg` | Horizontal logo (main form). `dark` and `mono-dark` on `surface` dark, `inverse` on a coloured fill |
| `logo-vertical-{…}.svg` | Stacked logo, where there is little width |
| `mark-{…}.svg` | The mark alone |
| `mark-animated.svg`, `mark-animated-dark.svg` | The animated mark for loading (see below) |
| `logo-intro.svg`, `logo-intro-dark.svg` | Horizontal logo that weaves itself once on load (see Logo motion) |
| `mark-beat.svg`, `lockups/{module}-beat.svg` | Mark and header lockups with one beat on hover or focus; inline only |
| `mark-relay.svg`, `mark-relay-dark.svg` | Short waits inside a screen: the ribbons light up in turn |
| `mark-heddle.svg`, `mark-heddle-dark.svg` | Waits for the AI: the ribbons rise and fall |
| `mark-fill.svg` | Waits with known progress, driven by `--lw-progress`; inline only |
| `lockups/{flashcards,practice,planner,insights}-{light,dark}.svg` | Header lockup: mark, wordmark and under it the module name on a tag in the module colour (see Header) |
| `modules/{flashcards,practice,planner,insights}-{light,dark}.svg` | Module icon: the module's own ribbon in colour, the others in `ribbon-muted` (`#D3C8B6` / `#423C33`) |
| `icons/app-icon-ios-1024.png`, `icons/apple-touch-icon-180.png` | iOS, square (the system rounds the corners) |
| `icons/icon-192.png`, `icons/icon-512.png` | Web app manifest, `purpose: "any"` |
| `icons/icon-maskable-512.png` | Web app manifest, `purpose: "maskable"` (mark inside the 80 % safe circle) |
| `icons/icon-dark-512.png` | Optional dark variant |
| `icons/favicon.svg`, `icons/favicon.ico` | Favicon (ICO holds 16, 32 and 48 px) |

Every icon PNG has its SVG source next to it. The gaps between ribbons are cut out (a mask), not
painted, so every file works on any background.

Rules from the branding: keep clear space of one ribbon width (1/6 of the mark) around the logo;
logo with text at least 120 px wide, mark alone at least 24 px, favicon 16 px only on its tile.
Do not change the colours or the order of the ribbons, stretch, rotate, or add shadows.

```js
// Vite: import the file URL
import logoUrl from 'lessonweave-design-system/brand/logo-color.svg';
```

The wordmark and the module names on the lockup tags are Outfit 600 converted to paths
(`scripts/brand/outline-wordmark.py`; the font and its OFL licence are in `scripts/brand/fonts/`).
Apps never load Outfit.

### Header

The app header shows the module's lockup from `brand/lockups/`: 40 px high, 36 px on a phone, as a
link to the module's start page. Light and dark files swap with the theme. The link carries the
name ("LessonWeave Flashcards"), so the image itself can be decorative. Nothing else marks the
module in the header: no module icon, no coloured text. A TEST badge for a test deployment stays
next to the lockup.

### Loading

Every wait has one motion. The mark is always `aria-hidden` and has a short text beside or under
it, which is what screen readers read (`role="status"` on the text or its wrapper).

| Wait | File | Size | When |
|---|---|---|---|
| A whole page or panel loading (app start, sign-in, student page, dashboard, editor, settings) | `mark-animated.svg` | 40 px | after 300 ms |
| A short wait inside a screen: a section or card loading, a row saving, a list refreshing | `mark-relay.svg` | 20–40 px | after 300 ms |
| A wait for the AI of unknown length: writing exercises, reading words from photos, suggesting a set | `mark-heddle.svg` | 40–96 px | at once (a click started it), with the usual time and Cancel under it |
| A wait with known steps: import, export, reading photos one by one, uploading images | `mark-fill.svg` | 40–96 px | at once, with "12 of 30" or a percentage under it |

Inside buttons the spinner (`loader-2`) stays: the mark does not fit there and short waits would
only flash. Fill is only for steps that take longer than a second; a shorter one uses Relay.
ProgressBar stays for progress inside a row or header.

The ribbons weave in one after another and the mark fades out and starts again (4 s loop; the empty
moment before the next loop is 0.25 s, about the pause between two ribbons). With
`prefers-reduced-motion: reduce` it stands still. Its colours are `var(--module-*, #hex)`:

- Inlined (for example imported with Vite's `?raw`), it follows the theme through `base.css`, so
  `mark-animated.svg` serves both themes. Give each inlined copy unique mask ids
  (`lw-mark-animated-under`, `lw-mark-animated-verticals`), e.g. by replacing the prefix with React's
  `useId()`; two copies sharing ids would share one animation.
- As `<img>`, the page's variables do not reach it: use `mark-animated.svg` on light and
  `mark-animated-dark.svg` on dark.

Mark the mark `aria-hidden` there; the text beside it is what screen readers read.

### Logo motion

Five more animated files, each with its own class prefix (`lw-intro-*`, `lw-beat-*`, `lw-relay-*`,
`lw-heddle-*`, `lw-fill-*`), so two of them inlined on one page do not touch each other. All of
them keep the over-under of the ribbons while they move (every cut moves with its ribbon), use
`var(--module-*, #hex)` like the animated mark, and stand still with `prefers-reduced-motion:
reduce`. Inlined, give each copy unique mask and clip ids by replacing the file's id prefix
(`lw-logo-intro-`, `lw-mark-relay-`, `lw-lockup-practice-beat-`, …), as for the animated mark.

- **Intro** (`logo-intro.svg`, 1.4 s, once): the vertical ribbons drop in, the top ribbon is drawn
  through them from the left, the bottom one from the right, then the wordmark unrolls. For the
  website's hero and the first screen of an app start. Once per visit, never in a loop; the content
  beside it does not wait for it. It plays when the file loads, so it works as `<img>` too (light
  and dark file); to play it again, insert it again.
- **Beat** (`mark-beat.svg`, `lockups/{module}-beat.svg`, 0.76 s): one beat of the loom. The app
  sets the class `lw-beat-run` on the svg or an ancestor on `pointerenter` and `focus` of the logo
  link and removes it after 800 ms, so a beat always finishes and the next one waits for it. Without
  the class it also beats on `:hover` and `:focus-visible` of a link or button around it, but a
  pointer that leaves early cuts that beat short. Only for the logo that links to the start page,
  never inside a larger link. Inline only; the lockups follow the theme through the tokens, one
  file per module.
- **Relay** (`mark-relay.svg`, 1.6 s loop): the whole mark stands, its ribbons light up in turn,
  clockwise. Nothing moves, so it reads down to 20 px.
- **Heddle** (`mark-heddle.svg`, 2.4 s loop): the vertical ribbons rise and fall in turn, the
  horizontal ones sway; calm enough to watch for half a minute.
- **Fill** (`mark-fill.svg`): set `--lw-progress` (0–1) on the svg or an ancestor; each ribbon is a
  quarter, drawn in weave order over a quiet copy of the mark in `neutral-soft`. At 1 the app may set
  `lw-fill-done` on an ancestor for a short pop that confirms it. Inline only. With reduced motion
  the ribbons still follow the progress, without easing.

## Releasing a new version

1. Change the design system artifact first and publish a new version of it with a changelog
   entry. A rule both apps need never goes only into one app.
2. Copy the new `project/tokens.json` from the artifact over `tokens.json`, unchanged.
3. Raise `version` in `package.json` (major = design system version, minor for fixes in this
   package) and add an entry to `CHANGELOG.md`.
4. `npm run build && npm test` (and `npm run build:brand` when the logo changed). The tests fail
   when `dist/` or `brand/` is out of date.
5. Commit `tokens.json` and `dist/`, tag `vX.Y.0`, push the tag.
6. In each app, change the tag in `package.json` in its own branch and check its screens.
