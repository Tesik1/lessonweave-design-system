// Generates dist/base.css and the Tailwind preset (ESM + CommonJS) from tokens.json.
// Run with `npm run build`. The output is committed, because installing from git
// does not run a build in the consuming app.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const header = `Generated from tokens.json (design system "${tokens.name}" v${tokens.version}, package ${pkg.version}) by scripts/build.mjs. Do not edit.`;

// Values that differ per theme are { light, dark }; the rest are plain strings.
// A value "{name}" is an alias of another token and becomes `var(--name)`.
const ref = (v) => v.replace(/^\{(.+)\}$/, 'var(--$1)');
const isAlias = (v) => /^\{.+\}$/.test(typeof v === 'string' ? v : v.light);
const light = (v) => ref(typeof v === 'string' ? v : v.light);
// An alias is resolved where it is used, so the dark block does not repeat it.
const dark = (v) => (typeof v === 'string' || (isAlias(v) && v.light === v.dark) ? null : ref(v.dark));

// Modules own a colour each (`module-flashcards` …). Aliases pointing at one module's token
// (`module` = "{module-practice}") follow `data-module` instead: one block per module.
const moduleNames = tokens.color.tokens.map((t) => t.name.match(/^module-(.+)$/)?.[1]).filter(Boolean);
const moduleAliases = tokens.color.tokens
  .filter((t) => isAlias(t.value))
  .map((t) => ({ name: t.name, target: light(t.value).match(/^var\(--(.+)\)$/)[1] }))
  .map((a) => ({ ...a, module: moduleNames.find((m) => a.target.endsWith(`-${m}`)) }))
  .filter((a) => a.module);

/** One `[data-module]` rule per module, pointing the module aliases at that module's tokens. */
export function moduleRules() {
  return moduleNames.map((m) => [
    m,
    moduleAliases.map((a) => [a.name, `var(--${a.target.slice(0, -a.module.length)}${m})`]),
  ]);
}

const typeStyles = tokens.type.groups.flatMap((g) => g.styles);
const fontVar = (family) => `var(--font-${family})`;

/** Every CSS custom property, in light and (where it differs) dark. */
export function cssVariables() {
  const lightVars = [];
  const darkVars = [];
  const add = (name, value) => {
    lightVars.push([name, light(value)]);
    const d = dark(value);
    if (d !== null) darkVars.push([name, d]);
  };
  for (const t of tokens.color.tokens) add(t.name, t.value);
  for (const t of tokens.spacing.tokens) add(t.name, t.value);
  for (const t of tokens.radius.tokens) add(t.name, t.value);
  for (const t of tokens.shadow.tokens) add(t.name, t.value);
  for (const t of tokens.size.tokens) add(t.name, t.value);
  for (const [family, stack] of Object.entries(tokens.type.families)) add(`font-${family}`, stack);
  for (const s of tokens.type.groups.flatMap((g) => g.styles.map((st) => ({ ...st, family: g.family })))) {
    add(`type-${s.name}`, `${s.fontWeight} ${s.fontSize}/${s.lineHeight} ${fontVar(s.family)}`);
  }
  return { lightVars, darkVars };
}

function baseCss() {
  const { lightVars, darkVars } = cssVariables();
  const decl = (vars) => vars.map(([n, v]) => `  --${n}: ${v};`).join('\n');
  return `/* ${header} */

:root {
${decl(lightVars)}
}

/* Dark theme: toggled per device from Settings > Appearance by setting data-theme="dark" on <html>. */
[data-theme="dark"] {
${decl(darkVars)}
}

/* Current module: set data-module="${moduleNames.join('|')}" on <html> (or on a container);
   ${moduleAliases.map((a) => `--${a.name}`).join(' and ')} follow it. Without it they point at ${moduleAliases[0]?.module}. */
${moduleRules()
  .map(([m, vars]) => `[data-module="${m}"] {\n${decl(vars)}\n}`)
  .join('\n')}

/* Base rules use :where() so they carry no specificity and every app style overrides them. */
:where(body) {
  background: var(--surface);
  color: var(--text);
  font: var(--type-body);
}

/* Focus ring: 3px solid, 2px offset, keyboard focus only. */
:where(:focus-visible) {
  outline: 3px solid var(--focus);
  outline-offset: 2px;
}
:where(:focus:not(:focus-visible)) {
  outline: none;
}
`;
}

// Colours cannot be plain `var(--x)` strings: Tailwind 3 cannot add an alpha channel to a
// `var()`, so `bg-accent/50` would silently produce nothing. They are functions that build the
// alpha with `color-mix` instead. JSON cannot hold functions, so the preset marks each colour
// and `presetSource` swaps the marker for a call of the `color` helper written into the file.
const COLOR_MARK = '@@color:';

const colorHelper = `// Colour from a CSS variable with opacity support (\`bg-accent/50\`). Without an opacity
// (Tailwind then passes undefined or \`var(--tw-bg-opacity)\`) the bare variable is kept.
const color = (name) => ({ opacityValue } = {}) =>
  opacityValue === undefined || String(opacityValue).startsWith('var(')
    ? \`var(--\${name})\`
    : \`color-mix(in srgb, var(--\${name}) \${Number(opacityValue) * 100}%, transparent)\`;
`;

/** Source of the preset: the `color` helper plus the preset object, exported by `exportLine`. */
function presetSource(exportLine) {
  const json = JSON.stringify(preset(), null, 2).replace(/"@@color:([^"]+)"/g, (_, name) => `color(${JSON.stringify(name)})`);
  return `// ${header}\n\n${colorHelper}\n${exportLine} ${json};\n`;
}

function preset() {
  const v = (name) => `var(--${name})`;
  const map = (list, key = (n) => n) => Object.fromEntries(list.map((t) => [key(t.name), v(t.name)]));
  const sizes = tokens.size.tokens;
  const controls = sizes.filter((t) => /^(control|touch)-/.test(t.name));
  const dialogs = sizes.filter((t) => t.name.startsWith('dialog-'));
  const icons = sizes.filter((t) => t.name.startsWith('icon-'));
  const fontSize = Object.fromEntries(
    typeStyles.map((s) => [s.name, [s.fontSize, { lineHeight: s.lineHeight, fontWeight: String(s.fontWeight) }]]),
  );
  return {
    theme: {
      extend: {
        colors: Object.fromEntries(tokens.color.tokens.map((t) => [t.name, COLOR_MARK + t.name])),
        borderColor: { DEFAULT: v('border') },
        fontFamily: Object.fromEntries(Object.keys(tokens.type.families).map((f) => [f, v(`font-${f}`)])),
        fontSize,
        spacing: map(tokens.spacing.tokens),
        borderRadius: map(tokens.radius.tokens, (n) => n.replace(/^radius-/, '')),
        boxShadow: map(tokens.shadow.tokens, (n) => n.replace(/^shadow-/, '')),
        height: map(controls),
        minHeight: map(controls),
        width: { ...map(controls), ...map(icons) },
        minWidth: map(controls),
        maxWidth: map(dialogs),
        size: { ...map(controls), ...map(icons) },
      },
    },
  };
}

export function build() {
  const out = join(root, 'dist');
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, 'base.css'), baseCss());
  writeFileSync(join(out, 'tailwind-preset.js'), presetSource('export default'));
  writeFileSync(join(out, 'tailwind-preset.cjs'), presetSource('module.exports ='));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build();
  console.log('Built dist/base.css, dist/tailwind-preset.js, dist/tailwind-preset.cjs');
}
