// node tests/page.test.js : static checks on the page (no external requests, metadata, files, ids, scripts parse).
const assert = require('assert'), fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
let n = 0; const t = (name, f) => { f(); n++; console.log('ok  ' + name); };
const URL = 'https://dhairyab0069.github.io/atlas-mobile-io/';

t('canonical and Open Graph point at the final URL', () => {
  assert.ok(html.includes('<link rel="canonical" href="' + URL + '">'));
  assert.ok(html.includes('content="' + URL + '"'));
  assert.ok(html.includes('content="' + URL + 'assets/og-image.png"'));
});
t('required files exist', () => {
  ['.nojekyll', 'README.md', 'assets/favicon-64.png', 'assets/og-image.png', 'assets/atlas.css', 'assets/app.js'].forEach(f => assert.ok(fs.existsSync(path.join(root, f)), f));
  const png = fs.readFileSync(path.join(root, 'assets/og-image.png'));
  assert.strictEqual(png.readUInt32BE(16), 1200); assert.strictEqual(png.readUInt32BE(20), 630);
});
t('local src/href targets exist', () => {
  for (const m of html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)) assert.ok(fs.existsSync(path.join(root, m[1])), m[1]);
});
t('no external requests: only links to the owner and the two repos, no external src', () => {
  assert.ok(!/<script[^>]+src="https?:/.test(html));
  assert.ok(!/<link[^>]+rel="stylesheet"[^>]+href="https?:/.test(html));
  for (const f of ['assets/app.js', 'assets/atlas.css', 'assets/sound.js', 'assets/logic.js']) {
    const s = fs.readFileSync(path.join(root, f), 'utf8');
    assert.ok(!/url\(\s*['"]?https?:/.test(s) && !/(fetch|XMLHttpRequest|import)\s*\(?\s*['"]https?:/.test(s), f);
  }
  for (const m of html.matchAll(/href="(https?:\/\/[^"]+)"/g))
    assert.ok(/^https:\/\/(github\.com\/dhairyab0069\/|dhairyab0069\.github\.io\/)/.test(m[1]), m[1]);
});
t('ids used by app.js exist in the page', () => {
  const js = fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8');
  const dynamic = ['friendList']; // created by the phone renderer
  for (const m of js.matchAll(/\$\('#([\w-]+)'\)/g)) if (!dynamic.includes(m[1])) assert.ok(html.includes('id="' + m[1] + '"'), m[1]);
});
t('four symbol controls, sound/motion/effects on by default, versioned keys, no audio files', () => {
  for (const id of ['sound', 'motion', 'fx']) assert.ok(html.includes('id="ctl-' + id + '" aria-pressed="true"'), id);
  assert.ok(html.includes('id="ctl-quiet" aria-pressed="false"') && html.includes('prefix: "atlas2"'));
  assert.ok(/sound: s\.sound !== 'off'/.test(fs.readFileSync(path.join(root, 'assets/controls.js'), 'utf8')));
  assert.strictEqual(fs.readdirSync(path.join(root, 'assets')).filter(f => /\.(mp3|wav|ogg|m4a)$/.test(f)).length, 0);
});
t('reduced motion is respected in CSS and JS', () => {
  assert.ok(/prefers-reduced-motion:\s*reduce/.test(fs.readFileSync(path.join(root, 'assets/atlas.css'), 'utf8')));
  assert.ok(/prefers-reduced-motion/.test(fs.readFileSync(path.join(root, 'assets/app.js'), 'utf8')));
});
t('scripts parse', () => {
  ['app.js', 'controls.js', 'sound.js', 'theme.js', 'logic.js', 'spec.js', 'fixtures.js'].forEach(f => new vm.Script(fs.readFileSync(path.join(root, 'assets', f), 'utf8')));
});
t('shared light/dark/auto theme: key, early script before the stylesheet, radiogroup', () => {
  const early = html.indexOf("localStorage.getItem('theme')");
  assert.ok(early > 0 && early < html.indexOf('rel="stylesheet"'));
  assert.ok(html.includes('role="radiogroup" aria-label="Color theme"'));
  assert.strictEqual((html.match(/data-theme-mode="(light|dark|auto)"/g) || []).length, 3);
  assert.ok(/setItem\(KEY|localStorage\.setItem\('theme'/.test(fs.readFileSync(path.join(root, 'assets/theme.js'), 'utf8')));
});
console.log(n + ' checks passed');
