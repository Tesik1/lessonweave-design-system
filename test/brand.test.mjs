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
