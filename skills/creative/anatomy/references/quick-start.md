# Ordinary SVG figures

Use this with the generated `build.mjs` for a normal standalone explainer. The
starter is a working dial indicator with a plate, feet, rails, carriage, gauge,
pointer and keyboard-accessible motion. Keep useful parts and replace the subject
with the user's concept; the unchanged baseline is not a finished deliverable.

## First working page

Through `terminal`, run `python <skill-dir>/scripts/start.py <output-dir> --theme light`
(or `dark`). It creates `build.mjs`, a local core kit, its inliner and the license,
then writes a standalone `dial-indicator-light.html` or `dial-indicator.html`.
No npm installation or bundler is involved. If the output folder contains work,
read and continue that work instead. Rebuild with `scripts/run.py` after edits.

Read the generated build. Keep its camera, card, SVG rendering and motion setup
while implementing the concept. First add the requested pure state transitions,
native buttons and live readouts, and build a functional preview. Retain existing
art or simple kit parts during this pass. Only then redesign custom mechanisms
and review their finish; do not spend the initial pass on geometry-only probes
and repeated image analysis while domain behavior remains unimplemented.
Rename its HTML filename and all user-facing
text when adapting it. A user asking for Chinese text should get Chinese controls,
caption, hint and accessible labels too.

## Small API surface

The build imports `k` from `./kit/iso-kit.mjs` and `kitScript` from
`./scripts/inline-kit.mjs`. Existing example calls demonstrate these signatures:

```js
const base = { x: -120, y: -65, w: 240, d: 130, r: 8 };
const P = k.fitProjection(k.boxCorners(base, -16, 120), 600, 380,
  { pad: 30, azimuth: 42 });
const body = k.solidSvg(k.slabOf(base, -12, 12, P, 8, 1), { tone: "mid" });
const puck = k.solidSvg(k.cylinder(0, 0, 10, 0, 4, P, 32, 0.5), { tone: "hi" });
const shifted = k.translateAlong(P, [24, 0, 0]); // SVG transform string
const line = k.lineSvg(k.lineOnTop([-10, 0], [10, 0], 4, P), { tone: "lo" });
```

- Coordinates: x/y on the floor, z up. Include the full height and movement
  extremes in the projection's point list so nothing clips.
- Paint lower/back pieces before front pieces. Sort repeated components by
  ascending `k.depthOf([x, y, z], P)`. Split a surrounding frame into back/front
  groups when it contains moving geometry.
- Prebuild static paths; move groups with `transform`. Rebuild geometry only
  when its shape changes. `kitScript()` embeds the core helpers for browser use.
- `figureSvg({ width, height, label, body })` returns the SVG string.
- `plateHtml({ fig, title, hint, readout, keys, caption, body })` frames it;
  the example puts a focusable `.iso-stage` into `body`. Native HTML buttons and
  readouts can be added around that stage for an algorithm's controls.
- `pageHtml({ title, theme, body, script, width })` embeds CSS and client code.
  The example's final `writeFileSync` writes that HTML next to `build.mjs`.

Keep `pageHtml` for previews too: it supplies the `.iso` theme wrapper and styles.
Putting the same SVG into a hand-written unstyled HTML probe makes its fills
black. Fix the missing CSS before changing geometry or repeating image analysis.
For a separate SVG file, use `figureSvg({ ..., standalone: "light" })` (or
`"dark"`), not `standalone: true`; this embeds the intended theme.

For a missing helper, use `search_files` for its export, then `read_file` for
that definition or the matching section of `references/kit.md`. There is no need
to read the full kit implementation before making a page.

## Model and motion

Keep domain state in a small pure module or pure functions. Define transitions
and boundary cases first, then derive the SVG, counters and accessibility text
from that state. Decorative animation must not change the algorithm's outcome.
For a queue, quota, cache or rate limiter, a tray, rack, drawer or gauge can show
the state without a physically simulated transport mechanism.

Reuse the example's `requestAnimationFrame` timing, exponential follow, keyboard
handlers, `IntersectionObserver` and `prefers-reduced-motion` handling. Animate
visual transitions calmly; stop decorative motion offscreen and under reduced
motion. A real-time domain process may still need to advance while its decorative
motion is paused: derive elapsed time from a clock so the logic remains correct.
Keep domain updates scheduled when decorative animation settles. Reduced motion
must also consume or clear visual queues so they cannot lock the controls.
For React or an unfamiliar animation pattern, read its specific reference.

## Finish and verify

Use a recognizable device, solid thickness, four-tone shading, a restrained
accent and supported parts. Retain the example's proven screws, feet, ruler,
bevels and frame where they suit the mechanism. Add details that explain the
subject after its controls and readouts work.

Through `terminal`, run these helpers via `python <skill-dir>/scripts/run.py`:

```sh
python <skill-dir>/scripts/run.py <skill-dir>/scripts/capture.mjs <page.html> --out <output-dir>/shots/desktop.png
python <skill-dir>/scripts/run.py <skill-dir>/scripts/capture.mjs <page.html> --width 390 --reduced --out <output-dir>/shots/phone.png
python <skill-dir>/scripts/run.py <skill-dir>/scripts/lines.mjs <page.html> --out <output-dir>/shots/lines.png
```

Inspect screenshots with `vision_analyze`. Test the actual model boundaries and
every control with `browser_exec` or `scripts/drive.mjs`. Put multiple actions in
a JSON file and pass `--actions <file>`; `drive.mjs --help` lists the supported
actions. For time-driven simulations, verify automatic updates with real waiting
and real buttons, including a burst followed by an ordinary click in reduced
motion. A test hook that advances state directly cannot prove these behaviors.
Capture the requested theme and inspect any custom junctions up close.
Run matching geometry audits for pipes, lathed parts, exploded assemblies or
true 3D; primitive-only SVG builds need functional, visual and line checks.
Report the checks actually run and fix failures before final delivery. Consult
the relevant section of `verify.md` for advanced checks or a specific failure.
