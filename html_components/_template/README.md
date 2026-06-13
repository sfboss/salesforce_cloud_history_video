# Reference Template

A functional 32-second reference clip demonstrating the shared timeline API.

## Authoring

1. Copy this folder and rename it.
2. Edit only `data.json` to replace the title, beats, takeaway, and timing.
3. Double-click `index.html`.

`data.json` uses an offline-safe `window.CLIP_DATA = {...}` envelope because browsers
block local `fetch()` calls under `file://`.
