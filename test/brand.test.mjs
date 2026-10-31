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

test('mask ids are unique per file, so inlined logos do not clash', () => {
  const owners = new Map();
  for (const [path, content] of Object.entries(svgFiles())) {
    if (path === 'brand/icons/favicon.svg') continue; // a copy of favicon-32.svg
    for (const [, id] of content.matchAll(/<mask id="([^"]+)"/g)) {
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

test('the animated mark follows the module tokens and stands still with reduced motion', () => {
  for (const path of ['brand/mark-animated.svg', 'brand/mark-animated-dark.svg']) {
    const content = svgFiles()[path];
    for (const m of ['flashcards', 'practice', 'planner', 'insights']) assert.ok(content.includes(`var(--module-${m}, #`), `${path}: ${m}`);
    assert.match(content, /4\.4s linear infinite/);
    assert.match(content, /prefers-reduced-motion:reduce\)\{\.lw-weave,\.lw-weave \*\{animation:none!important\}/);
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
