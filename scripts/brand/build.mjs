// Builds the LessonWeave logo files in brand/ from the mark geometry below and the
// outlined wordmark and module names (brand/src/wordmark.json and modules.json, from
// outline-wordmark.py).
// Run with `npm run build:brand`. SVGs are pure text; the PNG and ICO icons are
// rendered with @resvg/resvg-js. The output is committed.
//
// The gaps between ribbons are cut out with a mask, so every file works on any
// background. (The branding board draws them as strokes in the background colour.)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const wordmark = JSON.parse(readFileSync(join(root, 'brand', 'src', 'wordmark.json'), 'utf8'));
const moduleNames = JSON.parse(readFileSync(join(root, 'brand', 'src', 'modules.json'), 'utf8'));
const colorTokens = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8')).color.tokens;
const colorToken = (name) => colorTokens.find((t) => t.name === name).value;

/** Colours of each variant: ribbons top, left, right, bottom, then "Lesson" and "Weave". */
export const variants = {
  color: { top: '#D48A19', left: '#2F7A78', right: '#8C4A78', bottom: '#4A4DB0', lesson: '#221E19', weave: '#4A4DB0' },
  dark: { top: '#EBC25A', left: '#74C9C7', right: '#C48AB5', bottom: '#A3A6F2', lesson: '#EFE9DF', weave: '#A3A6F2' },
  mono: { top: '#221E19', left: '#221E19', right: '#221E19', bottom: '#221E19', lesson: '#221E19', weave: '#221E19' },
  // Mono on a dark background, in the dark theme's text colour.
  'mono-dark': { top: '#EFE9DF', left: '#EFE9DF', right: '#EFE9DF', bottom: '#EFE9DF', lesson: '#EFE9DF', weave: '#EFE9DF' },
  inverse: { top: '#FFFFFF', left: '#FFFFFF', right: '#FFFFFF', bottom: '#FFFFFF', lesson: '#FFFFFF', weave: '#FFFFFF' },
};

// Mark geometry, viewBox 0 0 120 120 (from the branding board).
const TOP = 'M10 30H110L103 40L110 50H10L17 40Z';
const BOTTOM = 'M10 70H110L103 80L110 90H10L17 80Z';
const LEFT = 'M30 10L40 17L50 10V110L40 103L30 110Z';
const RIGHT = 'M70 10L80 17L90 10V110L80 103L70 110Z';
// The bottom ribbon is drawn over both vertical ribbons; the 3-unit lines above and
// below it, across each vertical, are the gaps cut into the verticals.
const CROSSINGS = [26, 66];

const fmt = (n) => String(Math.round(n * 1000) / 1000);

// A colour is a hex value or a `var(--token, #fallback)`, which only works as a CSS property.
const paint = (colour) => (colour.startsWith('var(') ? `style="fill:${colour}"` : `fill="${colour}"`);

/**
 * The mark as SVG elements in its own 120×120 space. `id` must be unique in the
 * document the elements end up in (masks are referenced by id). With `animated`,
 * every part of a ribbon (its cut in the mask included) gets the ribbon's class,
 * so the gap moves in with the ribbon.
 */
