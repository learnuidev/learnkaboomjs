// math module
import {
  vec2,
  vec3,
  quad,
  // rgb,
  rgba,
  mat4,
  isVec2,
  isVec3,
  isColor,
  isMat4,
} from "../kaboomV6/math";
import * as math from "../kaboomV6/math";

import { deepEq } from "../kaboomV6/utils";

window.math = math;

// constants
const DEF_ORIGIN = "topleft";
const STRIDE = 9;
const QUEUE_COUNT = 65536;
const BG_GRID_SIZE = 64;

// uv = texture coordinate
const VERT_TEMPLATE = `
attribute vec3 a_pos;
attribute vec2 a_uv;
attribute vec4 a_color;

varying vec3 v_pos;
varying vec2 v_uv;
varying vec4 v_color;

vec4 def_vert() {
	return vec4(a_pos, 1.0);
}

{{user}}

void main() {
	vec4 pos = vert(a_pos, a_uv, a_color);
	v_pos = a_pos;
	v_uv = a_uv;
	v_color = a_color;
	gl_Position = pos;
}
`;

const FRAG_TEMPLATE = `
precision mediump float;

varying vec3 v_pos;
varying vec2 v_uv;
varying vec4 v_color;

uniform sampler2D u_tex;

vec4 def_frag() {
	return v_color * texture2D(u_tex, v_uv);
}

{{user}}

void main() {
	gl_FragColor = frag(v_pos, v_uv, v_color, u_tex);
	if (gl_FragColor.a == 0.0) {
		discard;
	}
}
`;

const DEF_VERT = `
vec4 vert(vec3 pos, vec2 uv, vec4 color) {
	return def_vert();
}
`;

const DEF_FRAG = `
vec4 frag(vec3 pos, vec2 uv, vec4 color, sampler2D tex) {
	return def_frag();
}
`;

// Helpers
function powerOfTwo(n) {
  return (Math.log(n) / Math.log(2)) % 1 === 0;
}

function originPt(orig) {
  switch (orig) {
    case "topleft":
      return vec2(-1, -1);
    case "top":
      return vec2(0, -1);
    case "topright":
      return vec2(1, -1);
    case "left":
      return vec2(-1, 0);
    case "center":
      return vec2(0, 0);
    case "right":
      return vec2(1, 0);
    case "botleft":
      return vec2(-1, 1);
    case "bot":
      return vec2(0, 1);
    case "botright":
      return vec2(1, 1);
    default:
      return orig;
  }
}

