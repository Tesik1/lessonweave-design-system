# LessonWeave branding – decisions

Decisions taken while bringing the LessonWeave branding (boards "LessonWeave – branding")
into the design system. They go into the design system artifact as the next version, then
into `tokens.json` here.

## Done without a decision

- **Wordmark outlined** – `brand/src/wordmark.json`, Outfit 600, −0.02em, kerned.
- **Gaps between ribbons are a mask**, not a stroke in the background colour – every file works on
  any background.
- **Logo, icon and favicon files** in `brand/`. Assumed: rounded icon tiles have no 1 px border
  (the border on the board only shows the tile edge); manifest `background_color` `#F4EEE3`.

## 2 – the `brand` token (2026-10-31)

**Decision: remove `brand` and `on-brand`.** This changes finished screens in Practice Module and
the Anki generator.

- Placeholder logos (Practice Module header and sign-in mark, Anki "A") → the files in `brand/`.
- Avatar (Practice Module account menu) → `neutral-soft` fill with `text`: the teacher is the same
  in every module, so the avatar carries no module colour.
- Illustrations in empty states (Practice Module `EmptyState`, Anki "No cards yet" and
  "Your students are already in Anki") → the colour of the module's own ribbon (Practice teal,
  Flashcards mustard). The token for it, and the text colour on it, is decided in point 3.

## 3 – module colours in the interface (2026-10-31)

**Where:** identity only. Filled shapes: the module's ribbon icon (navigation, module switcher),
illustrations in empty states and on start screens, materials. Always next to the module name or
its ribbon icon.

**Never:** text (headings, links, labels), controls (buttons, chips, borders, focus), selected
state, status dots or badges. That is where they would be mistaken for `warning-fill` (mustard),
`success` / `info` (teal) or `accent` (indigo = Insights), and mustard (1.7:1) and teal (4.35:1)
fail as text on cream anyway.

**Soft variants:** none for now. Added when a design needs one; Insights soft would almost equal
`accent-soft` (the selected state), so that one needs care.

**Tokens:** named per module, plus aliases for the current module.

| Token | Light | Dark |
|---|---|---|
| `module-flashcards` | `#E3B23C` | `#EBC25A` |
| `module-practice` | `#2F7A78` | `#74C9C7` |
| `module-planner` | `#8C4A78` | `#C48AB5` |
| `module-insights` | `#4A4DB0` | `#A3A6F2` |
| `on-module-flashcards` | `#221E19` (8.4:1) | `#1A1814` (10.5:1) |
| `on-module-practice` | `#FFFFFF` (5.0:1) | `#1A1814` (9.2:1) |
| `on-module-planner` | `#FFFFFF` (6.2:1) | `#1A1814` (6.5:1) |
| `on-module-insights` | `#FFFFFF` (7.0:1) | `#1A1814` (7.8:1) |

`module` and `on-module` point to the current module's pair, chosen by `data-module` on `<html>`
(`flashcards`, `practice`, `planner`, `insights`). Shared components (`EmptyState`) use
`bg-module text-on-module` and do not need to know which module they are in.

Note: a mustard shape on cream is only 1.7:1 – fine for decoration (illustrations are
`aria-hidden`), and the glyph on it uses `on-module` (8.4:1).

## 4 – inactive ribbon grey and the dark mono logo (2026-10-31)

- **New token `ribbon-muted`**: light `#D3C8B6` (as on the board, 1.43:1 on cream), dark `#423C33`
  (1.63:1 on night – equally quiet). Only for the other ribbons in a module icon. Its own token, so
  module icons do not change when `border` does. Files: `brand/modules/{module}-{light,dark}.svg`.
- **New logo variant `mono-dark`** in the dark theme's text colour `#EFE9DF` (14.7:1 on night), the
  mirror of `mono`. `inverse` (white) stays for coloured fills.

## 7 – logo in the app, loading (2026-10-31)

**Header (60 px):** the horizontal logo 32 px high (166 px wide; clear space fits), then a 1 px
divider and the module: module icon 20 px + module name in `heading-3`. The logo links to the
start page. On a phone only the mark, 32 px. In the merged app the module part becomes the module
switcher.

**Sign-in and legal pages:** the stacked logo, mark 67 px and wordmark 32 px (192 px wide), as the
page's `h1` (text "LessonWeave" for screen readers), the tagline below it.

**Loading:**

- A whole page or panel loading (app start, sign-in, student page, dashboard, editor, settings) →
  the animated mark, 40 px, with a text such as "Loading…" beside it. It appears after 300 ms, so
  fast loads do not flash. With reduced motion it stands still (the board's CSS already does this).
- Inside buttons, rows and dialogs → the spinner (`loader-2`) as today; the weave does not fit and
  short waits would only flash.
- To build: the animated mark as a file or component with the board's keyframes (4.4 s loop).

## 8 – names (2026-10-31)

**Modules:** Flashcards = today's Anki generator (mustard, top ribbon), Practice = today's Practice
Module (teal, left ribbon). Planner and Insights are future modules. The header shows the module
name instead of "Anki Generator" and "Practice Module".

**Design system:** renamed everywhere with the v3 release – the artifact ("LessonWeave design
system"), the GitHub repo and the package (`lessonweave-design-system`). GitHub redirects the old
repo URL, but both apps change the dependency and every import (`…/base.css`, `…/tailwind-preset`,
`…/brand/*`) in their own branch.

**App name:** browser tab "Page – Module – LessonWeave" (e.g. "My sets – Practice – LessonWeave");
web app manifest `name` "LessonWeave Practice", `short_name` "Practice" (Flashcards likewise).

## Next

1. Design system artifact v3: rename, tokens (`module-*`, `on-module-*`, `module` / `on-module`,
   `ribbon-muted`; remove `brand` / `on-brand`), rules from points 2–8, changelog entry.
2. This repo (done on `tomt-lessonweave-brand-assets`, package 3.0.0): `tokens.json` v3, aliases
   and `[data-module]` rules in the build, package renamed, animated mark. Left: rename the GitHub
   repo, merge, tag `v3.0.0`.
3. Practice Module and Anki generator: each in its own branch – new dependency and imports,
   `data-module`, logo, avatar, empty states, loading, tab title, manifest and icons.
