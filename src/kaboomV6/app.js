import { vec2 } from "./math";

function processBtnState(s) {
  if (s === "pressed" || s === "rpressed") {
    return "down";
  }
  if (s === "released") {
    return "up";
  }
  return s;
}

function appInit(gconf = {}) {
  const app = {
    canvas:
      gconf.canvas ??
      (() => {
        const canvas = document.createElement("canvas");
        (gconf.root ?? document.body).appendChild(canvas);
        return canvas;
      })(),
    keyStates: {},
    charInputted: [],
    mouseMoved: false,
    mouseState: "up",
    mousePos: vec2(0, 0),
    mouseDeltaPos: vec2(0, 0),
    time: 0,
    realTime: 0,
    skipTime: false,
    dt: 0.0,
    scale: gconf.scale ?? 1,
    isTouch: false,
    loopID: null,
    stopped: false,
    fps: 0,
    fpsBuf: [],
    fpsTimer: 0,
  };

  const keyMap = {
    ArrowLeft: "left",
    ArrowRight: "right",
    ArrowUp: "up",
    ArrowDown: "down",
    " ": "space",
  };

  const preventDefaultKeys = [
    "space",
    "left",
    "right",
    "up",
    "down",
    "tab",
    "f1",
    "f2",
    "f3",
    "f4",
    "f5",
    "f6",
    "f7",
    "f8",
    "f9",
    "f10",
    "f11",
  ];

  if (gconf.fullscreen) {
    app.canvas.width = window.innerWidth;
    app.canvas.height = window.innerHeight;
  } else {
    app.canvas.width = (gconf.width || 640) * app.scale;
    app.canvas.height = (gconf.height || 480) * app.scale;
  }

  const styles = ["outline: none", "cursor: default"];

  if (gconf.crisp) {
    styles.push("image-rendering: pixelated");
    styles.push("image-rendering: crisp-edges");
  }

  // @ts-ignore
  app.canvas.style = styles.join(";");
  app.canvas.setAttribute("tabindex", "0");

  const gl = app.canvas.getContext("webgl", {
    antialias: true,
    depth: true,
    stencil: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });

  app.isTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0;

  app.canvas.addEventListener("mousemove", (e) => {
    app.mousePos = vec2(e.offsetX, e.offsetY).scale(1 / app.scale);
    app.mouseDeltaPos = vec2(e.movementX, e.movementY).scale(1 / app.scale);
    app.mouseMoved = true;
  });

  app.canvas.addEventListener("mousedown", () => {
    app.mouseState = "pressed";
  });

  app.canvas.addEventListener("mouseup", () => {
    app.mouseState = "released";
  });

  app.canvas.addEventListener("keydown", (e) => {
    const k = keyMap[e.key] || e.key.toLowerCase();

    if (preventDefaultKeys.includes(k)) {
      e.preventDefault();
    }

    if (k.length === 1) {
      app.charInputted.push(k);
    }

    if (k === "space") {
      app.charInputted.push(" ");
    }

    if (e.repeat) {
      app.keyStates[k] = "rpressed";
    } else {
      app.keyStates[k] = "pressed";
    }
  });

  app.canvas.addEventListener("keyup", (e) => {
    const k = keyMap[e.key] || e.key.toLowerCase();
    app.keyStates[k] = "released";
  });

  app.canvas.addEventListener("touchstart", (e) => {
    if (!gconf.touchToMouse) return;
    // disable long tap context menu
    e.preventDefault();
    const t = e.touches[0];
    app.mousePos = vec2(t.clientX, t.clientY).scale(1 / app.scale);
    app.mouseState = "pressed";
  });

  app.canvas.addEventListener("touchmove", (e) => {
    if (!gconf.touchToMouse) return;
    // disable scrolling
    e.preventDefault();
    const t = e.touches[0];
    app.mousePos = vec2(t.clientX, t.clientY).scale(1 / app.scale);
    app.mouseMoved = true;
  });

  app.canvas.addEventListener("touchend", (e) => {
    if (!gconf.touchToMouse) return;
    app.mouseState = "released";
  });

  app.canvas.addEventListener("touchcancel", (e) => {
    if (!gconf.touchToMouse) return;
    app.mouseState = "released";
  });

  document.addEventListener("visibilitychange", () => {
    switch (document.visibilityState) {
      case "visible":
        // prevent a surge of dt() when switch back after the tab being hidden for a while
        app.skipTime = true;
        // TODO
        //  				audio.ctx().resume();
        break;
      case "hidden":
        //  				audio.ctx().suspend();
        break;
    }
  });

  function mousePos() {
    return app.mousePos.clone();
  }

  function mouseDeltaPos() {
    return app.mouseDeltaPos.clone();
  }

  function mouseClicked() {
    return app.mouseState === "pressed";
  }

  function mouseDown() {
    return app.mouseState === "pressed" || app.mouseState === "down";
  }

  function mouseReleased() {
    return app.mouseState === "released";
  }

  function mouseMoved() {
    return app.mouseMoved;
  }

  function keyPressed(k) {
    return app.keyStates[k] === "pressed";
  }

  function keyPressedRep(k) {
    return app.keyStates[k] === "pressed" || app.keyStates[k] === "rpressed";
  }

  function keyDown(k) {
    return (
      app.keyStates[k] === "pressed" ||
      app.keyStates[k] === "rpressed" ||
      app.keyStates[k] === "down"
    );
  }

  function keyReleased(k) {
    return app.keyStates[k] === "released";
  }

  function charInputted() {
    return [...app.charInputted];
  }

  // get delta time between last frame
  function dt() {
    return app.dt;
  }

  // get current running time
  function time() {
    return app.time;
  }

  function fps() {
    return app.fps;
  }

  // get a base64 png image of canvas
  function screenshot() {
    return app.canvas.toDataURL();
  }

  function cursor(c) {
    if (c) {
      app.canvas.style.cursor = c ?? "default";
    }
    return app.canvas.style.cursor;
  }

  function run(f) {
    const frame = (t) => {
      const realTime = t / 1000;
      const realDt = realTime - app.realTime;

      app.realTime = realTime;

      if (!app.skipTime) {
        app.dt = realDt;
        app.time += app.dt;
        app.fpsBuf.push(1 / app.dt);
        app.fpsTimer += app.dt;
        if (app.fpsTimer >= 1) {
          app.fpsTimer = 0;
          app.fps = Math.round(
            app.fpsBuf.reduce((a, b) => a + b) / app.fpsBuf.length
          );
          app.fpsBuf = [];
        }
      }

      app.skipTime = false;

      f();

      for (const k in app.keyStates) {
        app.keyStates[k] = processBtnState(app.keyStates[k]);
      }

      app.mouseState = processBtnState(app.mouseState);
      app.charInputted = [];
      app.mouseMoved = false;

      if (!app.stopped) {
        app.loopID = requestAnimationFrame(frame);
      }
    };

    app.loopID = requestAnimationFrame(frame);
  }

  function quit() {
    cancelAnimationFrame(app.loopID);
    app.stopped = true;
  }

  return {
    gl,
    mousePos,
    mouseDeltaPos,
    keyDown,
    keyPressed,
    keyPressedRep,
    keyReleased,
    mouseDown,
    mouseClicked,
    mouseReleased,
    mouseMoved,
    charInputted,
    cursor,
    dt,
    time,
    fps,
    screenshot,
    run,
    quit,
    focused: () => document.activeElement === app.canvas,
    focus: () => app.canvas.focus(),
    canvas: app.canvas,
    isTouch: app.isTouch,
    scale: app.scale,
  };
}

export default appInit;
