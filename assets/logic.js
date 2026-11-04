/* A small JavaScript port of the AtlasCore rules (Models.swift / Models.kt / AtlasStore.*).
   It exists so this page can run the same spec/fixtures.json the Swift and Kotlin suites run.
   Works in the browser (window.AtlasLogic) and in node (require). */
(function (root) {
  'use strict';

  var GYMS = [
    { id: 'ubco', name: 'UBCO Gym' },
    { id: 'anytimeFitness', name: 'Anytime Fitness' },
    { id: 'worldGym', name: 'World Gym' },
    { id: 'ymca', name: 'YMCA' }
  ];
  var MEALS = [
    { id: 'breakfast', name: 'Breakfast' },
    { id: 'lunch', name: 'Lunch' },
    { id: 'dinner', name: 'Dinner' },
    { id: 'exercise', name: 'Exercise' }
  ];
  var EXERCISES = [
    { id: 'benchPress', name: 'Bench Press' },
    { id: 'squat', name: 'Squat' },
    { id: 'deadlift', name: 'Deadlift' },
    { id: 'pullUps', name: 'Pull-ups' }
  ];

  /* Highest score first; ties broken alphabetically (same comparison as Leaderboard.ranked). */
  function ranked(entries) {
    return entries.slice().sort(function (a, b) {
      if (a.score !== b.score) return b.score - a.score;
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
  }

  /* goal - food + exercise = remaining. */
  function calorieSummary(goal, items) {
    var food = 0, exercise = 0;
    items.forEach(function (i) {
      if (i.meal === 'exercise') exercise += i.calories; else food += i.calories;
    });
    return { goal: goal, food: food, exercise: exercise, remaining: goal - food + exercise };
  }

  /* CheckInBoard: immutable, gym id -> list of names. */
  function emptyBoard() {
    var b = {};
    GYMS.forEach(function (g) { b[g.id] = []; });
    return b;
  }
  function boardFrom(map) {
    var b = emptyBoard();
    Object.keys(map || {}).forEach(function (k) { if (b[k]) b[k] = map[k].slice(); });
    return b;
  }
  function peopleAt(board, gym) { return (board[gym] || []).slice(); }
  function gymOf(board, name) {
    for (var i = 0; i < GYMS.length; i++) if ((board[GYMS[i].id] || []).indexOf(name) >= 0) return GYMS[i].id;
    return null;
  }
  function checkOut(board, name) {
    var b = boardFrom(board);
    GYMS.forEach(function (g) { b[g.id] = b[g.id].filter(function (n) { return n !== name; }); });
    return b;
  }
  /* Checks name in at gym, moving them out of any other gym first. */
  function checkIn(board, name, gym) {
    var b = checkOut(board, name);
    b[gym].push(name);
    return b;
  }
  /* The Java app kept each gym as one shared string and trimmed a fixed number of characters off
     the end on check-out. This is a model of that mistake (one character too many), not a port of
     the Java code: it is here so the page can show the shared spec catching it. */
  function checkOutLikeJava(board, name) {
    var gym = gymOf(board, name);
    if (!gym) return boardFrom(board);
    var b = boardFrom(board);
    var s = b[gym].join(' ');
    s = s.slice(0, Math.max(0, s.length - (name.length + 2)));
    b[gym] = s.split(' ').filter(Boolean);
    return b;
  }

  /* Renaming keeps your check-in (AtlasStore.setUserName). Returns {name, board}. */
  function rename(board, current, next) {
    var trimmed = String(next).trim();
    if (!trimmed || trimmed === current) return { name: current, board: board };
    var gym = gymOf(board, current);
    var b = checkOut(board, current);
    if (gym) b = checkIn(b, trimmed, gym);
    return { name: trimmed, board: b };
  }

  /* Journal: newest first per exercise; personal best is the highest 1-rep max, or null. */
  function entriesFor(journal, exercise) {
    return journal.filter(function (e) { return e.exercise === exercise; })
      .sort(function (a, b) { return b.date - a.date; });
  }
  function personalBest(journal, exercise) {
    var es = entriesFor(journal, exercise);
    return es.length ? Math.max.apply(null, es.map(function (e) { return e.maxWeight; })) : null;
  }

  var api = {
    GYMS: GYMS, MEALS: MEALS, EXERCISES: EXERCISES,
    ranked: ranked, calorieSummary: calorieSummary,
    boardFrom: boardFrom, peopleAt: peopleAt, gymOf: gymOf,
    checkIn: checkIn, checkOut: checkOut, checkOutLikeJava: checkOutLikeJava, rename: rename,
    entriesFor: entriesFor, personalBest: personalBest
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.AtlasLogic = api;
})(typeof window !== 'undefined' ? window : this);
