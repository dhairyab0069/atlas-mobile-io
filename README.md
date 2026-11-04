# Atlas Mobile, the page

The project page for [Atlas-Mobile](https://github.com/dhairyab0069/Atlas-Mobile), a gym tracker written natively for iOS
(SwiftUI) and Android (Kotlin with Jetpack Compose), with one shared behaviour spec:
**<https://dhairyab0069.github.io/atlas-mobile-io/>**

It is a static site: HTML, CSS and vanilla JavaScript, no build step, no libraries, no fonts, no trackers and no external requests.

## What is on it

- **A phone you can use.** An iOS / Android switch restyles a phone drawn in CSS (large titles and a tab bar on iOS, a top app bar,
  filled pill buttons and a navigation bar on Android). Behind it are the app's five screens: check in and see who is where,
  the lift journal (sets, reps, 1-rep max, best), the calorie diary (goal - food + exercise = remaining), rankings and friends.
  "Fill with demo data" loads the first calorie case from the repo's `fixtures.json` plus some made-up lifts. Beating a best
  flashes it. Nothing is saved.
- **A session board** (a page extra, not an app screen) with bars for your best lift of each exercise.
- **One spec, two native apps.** Runs every case in `fixtures.json` in the browser against `assets/logic.js`, a small JavaScript
  port of the AtlasCore rules. The Swift and Kotlin suites themselves run in the app repo's CI, not here. A switch swaps in a
  model of the old Java check-out (it trimmed a shared string by a fixed number of characters) so you can watch the spec fail.
- **Then and now**: the Nov 2022 Java app from COSC 341 at UBC Okanagan (team of five) against the Oct 2026 native rewrite, and
  flip cards for what the rewrite fixed.
- **Build and run** commands, copied from the app repo's README.

Friends and leaderboard scores are the apps' placeholder data, as in the apps. There are no releases yet, so only the repo is linked.

## Sound

The Sound switch in the top bar is off by default and remembered in `localStorage`. When on, taps, plates clanking on a personal
best, a check-in bell and the spec runner are synthesized with the Web Audio API. There are no audio files and nothing plays while
the tab is hidden.

## Motion and accessibility

Everything is a real button, link or input with a visible focus ring; the platform switch is a radio group (arrow keys work), the
spec cases and flip cards expose `aria-expanded` / `aria-pressed`. With `prefers-reduced-motion` the bar growth, flashes, card
flips and runner pacing are skipped.

## Run and test

```bash
python3 -m http.server 8000     # then open http://localhost:8000/
npm test                        # or: node tests/logic.test.js && node tests/page.test.js
```

`tests/logic.test.js` runs the shared spec (and checks the Java-bug model fails it); `tests/page.test.js` checks metadata, files,
that nothing external is requested and that the scripts parse.

## Light, dark and auto

The page follows one shared setting across all of dhairyab0069.github.io: `localStorage.theme` is `light`, `dark` or `auto`
(absent means auto, which follows the system). The three-way switch in the top bar changes it, and a change on any other
page or tab applies here live. Dark is the original look; light is a white gym with volt-lime as an accent on dark ink and
a deeper lime for text. An inline script in `<head>` applies the mode before first paint, the theme change plays a short
reveal and a soft sound cue when sound is on, and it is instant under reduced motion. Code: `assets/theme.js`, tokens at the top of `assets/atlas.css`.

## Keeping the spec copy fresh

`assets/fixtures.json` is a verbatim copy of `spec/fixtures.json` in the app repo. After updating it run `node tests/gen.js` to
regenerate `assets/fixtures.js` (the script-tag friendly copy). `python3 tests/images.py` redraws the favicon and social image.

## Files

| File | What it is |
|---|---|
| `index.html` | the page |
| `assets/atlas.css` | styles, both phone themes, reduced-motion rules |
| `assets/app.js` | phone, session board, spec runner, flip cards |
| `assets/logic.js` | JavaScript port of the AtlasCore rules |
| `assets/spec.js` | fixture runner shared by the page and the tests |
| `assets/sound.js` | Web Audio effects |
| `assets/theme.js` | light / dark / auto switch, shared across the owner's sites |
| `assets/fixtures.json`, `fixtures.js` | the shared spec, and its generated script copy |
