// import { vec2 } from "../kaboomV6/math";

import appInit from "./app";
import gfxInit from "./gfx";
import { audioInit } from "./../kaboomV6/audio";
import { vec3 } from "../kaboomV6/math";

// util
import { global } from "./utils";

// LESSON 3
import { assetsInit } from "./assets";

function kaboom(
  gconf = {
    width: 640,
    height: 480,
    scale: 1,
    fullscreen: false,
    debug: false,
    crisp: false,
    canvas: null,
    connect: null,
    logMax: 8,
    root: document.body,
  }
) {
  // console.log("kaboom", gconf);
  // window.gconf = gconf;

  // Part A: APP
  const app = appInit({
    width: gconf.width,
    height: gconf.height,
    scale: gconf.scale,
    fullscreen: gconf.fullscreen,
    crisp: gconf.crisp,
    canvas: gconf.canvas,
    root: gconf.root,
    touchToMouse: gconf.touchToMouse ?? true,
  });
  // console.log("APP", app);

  // Part B: GFX
  const gfx = gfxInit(gconf);
  console.log("gfx", gfx);

  // Part C: Audio
  const audio = audioInit();

  // Pard D: Assets
  const assets = assetsInit(gfx, audio, {
    errHandler: (err) => {
      console.log("assets error", err);
    },
  });

  window.assets = assets;

  // context
  const ctx = {
    loadRoot: assets.loadRoot,
    loadSprite: assets.loadSprite,
    // Math
    vec3,
  };

  if (gconf.global) {
    global(ctx);
  }

  app.run(() => {
    // console.log("runs every frame");
    gfx.frameStart();

    gfx.frameEnd();
  });

  return ctx;
}

export default kaboom;
