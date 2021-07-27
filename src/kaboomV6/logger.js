import { vec2, rgba, map } from "./math";

const LOG_SIZE = 16;

function loggerInit(
  gfx,
  assets,
  conf = {
    max: 8,
  }
) {
  let logs = [];
  const max = conf.max ?? 8;

  // TODO: draw rects first to reduce draw calls
  // TODO: make log and progress bar fixed size independent of global scale
  function draw() {
    if (logs.length > max) {
      logs = logs.slice(0, max);
    }

    const pos = vec2(0, gfx.height());

    logs.forEach((log, i) => {
      const txtAlpha = map(i, 0, max, 1, 0.5);
      const bgAlpha = map(i, 0, max, 0.8, 0.2);

      const col = (() => {
        // eslint-disable-next-line default-case
        switch (log.type) {
          case "info":
            return rgba(1, 1, 1, txtAlpha);
          case "error":
            return rgba(1, 0, 0.5, txtAlpha);
        }
      })();

      const ftext = gfx.fmtText(log.msg, assets.defFont(), {
        pos: pos,
        origin: "botleft",
        color: col,
        size: LOG_SIZE / gfx.scale(),
        width: gfx.width(),
      });

      gfx.drawRect(pos, ftext.width, ftext.height, {
        origin: "botleft",
        color: rgba(0, 0, 0, bgAlpha),
      });

      gfx.drawFmtText(ftext);
      pos.y -= ftext.height;
    });
  }

  function error(msg) {
    console.error(msg);
    logs.unshift({
      type: "error",
      msg: msg,
    });
  }

  function info(msg) {
    logs.unshift({
      type: "info",
      msg: msg,
    });
  }

  function clear() {
    logs = [];
  }

  return {
    info,
    error,
    draw,
    clear,
  };
}

export { loggerInit };
