function deg2rad(deg) {
  return (deg * Math.PI) / 180;
}

function rad2deg(rad) {
  return (rad * 180) / Math.PI;
}

function clamp(val, min, max) {
  if (min > max) {
    return clamp(val, max, min);
  }
  return Math.min(Math.max(val, min), max);
}

// THIS IS THE ONLY OPERATION WE CAN DO WITH points other than add/ subtracing and multiplying
function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}
// lerp2
function lerp2(p1, p2, t) {
  return (1 - t) * p1 + t * p2;
}

// general formula
// P = x1p1 + x2p2 + x3p3 ...such that x1 + x2 + .... + xn = 1
// This is called Affine Combination of Points
// https://en.wikipedia.org/wiki/Affine_combination
// and vectors and points are called Affine Space
// this is the way we figure out points and vectors and figure everything out

function map(v, l1, h1, l2, h2) {
  return l2 + ((v - l1) / (h1 - l1)) * (h2 - l2);
}

function mapc(v, l1, h1, l2, h2) {
  return clamp(map(v, l1, h1, l2, h2), l2, h2);
}

function vec2(...args) {
  if (args.length === 0) {
    return vec2(0, 0);
  }

  if (args.length === 1) {
    if (typeof args[0] === "number") {
      return vec2(args[0], args[0]);
    } else if (isVec2(args[0])) {
      return vec2(args[0].x, args[0].y);
    } else if (Array.isArray(args[0]) && args[0].length === 2) {
      return vec2.apply(null, args[0]);
    }
  }

  return {
    x: args[0],
    y: args[1],
    clone() {
      return vec2(this.x, this.y);
    },
    add(...args) {
      const p2 = vec2(...args);
      return vec2(this.x + p2.x, this.y + p2.y);
    },
    sub(...args) {
      const p2 = vec2(...args);
      return vec2(this.x - p2.x, this.y - p2.y);
    },
    scale(...args) {
      const s = vec2(...args);
      return vec2(this.x * s.x, this.y * s.y);
    },
    dist(...args) {
      const p2 = vec2(...args);
      return Math.sqrt(
        (this.x - p2.x) * (this.x - p2.x) + (this.y - p2.y) * (this.y - p2.y)
      );
    },
    len() {
      return this.dist(vec2(0, 0));
    },
    unit() {
      return this.scale(1 / this.len());
    },
    normal() {
      return vec2(this.y, -this.x);
    },
    dot(p2) {
      return this.x * p2.x + this.y + p2.y;
    },
    angle(...args) {
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
      // The Math.atan2() function returns the angle in the plane
      // (in radians) between the positive x - axis and the ray
      // from(0, 0) to the point(x, y), for Math.atan2(y, x).`;
      const p2 = vec2(...args);
      const diffVec = this.sub(p2);
      return Math.atan2(diffVec.y, diffVec.x);
    },
    lerp(p2, t) {
      return vec2(lerp(this.x, p2.x, t), lerp(this.y, p2.y, t));
    },
    toFixed(n) {
      return vec2(this.x.toFixed(n), this.y.toFixed(n));
    },
    eq(other) {
      return this.x === other.x && this.y === other.y;
    },
    str() {
      return `(${this.x}, ${this.y})`;
    },
  };
}

function vec2FromAngle(a) {
  return vec2(Math.cos(a), Math.sin(a));
}

function vec3(x, y, z) {
  return {
    x: x,
    y: y,
    z: z,
    xy() {
      return vec2(this.x, this.y);
    },
  };
}

function isVec2(p) {
  return p !== undefined && p.x !== undefined && p.y !== undefined;
}

function isVec3(p) {
  return (
    p !== undefined &&
    p.x !== undefined &&
    p.y !== undefined &&
    p.z !== undefined
  );
}

function isColor(c) {
  return (
    c !== undefined &&
    c.r !== undefined &&
    c.g !== undefined &&
    c.b !== undefined &&
    c.a !== undefined
  );
}

function isMat4(m) {
  if (m !== undefined && Array.isArray(m.m) && m.m.length === 16) {
    return m;
  }
}

function rgb(...args) {
  if (args.length === 0) {
    return rgba();
  } else if (args.length === 1) {
    if (isColor(args[0])) {
      return rgba(args[0]);
    } else if (Array.isArray(args[0]) && args[0].length === 3) {
      return rgb.apply(null, args[0]);
    }
  }
  return rgba(args[0], args[1], args[2], 1);
}

