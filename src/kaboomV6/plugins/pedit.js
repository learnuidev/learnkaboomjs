// load pedit
// https://github.com/slmjkdbtl/pedit.js

// @ts-ignore
const pedit = (k) => {
  function loadImg(src) {
    const img = new Image();
    img.src = src;
    img.crossOrigin = "anonymous";
    return (
      new Promise() <
      HTMLImageElement >
      ((resolve, reject) => {
        img.onload = () => {
          resolve(img);
        };
        img.onerror = () => {
          reject(`failed to load ${src}`);
        };
      })
    );
  }

  function loadPedit(name, src) {
    const loader =
      new Promise() <
      SpriteData >
      ((resolve, reject) => {
        fetch(k.loadRoot() + src)
          .then((res) => res.json())
          .then(async (data) => {
            const images = await Promise.all(data.frames.map(loadImg));
            const canvas = document.createElement("canvas");
            canvas.width = data.width;
            canvas.height = data.height * data.frames.length;

            const ctx = canvas.getContext("2d");

            images.forEach((img, i) => {
              ctx.drawImage(img, 0, i * data.height);
            });

            return k.loadSprite(name, canvas, {
              sliceY: data.frames.length,
              anims: data.anims,
            });
          })
          .then(resolve)
          .catch(reject);
      });

    k.addLoader(loader);

    return loader;
  }

  return {
    loadPedit,
  };
};

export default pedit;
