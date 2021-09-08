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
// uncomment this to see the error message
// attribute vec3 a_poss;
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
    // Step 1: Create Vertex and Fragment shaders
    // gl.createShader returns a creates an empty shader object of type WebGLShader
    // A shader object is used to maintain the source code strings that define a gl.shaderType indicates
    // the type of shader to be created.
    // Two types of shaders are supported.
    // 1. A shader of type VERTEX_SHADER is a shader that is intended to run on the programmable vertex processor.
    // 2. A shader of type FRAGMENT_SHADER is a shader that is intended to run on the programmable fragment processor.
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

    // Step 2: Attach source code to shaders
    // gl.shaderSource - Resets the source code in a shader object
    // Parameter (2)
    // shader (object): Specifies the handle of the shader object whose source code is to be replaced.
    // code   (string): Specifies the source code to be loaded into the shader.
    gl.shaderSource(vertShader, vcode);
    gl.shaderSource(fragShader, fcode);

    // Step 3: Compile shaders
    // https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glCompileShader.xml
    // gl.compileShader
    // - compiles the source code strings that have been stored in the shader object specified by shader.
    gl.compileShader(vertShader);
    gl.compileShader(fragShader);

    window.vertShader = vertShader;
    window.fragShader = fragShader;

    // Step 4: Check for Compilation Errors
    // gl.getShaderInfoLog — return the information log for a shader object
    // Parameters (1)
    // shader - Specifies the shader object whose information log is to be queried.
    // When a shader object is created, its information log will be a string of length 0.
    // aka if there is anything wrong with our shaders, this function will capture and throw it
    // https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glGetShaderInfoLog.xml
    if ((msg = gl.getShaderInfoLog(vertShader))) {
      window.vertError = msg;
      throw new Error(msg);
    }

    if ((msg = gl.getShaderInfoLog(fragShader))) {
      window.fragError = msg;
      throw new Error(msg);
    }
    // Exercise
    // To see the error in action,  try modifying either VERTEX_TEMPLATE or FRAGMENT_TEMPLATE defined above
    // and try to see what the content of window.vertError or window.fragError looks like

    // Example A: Vertex Error: vertError
    // In line 28 if i change "attribute vec3 a_pos" to "attribute vec3 a_poss", I will get this error, if I type
    // window.vertError on the console
    // "ERROR: 0:11: 'a_pos' : undeclared identifier\nERROR: 0:11: 'constructor' : not enough data
    // provided for construction\nERROR: 0: 21: 'a_pos' : undeclared identifier\nERROR: 0: 21: 'vert' :
    // no matching overloaded function found\nERROR: 0: 21: '=' : dimension mismatch\nERROR: 0: 21: '=' :
    // cannot convert from 'const mediump float' to 'highp 4-component vector of float'\nERROR: 0: 22: 'a_pos' :
    // undeclared identifier\nERROR: 0: 22: '=' : di

    // Example B: Fragment Error: Left as exercise
    // => window.fragError

    // If we have reached this, this means that following things have happened
    // 0. We have written our vertex and fragment code using glsl language
    // 1. We have created vertex and fragment shaders (createShader)
    // 2. We have added vertex and fragment code to our newly created shaders
    // 3. We have compiled our vertex and fragment source glsl source code that has been stored in the shader object
    // 4. In case of any complication bug, we thrown the error

    // 5. Finally we are ready to create the program
    // We can use createProgram method to create a new program.
    // A program object is an object to which shader objects can be attached.
    // This provides a mechanism to specify the shader objects that will be linked to
    // create a program. It also provides a means for checking the compatibility of the shaders
    // that will be used to create a program (for instance, checking the compatibility between a
    // vertex shader and a fragment shader). When no longer needed as part of a program object,
    // shader objects can be detached.
    const id = gl.createProgram();

    // 6. Attach Shaders
    // Once we have created our program, we have to tell the program more about our code
    // Before we can start using our shaders in our program, we first have to attach our shaders
    // This can be done with attachShader method
    // gl.attachShader — attach a shader object to a program object
    // Parameters
    // program - Specifies the program object to which a shader object will be attached.
    // shader  - Specifies the shader object that is to be attached.

    // Desc:
    // In order to create an executable, there must be a way to specify the list of things that
    // will be linked together. Program objects provide this mechanism.Shaders that are to be linked
    // together in a program object must first be attached to that program gl.attachShader attaches
    // the shader object specified by shader to the program object specified by program.
    // This indicates that shader will be included in link operations that will be performed on program.
    // Once we are done with this step we need to specify
    // https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glAttachShader.xml
    gl.attachShader(id, vertShader);
    gl.attachShader(id, fragShader);

    // 7. Associate Vertex attriute with index
    // Once we have attached the shaders
    // We need to tell the map attribute index with one of the named attribube: "a_pos", "a_uv", "a_color"
    // defined vertex source code
    // gl.bindAttribLocation is used to associate a user-defined attribute variable in the program object
    // specified by program with a generic vertex attribute index.
    // This is how the program knows which data to look at which location. Since we will be sending data in
    // buffers(discussed later)
    // https://www.khronos.org/registry/OpenGL-Refpages/es2.0/xhtml/glBindAttribLocation.xml
    gl.bindAttribLocation(id, 0, "a_pos");
    gl.bindAttribLocation(id, 1, "a_uv");
    gl.bindAttribLocation(id, 2, "a_color");

    // 8. Link the program
    // Once we have mapped our custom attributes
    // glLinkProgram links the program object specified by program.
    // - If any shader objects of type VERTEX_SHADER are attached to program, they will be
    //   used to create an executable that will run on the programmable vertex processor.
    // - If any shader objects of type FRAGMENT_SHADER are attached to program, they will be used to create an
    //   executable that will run on the programmable fragment processor.
    // https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/glLinkProgram.xhtml
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
    // Step 1: Create a WebGLTexture
    // Returns a WebGLTexture object to which images can be bound to.
    const id = gl.createTexture();

    // Step 2: Bind the texture to TEXTURE_2D
    // bind a named texture to a texturing target with target set to TEXTURE_2D
    gl.bindTexture(gl.TEXTURE_2D, id);

    // window.imageElement = data;

    // Step 3: specify a two-dimensional texture image
    // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texImage2D
    // Parameters (6)
    // 1. target - specifies the binding point (target) of the active texture: TEXTURE_2D in this case
    // 2. level - number specifying level of detail: gl.RGBA = 6408
    // 3. internalFormat - specified color format in the texture: gl.RGBA = 6408
    // 4. type - specifying the data type of the texel data: gl.UNSIGNED_BYTE = 5121
    // 5. data - HTMLImageElement
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);

    // Step 4: Set Parameters
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

    // Step 5: Unbind the texture
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

    window.iqueue = gfx.iqueue.slice();
    window.vqueue = gfx.vqueue.slice();

    // What happens if you dont flush
    // comment it out and see what happens
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
      // Texture change in action ====
      window.tex = tex;
      window.curTex = gfx.curTex;
      console.log("tex !== gfx.curTex", tex !== gfx.curTex);
      console.log("GETS CALLED");

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
          pt.x, // change this to v.pos.x
          pt.y, // and this to v.pos.y and see what happens on the screen
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

    pushTransform();
    pushTranslate(pos);
    pushRotateZ(rot);
    pushScale(scale);
    pushTranslate(offset);
    // pushTranslate({ x: 320, y: 240 });
    // pushTranslate({ x: 320, y: 140 });

    const input = {
      w,
      h,
      pos,
      origin,
      offset,
      scale,
      rot,
      q, // quad
      z,
      color,
    };

    window.drawQuadInput = input;

    function createVert({ pos, uv, color }) {
      return {
        pos: vec3(pos[0], pos[1], pos[2]),
        uv: vec2(uv[0], uv[1]),
        color: rgba(color[0], color[1], color[2], color[3]),
      };
    }

    const vertsOld = [
      {
        pos: vec3(-640 / 2, 480 / 2, z),
        uv: vec2(conf.flipX ? q.x + q.w : q.x, conf.flipY ? q.y : q.y + q.h),
        color: color,
      },
      {
        pos: vec3(-640 / 2, -480 / 2, z),
        uv: vec2(conf.flipX ? q.x + q.w : q.x, conf.flipY ? q.y + q.h : q.y),
        color: color,
      },
      {
        pos: vec3(640 / 2, -480 / 2, z),
        uv: vec2(conf.flipX ? q.x : q.x + q.w, conf.flipY ? q.y + q.h : q.y),
        color: color,
      },
      {
        pos: vec3(640 / 2, 480 / 2, z),
        uv: vec2(conf.flipX ? q.x : q.x + q.w, conf.flipY ? q.y : q.y + q.h),
        color: color,
      },
    ];
    const verts = [
      // Bottom Left
      createVert({
        pos: [-640 / 2, 480 / 2, z],
        uv: [conf.flipX ? q.x + q.w : q.x, conf.flipY ? q.y : q.y + q.h],
        color: [1, 1, 1, 1],
      }),
      // Top Left
      createVert({
        pos: [-640 / 2, -480 / 2, z],
        uv: [conf.flipX ? q.x + q.w : q.x, conf.flipY ? q.y + q.h : q.y],
        color: [1, 1, 1, 1],
      }),
      // Top Right
      createVert({
        pos: [640 / 2, -480 / 2, z],
        uv: [conf.flipX ? q.x : q.x + q.w, conf.flipY ? q.y + q.h : q.y],
        color: [1, 1, 1, 1],
      }),
      // Bottom Right
      createVert({
        pos: [640 / 2, 480 / 2, z],
        uv: [conf.flipX ? q.x : q.x + q.w, conf.flipY ? q.y : q.y + q.h],
        color: [1, 1, 1, 1],
      }),
    ];

    const indices = [0, 1, 3, 1, 2, 3];

    const drawRawInput = {
      verts,
      indices,
    };

    window.drawRawInput = drawRawInput;

    drawRaw(verts, indices, conf.tex, conf.prog, conf.uniform);

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

  // window.width = width;
  // window.height = height;

  const ctx = {
    // constants
    STRIDE,
    BG_GRID_SIZE,
    //
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

  for (const item in ctx) {
    window[item] = ctx[item];
  }

  return ctx;
}
