// load aseprite spritesheet

const aseprite = (k) => {
  function loadAseprite(name, imgSrc, jsonSrc) {
    const loader = new Promise((resolve, reject) => {
      const jsonPath = k.loadRoot() + jsonSrc;

      k.loadSprite(name, imgSrc)
        .then((sprite) => {
          fetch(jsonPath)
            .then((res) => {
              return res.json();
            })
            .then((data) => {
              const size = data.meta.size;
              sprite.frames = data.frames.map((f) => {
                return k.quad(
                  f.frame.x / size.w,
                  f.frame.y / size.h,
                  f.frame.w / size.w,
                  f.frame.h / size.h
                );
              });
              for (const anim of data.meta.frameTags) {
                sprite.anims[anim.name] = {
                  from: anim.from,
                  to: anim.to,
                };
              }
              resolve(sprite);
            })
            .catch(reject);
        })
        .catch(reject);
    });

    k.addLoader(loader);

    return loader;
  }

  return {
    loadAseprite,
  };
};

export default aseprite;
