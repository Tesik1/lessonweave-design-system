import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import presetEsm from '../dist/tailwind-preset.js';

const require = createRequire(import.meta.url);
const presetCjs = require('../dist/tailwind-preset.cjs');
const tokens = JSON.parse(readFileSync(new URL('../tokens.json', import.meta.url), 'utf8'));
const css = readFileSync(new URL('../dist/base.css', import.meta.url), 'utf8');

const block = (selector) => {
  const start = css.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `${selector} block missing`);
  return css.slice(start, css.indexOf('}', start));
};
const rootBlock = block(':root');
const darkBlock = block('[data-theme="dark"]');
const ext = presetEsm.theme.extend;
const presetText = JSON.stringify(ext);
const light = (v) => (typeof v === 'string' ? v : v.light);

const allTokens = [
  ...tokens.color.tokens,
  ...tokens.spacing.tokens,
  ...tokens.radius.tokens,
  ...tokens.shadow.tokens,
  ...tokens.size.tokens,
];

test('every token is a CSS variable with its light value', () => {
  for (const t of allTokens) {
    assert.ok(rootBlock.includes(`--${t.name}: ${light(t.value)};`), `--${t.name} missing or wrong`);
  }
});

test('every type style is a CSS variable and a Tailwind font size', () => {
  for (const s of tokens.type.groups.flatMap((g) => g.styles)) {
    assert.ok(rootBlock.includes(`--type-${s.name}: ${s.fontWeight} ${s.fontSize}/${s.lineHeight} `), `--type-${s.name}`);
    assert.deepEqual(ext.fontSize[s.name], [s.fontSize, { lineHeight: s.lineHeight, fontWeight: String(s.fontWeight) }]);
  }
});

test('dark theme covers every colour and every themed value', () => {
  for (const t of allTokens) {
    if (typeof t.value === 'string') continue;
    assert.ok(darkBlock.includes(`--${t.name}: ${t.value.dark};`), `dark --${t.name} missing or wrong`);
  }
  for (const t of tokens.color.tokens) assert.ok(t.value.dark, `${t.name} has no dark value`);
});

test('every token is reachable from the Tailwind preset', () => {
  for (const t of allTokens) {
    assert.ok(presetText.includes(`"var(--${t.name})"`), `${t.name} not in preset`);
  }
  for (const t of tokens.color.tokens) assert.equal(ext.colors[t.name], `var(--${t.name})`);
});

test('radius follows design system v2', () => {
  assert.equal(ext.borderRadius.md, 'var(--radius-md)');
  assert.ok(rootBlock.includes('--radius-md: 8px;'));
  assert.ok(!css.includes('--radius-sm'), 'radius-sm was removed in v2');
});

test('focus ring is 3px with 2px offset on keyboard focus only', () => {
  assert.match(css, /:where\(:focus-visible\) \{\s*outline: 3px solid var\(--focus\);\s*outline-offset: 2px;/);
});

test('ESM and CommonJS presets are identical', () => {
  assert.deepEqual(presetCjs, presetEsm);
});

test('generated files are up to date with tokens.json', async () => {
  const { cssVariables } = await import('../scripts/build.mjs');
  const { lightVars, darkVars } = cssVariables();
  for (const [n, v] of lightVars) assert.ok(rootBlock.includes(`--${n}: ${v};`), `stale --${n}: run npm run build`);
  for (const [n, v] of darkVars) assert.ok(darkBlock.includes(`--${n}: ${v};`), `stale dark --${n}: run npm run build`);
});
