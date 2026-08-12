import { readFile } from 'node:fs/promises';
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const checks = [
  ['six dashboard tabs', ['overview','projects','clients','inbox','finance','insights'].every(v => html.includes(`data-view="${v}"`))],
  ['sign in form', html.includes('id="signin-form"')],
  ['sign up form', html.includes('id="signup-form"')],
  ['theme toggle', html.includes('id="theme-toggle"') && js.includes('localStorage.setItem')],
  ['motion accessibility', css.includes('prefers-reduced-motion')],
  ['no CSS linear-gradient', !css.includes('linear-gradient(')],
  ['no CSS radial-gradient', !css.includes('radial-gradient(')],
];
let failed = false;
for (const [name, ok] of checks){ console.log(`${ok ? '✓' : '✗'} ${name}`); if(!ok) failed = true; }
if (failed) process.exit(1);
