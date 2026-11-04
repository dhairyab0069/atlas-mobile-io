/* Atlas project page: the phone sketch, session board, spec runner and small bits of UI.
   All state lives in memory. Rules come from logic.js, which is tested against fixtures.json. */
(function () {
  'use strict';
  var L = window.AtlasLogic, S = window.AtlasSpec, FX = window.ATLAS_FIXTURES, snd = window.AtlasSound;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var mq = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
  function reduced() { return document.documentElement.getAttribute('data-motion') === 'off' || !!(mq && mq.matches); }
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var gymName = function (id) { return L.GYMS.filter(function (g) { return g.id === id; })[0].name; };
  var exName = function (id) { return L.EXERCISES.filter(function (e) { return e.id === id; })[0].name; };
  var fmt = function (n) { return String(Math.round(n * 100) / 100); };

  /* ---------- icons ---------- */
  var ICON = {
    home: '<path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z"/>',
    journal: '<path d="M5 3h12a2 2 0 0 1 2 2v16H7a2 2 0 0 1-2-2z"/><path d="M9 8h6M9 12h6"/>',
    diary: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10"/>',
    rankings: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8"/>',
    friends: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14a5 5 0 0 1 5 5"/>'
  };
  var TABS = [['home', 'Home'], ['journal', 'Journal'], ['diary', 'Diary'], ['rankings', 'Rankings'], ['friends', 'Friends']];
  var svg = function (k) { return '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICON[k] + '</svg>'; };
  var liftArt = {
    benchPress: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="4" y="12" width="40" height="4" rx="2"/><rect x="6" y="6" width="4" height="16" rx="1.5"/><rect x="38" y="6" width="4" height="16" rx="1.5"/><rect x="10" y="30" width="28" height="6" rx="3"/><path d="M14 36v6M34 36v6" stroke="currentColor" stroke-width="3"/></svg>',
    squat: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="3" y="9" width="42" height="4" rx="2"/><rect x="5" y="3" width="4" height="16" rx="1.5"/><rect x="39" y="3" width="4" height="16" rx="1.5"/><circle cx="24" cy="19" r="4"/><path d="M24 24v8l-8 4v8M24 32l8 4v8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    deadlift: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="3" y="36" width="42" height="4" rx="2"/><rect x="5" y="28" width="5" height="20" rx="2"/><rect x="38" y="28" width="5" height="20" rx="2"/><circle cx="24" cy="9" r="4"/><path d="M24 14l-5 12h10zM21 26v10M27 26v10" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    pullUps: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="3" y="4" width="42" height="4" rx="2"/><path d="M16 8v8M32 8v8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><circle cx="24" cy="20" r="4"/><path d="M16 16h16M24 25v10l-5 9M24 35l5 9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>'
  };

  /* ---------- state ---------- */
  function fresh() {
    return {
      os: (state && state.os) || 'ios', tab: 'home', ex: null, adding: false, form: { sets: 3, reps: 8, w: '' },
      user: 'You', board: L.boardFrom(FX.sampleData.checkIns), journal: [], diary: [], goal: 0,
      sent: {}, search: '', gymSel: 'ubco', nameEdit: false, goalEdit: false,
      diaryForm: { name: '', cal: '', meal: 'breakfast' }, toast: null, flashEx: null, nid: 1
    };
  }
  var state = null;
  state = fresh();
  var refocus = null, toastTimer = 0;

  function setToast(msg, kind) {
    state.toast = { msg: msg, kind: kind || '' };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { state.toast = null; var t = $('.toast'); if (t) t.remove(); }, 2600);
  }

  /* ---------- screens ---------- */
  function header(title, back) {
    return '<header class="s-head">' + (back ? '<button type="button" class="s-back" data-act="back" aria-label="Back to Gym Journal">' + (state.os === 'ios' ? '&#8249; Journal' : '&#8592;') + '</button>' : '') +
      '<h2>' + esc(title) + '</h2></header>';
  }

  function homeScreen() {
    var gym = L.gymOf(state.board, state.user);
    var out = header('Atlas') + '<div class="s-body">';
    out += '<div class="group"><p class="g-t">Check in</p>';
    if (gym) {
      out += '<div class="row"><span>You\'re at</span><b>' + esc(gymName(gym)) + '</b></div>' +
        '<button type="button" class="act danger" data-act="gym-out">Check Out</button>';
    } else {
      out += '<label class="row"><span>Gym</span><select data-in="gymSel">' + L.GYMS.map(function (g) {
        return '<option value="' + g.id + '"' + (g.id === state.gymSel ? ' selected' : '') + '>' + esc(g.name) + '</option>';
      }).join('') + '</select></label><button type="button" class="act" data-act="gym-in">Check In</button>';
    }
    out += '</div><div class="group"><p class="g-t">See who\'s where</p>';
    L.GYMS.forEach(function (g) {
      var p = L.peopleAt(state.board, g.id);
      out += '<div class="row col"><b>' + esc(g.name) + '</b><span class="sub">' + (p.length ? esc(p.join(', ')) : 'Nobody yet') + '</span></div>';
    });
    out += '</div><div class="group"><p class="g-t">Profile</p>';
    if (state.nameEdit) {
      out += '<label class="row col"><span class="sub">Your name</span><input data-in="nameDraft" id="nameDraft" value="' + esc(state.nameDraft || state.user) + '" maxlength="24"></label>' +
        '<div class="btnrow"><button type="button" class="act" data-act="name-save">Save</button><button type="button" class="act ghost" data-act="name-cancel">Cancel</button></div>';
    } else {
      out += '<div class="row"><span>Signed in as <b>' + esc(state.user) + '</b></span><button type="button" class="link" data-act="name-edit">Edit name</button></div>';
    }
    return out + '</div></div>';
  }

  function journalScreen() {
    if (!state.ex) {
      var out = header('Gym Journal') + '<div class="s-body"><div class="group">';
      L.EXERCISES.forEach(function (e) {
        var es = L.entriesFor(state.journal, e.id), best = L.personalBest(state.journal, e.id);
        out += '<button type="button" class="row lift' + (state.flashEx === e.id ? ' pbflash' : '') + '" data-act="ex:' + e.id + '"><span class="art">' + liftArt[e.id] + '</span>' +
          '<span class="col"><b>' + e.name + '</b><span class="sub">' + (best === null ? 'No entries yet' : es.length + (es.length === 1 ? ' entry' : ' entries') + ' &middot; best ' + fmt(best)) + '</span></span><span class="chev" aria-hidden="true">&#8250;</span></button>';
      });
      return out + '</div></div>';
    }
    var id = state.ex, entries = L.entriesFor(state.journal, id);
    var o = header(exName(id), true) + '<div class="s-body">';
    o += '<button type="button" class="act" data-act="add-open"' + (state.adding ? ' aria-expanded="true"' : ' aria-expanded="false"') + '>' + (state.os === 'ios' ? '+ Add to journal' : '+ Add ' + esc(exName(id))) + '</button>';
    if (state.adding) {
      var f = state.form, bad = f.w === '' || Number(f.w) < 0 || isNaN(Number(f.w));
      o += '<div class="group form"><p class="g-t">Add ' + esc(exName(id)) + '</p>' +
        stepper('sets', 'Sets', f.sets) + stepper('reps', 'Reps', f.reps) +
        '<label class="row"><span>1-rep max weight</span><input data-in="w" id="wIn" inputmode="decimal" placeholder="0" value="' + esc(f.w) + '"></label>' +
        '<div class="btnrow"><button type="button" class="act" data-act="save-entry"' + (bad ? ' disabled' : '') + '>Save</button><button type="button" class="act ghost" data-act="add-cancel">Cancel</button></div></div>';
    }
    if (!entries.length) {
      o += '<div class="empty"><p><b>No ' + esc(exName(id)) + ' entries</b></p><p class="sub">Log your sets, reps and 1-rep max.</p></div>';
    } else {
      o += '<div class="group">';
      var best = L.personalBest(state.journal, id);
      entries.forEach(function (e) {
        o += '<div class="row entry"><div class="col"><span class="sub">' + new Date(e.date).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) + '</span>' +
          '<span class="stats"><span><i>Sets</i>' + e.sets + '</span><span><i>Reps</i>' + e.reps + '</span><span><i>1RM</i>' + fmt(e.maxWeight) + (e.maxWeight === best ? ' <em>best</em>' : '') + '</span></span></div>' +
          '<button type="button" class="x" data-act="del:' + e.id + '" aria-label="Delete this entry">&times;</button></div>';
      });
      o += '</div>';
    }
    return o + '</div>';
  }
  function stepper(key, label, v) {
    return '<div class="row"><span>' + label + ': <b>' + v + '</b></span><span class="step"><button type="button" data-act="step:' + key + ':-1" aria-label="Fewer ' + label.toLowerCase() + '">&minus;</button><button type="button" data-act="step:' + key + ':1" aria-label="More ' + label.toLowerCase() + '">+</button></span></div>';
  }

  function diaryScreen() {
    var sum = L.calorieSummary(state.goal, state.diary);
    var o = header('Diary') + '<div class="s-body"><div class="group sumcard"><p class="g-t">Calories remaining</p><div class="eq">' +
      '<div><b>' + sum.goal + '</b><span>Goal</span></div><i>&minus;</i><div><b>' + sum.food + '</b><span>Food</span></div><i>+</i><div><b>' + sum.exercise + '</b><span>Exercise</span></div><i>=</i><div class="res' + (sum.remaining < 0 ? ' neg' : '') + '"><b>' + sum.remaining + '</b><span>Left</span></div></div>';
    if (state.goalEdit) {
      o += '<label class="row"><span>Daily calorie goal</span><input data-in="goalDraft" id="goalIn" inputmode="numeric" value="' + esc(state.goalDraft == null ? state.goal : state.goalDraft) + '"></label><div class="btnrow"><button type="button" class="act" data-act="goal-save">Save</button><button type="button" class="act ghost" data-act="goal-cancel">Cancel</button></div>';
    } else {
      o += '<button type="button" class="act" data-act="goal-edit">Set goal</button>';
    }
    o += '</div>';
    L.MEALS.forEach(function (m) {
      var items = state.diary.filter(function (i) { return i.meal === m.id; });
      o += '<div class="group"><p class="g-t">' + m.name + '</p>';
      if (!items.length) o += '<div class="row"><span class="sub">Nothing yet</span></div>';
      items.forEach(function (i) {
        o += '<div class="row"><span class="col"><b>' + esc(i.name) + '</b><span class="sub">' + i.calories + ' kcal</span></span><button type="button" class="x" data-act="item-del:' + i.id + '" aria-label="Delete ' + esc(i.name) + '">&times;</button></div>';
      });
      o += '</div>';
    });
    var d = state.diaryForm;
    o += '<div class="group form"><p class="g-t">Add item</p><label class="row"><span>Name</span><input data-in="d-name" id="dName" value="' + esc(d.name) + '" maxlength="30" placeholder="Eggs"></label>' +
      '<label class="row"><span>Calories</span><input data-in="d-cal" inputmode="numeric" value="' + esc(d.cal) + '" placeholder="150"></label>' +
      '<label class="row"><span>Meal</span><select data-in="d-meal">' + L.MEALS.map(function (m) { return '<option value="' + m.id + '"' + (m.id === d.meal ? ' selected' : '') + '>' + m.name + '</option>'; }).join('') + '</select></label>' +
      '<button type="button" class="act" data-act="item-add">Add</button></div>';
    return o + '</div>';
  }

  function rankingsScreen() {
    var o = header('Rankings') + '<div class="s-body"><div class="group">';
    L.ranked(FX.sampleData.leaderboard).forEach(function (e, i) {
      o += '<div class="row rank r' + (i + 1) + '"><span class="pos">' + (i + 1) + '</span><b class="grow">' + esc(e.name) + '</b><span>' + e.score + ' / 100</span></div>';
    });
    return o + '</div><p class="foot">Placeholder scores from the prototype; no backend yet.</p></div>';
  }

  function friendsScreen() {
    var o = header(state.os === 'ios' ? 'Friends' : 'Add Friends') + '<div class="s-body"><label class="search"><span class="sr">Search</span><input data-in="search" id="searchIn" placeholder="Search" value="' + esc(state.search) + '"></label>' +
      '<p class="g-t pad">Contacts using Atlas</p><div class="group" id="friendList">' + friendList() + '</div></div>';
    return o;
  }
  function friendList() {
    var q = state.search.trim().toLowerCase();
    var m = FX.sampleData.suggestedFriends.filter(function (n) { return !q || n.toLowerCase().indexOf(q) >= 0; });
    if (!m.length) return '<div class="row"><span class="sub">No matches</span></div>';
    return m.map(function (n) {
      return '<div class="row"><b class="grow">' + esc(n) + '</b>' + (state.sent[n]
        ? '<span class="sent" role="img" aria-label="Request sent">&#10003; Sent</span>'
        : '<button type="button" class="act small" data-act="friend:' + esc(n) + '" aria-label="Add ' + esc(n) + '">Add</button>') + '</div>';
    }).join('');
  }

  var SCREENS = { home: homeScreen, journal: journalScreen, diary: diaryScreen, rankings: rankingsScreen, friends: friendsScreen };

  function render() {
    var scr = $('#screen'), keep = $('.s-body', scr), top = keep ? keep.scrollTop : 0;
    var tabs = '<nav class="tabbar" aria-label="Atlas tabs">' + TABS.map(function (t) {
      return '<button type="button" data-act="tab:' + t[0] + '"' + (state.tab === t[0] ? ' aria-current="page" class="on"' : '') + '><span class="ic">' + svg(t[0]) + '</span><span class="tl">' + t[1] + '</span></button>';
    }).join('') + '</nav>';
    var toast = state.toast ? '<div class="toast ' + state.toast.kind + '" role="status">' + esc(state.toast.msg) + '</div>' : '';
    scr.innerHTML = '<div class="status" aria-hidden="true"><span>9:41</span><span class="si"><i></i><i></i><i></i></span></div>' + SCREENS[state.tab]() + toast + tabs;
    var nb = $('.s-body', scr); if (nb) nb.scrollTop = top;
    if (refocus) { var el = $(refocus, scr); if (el) { el.focus(); if (el.setSelectionRange && el.type !== 'number') { try { el.setSelectionRange(el.value.length, el.value.length); } catch (e) { /* ignore */ } } } refocus = null; }
    renderBoard();
  }

  /* ---------- session board ---------- */
  function renderBoard() {
    var bests = L.EXERCISES.map(function (e) { return L.personalBest(state.journal, e.id); });
    var max = Math.max(100, Math.max.apply(null, bests.map(function (b) { return b || 0; })));
    $('#bests').innerHTML = L.EXERCISES.map(function (e, i) {
      var b = bests[i];
      return '<div class="bar' + (state.flashEx === e.id ? ' pbflash' : '') + '"><span class="bn">' + e.name + '</span><span class="track"><span class="fill" style="width:' + (b === null ? 0 : Math.max(3, Math.round(b / max * 100))) + '%"></span></span><b>' + (b === null ? '&ndash;' : fmt(b)) + '</b></div>';
    }).join('');
    $('#tileCal').textContent = L.calorieSummary(state.goal, state.diary).remaining;
    var g = L.gymOf(state.board, state.user);
    $('#tileGym').textContent = g ? gymName(g) : 'Nowhere';
  }

  /* ---------- actions ---------- */
  function act(a) {
    var p = a.split(':'), k = p[0];
    snd.play('tap');
    if (k === 'tab') { state.tab = p[1]; if (p[1] !== 'journal') { state.ex = null; state.adding = false; } }
    else if (k === 'ex') { state.ex = p[1]; state.adding = false; }
    else if (k === 'back') { state.ex = null; state.adding = false; }
    else if (k === 'add-open') { state.adding = !state.adding; if (state.adding) refocus = '#wIn'; }
    else if (k === 'add-cancel') { state.adding = false; }
    else if (k === 'step') { var f = state.form, lim = p[1] === 'sets' ? [1, 50] : [1, 100]; f[p[1]] = Math.min(lim[1], Math.max(lim[0], f[p[1]] + Number(p[2]))); }
    else if (k === 'save-entry') {
      var w = Number(state.form.w), prior = L.personalBest(state.journal, state.ex);
      if (state.form.w === '' || isNaN(w) || w < 0) return;
      state.journal.push({ id: state.nid++, exercise: state.ex, sets: state.form.sets, reps: state.form.reps, maxWeight: w, date: Date.now() });
      state.adding = false; state.form.w = '';
      if (prior !== null && w > prior) {
        state.flashEx = state.ex; setToast('New personal best: ' + exName(state.ex) + ' ' + fmt(w), 'pb'); snd.play('pb');
        setTimeout(function () { state.flashEx = null; var n = $$('.pbflash'); n.forEach(function (x) { x.classList.remove('pbflash'); }); }, 1800);
      } else { setToast('Saved to the journal'); }
    }
    else if (k === 'del') { var id = Number(p[1]); state.journal = state.journal.filter(function (e) { return e.id !== id; }); }
    else if (k === 'gym-in') { state.board = L.checkIn(state.board, state.user, state.gymSel); setToast('Checked in at ' + gymName(state.gymSel)); snd.play('checkin'); }
    else if (k === 'gym-out') { state.board = L.checkOut(state.board, state.user); setToast('Checked out'); }
    else if (k === 'name-edit') { state.nameEdit = true; state.nameDraft = state.user; refocus = '#nameDraft'; }
    else if (k === 'name-cancel') { state.nameEdit = false; }
    else if (k === 'name-save') { var r = L.rename(state.board, state.user, state.nameDraft || ''); state.user = r.name; state.board = r.board; state.nameEdit = false; setToast('Check-in kept under ' + r.name); }
    else if (k === 'goal-edit') { state.goalEdit = true; state.goalDraft = state.goal; refocus = '#goalIn'; }
    else if (k === 'goal-cancel') { state.goalEdit = false; }
    else if (k === 'goal-save') { state.goal = Math.max(0, Math.round(Number(state.goalDraft)) || 0); state.goalEdit = false; }
    else if (k === 'item-add') {
      var d = state.diaryForm, c = Math.round(Number(d.cal));
      if (!d.name.trim() || isNaN(c) || c <= 0) { setToast('Add a name and a calorie count', 'warn'); refocus = '#dName'; }
      else { state.diary.push({ id: state.nid++, name: d.name.trim(), calories: c, meal: d.meal }); state.diaryForm = { name: '', cal: '', meal: d.meal }; refocus = '#dName'; }
    }
    else if (k === 'item-del') { var iid = Number(p[1]); state.diary = state.diary.filter(function (i) { return i.id !== iid; }); }
    else if (k === 'friend') { state.sent[p.slice(1).join(':')] = true; }
    render();
  }

  function onInput(e) {
    var t = e.target, k = t.getAttribute('data-in');
    if (!k) return;
    if (k === 'w') { state.form.w = t.value; var s = $('[data-act="save-entry"]'); if (s) { var w = Number(t.value); s.disabled = t.value === '' || isNaN(w) || w < 0; } }
    else if (k === 'gymSel') state.gymSel = t.value;
    else if (k === 'nameDraft') state.nameDraft = t.value;
    else if (k === 'goalDraft') state.goalDraft = t.value;
    else if (k === 'd-name') state.diaryForm.name = t.value;
    else if (k === 'd-cal') state.diaryForm.cal = t.value;
    else if (k === 'd-meal') state.diaryForm.meal = t.value;
    else if (k === 'search') { state.search = t.value; $('#friendList').innerHTML = friendList(); }
  }

  function seed() {
    var day = 86400000, now = Date.now();
    state.journal = [];
    [['benchPress', 3, 8, 60, 14], ['benchPress', 4, 6, 70, 7], ['benchPress', 3, 5, 75, 2],
     ['squat', 5, 5, 90, 12], ['squat', 5, 5, 100, 5], ['deadlift', 3, 5, 120, 9], ['deadlift', 3, 3, 135, 3], ['pullUps', 3, 8, 10, 6]]
      .forEach(function (r) { state.journal.push({ id: state.nid++, exercise: r[0], sets: r[1], reps: r[2], maxWeight: r[3], date: now - r[4] * day }); });
    var c = FX.calorieSummary[0];
    state.goal = c.goal;
    state.diary = c.items.map(function (i) { return { id: state.nid++, name: i.name, calories: i.calories, meal: i.meal }; });
    setToast('Demo data loaded');
    render();
  }

  /* ---------- wiring: phone ---------- */
  $('#screen').addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (b && !b.disabled) act(b.getAttribute('data-act'));
  });
  $('#screen').addEventListener('input', onInput);
  $('#screen').addEventListener('change', onInput);
  $('#screen').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      var k = e.target.getAttribute('data-in');
      var map = { w: 'save-entry', nameDraft: 'name-save', goalDraft: 'goal-save', 'd-name': 'item-add', 'd-cal': 'item-add' };
      if (map[k]) { e.preventDefault(); act(map[k]); }
    }
  });
  $$('.seg [data-os]').forEach(function (b) {
    b.addEventListener('click', function () {
      state.os = b.getAttribute('data-os');
      $$('.seg [data-os]').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); });
      $('#phone').setAttribute('data-os', state.os);
      snd.play('tap'); render();
    });
  });
  $('.seg').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    var bs = $$('.seg [data-os]'), i = bs.indexOf(document.activeElement);
    if (i < 0) return; var n = bs[(i + (e.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length]; n.focus(); n.click();
  });
  $('#seed').addEventListener('click', seed);
  $('#reset').addEventListener('click', function () { state = fresh(); $('#phone').setAttribute('data-os', state.os); render(); });

  /* ---------- spec runner ---------- */
  var bugOn = false, runToken = 0;
  var GROUP = { sampleData: 'Sample data', leaderboard: 'Leaderboard', calorieSummary: 'Calorie summary', checkIns: 'Check-ins' };
  function results() { return S.runSpec(FX, bugOn ? { checkOut: L.checkOutLikeJava } : null); }
  function renderCases(res, shown) {
    $('#cases').innerHTML = res.map(function (r, i) {
      var st = i < shown ? (r.ok ? 'pass' : 'fail') : 'idle';
      return '<li class="case ' + st + '"><button type="button" aria-expanded="false" aria-controls="cd' + i + '"><span class="mark" aria-hidden="true">' + (st === 'pass' ? '&#10003;' : st === 'fail' ? '&#10007;' : '&middot;') + '</span>' +
        '<span class="cg">' + GROUP[r.group] + '</span><span class="cn">' + esc(r.name) + '</span><span class="sr">' + (st === 'idle' ? 'not run' : st === 'pass' ? 'passes' : 'fails') + '</span></button><div class="cd" id="cd' + i + '" hidden>' + esc(r.detail) + '</div></li>';
    }).join('');
  }
  function runSpec(animate) {
    var res = results(), token = ++runToken, i = 0, score = $('#score');
    score.className = 'score';
    function step() {
      if (token !== runToken) return;
      i++; renderCases(res, i);
      var okSoFar = res.slice(0, i).filter(function (r) { return r.ok; }).length;
      score.textContent = 'Running: ' + okSoFar + ' of ' + i + ' pass';
      snd.play(res[i - 1].ok ? 'pass' : 'fail');
      if (i < res.length) setTimeout(step, reduced() || !animate ? 0 : 140);
      else {
        var fails = res.length - okSoFar;
        score.textContent = fails ? fails + ' of ' + res.length + ' fail: the shared spec catches it' : 'All ' + res.length + ' pass';
        score.className = 'score ' + (fails ? 'bad' : 'good');
        if (!fails) snd.play('done');
      }
    }
    step();
  }
  renderCases(results(), 0);
  $('#runSpec').addEventListener('click', function () { runSpec(true); });
  $('#bug').addEventListener('click', function () {
    bugOn = !bugOn; this.setAttribute('aria-checked', String(bugOn)); runSpec(false);
  });
  $('#cases').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var open = b.getAttribute('aria-expanded') !== 'true';
    b.setAttribute('aria-expanded', String(open));
    document.getElementById(b.getAttribute('aria-controls')).hidden = !open;
  });

  /* ---------- then and now: flip cards ---------- */
  var FLIPS = [
    ['Journals skipped the first saved entry', 'An extra readLine() before the loop ate it, and an empty journal crashed.', 'Entries are a plain list, newest first; an empty journal shows an empty state.'],
    ['Check-out mangled other people\'s names', 'It trimmed the wrong number of characters from a shared string.', 'The board is a list of names per gym, and check-out removes only that name. The shared spec covers it.'],
    ['Eight near-identical journal screens', 'Four journal and four add-entry activities, one pair per lift.', 'One screen parameterised by exercise, on both platforms.'],
    ['The calorie diary had no logic', 'The layout existed; nothing added up.', 'Goal minus food plus exercise equals remaining, with per-meal items.']
  ];
  $('#flips').innerHTML = FLIPS.map(function (f, i) {
    return '<button type="button" class="flip" aria-pressed="false" data-i="' + i + '"><span class="inner"><span class="face front"><em>Then</em><b>' + esc(f[0]) + '</b><span>' + esc(f[1]) + '</span></span><span class="face back"><em>Now</em><b>' + esc(f[0]) + '</b><span>' + esc(f[2]) + '</span></span></span></button>';
  }).join('');
  $('#flips').addEventListener('click', function (e) {
    var b = e.target.closest('.flip'); if (!b) return;
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); snd.play('clank');
  });

  /* ---------- copy buttons ---------- */
  $$('.copy').forEach(function (b) {
    var label = b.textContent;
    b.addEventListener('click', function () {
      var done = function (m) { b.textContent = m; setTimeout(function () { b.textContent = label; }, 1500); };
      try { navigator.clipboard.writeText(b.getAttribute('data-copy')).then(function () { done('Copied'); }, function () { done('Copy failed'); }); }
      catch (err) { done('Copy failed'); }
    });
  });

  render();
})();