export function markElements(c, id, { animated = false } = {}) {
  const under = `${id}-under`;
  const verticals = `${id}-verticals`;
  const cls = (ribbon) => (animated ? ` class="lw-weave-${ribbon}"` : '');
  return [
    '<defs>',
    // The top ribbon loses a 2.5-unit gap on each side of both verticals.
    `<mask id="${under}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">`,
    '<rect width="120" height="120" fill="#fff"/>',
    `<path${cls('left')} d="${LEFT}" fill="#000" stroke="#000" stroke-width="5" stroke-linejoin="round"/>`,
    `<path${cls('right')} d="${RIGHT}" fill="#000" stroke="#000" stroke-width="5" stroke-linejoin="round"/>`,
    '</mask>',
    // Verticals lose the gap lines above and below the bottom ribbon.
    `<mask id="${verticals}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">`,
    '<rect width="120" height="120" fill="#fff"/>',
    `<path${cls('bottom')} d="${CROSSINGS.map((x) => `M${x + 2} 68.5H${x + 26}M${x + 2} 91.5H${x + 26}`).join('')}" stroke="#000" stroke-width="3"/>`,
    '</mask>',
    '</defs>',
    `<g mask="url(#${under})">`,
    `<path${cls('top')} d="${TOP}" ${paint(c.top)}/>`,
    '</g>',
    `<g mask="url(#${verticals})">`,
    `<path${cls('left')} d="${LEFT}" ${paint(c.left)}/>`,
    `<path${cls('right')} d="${RIGHT}" ${paint(c.right)}/>`,
    '</g>',
    // One shape on top, not patches over a masked ribbon: patch edges showed as hairlines.
    `<path${cls('bottom')} d="${BOTTOM}" ${paint(c.bottom)}/>`,
  ];
}

// The wordmark is laid out as the branding board does it in CSS: font-size F,
// line-height 1, vertically centred. The baseline sits at (F + ascender + descender) / 2
// from the top of the line box (half-leading may be negative).
const em = wordmark.unitsPerEm;
const baselineInBox = (F) => (F * (1 + (wordmark.ascender + wordmark.descender) / em)) / 2;
const wordWidth = (F) => (F * wordmark.advance) / em;

function wordElements(c, x, baseline, F) {
  // A scale needs more digits than a coordinate: 0.0245 rounded to 0.025 is 2 % too wide.
  const s = String(Math.round((F / em) * 1e6) / 1e6);
  return [
    `<g transform="translate(${fmt(x)} ${fmt(baseline)}) scale(${s})">`,
    `<path d="${wordmark.paths.lesson}" ${paint(c.lesson)}/>`,
    `<path d="${wordmark.paths.weave}" ${paint(c.weave)}/>`,
    '</g>',
  ];
}

const svg = (w, h, label, body) =>
  [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fmt(w)} ${fmt(h)}" width="${fmt(w)}" height="${fmt(h)}" role="img" aria-label="${label}">`,
    `<title>${label}</title>`,
    ...body,
    '</svg>',
    '',
  ].join('\n');

const placeMark = (x, y, size, elements) => [
  `<g transform="translate(${fmt(x)} ${fmt(y)}) scale(${fmt(size / 120)})">`,
  ...elements,
  '</g>',
];

/** Horizontal logo (main form). Proportions from the board: mark 1.5 F, gap 20/72 F. */
export function logo(c, id, F = 72) {
  const M = 1.5 * F;
  const gap = (20 / 72) * F;
  const width = M + gap + wordWidth(F);
  const baseline = (M - F) / 2 + baselineInBox(F);
  return svg(width, M, 'LessonWeave', [...placeMark(0, 0, M, markElements(c, id)), ...wordElements(c, M + gap, baseline, F)]);
}

/** Stacked logo. Proportions from the board: mark 84, gap 14, font 40. */
export function logoVertical(c, id, F = 40) {
  const M = 2.1 * F;
  const gap = 0.35 * F;
  const width = Math.max(M, wordWidth(F));
  const baseline = M + gap + baselineInBox(F);
  return svg(width, M + gap + F, 'LessonWeave', [
    ...placeMark((width - M) / 2, 0, M, markElements(c, id)),
    ...wordElements(c, (width - wordWidth(F)) / 2, baseline, F),
  ]);
}

export function mark(c, id, size = 120) {
  return svg(size, size, 'LessonWeave', placeMark(0, 0, size, markElements(c, id)));
}

/**
 * Animated mark for loading (board "Animace loga", 4 s loop): the top ribbon slides in,
 * then left, right and the bottom one over them; at the end the mark fades out and starts
 * again after about the pause between two ribbons, so the loop reads as one motion. With reduced motion it stands still. Ribbons use the module colour tokens with
 * hex fallbacks, so an inlined mark follows the theme and an <img> uses the fallbacks.
 */
