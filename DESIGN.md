# Atlas-Mobile: design

Describes what the page does now.

## Purpose
Explain Atlas-Mobile (a gym tracker built as SwiftUI on iOS and Jetpack Compose on Android around one shared spec) and let visitors try it: a working phone sketch in HTML and CSS, a session board that follows what they do, and a button that runs the shared spec (`fixtures.json`) against the page's own logic. Logic is in `assets/logic.js`, the spec in `assets/spec.js`, the phone and page behaviour in `assets/app.js`.

## Theme choice and why
Gym floor: near-black iron, chalk text, one electric "volt" lime accent, condensed uppercase display type and diagonal stripe texture. Light mode is a clean white gym: the volt stays as fills (bars, plates) on dark ink, and text that was volt becomes a deep lime to keep 4.5:1.
Light, dark and auto are one shared setting: localStorage key `theme`, an early inline script before the stylesheet, a three-way radiogroup with a sliding volt indicator, `themechange`, `storage` sync, circle reveal (or crossfade) with a soft cue, instant when motion is off. The phone has its own iOS and Android looks, each in light and dark.

## Tokens
At the top of `assets/atlas.css`.

| Token | Dark | Light |
|---|---|---|
| `--ink` (page) | `#0c0e11` | `#fafbf7` |
| `--iron` | `#14171c` | `#f0f3e8` |
| `--plate` | `#1d2128` | `#e4e9d8` |
| `--line` | `#2a303a` | `#c6cdb5` |
| `--chalk` (text) | `#f1efe6` | `#12150d` |
| `--muted` | `#9aa3af` | `#4a5340` |
| `--volt` (fills) | `#d6ff3d` | `#d6ff3d` |
| `--accent-text` | `#d6ff3d` | `#455a00` |
| `--volt-edge` | `#d6ff3d` | `#6b8700` |
| `--heat` | `#ff5a36` | `#c0310f` |
| `--focus` | `#d6ff3d` | `#2f3f00` |

Type is system-only: `--display` (Arial Narrow, Franklin Gothic, Impact fallback, uppercase), `--body` (system-ui), `--mono` (ui-monospace). Control tokens `--c-*` map these onto the symbol controls (plate fill, volt-edge border when on).

## Motion spec
- Gate: `html[data-motion="on|off"]` from the Motion control; off (or the system asking for reduced motion) kills every CSS animation and transition. JS checks the same gate (`reduced()` in `app.js`, `motionOn()` in `theme.js`).
- What moves: toast rise and pulse, personal-best flash and glow, the marching beam in the spec diagram, check pings, progress fills, the spec runner's stepwise reveal (140 ms per case, instant when motion is off), the theme indicator and reveal.
- Transform, opacity and background only; nothing flashes more than twice.

## Effects (the Effects control)
- Pointer glow: a soft volt light that follows the mouse or pen (not touch).
- Phone tilt: the phone leans up to 9 degrees toward the pointer. Needs Effects and Motion.
- Chalk sparks: about 22 (fewer on small screens, never more than 36) small volt specks rising on one canvas behind the content; needs Effects and Motion; colour from `--volt-edge`, re-read on `themechange`.

## Sound spec
- Web Audio synthesis only, no files, no requests. Cues: `tap`, `clank` (iron plates: three inharmonic partials), `pb` (clank plus a rising arpeggio), `checkin`, `pass`, `fail`, `done`, `themeLight`, `themeDark`. Silent while the tab is hidden.
- ON by default; the AudioContext is created and resumed at the first pointer, key or touch. The Sound control gates every cue.

## Interaction inventory
| Where | Interaction | Feedback |
|---|---|---|
| Bottom-right dock | Light, Dark, Auto; Sound, Motion, Effects, Quiet everything | icon fill and glyph, live-region message, cue |
| Phone | switch iOS or Android, log a lift, check in, tabs, demo data, reset | tap and clank sounds, toast, personal-best flash, session board updates |
| Spec | Run the shared spec, open a case | stepwise pass or fail, ping, done cue |
| Pointer | move | volt glow, phone tilt, chalk sparks (Effects) |

## Accessibility notes
- Controls are real buttons with `aria-pressed`, a state-stating `aria-label`, a `title`, 44 px targets, a 3 px focus ring and different glyphs when off. Quiet everything restores the exact previous state.
- Theme radiogroup with arrow keys; platform switch is a radiogroup; spec cases are disclosure buttons with `aria-expanded`; toasts and controls announce through live regions; skip link.
- Reduced motion: the system setting starts Motion off and the control stays off.
- Light text uses `--accent-text`, never raw volt on white. Small screens: the dock stays one row down to 390 px and the page keeps 64 px of bottom padding.

## Decisions and trade-offs
| Date | Decision | Why |
|---|---|---|
| 2026-11-04 | Header Sound pill and theme switch moved into a bottom-right dock with the four symbol controls | seven buttons do not fit a 390 px header; the dock stays visible while scrolling |
| 2026-11-04 | `AtlasSound` reads `Ctl.state.sound`; `set`, `init` and the old key `atlas-io-sound` removed | one source of truth; new keys `atlas2-sound/-motion/-fx` so an old "off" cannot carry over |
| 2026-11-04 | Effects: glow, phone tilt, chalk sparks | the page had none; sparks suit gym chalk and the volt accent |

## How to extend
- New animation: transform or opacity; the `data-motion` rule stops it (add a static fallback if state depends on it).
- New sound: add a function to `sounds` in `assets/sound.js` and call `snd.play('name')`.
- New effect: gate on `Ctl.state.fx` (and `.motion`) and listen for `ctlchange`; config is `window.CTL` in `index.html`.
- Tests: `npm test`. Audit: `node ~/.claude/skills/dynamic-web-design/scripts/check_site.js .`.
