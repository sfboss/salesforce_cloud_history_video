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
      const main = node("section", "scene concept-main");
      const close = node("section", "scene concept-close");
      const orbit = node("div", "ambient-orb concept-orb");

      const header = node("div", "concept-header");
      header.append(
        node("p", "eyebrow concept-eyebrow", data.meta.series),
        node("p", "scene-index", data.meta.chapter),
        node("h1", "display-title concept-title", data.title),
        node("p", "lede concept-lede", data.subtitle)
      );

      const body = node("div", "concept-body");
      const diagram = node("div", "loop-diagram");
      const core = node("div", "loop-core", data.diagram.center);
      diagram.append(core);
      data.diagram.nodes.forEach((label, index) => {
        const item = node("div", `loop-node loop-node-${index + 1}`, label);
        item.dataset.index = String(index);
        diagram.append(item);
      });
      const points = node("div", "concept-points");
      data.points.forEach((point) => {
        const item = node("article", "concept-point");
        item.append(
          node("span", "point-number mono", point.number),
          node("span", "micro-label", point.label),
          node("h2", "", point.title),
          node("p", "", point.body)
        );
        points.append(item);
      });
      body.append(diagram, points);
      main.append(header, node("div", "top-rule concept-rule"), body);

      close.append(
        node("p", "eyebrow close-eyebrow", data.takeaway.label),
        node("p", "concept-takeaway", data.takeaway.text),
        node("p", "concept-accent", data.takeaway.accent),
        node("p", "corner-note", `${data.duration}s / concept reveal`)
      );
      stage.append(orbit, main, close);

      timeline
        .at(0.2).reveal(".concept-eyebrow", { from: "translate3d(-30px,0,0)", duration: 0.65 })
        .at(0.5).reveal(".concept-title", { duration: 1.1, blur: 16 })
        .at(1.3).reveal(".concept-lede", { from: "translate3d(40px,0,0)", duration: 0.8, easing: easings.softOut })
        .at(2).grow(".concept-rule", { duration: 1.05 })
        .at(0).animate(".concept-orb", [
          { transform: "translate3d(0,0,0) rotate(-10deg) scale(0.96)", opacity: 0.24 },
          { transform: "translate3d(-45px,30px,0) rotate(18deg) scale(1.06)", opacity: 0.56 }
        ], { duration: data.duration, easing: easings.focus })
        .at(data.timing.diagram).reveal(".loop-core", { from: "scale(0.78)", duration: 0.9, easing: easings.spring })
        .at(data.timing.diagram + 0.35).reveal(".loop-node", {
          stagger: 0.14,
          duration: 0.72,
          from: "translate3d(0,22px,0) scale(0.8)",
          easing: easings.spring
        })
        .at(data.timing.diagram + 1).animate(".loop-diagram", [
          { transform: "rotate(-2deg) scale(0.985)" },
          { transform: "rotate(2deg) scale(1.015)" }
        ], { duration: 20, easing: easings.focus, direction: "alternate", iterations: 2 });

      data.points.forEach((point, index) => {
        const at = data.timing.pointsStart + index * data.timing.pointGap;
        timeline
          .at(at).reveal(`.concept-point:nth-child(${index + 1})`, {
            from: index % 2 ? "translate3d(44px,0,0)" : "translate3d(0,46px,0)",
            duration: 0.85
          })
          .at(at + 0.15).animate(`.loop-node-${point.diagramNode}`, [
            { backgroundColor: "rgba(17,26,34,0.82)", borderColor: "rgba(240,237,229,0.22)", transform: "scale(1)" },
            { backgroundColor: "rgba(224,122,79,0.22)", borderColor: "#e07a4f", transform: "scale(1.08)" },
            { backgroundColor: "rgba(17,26,34,0.82)", borderColor: "rgba(240,237,229,0.22)", transform: "scale(1)" }
          ], { duration: 2.2, easing: easings.focus });
      });

      timeline
        .at(data.timing.takeaway).transition(".concept-main", ".concept-close", { duration: 0.85 })
        .at(data.timing.takeaway + 0.4).reveal(".close-eyebrow", { from: "translate3d(-28px,0,0)" })
        .at(data.timing.takeaway + 0.9).reveal(".concept-takeaway", { duration: 1.15, blur: 18 })
        .at(data.timing.takeaway + 1.8).reveal(".concept-accent", { from: "translate3d(0,36px,0) scale(0.96)", easing: easings.spring })
        .at(data.timing.outro).hide(".concept-close", { duration: 0.75 });
    });
  });
})();