function rgba(...args) {
  if (args.length === 0) {
    return rgba(1, 1, 1, 1);
  } else if (args.length === 1) {
    if (isColor(args[0])) {
      return rgba(args[0].r, args[0].g, args[0].b, args[0].a);
    } else if (Array.isArray(args[0]) && args[0].length === 4) {
      return rgba.apply(null, args[0]);
    }
  }

  return {
    r: args[0],
    g: args[1],
    b: args[2],
    a: args[3] ?? 1,
    clone() {
      return rgba(this.r, this.g, this.b, this.a);
    },
    lighten(a) {
      return rgba(this.r + a, this.g + a, this.b + a, this.a);
    },
    darken(a) {
      return this.lighten(-a);
    },
    invert() {
      return rgba(1 - this.r, 1 - this.g, 1 - this.b, this.a);
    },
    isDark(p = 0.5) {
      return this.r + this.g + this.b < 3 * p;
    },
    isLight(p = 0.5) {
      return this.r + this.g + this.b > 3 * p;
    },
    eq(other) {
      return (
        this.r === other.r &&
        this.g === other.g &&
        this.b === other.g &&
        this.a === other.a
      );
    },
  };
}

function quad(x, y, w, h) {
  return {
    x: x,
    y: y,
    w: w,
    h: h,
    scale(other) {
      return quad(
        this.x + this.w * other.x,
        this.y + this.h * other.y,
        this.w * other.w,
        this.h * other.h
      );
    },
    clone() {
      return quad(this.x, this.y, this.w, this.h);
    },
    eq(other) {
      return (
        this.x === other.x &&
        this.y === other.y &&
        this.w === other.w &&
        this.h === other.h
      );
    },
  };
}

