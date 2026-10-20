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
const light = (v) => (typeof v === 'string' ? v : v.light);
const dark = (v) => (typeof v === 'string' ? null : v.dark);

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
        colors: map(tokens.color.tokens),
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
  const json = JSON.stringify(preset(), null, 2);
  writeFileSync(join(out, 'base.css'), baseCss());
  writeFileSync(join(out, 'tailwind-preset.js'), `// ${header}\nexport default ${json};\n`);
  writeFileSync(join(out, 'tailwind-preset.cjs'), `// ${header}\nmodule.exports = ${json};\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build();
  console.log('Built dist/base.css, dist/tailwind-preset.js, dist/tailwind-preset.cjs');
}
