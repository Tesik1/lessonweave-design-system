# teachers-app-design-system

Design tokens shared by the apps of the teachers app: the Practice Module, the Anki card
generator and the modules that follow. One package, so the apps cannot drift apart.

The source of truth is the Design System artifact
["Teachers app design system"](https://claude.ai/artifact/KwNUchhYiqXnfj1BKiQTKb) (it will be renamed again
when the app has its name). This package only carries its tokens; the rules for
components, states and copy live in the design system's README and component pages.
Components are shared later, when the apps merge.

| File | What it is |
|---|---|
| `tokens.json` | Copy of the design system's tokens, unchanged |
| `dist/base.css` | CSS custom properties named as the tokens (`--accent`, `--border-strong` …), dark values under `[data-theme="dark"]`, type styles as `--type-*`, focus ring and body defaults |
| `dist/tailwind-preset.js` / `.cjs` | Tailwind 3.4 preset that maps the tokens to those CSS variables |

## Install

From git, pinned to a version tag:

```bash
npm install github:Tesik1/teachers-app-design-system#v2.3.0
```

Upgrading to a new design system version means changing the tag in `package.json`.

## Use

```js
// tailwind.config.js
import preset from 'teachers-app-design-system/tailwind-preset';

export default {
  presets: [preset],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
};
```

```css
/* src/index.css */
@import 'teachers-app-design-system/base.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Load Source Sans 3 (400, 600, 700) from Google Fonts, or bundle it (e.g. `@fontsource/source-sans-3`) when the app has a strict CSP.

Dark theme: set `data-theme="dark"` on `<html>` (per device, from Settings › Appearance).

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

## Releasing a new version

1. Change the design system artifact first and publish a new version of it with a changelog
   entry. A rule both apps need never goes only into one app.
2. Copy the new `project/tokens.json` from the artifact over `tokens.json`, unchanged.
3. Raise `version` in `package.json` (major = design system version, minor for fixes in this
   package) and add an entry to `CHANGELOG.md`.
4. `npm run build && npm test`. The test fails when `dist/` is out of date.
5. Commit `tokens.json` and `dist/`, tag `vX.Y.0`, push the tag.
6. In each app, change the tag in `package.json` in its own branch and check its screens.