const WEAVE_LOOP = 4; // s
const WEAVE_SLIDE = 0.55; // s, one ribbon sliding in
const WEAVE_KEYFRAMES = [
  // ribbon, from, start (s)
  ['top', 'translateX(-36px)', 0.2],
  ['left', 'translateY(-36px)', 0.4],
  ['right', 'translateY(-36px)', 0.7],
  ['bottom', 'translateX(36px)', 0.95],
];
// Fade out 3.6–3.95 s; with the top ribbon's 0.2 s the empty gap is 0.25 s.
const WEAVE_FADE = [3.6, 3.95];
const pct = (t) => `${fmt((t / WEAVE_LOOP) * 100)}%`;
const weaveStyle = [
  '<style>',
  ...WEAVE_KEYFRAMES.map(
    ([r, from, start]) =>
      `@keyframes lw-weave-${r}{0%,${pct(start)}{opacity:0;transform:${from};animation-timing-function:cubic-bezier(.25,.8,.25,1)}${pct(start + WEAVE_SLIDE)},100%{opacity:1;transform:none}}` +
      `.lw-weave-${r}{animation:lw-weave-${r} ${WEAVE_LOOP}s linear infinite both}`,
  ),
  `@keyframes lw-weave-fade{0%,${pct(WEAVE_FADE[0])}{opacity:1}${pct(WEAVE_FADE[1])},100%{opacity:0}}`,
  `.lw-weave{animation:lw-weave-fade ${WEAVE_LOOP}s linear infinite both}`,
  '@media (prefers-reduced-motion:reduce){.lw-weave,.lw-weave *{animation:none!important}}',
  '</style>',
];

export function markAnimated(c, id, size = 120) {
  return svg(size, size, 'LessonWeave', [
    ...weaveStyle,
    '<g class="lw-weave">',
    ...placeMark(0, 0, size, markElements(tokenised(c), id, { animated: true })),
    '</g>',
  ]);
}

/*
 * Logo motion (canvas "LessonWeave Logo Motion"): five more animated files, each with its
 * own class prefix, so their inlined styles never touch one another.
 *   intro  – logo, once on load: the verticals drop in, the top ribbon is drawn through
 *            them from the left, the bottom one from the right, then the wordmark unrolls
 *   beat   – mark and header lockups, one beat on hover or focus of the link around them
 *   relay  – mark, loop: the ribbons light up in turn, clockwise; reads down to 20 px
 *   heddle – mark, loop: the verticals rise and fall, the horizontals sway
 *   fill   – mark, driven by --lw-progress (0–1): a quarter of the progress per ribbon
 */
const RIBBONS = ['top', 'left', 'right', 'bottom'];

// The whole bottom ribbon (plus its 1.5-unit gaps) as a cut in the verticals, for relay:
// with only the gap lines cut, the verticals show through a dimmed bottom ribbon.
const BOTTOM_CUT = `<path d="${BOTTOM}" fill="#000" stroke="#000" stroke-width="6" stroke-linejoin="round"/>`;

// Clip rects that reveal a ribbon (and the cuts it makes) along its length.
const REVEAL = {
  top: [5, 25, 110, 30],
  left: [25, 5, 30, 110],
  right: [65, 5, 30, 110],
  bottom: [5, 65, 110, 30],
};

/**
 * The mark for logo motion, in its own 120×120 space. Every ribbon and every cut it makes
 * in the others is a path with the class `{p}-{ribbon}`, so they move together and the
 * over-under stays right; the visible ribbon sits in a group `{p}-{ribbon}-fade` that
 * carries its opacity alone. With `reveal`, a ribbon and its cuts share a clip rect
 * `{p}-{ribbon}-clip`. `solid` cuts the whole bottom ribbon out of the verticals, `ghost`
 * draws the mark underneath in a quiet colour.
 */
