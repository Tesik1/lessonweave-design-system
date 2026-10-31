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

## Open

- 7 – logo size in the header and on sign-in; animated loader vs spinner.
- 8 – module names (Flashcards = Anki generator?) and renaming the design system and package.
