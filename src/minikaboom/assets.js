import { quad } from "../kaboomV6/math";

function isDataUrl(src) {
  return src.startsWith("data:");
}

function loadImg(src) {
  const img = new Image();
  img.src = src;
  img.crossOrigin = "anonymous";
  return new Promise((resolve, reject) => {
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(`failed to load ${src}`);
    };
  });
}

export function assetsInit(gfx, audio, gconf = {}) {
  const assets = {
    lastLoaderID: 0,
    loadRoot: "",
    loaders: {},
    sprites: {},
    sounds: {},
    fonts: {},
    shaders: {},
  };

  function addLoader(prom) {
    const id = assets.lastLoaderID;
    assets.loaders[id] = false;
    assets.lastLoaderID++;
    prom
      .catch(gconf.errHandler ?? console.error)
      .finally(() => (assets.loaders[id] = true));
  }

  // global load path prefix
  function loadRoot(path) {
    if (path !== undefined) {
      assets.loadRoot = path;
    }
    return assets.loadRoot;
  }

  // TODO: use getSprite() functions for async settings
  // load a sprite to asset manager
  function loadSprite(
    name,
    src,
    conf = {
      sliceX: 1,
      sliceY: 1,
      anims: {},
    }
  ) {
    // synchronously load sprite from local pixel data
    function loadRawSprite(
      name,
      src,
      conf = {
        sliceX: 1,
        sliceY: 1,
        gridWidth: 0,
        gridHeight: 0,
        anims: {},
      }
    ) {
      const frames = [];
      const tex = gfx.makeTex(src);
      const sliceX = conf.sliceX || tex.width / (conf.gridWidth || tex.width);
      const sliceY =
        conf.sliceY || tex.height / (conf.gridHeight || tex.height);
      const qw = 1 / sliceX;
      const qh = 1 / sliceY;

      for (let j = 0; j < sliceY; j++) {
        for (let i = 0; i < sliceX; i++) {
          frames.push(quad(i * qw, j * qh, qw, qh));
        }
      }

      const sprite = {
        tex: tex,
        frames: frames,
        anims: conf.anims || {},
      };

      assets.sprites[name] = sprite;

      return sprite;
    }

    const loader = new Promise((resolve, reject) => {
      if (!src) {
        return reject(`expected sprite src for "${name}"`);
      }

      // from url
      if (typeof src === "string") {
        const path = isDataUrl(src) ? src : assets.loadRoot + src;
        loadImg(path)
          .then((img) => {
            resolve(loadRawSprite(name, img, conf));
          })
          .catch(reject);
      } else {
        resolve(loadRawSprite(name, src, conf));
      }
    });

    addLoader(loader);

    return loader;
  }

  return {
    loadRoot,
    loadSprite,
    assets,
  };
}