function motionMarkElements(c, id, p, { reveal = false, solid = false, ghost = null } = {}) {
  const under = `${id}-under`;
  const verticals = `${id}-verticals`;
  const clip = (r) => (reveal ? ` clip-path="url(#${id}-${r})"` : '');
  const cut = (r, path) => `<g${clip(r)}>${path.replace('<path', `<path class="${p}-${r}"`)}</g>`;
  const ribbon = (r, d) => `<g class="${p}-${r}-fade"${clip(r)}><path class="${p}-${r}" d="${d}" ${paint(c[r])}/></g>`;
  const gaps = CROSSINGS.map((x) => `M${x + 2} 68.5H${x + 26}M${x + 2} 91.5H${x + 26}`).join('');
  return [
    '<defs>',
    ...(reveal
      ? RIBBONS.map(
          (r) =>
            `<clipPath id="${id}-${r}"><rect class="${p}-${r}-clip" x="${REVEAL[r][0]}" y="${REVEAL[r][1]}" width="${REVEAL[r][2]}" height="${REVEAL[r][3]}"/></clipPath>`,
        )
      : []),
    `<mask id="${under}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">`,
    '<rect width="120" height="120" fill="#fff"/>',
    cut('left', `<path d="${LEFT}" fill="#000" stroke="#000" stroke-width="5" stroke-linejoin="round"/>`),
    cut('right', `<path d="${RIGHT}" fill="#000" stroke="#000" stroke-width="5" stroke-linejoin="round"/>`),
    '</mask>',
    `<mask id="${verticals}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">`,
    '<rect width="120" height="120" fill="#fff"/>',
    cut('bottom', solid ? BOTTOM_CUT : `<path d="${gaps}" stroke="#000" stroke-width="3"/>`),
    '</mask>',
    '</defs>',
    ...(ghost ? [`<g ${paint(ghost)}><path d="${TOP}"/><path d="${LEFT}"/><path d="${RIGHT}"/><path d="${BOTTOM}"/></g>`] : []),
    `<g mask="url(#${under})">`,
    ribbon('top', TOP),
    '</g>',
    `<g mask="url(#${verticals})">`,
    ribbon('left', LEFT),
    ribbon('right', RIGHT),
    '</g>',
    ribbon('bottom', BOTTOM),
  ];
}

// Ribbons and wordmark in theme tokens, with the variant's hex values as fallbacks.
// A function declaration, so markAnimated above can use it too.
function tokenised(c) {
  return {
  ...Object.fromEntries(Object.entries(modules).map(([module, ribbon]) => [ribbon, `var(--module-${module}, ${c[ribbon]})`])),
  lesson: `var(--text, ${c.lesson})`,
  weave: `var(--accent, ${c.weave})`,
  };
}

const reducedMotion = (p) => `@media (prefers-reduced-motion:reduce){.${p},.${p} *{animation:none!important;transition:none!important}}`;
const EASE_OUT = 'cubic-bezier(.25,.8,.25,1)';
const EASE_DRAW = 'cubic-bezier(.5,0,.2,1)';

