import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { svgFiles, icons } from '../scripts/brand/build.mjs';

const root = new URL('../', import.meta.url);

test('brand SVGs are up to date (run npm run build:brand)', () => {
  for (const [path, content] of Object.entries(svgFiles())) {
    assert.equal(readFileSync(new URL(path, root), 'utf8'), content, `${path} is out of date`);
  }
});

test('every icon has its PNG, and favicon.ico exists', () => {
  for (const name of Object.keys(icons)) {
    assert.ok(existsSync(new URL(`brand/icons/${name}.png`, root)), `brand/icons/${name}.png missing`);
  }
  assert.ok(existsSync(new URL('brand/icons/favicon.ico', root)));
});

test('mask and clip ids are unique per file, so inlined logos do not clash', () => {
  const owners = new Map();
  for (const [path, content] of Object.entries(svgFiles())) {
    if (path === 'brand/icons/favicon.svg') continue; // a copy of favicon-32.svg
    for (const [, id] of content.matchAll(/<(?:mask|clipPath) id="([^"]+)"/g)) {
      assert.ok(!owners.has(id), `${id} is in ${owners.get(id)} and ${path}`);
      owners.set(id, path);
    }
  }
});

test('ribbon gaps are cut out, never painted in a background colour', () => {
  for (const [path, content] of Object.entries(svgFiles())) {
    assert.ok(!content.includes('stroke="#F4EEE3"'), `${path} paints a gap in cream`);
    assert.ok(content.includes('mask="url(#'), `${path} has no mask`);
  }
});

test('the bottom ribbon is one shape over the verticals, not patches (no hairlines)', () => {
  for (const [path, content] of Object.entries(svgFiles())) {
    assert.ok(!/<rect[^>]* y="70" width="28" height="20"/.test(content), `${path} still has patches`);
  }
});

