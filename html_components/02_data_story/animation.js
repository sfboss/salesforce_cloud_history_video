(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };
  const svgNode = (tag, attrs = {}) => {
    const element = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  };

  document.addEventListener("DOMContentLoaded", () => {
    ClipEngine.boot(({ data, stage, timeline, easings }) => {
      const main = node("section", "scene data-main");
      const close = node("section", "scene data-close");
      const orb = node("div", "ambient-orb data-orb");

      const header = node("header", "data-header");
      header.append(
        node("p", "eyebrow data-eyebrow", data.meta.series),
        node("p", "scene-index", data.meta.chapter),
        node("h1", "data-title", data.title),
        node("p", "lede data-lede", data.subtitle)
      );

      const content = node("div", "data-content");
      const statPanel = node("aside", "stat-panel");
      statPanel.append(
        node("span", "micro-label", data.heroStat.label),
        node("strong", "hero-stat tabular", `0${data.heroStat.suffix}`),
        node("div", "stat-rule")
      );

      const chartPanel = node("div", "chart-panel");
      chartPanel.append(node("p", "micro-label chart-label", data.chart.label));
      const svg = svgNode("svg", { class: "chart-svg", viewBox: "0 0 1000 500", role: "img" });
      const values = data.chart.values;
      const max = Math.max(...values.map((item) => item.value));
      const points = values.map((item, index) => ({
        x: 80 + index * (840 / (values.length - 1)),
        y: 420 - (item.value / max) * 330,
        ...item
      }));
      const areaPath = [
        `M ${points[0].x} 420`,
        ...points.map((point) => `L ${point.x} ${point.y}`),
        `L ${points[points.length - 1].x} 420 Z`
      ].join(" ");
      const linePath = points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");
      svg.append(
        svgNode("path", { class: "chart-area", d: areaPath }),
        svgNode("path", { class: "chart-line", d: linePath })
      );
      points.forEach((point, index) => {
        const dot = svgNode("circle", { class: `chart-dot chart-dot-${index + 1}`, cx: point.x, cy: point.y, r: 8 });
        const year = svgNode("text", { class: "chart-year", x: point.x, y: 470, "text-anchor": "middle" });
        year.textContent = point.year;
        svg.append(dot, year);
      });
      chartPanel.append(svg);

      const annotations = node("div", "annotations");
      data.chart.annotations.forEach((annotation) => {
        const point = points[annotation.index];
        const item = node("article", "annotation");
        item.style.left = `${Math.min(78, Math.max(8, (point.x / 1000) * 100))}%`;
        item.style.top = `${Math.min(68, Math.max(10, (point.y / 500) * 100))}%`;
        item.append(node("strong", "", annotation.label), node("span", "", annotation.detail));
        annotations.append(item);
      });
      chartPanel.append(annotations);
      content.append(statPanel, chartPanel);

      const drivers = node("div", "drivers");
      data.drivers.forEach((driver) => {
        const item = node("article", `driver driver-${driver.tone}`);
        item.append(
          node("strong", "driver-value tabular", `0${driver.suffix}`),
          node("span", "", driver.label)
        );
        drivers.append(item);
      });
      main.append(header, content, drivers);

      close.append(
        node("p", "eyebrow close-eyebrow", data.takeaway.label),
        node("p", "data-takeaway", data.takeaway.text),
        node("p", "data-note mono", data.takeaway.note),
        node("p", "corner-note", `${data.duration}s / data story`)
      );
      stage.append(orb, main, close);

      timeline
        .at(0.2).reveal(".data-eyebrow", { from: "translate3d(-28px,0,0)", duration: 0.62 })
        .at(0.55).reveal(".data-title", { duration: 0.95, blur: 14 })
        .at(1.2).reveal(".data-lede", { from: "translate3d(36px,0,0)", duration: 0.76, easing: easings.softOut })
        .at(0).animate(".data-orb", [
          { transform: "translate3d(0,0,0) scale(0.94)", opacity: 0.22 },
          { transform: "translate3d(38px,-25px,0) scale(1.08)", opacity: 0.54 }
        ], { duration: data.duration, easing: easings.focus })
        .at(data.timing.stat).reveal(".stat-panel", { from: "translate3d(-44px,0,0) scale(0.98)", duration: 0.9 })
        .at(data.timing.stat + 0.25).countUp(".hero-stat", 0, data.heroStat.value, {
          duration: 2.1,
          suffix: data.heroStat.suffix
        })
        .at(data.timing.stat + 0.35).grow(".stat-rule", { duration: 1.4 })
        .at(data.timing.chart).reveal(".chart-panel", { from: "translate3d(52px,0,0)", duration: 0.95 })
        .at(data.timing.chart + 0.45).draw(".chart-line", { duration: 4.6, easing: easings.focus })
        .at(data.timing.chart + 0.6).fade(".chart-area", { duration: 2.4 })
        .at(data.timing.chart + 0.8).reveal(".chart-dot", {
          stagger: 0.48,
          duration: 0.55,
          from: "scale(0.2)",
          easing: easings.spring,
          blur: 0
        })
        .at(data.timing.chart + 1).reveal(".chart-year", { stagger: 0.48, duration: 0.45, from: "translate3d(0,14px,0)", blur: 0 })
        .at(data.timing.annotationsStart).reveal(".annotation", {
          stagger: data.timing.annotationGap,
          duration: 0.75,
          from: "translate3d(22px,-16px,0) scale(0.98)"
        })
        .at(data.timing.drivers).reveal(".driver", { stagger: 0.24, duration: 0.8, from: "translate3d(0,44px,0)" });

      data.drivers.forEach((driver, index) => {
        timeline.at(data.timing.drivers + 0.2 + index * 0.24).countUp(`.driver:nth-child(${index + 1}) .driver-value`, 0, driver.value, {
          duration: 1.6,
          decimals: driver.decimals || 0,
          suffix: driver.suffix
        });
      });

      timeline
        .at(data.timing.takeaway).transition(".data-main", ".data-close", { duration: 0.85 })
        .at(data.timing.takeaway + 0.35).reveal(".close-eyebrow", { from: "translate3d(-30px,0,0)" })
        .at(data.timing.takeaway + 0.8).reveal(".data-takeaway", { duration: 1.1, blur: 16 })
        .at(data.timing.takeaway + 1.7).reveal(".data-note", { from: "translate3d(0,24px,0)", duration: 0.65 })
        .at(data.timing.outro).hide(".data-close", { duration: 0.7 });
    });
  });
})();
