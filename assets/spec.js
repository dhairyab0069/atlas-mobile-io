/* Runs every case in spec/fixtures.json against AtlasLogic. Shared by the page and the node test. */
(function (root) {
  'use strict';
  var L = typeof module !== 'undefined' && module.exports ? require('./logic.js') : root.AtlasLogic;

  function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

  /* options.checkOut lets the page swap in the buggy check-out. Returns [{group, name, ok, detail}]. */
  function runSpec(fx, options) {
    var checkOut = (options && options.checkOut) || L.checkOut;
    var out = [];

    // sampleData is checked first, like SharedSpecTest.sampleDataMatchesSpec.
    var board = L.boardFrom(fx.sampleData.checkIns);
    out.push({ group: 'sampleData', name: 'sample leaderboard, check-ins and friends are what the apps ship',
      ok: fx.sampleData.leaderboard.length === 7 && L.GYMS.every(function (g) {
        return same(L.peopleAt(board, g.id), fx.sampleData.checkIns[g.id] || []);
      }), detail: fx.sampleData.leaderboard.length + ' leaderboard rows, ' + fx.sampleData.suggestedFriends.length + ' suggested friends' });

    fx.leaderboard.forEach(function (c) {
      var entries = c.useSampleData ? fx.sampleData.leaderboard : c.entries;
      var got = L.ranked(entries).map(function (e) { return e.name; });
      out.push({ group: 'leaderboard', name: c.name, ok: same(got, c.expected),
        detail: 'ranked: ' + (got.join(', ') || '(empty)') + '  |  expected: ' + (c.expected.join(', ') || '(empty)') });
    });

    fx.calorieSummary.forEach(function (c) {
      var s = L.calorieSummary(c.goal, c.items);
      out.push({ group: 'calorieSummary', name: c.name,
        ok: s.food === c.food && s.exercise === c.exercise && s.remaining === c.remaining,
        detail: c.goal + ' - ' + s.food + ' + ' + s.exercise + ' = ' + s.remaining + '  |  expected ' + c.remaining });
    });

    fx.checkIns.forEach(function (c) {
      var b = L.boardFrom(c.initial);
      c.steps.forEach(function (s) {
        b = s.action === 'checkIn' ? L.checkIn(b, s.person, s.gym) : checkOut(b, s.person);
      });
      var ok = L.GYMS.every(function (g) { return same(L.peopleAt(b, g.id), c.expected[g.id] || []); });
      var show = function (m) {
        return L.GYMS.filter(function (g) { return (m[g.id] || []).length; })
          .map(function (g) { return g.id + ': ' + m[g.id].join(', '); }).join('; ') || '(nobody)';
      };
      out.push({ group: 'checkIns', name: c.name, ok: ok, detail: 'got ' + show(b) + '  |  expected ' + show(L.boardFrom(c.expected)) });
    });
    return out;
  }

  var api = { runSpec: runSpec };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AtlasSpec = api;
})(typeof window !== 'undefined' ? window : this);