const MOTION_STYLE = {
  intro: [
    '@keyframes lw-intro-drop{from{transform:translateY(-24px)}}',
    '@keyframes lw-intro-fade{from{opacity:0}}',
    '@keyframes lw-intro-draw{from{transform:scaleX(0)}}',
    `.lw-intro-left{animation:lw-intro-drop .5s ${EASE_OUT} both}`,
    `.lw-intro-right{animation:lw-intro-drop .5s ${EASE_OUT} .1s both}`,
    '.lw-intro-left-fade{animation:lw-intro-fade .35s ease-out both}',
    '.lw-intro-right-fade{animation:lw-intro-fade .35s ease-out .1s both}',
    `.lw-intro-top-clip{transform-box:fill-box;transform-origin:left center;animation:lw-intro-draw .5s ${EASE_DRAW} .4s both}`,
    `.lw-intro-bottom-clip{transform-box:fill-box;transform-origin:right center;animation:lw-intro-draw .5s ${EASE_DRAW} .62s both}`,
    `.lw-intro-word-clip{transform-box:fill-box;transform-origin:left center;animation:lw-intro-draw .5s cubic-bezier(.45,0,.2,1) .9s both}`,
    reducedMotion('lw-intro'),
  ],
  beat: [
    ...[
      ['l', 'translateX(-5px)', 'translateX(1.5px)'],
      ['r', 'translateX(5px)', 'translateX(-1.5px)'],
      ['u', 'translateY(-5px)', 'translateY(1.5px)'],
      ['d', 'translateY(5px)', 'translateY(-1.5px)'],
    ].map(([k, out, back]) => `@keyframes lw-beat-${k}{0%,100%{transform:none}30%{transform:${out}}62%{transform:${back}}}`),
    // A beat when the pointer or the keyboard reaches the link or button around the
    // logo, or when the app sets lw-beat-run on it (a tap)
    ...[
      ['top', 'l', 0],
      ['bottom', 'r', 0],
      ['left', 'u', 0.06],
      ['right', 'd', 0.06],
    ].map(
      ([r, k, delay]) =>
        `:is(a,button):hover .lw-beat-${r},:is(a,button):focus-visible .lw-beat-${r},.lw-beat-run .lw-beat-${r}{animation:lw-beat-${k} .7s ease-in-out ${delay}s both}`,
    ),
    reducedMotion('lw-beat'),
  ],
  relay: [
    '@keyframes lw-relay{0%,100%{opacity:.35}10%,35%{opacity:1}58%{opacity:.35}}',
    // Clockwise from the top: top, right, bottom, left
    ...[
      ['top', -1.6],
      ['right', -1.2],
      ['bottom', -0.8],
      ['left', -0.4],
    ].map(([r, delay]) => `.lw-relay-${r}-fade{animation:lw-relay 1.6s ease-in-out ${delay}s infinite both}`),
    reducedMotion('lw-relay'),
  ],
  heddle: [
    // One swing between the two ends: it slows only where it turns, never at the centre.
    // As wide as the weave allows (no ribbon end reaches a crossing): Firefox draws a move
    // of a pixel or two in steps, so at 40 px a narrower swing looked jerky there
    '@keyframes lw-heddle-y{0%,100%{transform:translateY(-10px)}50%{transform:translateY(10px)}}',
    '@keyframes lw-heddle-x{0%,100%{transform:translateX(8px)}50%{transform:translateX(-8px)}}',
    '.lw-heddle-left{animation:lw-heddle-y 2.1s ease-in-out -1.575s infinite}',
    '.lw-heddle-right{animation:lw-heddle-y 2.1s ease-in-out -.525s infinite}',
    '.lw-heddle-top{animation:lw-heddle-x 2.1s ease-in-out infinite}',
    '.lw-heddle-bottom{animation:lw-heddle-x 2.1s ease-in-out -1.05s infinite}',
    // The gaps it cuts in the verticals stay over them: it sways along its own edges
    'mask .lw-heddle-bottom{animation:none}',
    reducedMotion('lw-heddle'),
  ],
  fill: [
    // In weave order, a quarter each: top from the left, the verticals from the top,
    // the bottom one from the right
    ...[
      ['top', 'left center', 'scaleX', 0],
      ['left', 'center top', 'scaleY', 1],
      ['right', 'center top', 'scaleY', 2],
      ['bottom', 'right center', 'scaleX', 3],
    ].map(
      ([r, origin, scale, quarter]) =>
        `.lw-fill-${r}-clip{transform-box:fill-box;transform-origin:${origin};transform:${scale}(clamp(0,calc(var(--lw-progress,0)*4${quarter ? ` - ${quarter}` : ''}),1));transition:transform .3s ease-out}`,
    ),
    '@keyframes lw-fill-done{40%{transform:scale(1.07)}}',
    '.lw-fill{transform-box:fill-box;transform-origin:center}',
    '.lw-fill-done .lw-fill{animation:lw-fill-done .45s cubic-bezier(.3,1.4,.5,1)}',
    reducedMotion('lw-fill'),
  ],
};