export default function gfxInit(gconf) {
  // webgl context
  const gl = gconf.canvas.getContext("webgl", {
    antialias: true,
    depth: true,
    stencil: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  console.log("gl", gl);
  window.gl = gl;

  const texFilter = (() => {
    switch (gconf.texFilter) {
      case "linear":
        return gl.LINEAR;
      case "nearest":
        return gl.NEAREST;
      default:
        return gl.NEAREST;
    }
  })();

  // Lesson 1.1

  function createShader(type, code) {
    let msg;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, code);
    gl.compileShader(shader);

    if ((msg = gl.getShaderInfoLog(shader))) {
      throw new Error(msg);
    }

    if ((msg = gl.getShaderInfoLog(shader))) {
      throw new Error(msg);
    }

    return shader;
  }

  function makeProgram(vertSrc = DEF_VERT, fragSrc = DEF_FRAG) {
    let msg;
    const vcode = VERT_TEMPLATE.replace("{{user}}", vertSrc || DEF_VERT);
    const fcode = FRAG_TEMPLATE.replace("{{user}}", fragSrc || DEF_FRAG);
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    window.vertShader = vertShader;
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertShader, vcode);
    gl.shaderSource(fragShader, fcode);
    gl.compileShader(vertShader);
    gl.compileShader(fragShader);

    if ((msg = gl.getShaderInfoLog(vertShader))) {
      throw new Error(msg);
    }

    if ((msg = gl.getShaderInfoLog(fragShader))) {
      throw new Error(msg);
    }

    const id = gl.createProgram();

    gl.attachShader(id, vertShader);
    gl.attachShader(id, fragShader);

    gl.bindAttribLocation(id, 0, "a_pos");
    gl.bindAttribLocation(id, 1, "a_uv");
    gl.bindAttribLocation(id, 2, "a_color");

    gl.linkProgram(id);

    if ((msg = gl.getProgramInfoLog(id))) {
      // for some reason on safari it always has a "\n" msg
      if (msg !== "\n") {
        throw new Error(msg);
      }
    }

    return {
      // 2. gets used in flush before this.bindAttribs()
      // it is also used in send method below
      bind() {
        gl.useProgram(id);
      },

      // 3. gets called in flush function
      // it is also used in send method below
      unbind() {
        gl.useProgram(null);
      },

      // 3. gets used in flush after this.bind()
      bindAttribs() {
        // TODO: test this
        // var texcoordLocation = gl.getAttribLocation(id, "a_uv");
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, STRIDE * 4, 0);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, STRIDE * 4, 12);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, STRIDE * 4, 20);
        gl.enableVertexAttribArray(2);
      },

      // uniform is {}
      // 1. gets called first in flush function
      send(uniform) {
        this.bind();
        // TODO: slow for vec2
        for (const name in uniform) {
          const val = uniform[name];
          const loc = gl.getUniformLocation(id, name);
          // It handles 5 Data types
          if (typeof val === "number") {
            // 1. if the value is number then we call .uniform1f
            gl.uniform1f(loc, val);
          } else if (isMat4(val)) {
            // 2. if the value is mat4 then we call .uniformMatrix4fv
            gl.uniformMatrix4fv(loc, false, new Float32Array(val.m));
          } else if (isColor(val)) {
            // 3. if the value is color then we call .uniform4f
            gl.uniform4f(loc, val.r, val.g, val.b, val.a);
          } else if (isVec3(val)) {
            // 4. if the value is vec3 then we call .uniform3f
            gl.uniform3f(loc, val.x, val.y, val.z);
          } else if (isVec2(val)) {
            // 5. if the value is vec2 then we call .uniform2f
            gl.uniform2f(loc, val.x, val.y);
          }
        }
        this.unbind();
      },
    };
  }

  // Lesson 1.2
  // data => ImageData
  function makeTex(data) {
    const id = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, id);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texFilter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texFilter);

    // TODO
    const wrap = (() => {
      if (powerOfTwo(data.width) && powerOfTwo(data.height)) {
        // repeats texture in certain direction
        return gl.REPEAT;
      } else {
        // https://webglfundamentals.org/webgl/lessons/webgl-3d-textures.html
        // You can tell WebGL to not repeat the texture in a certain direction by using CLAMP_TO_EDGE
        return gl.CLAMP_TO_EDGE;
      }
    })();

    // TEXTURE_MIN_FILTER is the setting used when the size you are drawing is smaller
    // than the largest mip.TEXTURE_MAG_FILTER is the setting used when the size you are
    // drawing is larger than the largest mip.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return {
      width: data.width,
      height: data.height,
      // gets called in flush function
      bind() {
        gl.bindTexture(gl.TEXTURE_2D, id);
      },
      // gets called in flush function
      unbind() {
        gl.bindTexture(gl.TEXTURE_2D, null);
      },
    };
  }

  // Lesson 1: Initialize GFX
  const gfx = (() => {
    const defProg = makeProgram(DEF_VERT, DEF_FRAG);
    const emptyTex = makeTex(
      new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1)
    );

    const c = gconf.clearColor ?? rgba(0, 0, 0, 1);

    gl.clearColor(c.r, c.g, c.b, c.a);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(
      gl.SRC_ALPHA,
      gl.ONE_MINUS_SRC_ALPHA,
      gl.ONE,
      gl.ONE_MINUS_SRC_ALPHA
    );

    const vbuf = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.bufferData(gl.ARRAY_BUFFER, QUEUE_COUNT * 4, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    const ibuf = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, QUEUE_COUNT * 2, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // prettier-ignore
    const bgTex = makeTex(
      new ImageData(
        new Uint8ClampedArray([
          128, 128, 128, 255,
          190, 190, 190, 255,
          190, 190, 190, 255,
          128, 128, 128, 255,
        ]),
        2,
        2
      )
    );

    return {
      drawCalls: 0,
      lastDrawCalls: 0,
      defProg: defProg,
      curProg: defProg,
      defTex: emptyTex,
      curTex: emptyTex,
      curUniform: {},
      vbuf: vbuf,
      ibuf: ibuf,
      vqueue: [],
      iqueue: [],
      transform: mat4(),
      transformStack: [],
      clearColor: c,
      bgTex: bgTex,
    };
  })();

  // Lesson 2: Frame LifeCycle
  frameStart();
  frameEnd();

  // Lesson 2: Frame Start / Frame End / Flush / drawQuad / width / height / scale
  // get current canvas width
  function width() {
    return gl.drawingBufferWidth / scale();
  }

  // get current canvas height
  function height() {
    return gl.drawingBufferHeight / scale();
  }

  function scale() {
    return gconf.scale ?? 1;
  }

  // NDC
  function toNDC(pt) {
    return vec2((pt.x / width()) * 2 - 1, (-pt.y / height()) * 2 + 1);
  }

  // Push Transformations
  function pushMatrix(m) {
    gfx.transform = m.clone();
  }

  function pushTranslate(p) {
    if (!p || (p.x === 0 && p.y === 0)) {
      return;
    }
    gfx.transform = gfx.transform.translate(p);
  }

  function pushScale(p) {
    if (!p || (p.x === 1 && p.y === 1)) {
      return;
    }
    const scaled = gfx.transform.scale(p);
    window.pushScaled = scaled;
    gfx.transform = scaled;
  }

  function pushRotateZ(a) {
    if (!a) {
      return;
    }
    gfx.transform = gfx.transform.rotateZ(a);
  }

  function pushTransform() {
    gfx.transformStack.push(gfx.transform.clone());
  }

  function popTransform() {
    if (gfx.transformStack.length > 0) {
      gfx.transform = gfx.transformStack.pop();
    }
  }

  // Flush
  function flush() {
    if (
      !gfx.curTex ||
      !gfx.curProg ||
      gfx.vqueue.length === 0 ||
      gfx.iqueue.length === 0
    ) {
      return;
    }

    window.gfx = gfx;

    gfx.curProg.send(gfx.curUniform);

    gl.bindBuffer(gl.ARRAY_BUFFER, gfx.vbuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(gfx.vqueue));

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gfx.ibuf);
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, new Uint16Array(gfx.iqueue));

    gfx.curProg.bind();
    gfx.curProg.bindAttribs();
    gfx.curTex.bind();
    gl.drawElements(gl.TRIANGLES, gfx.iqueue.length, gl.UNSIGNED_SHORT, 0);
    gfx.curTex.unbind();
    gfx.curProg.unbind();
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    gfx.iqueue = [];
    gfx.vqueue = [];

    gfx.drawCalls++;
  }

  // ========= Draw Functions ==========

  // Draw Raw
  function drawRaw(
    verts,
    indices,
    tex = gfx.defTex,
    prog = gfx.defProg,
    uniform = {}
  ) {
    tex = tex ?? gfx.defTex;
    prog = prog ?? gfx.defProg;

    // flush on texture / shader change and overflow
    if (
      tex !== gfx.curTex ||
      prog !== gfx.curProg ||
      !deepEq(gfx.curUniform, uniform) ||
      gfx.vqueue.length + verts.length * STRIDE > QUEUE_COUNT ||
      gfx.iqueue.length + indices.length > QUEUE_COUNT
    ) {
      flush();
    }

    gfx.curTex = tex;
    gfx.curProg = prog;
    gfx.curUniform = uniform;

    const nIndices = indices.map((i) => {
      return i + gfx.vqueue.length / STRIDE;
    });

    const nVerts = verts
      .map((v) => {
        const pt = toNDC(gfx.transform.multVec2(v.pos.xy()));
        return [
          pt.x,
          pt.y,
          v.pos.z,
          v.uv.x,
          v.uv.y,
          v.color.r,
          v.color.g,
          v.color.b,
          v.color.a,
        ];
      })
      .flat();

    nIndices.forEach((i) => gfx.iqueue.push(i));
    nVerts.forEach((v) => gfx.vqueue.push(v));
  }

  // Draw Quad
  function drawQuad(conf = {}) {
    const w = conf.width || 0;
    const h = conf.height || 0;
    const pos = conf.pos || vec2(0, 0);
    const origin = originPt(conf.origin || DEF_ORIGIN);
    const offset = origin.scale(vec2(w, h).scale(-0.5));
    const scale = vec2(conf.scale ?? 1);

    const rot = conf.rot || 0;
    const q = conf.quad || quad(0, 0, 1, 1);
    const z = 1 - (conf.z ?? 0);
    const color = conf.color || rgba(1, 1, 1, 1);
    const input = {
      w,
      h,
      pos,
      origin,
      offset,
      scale,
      rot,
      q,
      z,
      color,
    };

    window.drawQuadInput = input;

    pushTransform();
    pushTranslate(pos);
    pushRotateZ(rot);
    pushScale(scale);
    pushTranslate(offset);

    drawRaw(
      [
        {
          pos: vec3(-w / 2, h / 2, z),
          uv: vec2(conf.flipX ? q.x + q.w : q.x, conf.flipY ? q.y : q.y + q.h),
          color: color,
        },
        {
          pos: vec3(-w / 2, -h / 2, z),
          uv: vec2(conf.flipX ? q.x + q.w : q.x, conf.flipY ? q.y + q.h : q.y),
          color: color,
        },
        {
          pos: vec3(w / 2, -h / 2, z),
          uv: vec2(conf.flipX ? q.x : q.x + q.w, conf.flipY ? q.y + q.h : q.y),
          color: color,
        },
        {
          pos: vec3(w / 2, h / 2, z),
          uv: vec2(conf.flipX ? q.x : q.x + q.w, conf.flipY ? q.y : q.y + q.h),
          color: color,
        },
      ],
      [0, 1, 3, 1, 2, 3],
      conf.tex,
      conf.prog,
      conf.uniform
    );

    popTransform();
  }

  function frameStart() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (!gconf.clearColor) {
      const opts = {
        width: width(),
        height: height(),
        quad: quad(
          0,
          0,
          (width() * scale()) / BG_GRID_SIZE,
          (height() * scale()) / BG_GRID_SIZE
        ),
        tex: gfx.bgTex,
      };
      window.opts = opts;
      drawQuad(opts);
    }

    gfx.drawCalls = 0;
    gfx.transformStack = [];
    gfx.transform = mat4();
  }

  function frameEnd() {
    flush();
    gfx.lastDrawCalls = gfx.drawCalls;
  }

  return {
    width,
    height,
    scale,
    makeTex,
    makeProgram,
    //  makeFont,
    //  drawTexture,
    //  drawText,
    //  drawFmtText,
    //  drawRect,
    //  drawRectStroke,
    //  drawLine,
    //  drawTri,
    //  fmtText,
    frameStart,
    frameEnd,
    pushTransform,
    popTransform,
    pushMatrix,
    //  drawCalls,
    //  clearColor,
  };
}
