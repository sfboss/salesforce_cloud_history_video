(function () {
  "use strict";

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  document.addEventListener("DOMContentLoaded", () => {
    ClipEngine.boot(({ data, stage, timeline, easings }) => {
      const main = node("section", "scene template-main");
      const close = node("section", "scene template-close");
      const orb = node("div", "ambient-orb template-orb");

      main.append(
        node("p", "eyebrow template-eyebrow", data.meta.series),
        node("p", "scene-index", data.meta.chapter),
        node("h1", "display-title template-title", data.title),
        node("p", "lede template-lede", data.subtitle),
        node("div", "top-rule template-rule")
      );

      const beats = node("div", "template-beats");
      data.beats.forEach((beat, index) => {
        const item = node("article", "template-beat");
        item.append(
          node("span", "beat-number mono", `0${index + 1}`),
          node("span", "micro-label", beat.label),
          node("h2", "", beat.title),
          node("p", "", beat.body)
        );
        beats.append(item);
      });
      main.append(beats);

      close.append(
        node("p", "eyebrow close-eyebrow", data.takeaway.label),
        node("p", "template-quote", data.takeaway.text),
        node("div", "close-rule"),
        node("p", "corner-note", `${data.duration}s / deterministic playback`)
      );
      stage.append(orb, main, close);

      timeline
        .at(0.2).reveal(".template-eyebrow", { from: "translate3d(-28px,0,0)", duration: 0.6 })
        .at(0.55).reveal(".template-title", { duration: 1.05, blur: 14 })
        .at(1.2).reveal(".template-lede", { from: "translate3d(34px,0,0)", duration: 0.8, easing: easings.softOut })
        .at(1.8).grow(".template-rule", { duration: 1.1 })
        .at(0).animate(".template-orb", [
          { transform: "translate3d(0,0,0) rotate(-8deg) scale(0.96)", opacity: 0.28 },
          { transform: "translate3d(-34px,22px,0) rotate(8deg) scale(1.04)", opacity: 0.55 }
        ], { duration: data.duration, easing: easings.focus })
        .at(data.timing.beatsStart).reveal(".template-beat", {
          stagger: data.timing.beatGap,
          duration: 0.85,
          from: "translate3d(0,52px,0) scale(0.98)"
        })
        .at(data.timing.takeaway).transition(".template-main", ".template-close", { duration: 0.8 })
        .at(data.timing.takeaway + 0.35).reveal(".close-eyebrow", { from: "translate3d(-32px,0,0)" })
        .at(data.timing.takeaway + 0.8).reveal(".template-quote", { duration: 1.1, blur: 16 })
        .at(data.timing.takeaway + 1.4).grow(".close-rule", { duration: 1.2 })
        .at(data.timing.outro).hide(".template-close", { duration: 0.7, to: "translate3d(0,-20px,0) scale(0.995)" });
    });
  });
})();
