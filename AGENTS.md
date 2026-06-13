Here's a prompt you can hand directly to an agent coder. I've written it to be self-contained, opinionated about quality (so the output doesn't read as "slop"), and structured so the agent builds a repeatable system rather than a one-off.

---

## PROMPT FOR THE AGENT CODER

**Role:** You are building a local, file-driven system for generating high-quality, faceless technical explainer video clips. Each clip is a standalone HTML page that plays a self-contained 30–60 second animated presentation. I will screen-record the playing page to capture the clip, then string multiple clips together into full YouTube videos. The bar is **broadcast-quality motion design** — it must NOT look auto-generated, templated, or like "AI slop."

### Step 1 — Scaffold the workspace

Create a root folder `html_components/`. Inside it, create:

- `_shared/` — shared assets used by every component:
  - `engine.js` — a small reusable animation/timeline runtime (see Step 3)
  - `theme.css` — global design tokens (color palette, type scale, spacing, easing curves)
  - `fonts/` — placeholder for self-hosted fonts (document which to drop in)
  - `lib/` — vendored dependencies (no CDN reliance; everything runs offline)
- `_template/` — a reference component folder others are cloned from
- `README.md` — explains the architecture, how to add a new component, and how to record a clip

Then create **3 distinct example component subfolders** to prove the system, each a different *kind* of presentation (see Step 4 for the three types).

### Step 2 — Per-component folder structure

Every component subfolder (e.g. `html_components/01_concept_reveal/`) must contain:

```
index.html        → the standalone page that autoplays the animation on load
animation.js      → component-specific scene/timeline logic
styles.css        → component-specific styling
data.json         → ALL dynamic content lives here (text, labels, numbers, steps, timing)
README.md         → what this clip explains, duration, how data.json drives it
```

**Hard requirement:** `index.html` must run by double-clicking it (file://) with **zero network calls and no build step**. All content — every headline, bullet, code snippet, stat, and step — is read from `data.json` at runtime. Changing the clip's content means editing only `data.json`, never the HTML/JS.

### Step 3 — The shared animation engine (`engine.js`)

Build a lightweight timeline runtime so components are consistent and easy to author. It should provide:

- A **timeline/sequencer**: schedule animation steps by time (e.g. `at(2.0).reveal('#title')`, `from(3).to(5).countUp('#stat', 0, 1200)`).
- **Easing**: use professional easing curves (e.g. cubic-bezier ease-out-expo, spring-like settles) — never linear, never default browser easing. Motion should feel weighted and intentional.
- **Autoplay on load** with a fixed, deterministic duration (30–60s) so screen recordings are reproducible. Optionally support `?record=1` to add a 1s lead-in blank and an end freeze frame for clean recording trim points.
- A fixed **canvas/stage** at 1920×1080 (16:9), centered, so every clip records at clean 1080p. Make resolution a config constant.
- Respect a master `duration` field from `data.json`.

Prefer the **Web Animations API + requestAnimationFrame** and CSS transforms (GPU-accelerated). Avoid heavy frameworks. If you vendor a library, justify it and put it in `_shared/lib/`.

### Step 4 — The three example components (prove range)

1. **`01_concept_reveal`** — a titled concept explainer: animated headline entrance, a 3–4 point sequential reveal with staggered timing, supporting icon/diagram, and a closing takeaway. Data-driven bullets.
2. **`02_data_story`** — an animated stat/metric presentation: numbers that count up, an animated bar or line chart drawn progressively, annotations that fade in. Chart values come entirely from `data.json`.
3. **`03_code_walkthrough`** — a technical code explainer: a code block with syntax highlighting where lines reveal/highlight in sequence with floating callout labels pointing at specific lines. Code and callouts defined in `data.json`.

### Step 5 — Quality bar (this is what separates it from slop)

Enforce these as design rules in `theme.css` and every component:

- **Restrained, cohesive palette** (2 brand colors + neutrals). No rainbow gradients, no default Bootstrap/Tailwind look.
- **Strong typographic hierarchy** with a real typeface (self-hosted), generous whitespace, and a consistent type scale.
- **Motion principles:** stagger related elements, animate in/out (never pop), use subtle parallax/depth, add micro-motion (slow drift, breathing scale) so static moments aren't dead. Nothing should appear or vanish instantly.
- **Pacing:** content holds long enough to read comfortably; no element on screen for under ~1.5s of legibility.
- **Subtle texture/depth:** soft shadows, layered backgrounds, maybe a faint grain or gradient mesh — avoid flat default white.
- **Frame discipline:** consistent safe margins, aligned grid, baseline-aligned text.

### Step 6 — Deliverables & verification

- After building, open each `index.html` and confirm it autoplays end-to-end within its stated duration with no console errors and no network requests.
- Write the root `README.md` "Add a new clip" guide: copy `_template/`, rename, edit `data.json`, open `index.html`, screen-record the stage region.
- Keep the architecture **append-only**: adding the 4th, 5th, 50th clip must require zero changes to `_shared/` — only a new folder. The library is meant to grow indefinitely.

**Start now by scaffolding `html_components/` and `_shared/`, then build the engine, then the three example components. Show me the folder tree when the scaffold is done, before filling in component logic.**

---

A couple of optional add-ons you might want to fold in depending on your taste:

- **Audio/voiceover sync** — if you'll add narration later, ask it to support an optional `narration.json` with timestamped captions/markers the timeline can sync to.
- **Headless capture** — instead of manual screen-recording, you could have it add a Puppeteer/Playwright script that renders each `index.html` frame-by-frame to a PNG sequence → MP4. That removes human screen-recording entirely and guarantees clean 60fps 1080p output. Want me to extend the prompt with that capture pipeline?
