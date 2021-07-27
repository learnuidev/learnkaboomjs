// font proggy
// http://upperbounds.net/

// @ts-ignore
import proggySrc from "./proggy_7x13.png";

// @ts-ignore
const proggy = (k) => {
  function loadProggy() {
    return k.loadFont("proggy", proggySrc, 7, 13);
  }

  return {
    loadProggy,
  };
};

export default proggy;
