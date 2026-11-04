/* Synthesized sound effects (Web Audio), on by default and gated by the Sound symbol (controls.js, Ctl.state.sound). No audio files. */
(function (root) {
  'use strict';
  var ctx = null;
  function on() { return !!(root.Ctl && root.Ctl.state.sound); }

  function ac() {
    if (!ctx) {
      var C = root.AudioContext || root.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, type, gain, endFreq) {
    var c = ac(); if (!c) return;
    var t = c.currentTime + start, o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.08, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  var sounds = {
    tap: function () { tone(520, 0, 0.05, 'triangle', 0.04); },
    // iron plates meeting: inharmonic partials with a fast decay
    clank: function () { [1, 2.76, 5.4].forEach(function (m, i) { tone(330 * m, 0, 0.35 / (i + 1), 'sine', 0.07 / (i + 1)); }); },
    pb: function () { sounds.clank(); [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.12 + i * 0.07, 0.22, 'triangle', 0.06); }); },
    checkin: function () { tone(880, 0, 0.5, 'sine', 0.06); tone(1320, 0, 0.35, 'sine', 0.03); },
    pass: function () { tone(660, 0, 0.09, 'square', 0.025); tone(880, 0.05, 0.12, 'square', 0.025); },
    fail: function () { tone(160, 0, 0.28, 'sawtooth', 0.05, 90); },
    themeLight: function () { tone(660, 0, 0.18, 'sine', 0.03); tone(990, 0.07, 0.24, 'sine', 0.025); },
    themeDark: function () { tone(660, 0, 0.18, 'sine', 0.03); tone(440, 0.07, 0.26, 'sine', 0.025); },
    done: function () { [392, 523, 659].forEach(function (f, i) { tone(f, i * 0.08, 0.2, 'triangle', 0.05); }); }
  };

  var api = {
    get on() { return on(); },
    play: function (name) {
      if (!on() || root.document.hidden) return;
      try { if (sounds[name]) sounds[name](); } catch (e) { /* audio unavailable */ }
    }
  };
  root.AtlasSound = api;
  /* browsers only start audio after a gesture: the first pointer, key or touch wakes it */
  root.addEventListener('ctlunlock', function () { if (on()) ac(); });
  root.addEventListener('ctlchange', function (e) {
    var k = e.detail.key;
    if ((k === 'sound' || k === 'quiet') && on()) { ac(); sounds.tap(); }
  });
})(typeof window !== 'undefined' ? window : this);
