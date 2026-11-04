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
  port of the AtlasCore rules. The Swift and Kotlin suites themselves run in the app repo's CI, not here. 
- **Build and run** commands, copied from the app repo's README.

Friends and leaderboard scores are the apps' placeholder data, as in the apps.

## Sound

Sound is on by default (see Controls and defaults below). Taps, plates clanking on a personal
best, a check-in bell and the spec runner are synthesized with the Web Audio API. There are no audio files and nothing plays while
the tab is hidden.

## Controls and defaults

Four symbol buttons sit bottom right, beside the light/dark/auto switch: Sound (speaker), Motion (flowing waves), Effects (sparkle) and Quiet everything (circle with a bar). Sound, Motion and Effects all start on; Motion starts off only when the system asks for reduced motion. Browsers only allow audio after a gesture, so sound starts at the first click, key press or touch. Pressing Quiet everything turns all three off, and pressing it again restores exactly what was on before. Choices are saved under `atlas2-sound`, `atlas2-motion` and `atlas2-fx` in `localStorage` (the page works with storage blocked). Effects: a volt-green light that follows the pointer, the phone leaning toward it, and slow rising chalk sparks. Motion off stops every animation, transition and loop (`html[data-motion="off"]`). The page makes no external requests. Design notes are in [DESIGN.md](DESIGN.md).

## Motion and accessibility

Everything is a real button, link or input with a visible focus ring; the platform switch is a radio group (arrow keys work), the
spec cases expose `aria-expanded`. With `prefers-reduced-motion` the bar growth, flashes and runner pacing are skipped.

## Run and test

```bash
python3 -m http.server 8000     # then open http://localhost:8000/
npm test                        # or: node tests/logic.test.js && node tests/page.test.js
```

`tests/logic.test.js` runs the shared spec; `tests/page.test.js` checks metadata, files,
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
| `assets/app.js` | phone, session board, spec runner |
| `assets/logic.js` | JavaScript port of the AtlasCore rules |
| `assets/spec.js` | fixture runner shared by the page and the tests |
| `assets/sound.js` | Web Audio effects |
| `assets/controls.js` | the four symbol controls and the pointer and particle effects |
| `DESIGN.md` | design write-up |
| `assets/theme.js` | light / dark / auto switch, shared across the owner's sites |
| `assets/fixtures.json`, `fixtures.js` | the shared spec, and its generated script copy |
