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

## Open

- 3 – module colours in the interface (contrast, conflict with warning / success / accent, soft
  variants, text on them).
- 4 – inactive ribbon grey `#D3C8B6` and the dark mono logo.
- 7 – logo size in the header and on sign-in; animated loader vs spinner.
- 8 – module names (Flashcards = Anki generator?) and renaming the design system and package.
