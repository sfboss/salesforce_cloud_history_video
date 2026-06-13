# File-Driven Explainer Clips

This folder contains standalone 1920×1080 HTML clips for screen-recorded technical
explainers. Every clip autoplays, runs offline, requires no build step, and keeps all
visible content and author-controlled timing in its own `data.json`.

## Architecture

```text
html_components/
├── _shared/
│   ├── engine.js       # timeline, count-up, draw, transition, stage scaling
│   ├── theme.css       # palette, type, spacing, depth, shared stage styles
│   ├── fonts/          # optional self-hosted font files
│   └── lib/            # vendored dependencies, currently empty
├── _template/          # functional reference clip to copy
├── 01_concept_reveal/  # sequential concept and diagram
├── 02_data_story/      # metric, SVG chart, and annotations
└── 03_code_walkthrough/# syntax spans, line highlights, and callouts
```

Each clip owns `index.html`, `animation.js`, `styles.css`, `data.json`, and `README.md`.
Adding a new clip never requires editing `_shared/`.

## Offline Data Files

Browsers block `fetch("./data.json")` when a page is opened directly with `file://`.
For reliable double-click playback, each `data.json` is an offline-safe data envelope:

```js
window.CLIP_DATA = {
  "duration": 36,
  "title": "Visible content lives here"
};
```

The object is JSON-shaped, and the file remains the only content source. Do not move
visible copy into HTML or JavaScript.

## Add A New Clip

1. Copy `_template/` and rename the copied folder.
2. Edit only the copied `data.json` to author the clip.
3. Adjust component CSS or animation logic only when creating a genuinely new visual
   presentation type.
4. Double-click `index.html` to review the autoplaying clip.
5. Run `node html_components/verify.mjs` from the repository root.

## Timeline API

`engine.js` provides a deterministic timeline built on the Web Animations API and
`requestAnimationFrame`:

```js
timeline
  .at(2).reveal("#title")
  .at(4).grow(".rule")
  .at(6).countUp("#stat", 0, 1200, { duration: 2, suffix: "+" })
  .at(9).draw("svg path")
  .at(14).transition(".scene-one", ".scene-two");
```

Professional cubic-bezier curves are shared through `easings`. Avoid default or
linear easing.

## Record A Clip

1. Open a clip's `index.html` in a browser.
2. Add `?record=1` to the URL for a one-second blank lead-in and two-second end freeze.
3. Record the centered 16:9 stage region at 1920×1080.
4. Trim on the blank lead-in and final freeze frame.

The stage scales to fit the browser window while preserving the exact 1920×1080
composition. For accelerated QA only, add `?speed=10`. For frame-accurate inspection,
add `?seek=16` to pause the deterministic timeline at 16 seconds.

## Design Rules

- Use the palette and type hierarchy in `_shared/theme.css` and `DESIGN.md`.
- Keep all visible copy, code, labels, metrics, and timings in `data.json`.
- Animate entrances and exits; never pop elements on or off.
- Give each readable element at least 1.5 seconds on screen.
- Use GPU-friendly transforms, opacity, SVG stroke drawing, and finite ambient motion.
- Keep safe margins, restrained colors, and aligned visual zones.
