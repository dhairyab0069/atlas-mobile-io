// node tests/logic.test.js : runs the shared spec against the page's JS port of the AtlasCore rules.
const assert = require('assert'), fs = require('fs'), path = require('path'), vm = require('vm');
const L = require('../assets/logic.js'), S = require('../assets/spec.js');
const fx = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/fixtures.json'), 'utf8'));
let n = 0; const t = (name, f) => { f(); n++; console.log('ok  ' + name); };

t('every fixtures.json case passes', () => {
  const res = S.runSpec(fx);
  assert.strictEqual(res.length, 1 + fx.leaderboard.length + fx.calorieSummary.length + fx.checkIns.length);
  res.forEach(r => assert.ok(r.ok, r.group + ': ' + r.name + ' | ' + r.detail));
});
t('the Java check-out model fails the shared spec', () => {
  const res = S.runSpec(fx, { checkOut: L.checkOutLikeJava });
  const failed = res.filter(r => !r.ok);
  assert.ok(failed.length >= 1);
  assert.ok(failed.every(r => r.group === 'checkIns'));
  assert.ok(failed.some(r => /leaves everyone else/.test(r.name)));
});
t('fixtures.js is in sync with fixtures.json', () => {
  const ctx = { window: {} }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/fixtures.js'), 'utf8'), ctx);
  assert.deepStrictEqual(JSON.parse(JSON.stringify(ctx.window.ATLAS_FIXTURES)), fx);
});
t('personal best and ordering', () => {
  const j = [{ exercise: 'squat', maxWeight: 100, date: 1 }, { exercise: 'squat', maxWeight: 120, date: 3 }, { exercise: 'squat', maxWeight: 110, date: 2 }];
  assert.strictEqual(L.personalBest(j, 'squat'), 120);
  assert.strictEqual(L.personalBest(j, 'deadlift'), null);
  assert.deepStrictEqual(L.entriesFor(j, 'squat').map(e => e.date), [3, 2, 1]);
});
t('renaming keeps the check-in', () => {
  const b = L.checkIn(L.boardFrom({}), 'You', 'anytimeFitness');
  const r = L.rename(b, 'You', '  Yegor ');
  assert.strictEqual(r.name, 'Yegor');
  assert.deepStrictEqual(L.peopleAt(r.board, 'anytimeFitness'), ['Yegor']);
  assert.strictEqual(L.rename(b, 'You', '   ').name, 'You');
});
console.log(n + ' test groups passed');
