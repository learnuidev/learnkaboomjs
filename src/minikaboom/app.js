import { vec2 } from "../kaboomV6/math";

// const keyMap = {
//   ArrowLeft: "left",
//   ArrowRight: "right",
//   ArrowUp: "up",
//   ArrowDown: "down",
//   " ": "space",
// };

// const preventDefaultKeys = [
//   "space",
//   "left",
//   "right",
//   "up",
//   "down",
//   "tab",
//   "f1",
//   "f2",
//   "f3",
//   "f4",
//   "f5",
//   "f6",
//   "f7",
//   "f8",
//   "f9",
//   "f10",
//   "f11",
// ];

function setFullScreen(gconf, app) {
  // full screen mode
  if (gconf.fullscreen) {
    app.canvas.width = window.innerWidth;
    app.canvas.height = window.innerHeight;
  } else {
    app.canvas.width = (gconf.width || 640) * app.scale;
    app.canvas.height = (gconf.height || 480) * app.scale;
  }
}

function setStyle(gconf, app) {
  // styles
  const styles = ["outline: none", "cursor: default"];
  if (gconf.crisp) {
    styles.push("image-rendering: pixelated");
    styles.push("image-rendering: crisp-edges");
  }
  // @ts-ignore
  app.canvas.style = styles.join(";");
  app.canvas.setAttribute("tabindex", "0");
}

export default function appInit(gconf) {
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

  setFullScreen(gconf, app);
  setStyle(gconf, app);

  // webgl context
  const gl = app.canvas.getContext("webgl", {
    antialias: true,
    depth: true,
    stencil: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });

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

      // for (const k in app.keyStates) {
      //   app.keyStates[k] = processBtnState(app.keyStates[k]);
      // }

      // app.mouseState = processBtnState(app.mouseState);
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
    run,
    quit,
  };
}
