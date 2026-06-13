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
      const main = node("section", "scene code-main");
      const close = node("section", "scene code-close");
      const orb = node("div", "ambient-orb code-orb");

      const header = node("header", "code-header");
      header.append(
        node("p", "eyebrow code-eyebrow", data.meta.series),
        node("p", "scene-index", data.meta.chapter),
        node("h1", "code-title", data.title),
        node("p", "lede code-lede", data.subtitle)
      );

      const workbench = node("div", "code-workbench");
      const editor = node("section", "code-editor");
      const editorBar = node("header", "editor-bar");
      const dots = node("span", "window-dots");
      dots.append(node("i"), node("i"), node("i"));
      editorBar.append(dots, node("span", "file-name mono", data.file), node("span", "language mono", data.language));

      const code = node("ol", "code-lines mono");
      data.code.forEach((segments, index) => {
        const line = node("li", "code-line");
        line.dataset.line = String(index + 1);
        const content = node("code", "");
        segments.forEach((segment) => content.append(node("span", `token token-${segment.type || "plain"}`, segment.text)));
        line.append(content);
        code.append(line);
      });
      editor.append(editorBar, code);

      const calloutRail = node("aside", "callout-rail");
      data.callouts.forEach((callout, index) => {
        const item = node("article", `code-callout callout-${callout.tone}`);
        item.dataset.line = String(callout.line);
        item.append(
          node("span", "micro-label", callout.label),
          node("h2", "", callout.title),
          node("p", "", callout.body)
        );
        calloutRail.append(item);
      });
      workbench.append(editor, calloutRail);
      main.append(header, workbench);

      close.append(
        node("p", "eyebrow close-eyebrow", data.takeaway.label),
        node("p", "code-takeaway", data.takeaway.text),
        node("p", "code-accent", data.takeaway.accent),
        node("p", "corner-note", `${data.duration}s / code walkthrough`)
      );
      stage.append(orb, main, close);

      timeline
        .at(0.2).reveal(".code-eyebrow", { from: "translate3d(-28px,0,0)", duration: 0.62 })
        .at(0.52).reveal(".code-title", { duration: 0.95, blur: 14 })
        .at(1.15).reveal(".code-lede", { from: "translate3d(34px,0,0)", duration: 0.75, easing: easings.softOut })
        .at(0).animate(".code-orb", [
          { transform: "translate3d(0,0,0) rotate(-6deg) scale(0.95)", opacity: 0.2 },
          { transform: "translate3d(-36px,24px,0) rotate(10deg) scale(1.06)", opacity: 0.52 }
        ], { duration: data.duration, easing: easings.focus })
        .at(data.timing.codeStart - 0.6).reveal(".code-editor", { from: "translate3d(-52px,0,0) scale(0.985)", duration: 0.9 })
        .at(data.timing.codeStart).reveal(".code-line", {
          stagger: data.timing.lineGap,
          duration: 0.56,
          from: "translate3d(-26px,0,0)",
          blur: 0
        });

      data.callouts.forEach((callout, index) => {
        const at = data.timing.calloutsStart + index * data.timing.calloutGap;
        timeline
          .at(at).animate(`.code-line[data-line="${callout.line}"]`, [
            { backgroundColor: "rgba(224,122,79,0)", transform: "translate3d(0,0,0)" },
            { backgroundColor: callout.tone === "sage" ? "rgba(135,168,139,0.18)" : "rgba(224,122,79,0.18)", transform: "translate3d(8px,0,0)" },
            { backgroundColor: "rgba(240,237,229,0.035)", transform: "translate3d(0,0,0)" }
          ], { duration: 3.4, easing: easings.focus })
          .at(at + 0.25).reveal(`.code-callout:nth-child(${index + 1})`, {
            from: "translate3d(46px,0,0) scale(0.98)",
            duration: 0.82
          });
      });

      timeline
        .at(data.timing.takeaway).transition(".code-main", ".code-close", { duration: 0.86 })
        .at(data.timing.takeaway + 0.35).reveal(".close-eyebrow", { from: "translate3d(-30px,0,0)" })
        .at(data.timing.takeaway + 0.8).reveal(".code-takeaway", { duration: 1.15, blur: 16 })
        .at(data.timing.takeaway + 1.8).reveal(".code-accent", { from: "translate3d(0,34px,0) scale(0.97)", easing: easings.spring })
        .at(data.timing.outro).hide(".code-close", { duration: 0.72 });
    });
  });
})();
