// font 04b03

import b04b03Src from "./04b03_6x8.png";

// @ts-ignore
const fourB03 = (k) => {
  function load04b03() {
    return k.loadFont("04b03", b04b03Src, 6, 8);
  }

  return {
    load04b03,
  };
};

export default fourB03;