const MOTION_OPTIONS = {
  intro: { reveal: true },
  beat: {},
  relay: { solid: true },
  heddle: {},
  fill: { reveal: true },
};

const motionStyle = (motion) => ['<style>', ...MOTION_STYLE[motion], '</style>'];

/** The mark with one of the logo motions; colours follow the theme tokens when inlined. */
export function markMotion(motion, c, id, size = 120) {
  const p = `lw-${motion}`;
  const ghost = motion === 'fill' ? `var(--neutral-soft, ${colorToken('neutral-soft').light})` : null;
  return svg(size, size, 'LessonWeave', [
    ...motionStyle(motion),
    `<g class="${p}">`,
    ...placeMark(0, 0, size, motionMarkElements(tokenised(c), id, p, { ...MOTION_OPTIONS[motion], ghost })),
    '</g>',
  ]);
}

/** The horizontal logo with the intro: the mark weaves itself, then the wordmark unrolls. */
export function logoIntro(c, id, F = 72) {
  const M = 1.5 * F;
  const gap = (20 / 72) * F;
  const width = M + gap + wordWidth(F);
  const baseline = (M - F) / 2 + baselineInBox(F);
  const t = tokenised(c);
  return svg(width, M, 'LessonWeave', [
    ...motionStyle('intro'),
    '<g class="lw-intro">',
    `<defs><clipPath id="${id}-word"><rect class="lw-intro-word-clip" x="${fmt(M)}" y="0" width="${fmt(width - M)}" height="${fmt(M)}"/></clipPath></defs>`,
    ...placeMark(0, 0, M, motionMarkElements(t, id, 'lw-intro', MOTION_OPTIONS.intro)),
    `<g clip-path="url(#${id}-word)">`,
    ...wordElements(t, M + gap, baseline, F),
    '</g>',
    '</g>',
  ]);
}

/**
 * App icon: the mark on a tile. `markRatio` is the mark size against the tile,
 * `radius` the corner radius against the tile (0 = square, full bleed).
 */
export function icon({ size, background, colors, markRatio, radius, id }) {
  const m = size * markRatio;
  return svg(size, size, 'LessonWeave', [
    `<rect width="${size}" height="${size}" rx="${fmt(size * radius)}" fill="${background}"/>`,
    ...placeMark((size - m) / 2, (size - m) / 2, m, markElements(colors, id)),
  ]);
}

/**
 * Module icons: the mark with only the module's ribbon in colour, the others in
 * `ribbon-muted`. Each module owns one ribbon.
 */
const RIBBON_MUTED = { light: '#D3C8B6', dark: '#423C33' };
export const modules = { flashcards: 'top', practice: 'left', planner: 'right', insights: 'bottom' };

export function moduleColors(module, theme) {
  const full = theme === 'dark' ? variants.dark : variants.color;
  const muted = RIBBON_MUTED[theme];
  const own = modules[module];
  const pick = (ribbon) => (ribbon === own ? full[ribbon] : muted);
  return { top: pick('top'), left: pick('left'), right: pick('right'), bottom: pick('bottom') };
}

const CREAM = '#F4EEE3';
const NIGHT = '#1A1814';