function mat4(m) {
  return {
    m: m ? [...m] : [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],

    clone() {
      return mat4(this.m);
    },

    mult(other) {
      const out = [];

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          out[i * 4 + j] =
            this.m[0 * 4 + j] * other.m[i * 4 + 0] +
            this.m[1 * 4 + j] * other.m[i * 4 + 1] +
            this.m[2 * 4 + j] * other.m[i * 4 + 2] +
            this.m[3 * 4 + j] * other.m[i * 4 + 3];
        }
      }

      return mat4(out);
    },

    multVec4(p) {
      return {
        x:
          p.x * this.m[0] +
          p.y * this.m[4] +
          p.z * this.m[8] +
          p.w * this.m[12],
        y:
          p.x * this.m[1] +
          p.y * this.m[5] +
          p.z * this.m[9] +
          p.w * this.m[13],
        z:
          p.x * this.m[2] +
          p.y * this.m[6] +
          p.z * this.m[10] +
          p.w * this.m[14],
        w:
          p.x * this.m[3] +
          p.y * this.m[7] +
          p.z * this.m[11] +
          p.w * this.m[15],
      };
    },

    multVec3(p) {
      const p4 = this.multVec4({
        x: p.x,
        y: p.y,
        z: p.z,
        w: 1.0,
      });
      return vec3(p4.x, p4.y, p4.z);
    },

    multVec2(p) {
      return vec2(
        p.x * this.m[0] + p.y * this.m[4] + 0 * this.m[8] + 1 * this.m[12],
        p.x * this.m[1] + p.y * this.m[5] + 0 * this.m[9] + 1 * this.m[13]
      );
    },

    // prettier-ignore
    translate(p) {
      return this.mult(
        mat4([
          1,   0,   0, 0,
          0,   1,   0, 0,
          0,   0,   1, 0,
          p.x, p.y, 0, 1])
      );
    },

    // prettier-ignore
    scale(s) {
      return this.mult(
        mat4([
          s.x, 0,   0, 0,
          0,   s.y, 0, 0, 
          0,   0,   1, 0, 
          0,   0,   0, 1])
      );
    },

    // prettier-ignore
    rotateX(a) {
      return this.mult(
        mat4([
          1, 0,            0,           0,
          0, Math.cos(a), -Math.sin(a), 0,
          0, Math.sin(a),  Math.cos(a), 0,
          0, 0,            0,           1,
        ])
      );
    },

    // prettier-ignore
    rotateY(a) {
      return this.mult(
        mat4([
          Math.cos(a), 0, -Math.sin(a), 0,
          0,           1,  0,           0,
          Math.sin(a), 0,  Math.cos(a), 0,
          0,           0,  0,           1,
        ])
      );
    },

    // prettier-ignore
    rotateZ(a) {
      return this.mult(
        mat4([
          Math.cos(a), -Math.sin(a), 0, 0,
          Math.sin(a),  Math.cos(a), 0, 0,
          0,            0,           1, 0,
          0,            0,           0, 1,
        ])
      );
    },

    invert() {
      const out = [];

      const f00 = this.m[10] * this.m[15] - this.m[14] * this.m[11];
      const f01 = this.m[9] * this.m[15] - this.m[13] * this.m[11];
      const f02 = this.m[9] * this.m[14] - this.m[13] * this.m[10];
      const f03 = this.m[8] * this.m[15] - this.m[12] * this.m[11];
      const f04 = this.m[8] * this.m[14] - this.m[12] * this.m[10];
      const f05 = this.m[8] * this.m[13] - this.m[12] * this.m[9];
      const f06 = this.m[6] * this.m[15] - this.m[14] * this.m[7];
      const f07 = this.m[5] * this.m[15] - this.m[13] * this.m[7];
      const f08 = this.m[5] * this.m[14] - this.m[13] * this.m[6];
      const f09 = this.m[4] * this.m[15] - this.m[12] * this.m[7];
      const f10 = this.m[4] * this.m[14] - this.m[12] * this.m[6];
      const f11 = this.m[5] * this.m[15] - this.m[13] * this.m[7];
      const f12 = this.m[4] * this.m[13] - this.m[12] * this.m[5];
      const f13 = this.m[6] * this.m[11] - this.m[10] * this.m[7];
      const f14 = this.m[5] * this.m[11] - this.m[9] * this.m[7];
      const f15 = this.m[5] * this.m[10] - this.m[9] * this.m[6];
      const f16 = this.m[4] * this.m[11] - this.m[8] * this.m[7];
      const f17 = this.m[4] * this.m[10] - this.m[8] * this.m[6];
      const f18 = this.m[4] * this.m[9] - this.m[8] * this.m[5];

      out[0] = this.m[5] * f00 - this.m[6] * f01 + this.m[7] * f02;
      out[4] = -(this.m[4] * f00 - this.m[6] * f03 + this.m[7] * f04);
      out[8] = this.m[4] * f01 - this.m[5] * f03 + this.m[7] * f05;
      out[12] = -(this.m[4] * f02 - this.m[5] * f04 + this.m[6] * f05);

      out[1] = -(this.m[1] * f00 - this.m[2] * f01 + this.m[3] * f02);
      out[5] = this.m[0] * f00 - this.m[2] * f03 + this.m[3] * f04;
      out[9] = -(this.m[0] * f01 - this.m[1] * f03 + this.m[3] * f05);
      out[13] = this.m[0] * f02 - this.m[1] * f04 + this.m[2] * f05;

      out[2] = this.m[1] * f06 - this.m[2] * f07 + this.m[3] * f08;
      out[6] = -(this.m[0] * f06 - this.m[2] * f09 + this.m[3] * f10);
      out[10] = this.m[0] * f11 - this.m[1] * f09 + this.m[3] * f12;
      out[14] = -(this.m[0] * f08 - this.m[1] * f10 + this.m[2] * f12);

      out[3] = -(this.m[1] * f13 - this.m[2] * f14 + this.m[3] * f15);
      out[7] = this.m[0] * f13 - this.m[2] * f16 + this.m[3] * f17;
      out[11] = -(this.m[0] * f14 - this.m[1] * f16 + this.m[3] * f18);
      out[15] = this.m[0] * f15 - this.m[1] * f17 + this.m[2] * f18;

      const det =
        this.m[0] * out[0] +
        this.m[1] * out[4] +
        this.m[2] * out[8] +
        this.m[3] * out[12];

      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          out[i * 4 + j] *= 1.0 / det;
        }
      }

      return mat4(out);
    },
  };
}

// easy sine wave
function wave(lo, hi, t) {
  return lo + ((Math.sin(t) + 1) / 2) * (hi - lo);
}

// basic ANSI C LCG
const A = 1103515245;
const C = 12345;
const M = 2147483648;
const defRNG = makeRng(Date.now());

