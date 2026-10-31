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
// Colours are functions (JSON.stringify drops them), so the rest of the preset is checked as text.
const presetText = JSON.stringify(ext);
const resolved = (preset) => ({
  ...preset.theme.extend,
  colors: Object.fromEntries(Object.entries(preset.theme.extend.colors).map(([n, fn]) => [n, [fn(), fn({ opacityValue: '0.4' })]])),
});
const ref = (v) => v.replace(/^\{(.+)\}$/, 'var(--$1)');
const light = (v) => ref(typeof v === 'string' ? v : v.light);
const isAlias = (v) => typeof v !== 'string' && /^\{.+\}$/.test(v.light);

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
    if (typeof t.value === 'string' || isAlias(t.value)) continue;
    assert.ok(darkBlock.includes(`--${t.name}: ${t.value.dark};`), `dark --${t.name} missing or wrong`);
  }
  for (const t of tokens.color.tokens) assert.ok(t.value.dark, `${t.name} has no dark value`);
});

test('every token is reachable from the Tailwind preset', () => {
  // inline-h and text-line size inline text in the editor; they are CSS variables only.
  const cssOnly = ['inline-h', 'text-line'];
  for (const t of allTokens.filter((t) => !tokens.color.tokens.includes(t) && !cssOnly.includes(t.name))) {
    assert.ok(presetText.includes(`"var(--${t.name})"`), `${t.name} not in preset`);
  }
  for (const t of tokens.color.tokens) assert.equal(typeof ext.colors[t.name], 'function', `${t.name} not in preset`);
});

test('colours are functions that support opacity', () => {
  assert.equal(ext.colors.accent(), 'var(--accent)');
  assert.equal(ext.colors.accent({ opacityValue: undefined }), 'var(--accent)');
  assert.equal(ext.colors.text({ opacityValue: '0.4' }), 'color-mix(in srgb, var(--text) 40%, transparent)');
  assert.equal(ext.colors.text({ opacityValue: 0.4 }), 'color-mix(in srgb, var(--text) 40%, transparent)');
  assert.equal(ext.colors.text({ opacityValue: 'var(--tw-bg-opacity)' }), 'var(--text)');
});

test('inline element tokens, radius-xs and the score style reach CSS and Tailwind', () => {
  assert.ok(rootBlock.includes('--inline-h: 28px;'));
  assert.ok(rootBlock.includes('--text-line: 48px;'));
  assert.ok(rootBlock.includes('--radius-xs: 2px;'));
  assert.ok(rootBlock.includes('--type-student-score: 700 56px/62px '));
  assert.equal(ext.borderRadius.xs, 'var(--radius-xs)');
  assert.deepEqual(ext.fontSize['student-score'], ['56px', { lineHeight: '62px', fontWeight: '700' }]);
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
  assert.deepEqual(resolved(presetCjs), resolved(presetEsm));
});

test('generated files are up to date with tokens.json', async () => {
  const { cssVariables } = await import('../scripts/build.mjs');
  const { lightVars, darkVars } = cssVariables();
  for (const [n, v] of lightVars) assert.ok(rootBlock.includes(`--${n}: ${v};`), `stale --${n}: run npm run build`);
  for (const [n, v] of darkVars) assert.ok(darkBlock.includes(`--${n}: ${v};`), `stale dark --${n}: run npm run build`);
});

test('module aliases resolve to a CSS variable and follow data-module', () => {
  assert.ok(rootBlock.includes('--module: var(--module-practice);'));
  assert.ok(rootBlock.includes('--on-module: var(--on-module-practice);'));
  assert.ok(!darkBlock.includes('--module:'), 'aliases resolve where used, not repeated for dark');
  for (const m of ['flashcards', 'practice', 'planner', 'insights']) {
    const rule = block(`[data-module="${m}"]`);
    assert.ok(rule.includes(`--module: var(--module-${m});`), `${m}: --module`);
    assert.ok(rule.includes(`--on-module: var(--on-module-${m});`), `${m}: --on-module`);
  }
  assert.ok(!css.includes('{module'), 'no unresolved {alias} left');
  assert.equal(ext.colors.module(), 'var(--module)');
});

test('design system v3 dropped brand and on-brand', () => {
  assert.ok(!/--(on-)?brand:/.test(css));
  assert.equal(ext.colors.brand, undefined);
});