/** Ratios from the branding board (Ikona aplikace a favicon). */
export const icons = {
  // iOS: square, the system rounds the corners. 172/220 of the tile.
  'app-icon-ios-1024': { size: 1024, background: CREAM, colors: variants.color, markRatio: 172 / 220, radius: 0 },
  'apple-touch-icon-180': { size: 180, background: CREAM, colors: variants.color, markRatio: 172 / 220, radius: 0 },
  // PWA "any": rounded tile, 75/96 of the tile, corners 22 %.
  'icon-192': { size: 192, background: CREAM, colors: variants.color, markRatio: 75 / 96, radius: 0.22 },
  'icon-512': { size: 512, background: CREAM, colors: variants.color, markRatio: 75 / 96, radius: 0.22 },
  // PWA / Android maskable: full bleed, the mark inside the 80 % safe circle (124/200).
  'icon-maskable-512': { size: 512, background: CREAM, colors: variants.color, markRatio: 124 / 200, radius: 0 },
  // Optional dark variant: 125/160 of the tile.
  'icon-dark-512': { size: 512, background: NIGHT, colors: variants.dark, markRatio: 125 / 160, radius: 0.22 },
  // Favicons at real size: 28 in 32 (radius 6), 14 in 16 (radius 3).
  'favicon-32': { size: 32, background: CREAM, colors: variants.color, markRatio: 28 / 32, radius: 6 / 32 },
  'favicon-16': { size: 16, background: CREAM, colors: variants.color, markRatio: 14 / 16, radius: 3 / 16 },
};

/**
 * Header lockup (variant D2): the mark, the wordmark beside it and under the wordmark the
 * module name on a tag in the module colour. Drawn at its header size, 40 px high; on a
 * phone the app shows it at 36 px. Module names are Outfit 600 outlined like the wordmark.
 */
const LOCKUP = {
  height: 40, // = the mark
  gap: 10, // mark to the text column
  word: 24.5, // wordmark font size: its capitals fill the top 17 px
  tagTop: 22,
  tagHeight: 18,
  tagRadius: 5,
  tagPadding: 8,
  tagFont: 12,
};

export function lockup(module, theme, id, { beat = false } = {}) {
  const c = theme === 'dark' ? variants.dark : variants.color;
  // With beat the lockup is for inlining: colours are theme tokens, so one file serves both themes
  const colours = beat ? tokenised(c) : c;
  const tag = (token) => (beat ? `var(--${token}, ${colorToken(token)[theme]})` : colorToken(token)[theme]);
  const name = moduleNames.modules[module];
  const L = LOCKUP;
  const x = L.height + L.gap;
  const capHeight = (F) => (F * 703) / em; // top of the L of the wordmark
  const tagWidth = (name.advance * L.tagFont) / moduleNames.unitsPerEm + 2 * L.tagPadding;
  const width = x + Math.max(wordWidth(L.word), tagWidth);
  const textBaseline = L.tagTop + L.tagHeight / 2 + capHeight(L.tagFont) / 2;
  const body = [
    ...placeMark(0, 0, L.height, beat ? motionMarkElements(colours, id, 'lw-beat') : markElements(c, id)),
    ...wordElements(colours, x, capHeight(L.word), L.word),
    `<rect x="${fmt(x)}" y="${L.tagTop}" width="${fmt(tagWidth)}" height="${L.tagHeight}" rx="${L.tagRadius}" ${paint(tag(`module-${module}`))}/>`,
    `<g transform="translate(${fmt(x + L.tagPadding)} ${fmt(textBaseline)}) scale(${L.tagFont / moduleNames.unitsPerEm})">`,
    `<path d="${name.path}" ${paint(tag(`on-module-${module}`))}/>`,
    '</g>',
  ];
  return svg(width, L.height, `LessonWeave ${name.text}`, beat ? [...motionStyle('beat'), '<g class="lw-beat">', ...body, '</g>'] : body);
}