function makeRng(seed) {
  return {
    seed: seed,
    gen(...args) {
      if (args.length === 0) {
        // generate 0 - 1
        this.seed = (A * this.seed + C) % M;
        return this.seed / M;
      } else if (args.length === 1) {
        if (typeof args[0] === "number") {
          return this.gen(0, args[0]);
        } else if (isVec2(args[0])) {
          return this.gen(vec2(0, 0), args[0]);
        } else if (isColor(args[0])) {
          return this.gen(rgba(0, 0, 0, 0), args[0]);
        }
      } else if (args.length === 2) {
        if (typeof args[0] === "number" && typeof args[1] === "number") {
          return this.gen() * (args[1] - args[0]) + args[0];
        } else if (isVec2(args[0]) && isVec2(args[1])) {
          return vec2(
            this.gen(args[0].x, args[1].x),
            this.gen(args[0].y, args[1].y)
          );
        } else if (isColor(args[0]) && isColor(args[1])) {
          return rgba(
            this.gen(args[0].r, args[1].r),
            this.gen(args[0].g, args[1].g),
            this.gen(args[0].b, args[1].b),
            this.gen(args[0].a, args[1].a)
          );
        }
      }
    },
  };
}

function randSeed(seed) {
  if (seed != null) {
    defRNG.seed = seed;
  }
  return defRNG.seed;
}

function rand(...args) {
  // @ts-ignore
  return defRNG.gen(...args);
}

function chance(p) {
  return rand() <= p;
}

function choose(list) {
  return list[Math.floor(rand(list.length))];
}

function colRectRect(r1, r2) {
  return (
    r1.p2.x >= r2.p1.x &&
    r1.p1.x <= r2.p2.x &&
    r1.p2.y >= r2.p1.y &&
    r1.p1.y <= r2.p2.y
  );
}

function overlapRectRect(r1, r2) {
  return (
    r1.p2.x > r2.p1.x &&
    r1.p1.x < r2.p2.x &&
    r1.p2.y > r2.p1.y &&
    r1.p1.y < r2.p2.y
  );
}

function colLineLine(l1, l2) {
  const a =
    ((l2.p2.x - l2.p1.x) * (l1.p1.y - l2.p1.y) -
      (l2.p2.y - l2.p1.y) * (l1.p1.x - l2.p1.x)) /
    ((l2.p2.y - l2.p1.y) * (l1.p2.x - l1.p1.x) -
      (l2.p2.x - l2.p1.x) * (l1.p2.y - l1.p1.y));
  const b =
    ((l1.p2.x - l1.p1.x) * (l1.p1.y - l2.p1.y) -
      (l1.p2.y - l1.p1.y) * (l1.p1.x - l2.p1.x)) /
    ((l2.p2.y - l2.p1.y) * (l1.p2.x - l1.p1.x) -
      (l2.p2.x - l2.p1.x) * (l1.p2.y - l1.p1.y));
  return a >= 0.0 && a <= 1.0 && b >= 0.0 && b <= 1.0;
}

function colRectLine(r, l) {
  if (colRectPt(r, l.p1) || colRectPt(r, l.p2)) {
    return true;
  }
  return (
    colLineLine(l, makeLine(r.p1, vec2(r.p2.x, r.p1.y))) ||
    colLineLine(l, makeLine(vec2(r.p2.x, r.p1.y), r.p2)) ||
    colLineLine(l, makeLine(r.p2, vec2(r.p1.x, r.p2.y))) ||
    colLineLine(l, makeLine(vec2(r.p1.x, r.p2.y), r.p1))
  );
}

function colRectPt(r, pt) {
  return pt.x >= r.p1.x && pt.x <= r.p2.x && pt.y >= r.p1.y && pt.y < r.p2.y;
}

function makeLine(p1, p2) {
  return {
    p1: p1.clone(),
    p2: p2.clone(),
  };
}

export {
  vec2,
  vec3,
  mat4,
  quad,
  rgba,
  rgb,
  makeRng,
  rand,
  randSeed,
  chance,
  choose,
  clamp,
  lerp,
  lerp2,
  map,
  mapc,
  wave,
  deg2rad,
  rad2deg,
  colRectRect,
  overlapRectRect,
  colLineLine,
  colRectLine,
  colRectPt,
  vec2FromAngle,
  isVec2,
  isVec3,
  isColor,
  isMat4,
};
