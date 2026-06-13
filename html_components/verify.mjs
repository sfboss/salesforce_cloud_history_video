import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.dirname(new URL(import.meta.url).pathname);
const required = ["index.html", "animation.js", "styles.css", "data.json", "README.md"];
const clipDirs = fs
  .readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && (entry.name === "_template" || /^\d{2}_/.test(entry.name)))
  .map((entry) => entry.name);

let failures = 0;

for (const dir of clipDirs) {
  const clipRoot = path.join(root, dir);
  for (const file of required) {
    if (!fs.existsSync(path.join(clipRoot, file))) {
      console.error(`${dir}: missing ${file}`);
      failures += 1;
    }
  }

  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(clipRoot, "data.json"), "utf8"), context);
  const data = context.window.CLIP_DATA;
  if (!data || typeof data !== "object") {
    console.error(`${dir}: data.json did not register window.CLIP_DATA`);
    failures += 1;
  } else if (!Number.isFinite(Number(data.duration)) || data.duration < 30 || data.duration > 60) {
    console.error(`${dir}: duration must be between 30 and 60 seconds`);
    failures += 1;
  }

  const html = fs.readFileSync(path.join(clipRoot, "index.html"), "utf8");
  for (const reference of ["./data.json", "../_shared/engine.js", "../_shared/theme.css", "./animation.js", "./styles.css"]) {
    if (!html.includes(reference)) {
      console.error(`${dir}: index.html missing ${reference}`);
      failures += 1;
    }
  }
}

if (failures) {
  console.error(`Verification failed with ${failures} issue(s).`);
  process.exit(1);
}

console.log(`Verified ${clipDirs.length} clips: structure, data registration, duration, and offline references.`);