/** Every SVG file in brand/, as { path: content }. */
export function svgFiles() {
  const files = {};
  for (const [name, c] of Object.entries(variants)) {
    files[`brand/logo-${name}.svg`] = logo(c, `lw-logo-${name}`);
    files[`brand/logo-vertical-${name}.svg`] = logoVertical(c, `lw-logo-vertical-${name}`);
    files[`brand/mark-${name}.svg`] = mark(c, `lw-mark-${name}`);
  }
  files['brand/mark-animated.svg'] = markAnimated(variants.color, 'lw-mark-animated');
  files['brand/mark-animated-dark.svg'] = markAnimated(variants.dark, 'lw-mark-animated-dark');
  for (const module of Object.keys(modules)) {
    for (const theme of ['light', 'dark']) {
      files[`brand/modules/${module}-${theme}.svg`] = mark(moduleColors(module, theme), `lw-module-${module}-${theme}`);
    }
  }
  for (const module of Object.keys(modules)) {
    for (const theme of ['light', 'dark']) {
      files[`brand/lockups/${module}-${theme}.svg`] = lockup(module, theme, `lw-lockup-${module}-${theme}`);
    }
  }
  // Logo motion. Files used as <img> come in light and dark; beat and fill only work inlined.
  files['brand/logo-intro.svg'] = logoIntro(variants.color, 'lw-logo-intro');
  files['brand/logo-intro-dark.svg'] = logoIntro(variants.dark, 'lw-logo-intro-dark');
  files['brand/mark-beat.svg'] = markMotion('beat', variants.color, 'lw-mark-beat');
  for (const module of Object.keys(modules)) {
    files[`brand/lockups/${module}-beat.svg`] = lockup(module, 'light', `lw-lockup-${module}-beat`, { beat: true });
  }
  for (const motion of ['relay', 'heddle']) {
    files[`brand/mark-${motion}.svg`] = markMotion(motion, variants.color, `lw-mark-${motion}`);
    files[`brand/mark-${motion}-dark.svg`] = markMotion(motion, variants.dark, `lw-mark-${motion}-dark`);
  }
  files['brand/mark-fill.svg'] = markMotion('fill', variants.color, 'lw-mark-fill');
  for (const [name, spec] of Object.entries(icons)) {
    files[`brand/icons/${name}.svg`] = icon({ ...spec, id: `lw-${name}` });
  }
  // The SVG favicon uses the 32 px design and scales.
  files['brand/icons/favicon.svg'] = files['brand/icons/favicon-32.svg'];
  return files;
}

/** A .ico file holding PNG images (supported by every current browser and Windows). */
function ico(pngs) {
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    header.writeUInt8(size >= 256 ? 0 : size, e);
    header.writeUInt8(size >= 256 ? 0 : size, e + 1);
    header.writeUInt16LE(1, e + 4); // colour planes
    header.writeUInt16LE(32, e + 6); // bits per pixel
    header.writeUInt32LE(data.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...pngs.map((p) => p.data)]);
}

async function main() {
  const { Resvg } = await import('@resvg/resvg-js');
  const files = svgFiles();
  mkdirSync(join(root, 'brand', 'icons'), { recursive: true });
  mkdirSync(join(root, 'brand', 'modules'), { recursive: true });
  mkdirSync(join(root, 'brand', 'lockups'), { recursive: true });
  for (const [path, content] of Object.entries(files)) writeFileSync(join(root, path), content);

  const png = (svgText, width) => new Resvg(svgText, { fitTo: { mode: 'width', value: width } }).render().asPng();
  for (const [name, spec] of Object.entries(icons)) {
    writeFileSync(join(root, 'brand', 'icons', `${name}.png`), png(files[`brand/icons/${name}.svg`], spec.size));
  }
  // favicon.ico: the 16 px and 32 px designs, plus 48 px scaled from the 32 px one.
  const favicon32 = files['brand/icons/favicon-32.svg'];
  writeFileSync(
    join(root, 'brand', 'icons', 'favicon.ico'),
    ico([
      { size: 16, data: png(files['brand/icons/favicon-16.svg'], 16) },
      { size: 32, data: png(favicon32, 32) },
      { size: 48, data: png(favicon32, 48) },
    ]),
  );
  console.log(`brand/: ${Object.keys(files).length} SVG files, ${Object.keys(icons).length} PNG icons, favicon.ico`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
