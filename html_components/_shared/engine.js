(function attachClipEngine(global) {
  "use strict";

  const STAGE_WIDTH = 1920;
  const STAGE_HEIGHT = 1080;
  const EASINGS = {
    expoOut: "cubic-bezier(0.16, 1, 0.3, 1)",
    quartOut: "cubic-bezier(0.25, 1, 0.5, 1)",
    softOut: "cubic-bezier(0.22, 0.61, 0.36, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    focus: "cubic-bezier(0.65, 0, 0.35, 1)",
    exit: "cubic-bezier(0.7, 0, 0.84, 0)"
  };

  const params = new URLSearchParams(global.location.search);
  const recordMode = params.get("record") === "1";
  const seekTime = params.has("seek") ? Math.max(0, Number(params.get("seek")) || 0) : null;
  const speed = Math.max(0.05, Number(params.get("speed")) || 1);
  const leadIn = recordMode ? 1 : 0;
  const endFreeze = recordMode ? 2 : 0;
  const animations = [];

  const toArray = (target, root) => {
    if (!target) return [];
    if (typeof target === "string") return Array.from((root || document).querySelectorAll(target));
    if (target instanceof Element) return [target];
    return Array.from(target);
  };

  const seconds = (value) => Math.max(0, Number(value) || 0);
  const scaledMs = (value) => (seconds(value) * 1000) / speed;

  function animateElements(root, target, keyframes, options, at) {
    const elements = toArray(target, root);
    const stagger = seconds(options.stagger);
    return elements.map((element, index) => {
      const animation = element.animate(keyframes, {
        delay: scaledMs(leadIn + at + stagger * index),
        duration: scaledMs(options.duration ?? 0.7),
        easing: options.easing || EASINGS.expoOut,
        fill: options.fill || "both",
        iterations: options.iterations || 1,
        direction: options.direction || "normal"
      });
      animations.push(animation);
      return animation;
    });
  }

  function formatNumber(value, options) {
    const decimals = Number.isInteger(options.decimals) ? options.decimals : 0;
    const number = Number(value).toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
    return `${options.prefix || ""}${number}${options.suffix || ""}`;
  }

  class Timeline {
    constructor(root, duration) {
      this.root = root;
      this.duration = seconds(duration);
      this.cursor = 0;
      this.frameJobs = [];
      this.started = false;
    }

    at(time) {
      this.cursor = seconds(time);
      return this;
    }

    animate(target, keyframes, options = {}) {
      animateElements(this.root, target, keyframes, options, this.cursor);
      return this;
    }

    reveal(target, options = {}) {
      const from = options.from || "translate3d(0, 44px, 0) scale(0.985)";
      const to = options.to || "translate3d(0, 0, 0) scale(1)";
      return this.animate(
        target,
        [
          { opacity: 0, transform: from, filter: `blur(${options.blur ?? 10}px)` },
          { opacity: 1, transform: to, filter: "blur(0px)" }
        ],
        {
          duration: options.duration ?? 0.8,
          stagger: options.stagger,
          easing: options.easing || EASINGS.expoOut
        }
      );
    }

    fade(target, options = {}) {
      return this.animate(
        target,
        [{ opacity: options.from ?? 0 }, { opacity: options.to ?? 1 }],
        {
          duration: options.duration ?? 0.65,
          stagger: options.stagger,
          easing: options.easing || EASINGS.softOut
        }
      );
    }

    hide(target, options = {}) {
      return this.animate(
        target,
        [
          { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)", filter: "blur(0px)" },
          {
            opacity: 0,
            transform: options.to || "translate3d(0, -28px, 0) scale(0.99)",
            filter: `blur(${options.blur ?? 8}px)`
          }
        ],
        {
          duration: options.duration ?? 0.42,
          stagger: options.stagger,
          easing: options.easing || EASINGS.exit
        }
      );
    }

    draw(target, options = {}) {
      toArray(target, this.root).forEach((path) => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = String(length);
        path.style.strokeDashoffset = String(length);
        animateElements(
          this.root,
          path,
          [{ strokeDashoffset: length }, { strokeDashoffset: 0 }],
          { duration: options.duration ?? 1.6, easing: options.easing || EASINGS.focus },
          this.cursor
        );
      });
      return this;
    }

    grow(target, options = {}) {
      const origin = options.origin || "left center";
      toArray(target, this.root).forEach((element) => {
        element.style.transformOrigin = origin;
      });
      return this.animate(
        target,
        [
          { opacity: options.fade === false ? 1 : 0, transform: options.from || "scaleX(0)" },
          { opacity: 1, transform: options.to || "scaleX(1)" }
        ],
        {
          duration: options.duration ?? 0.9,
          stagger: options.stagger,
          easing: options.easing || EASINGS.expoOut
        }
      );
    }

    countUp(target, from, to, options = {}) {
      const start = this.cursor;
      const duration = seconds(options.duration ?? 1.4);
      const elements = toArray(target, this.root);
      const ease = options.ease || ((t) => 1 - Math.pow(1 - t, 4));
      this.frameJobs.push({
        start,
        end: start + duration,
        update(progress) {
          const value = Number(from) + (Number(to) - Number(from)) * ease(progress);
          elements.forEach((element) => {
            element.textContent = formatNumber(value, options);
          });
        }
      });
      return this;
    }

    progress(start, end, update) {
      this.frameJobs.push({
        start: seconds(start),
        end: seconds(end),
        update
      });
      return this;
    }

    call(callback) {
      this.frameJobs.push({ start: this.cursor, end: this.cursor, update: callback, once: true, called: false });
      return this;
    }

    transition(fromTarget, toTarget, options = {}) {
      const duration = options.duration ?? 0.72;
      this.animate(
        fromTarget,
        [
          { opacity: 1, transform: "translate3d(0, 0, 0)", clipPath: "inset(0 0 0 0)" },
          { opacity: 0.25, transform: "translate3d(-56px, 0, 0)", clipPath: "inset(0 100% 0 0)" }
        ],
        { duration, easing: options.easing || EASINGS.focus }
      );
      this.animate(
        toTarget,
        [
          { opacity: 0.2, transform: "translate3d(80px, 0, 0)", clipPath: "inset(0 0 0 100%)" },
          { opacity: 1, transform: "translate3d(0, 0, 0)", clipPath: "inset(0 0 0 0)" }
        ],
        { duration, easing: options.easing || EASINGS.focus }
      );
      return this;
    }

    play() {
      if (this.started) return;
      this.started = true;
      const startedAt = performance.now();
      const jobs = this.frameJobs;

      const tick = (now) => {
        const elapsed = ((now - startedAt) / 1000) * speed - leadIn;
        jobs.forEach((job) => {
          if (job.once) {
            if (!job.called && elapsed >= job.start) {
              job.called = true;
              job.update(1);
            }
            return;
          }
          if (elapsed < job.start) return;
          const span = Math.max(0.001, job.end - job.start);
          const progress = Math.min(1, Math.max(0, (elapsed - job.start) / span));
          job.update(progress);
        });

        if (elapsed < this.duration + endFreeze) {
          requestAnimationFrame(tick);
        } else {
          global.__clipDone = true;
          document.documentElement.dataset.clipState = "done";
        }
      };
      requestAnimationFrame(tick);
    }

    seek(time) {
      const target = Math.min(this.duration, seconds(time));
      animations.forEach((animation) => {
        animation.pause();
        animation.currentTime = scaledMs(leadIn + target);
      });
      this.frameJobs.forEach((job) => {
        if (job.once) {
          if (target >= job.start) job.update(1);
          return;
        }
        if (target < job.start) return;
        const span = Math.max(0.001, job.end - job.start);
        job.update(Math.min(1, Math.max(0, (target - job.start) / span)));
      });
      global.__clipDone = target >= this.duration;
      document.documentElement.dataset.clipState = "seek";
      document.documentElement.dataset.clipSeek = String(target);
    }
  }

  function fitStage() {
    const shell = document.querySelector(".stage-shell");
    const stage = document.querySelector(".stage");
    if (!shell || !stage) return;
    const scale = Math.min(global.innerWidth / STAGE_WIDTH, global.innerHeight / STAGE_HEIGHT);
    stage.style.transform = `scale(${scale})`;
    shell.style.width = `${STAGE_WIDTH * scale}px`;
    shell.style.height = `${STAGE_HEIGHT * scale}px`;
  }

  function addRecordMatte(duration) {
    if (!recordMode) return;
    const matte = document.createElement("div");
    matte.className = "record-matte";
    document.body.appendChild(matte);
    matte.animate([{ opacity: 1 }, { opacity: 0 }], {
      delay: scaledMs(leadIn - 0.18),
      duration: scaledMs(0.18),
      easing: EASINGS.focus,
      fill: "forwards"
    });
    global.setTimeout(() => matte.remove(), scaledMs(leadIn + 0.1));
    document.documentElement.dataset.recordDuration = String(duration + leadIn + endFreeze);
  }

  function boot(buildClip) {
    const data = global.CLIP_DATA;
    const stage = document.querySelector(".stage");
    if (!data || typeof data !== "object") {
      throw new Error("data.json did not register window.CLIP_DATA.");
    }
    if (!stage) throw new Error("Missing .stage element.");
    if (!Number.isFinite(Number(data.duration))) throw new Error("data.json requires a numeric duration.");

    document.title = data.meta?.title || data.title || "Technical Explainer Clip";
    document.documentElement.dataset.clipState = "ready";
    document.documentElement.dataset.clipDuration = String(data.duration);
    fitStage();
    global.addEventListener("resize", fitStage);
    addRecordMatte(Number(data.duration));

    const timeline = new Timeline(stage, data.duration);
    buildClip({ data, stage, timeline, easings: EASINGS, config: { STAGE_WIDTH, STAGE_HEIGHT } });
    global.__clipReady = true;
    global.__clipTimeline = timeline;
    if (seekTime === null) timeline.play();
    else timeline.seek(seekTime);
  }

  global.ClipEngine = {
    boot,
    Timeline,
    easings: EASINGS,
    config: { STAGE_WIDTH, STAGE_HEIGHT, recordMode, leadIn, endFreeze, speed, seekTime }
  };
})(window);