test('the animated mark follows the module tokens and stands still with reduced motion', () => {
  for (const path of ['brand/mark-animated.svg', 'brand/mark-animated-dark.svg']) {
    const content = svgFiles()[path];
    for (const m of ['flashcards', 'practice', 'planner', 'insights']) assert.ok(content.includes(`var(--module-${m}, #`), `${path}: ${m}`);
    assert.match(content, /\.lw-weave\{animation:lw-weave-fade 4s linear infinite both\}/);
    // Faded out at 98.75 % (3.95 s), the top ribbon starts at 5 % (0.2 s): 0.25 s empty
    assert.match(content, /lw-weave-fade\{0%,90%\{opacity:1\}98\.75%,100%\{opacity:0\}\}/);
    assert.match(content, /@keyframes lw-weave-top\{0%,5%\{/);
    assert.match(content, /prefers-reduced-motion:reduce\)\{\.lw-weave,\.lw-weave \*\{animation:none!important\}/);
  }
});

test('logo motion: every file follows the theme tokens and stands still with reduced motion', () => {
  const files = svgFiles();
  const motion = {
    'brand/logo-intro.svg': 'intro',
    'brand/logo-intro-dark.svg': 'intro',
    'brand/mark-beat.svg': 'beat',
    'brand/mark-relay.svg': 'relay',
    'brand/mark-relay-dark.svg': 'relay',
    'brand/mark-heddle.svg': 'heddle',
    'brand/mark-heddle-dark.svg': 'heddle',
    'brand/mark-fill.svg': 'fill',
    ...Object.fromEntries(['flashcards', 'practice', 'planner', 'insights'].map((m) => [`brand/lockups/${m}-beat.svg`, 'beat'])),
  };
  for (const [path, name] of Object.entries(motion)) {
    const content = files[path];
    assert.ok(content, `${path} missing`);
    for (const m of ['flashcards', 'practice', 'planner', 'insights']) assert.ok(content.includes(`var(--module-${m}, #`), `${path}: ${m}`);
    assert.ok(content.includes(`<g class="lw-${name}">`), `${path}: root group`);
    assert.ok(
      content.includes(`@media (prefers-reduced-motion:reduce){.lw-${name},.lw-${name} *{animation:none!important;transition:none!important}}`),
      `${path}: reduced motion`,
    );
    // Only this motion's classes, so two inlined motions never share keyframes
    const own = new RegExp(`^lw-${name}(-(top|left|right|bottom)(-fade|-clip)?|-word-clip)?$`);
    for (const [, cls] of content.matchAll(/class="([^"]+)"/g)) assert.match(cls, own, `${path}: ${cls}`);
  }
  // Dark files fall back to the dark ribbon colours
  assert.ok(files['brand/mark-relay-dark.svg'].includes('var(--module-flashcards, #EBC25A)'));
  assert.ok(files['brand/logo-intro-dark.svg'].includes('var(--text, #EFE9DF)'));
});

test('heddle: the swing keeps every ribbon end clear of the crossings', () => {
  const content = svgFiles()['brand/mark-heddle.svg'];
  const swing = (axis) =>
    Math.max(...[...content.matchAll(new RegExp(`translate${axis}\\((-?[\\d.]+)px\\)`, 'g'))].map((m) => Math.abs(+m[1])));
  // The verticals' chevrons sit 10 units from the box edge (and from the gap under the
  // bottom ribbon), the horizontals' ends 10 from the cut around the verticals
  assert.ok(swing('Y') <= 10, `verticals swing ${swing('Y')}`);
  assert.ok(swing('X') <= 8, `horizontals swing ${swing('X')}`);
  // Wide enough for Firefox, which draws a move of a pixel or two in steps
  assert.ok(swing('Y') >= 10 && swing('X') >= 8);
});

test('logo motion: each ribbon moves together with the gaps it cuts', () => {
  for (const path of ['brand/logo-intro.svg', 'brand/mark-beat.svg', 'brand/mark-heddle.svg']) {
    const content = svgFiles()[path];
    const name = path.match(/(intro|beat|heddle)/)[1];
    // The vertical cuts in the top ribbon and the gap lines in the verticals carry the ribbon's class
    for (const r of ['left', 'right', 'bottom']) {
      assert.match(content, new RegExp(`<mask[^>]*>[\\s\\S]*?<path class="lw-${name}-${r}" d=`), `${path}: cut of ${r}`);
    }
  }
});

test('logo motion: intro and fill reveal each ribbon with its cuts; relay cuts the whole bottom ribbon', () => {
  const files = svgFiles();
  for (const path of ['brand/logo-intro.svg', 'brand/mark-fill.svg']) {
    for (const r of ['top', 'left', 'right', 'bottom']) {
      const id = files[path].match(new RegExp(`<clipPath id="([^"]+)"><rect class="lw-[a-z]+-${r}-clip"`))[1];
      // The ribbon and the cuts it makes in the masks share the clip
      assert.ok(files[path].split(`clip-path="url(#${id})"`).length - 1 >= (r === 'top' ? 1 : 2), `${path}: ${r}`);
    }
  }
  assert.match(files['brand/mark-fill.svg'], /scaleX\(clamp\(0,calc\(var\(--lw-progress,0\)\*4\),1\)\)/);
  assert.match(files['brand/mark-fill.svg'], /scaleX\(clamp\(0,calc\(var\(--lw-progress,0\)\*4 - 3\),1\)\)/);
  assert.ok(files['brand/mark-fill.svg'].includes('var(--neutral-soft, #'));
  assert.match(files['brand/mark-relay.svg'], /<path class="lw-relay-bottom" d="M10 70H110L103 80L110 90H10L17 80Z" fill="#000" stroke="#000" stroke-width="6"/);
});

test('beat lockups match the static header lockups in size and name', () => {
  const files = svgFiles();
  for (const m of ['flashcards', 'practice', 'planner', 'insights']) {
    const open = (path) => files[path].split('\n')[0];
    assert.equal(open(`brand/lockups/${m}-beat.svg`), open(`brand/lockups/${m}-light.svg`));
    assert.ok(files[`brand/lockups/${m}-beat.svg`].includes(`var(--on-module-${m}, #`));
  }
});

test('the static files did not take any motion', () => {
  for (const [path, content] of Object.entries(svgFiles())) {
    if (/-(intro|beat|relay|heddle|fill)(-dark)?\.svg$|mark-animated/.test(path)) continue;
    assert.ok(!content.includes('<style>'), `${path} has a style`);
  }
});

test('each module has a header lockup in both themes, its tag in the module colour', () => {
  const tokens = JSON.parse(readFileSync(new URL('tokens.json', root), 'utf8')).color.tokens;
  const value = (name) => tokens.find((t) => t.name === name).value;
  const files = svgFiles();
  for (const m of ['flashcards', 'practice', 'planner', 'insights']) {
    for (const theme of ['light', 'dark']) {
      const content = files[`brand/lockups/${m}-${theme}.svg`];
      assert.ok(content, `brand/lockups/${m}-${theme}.svg missing`);
      assert.match(content, /viewBox="0 0 [\d.]+ 40"/, `${m}-${theme}: 40 px high`);
      assert.match(content, new RegExp(`aria-label="LessonWeave ${m[0].toUpperCase()}${m.slice(1)}"`));
      assert.ok(content.includes(`<rect x="50" y="22" width="`) && content.includes(`fill="${value(`module-${m}`)[theme]}"/>`), `${m}-${theme}: tag colour`);
      assert.ok(content.includes(`fill="${value(`on-module-${m}`)[theme]}"/>`), `${m}-${theme}: tag text colour`);
    }
  }
});

test('the top ribbon is the Flashcards module colour', () => {
  const tokens = JSON.parse(readFileSync(new URL('tokens.json', root), 'utf8')).color.tokens;
  const flashcards = tokens.find((t) => t.name === 'module-flashcards').value;
  assert.ok(svgFiles()['brand/mark-color.svg'].includes(`fill="${flashcards.light}"`));
  assert.ok(svgFiles()['brand/mark-dark.svg'].includes(`fill="${flashcards.dark}"`));
});
