import { mat4, vec3 } from "gl-matrix";

// camera
import {
  cubeVertexArray,
  cubeVertexCount,
  triangleVertexCount,
  triangleVertexArray,
} from "./data";

// TODO:

var GPUBufferUsage = window.GPUBufferUsage;

// `Module 4: Objects ===`;
const wgslShaders = {
  vertex: `
  [[block]] struct Uniforms {
    modelViewProjectionMatrix : mat4x4<f32>;
  };

  [[binding(0), group(0)]] var<uniform> uniforms : Uniforms;

  struct VertexOutput {
    [[builtin(position)]] Position : vec4<f32>;
    [[location(0)]] fragColor : vec4<f32>;
  };

  [[stage(vertex)]]
  fn main([[location(0)]] position : vec4<f32>,
          [[location(1)]] color : vec4<f32>) -> VertexOutput {
    return VertexOutput(uniforms.modelViewProjectionMatrix * position, color);
  }
  `,
  fragment: `
  [[stage(fragment)]]
  fn main([[location(0)]] fragColor : vec4<f32>) -> [[location(0)]] vec4<f32> {
    return fragColor;
  }
  `,
};

const positionOffset = 0;
const colorOffset = 4 * 4; // Byte offset of object color attribute.
const vertexSize = 4 * 10; // Byte size of one object.

export function RenderObject(
  device,
  verticesArray,
  vertexCount,
  parameter = { x: 0, y: 0, z: 0, rotX: 0, rotY: 0, rotZ: 0 }
) {
  this.device = device;

  this.x = parameter.x || 0;
  this.y = parameter.y || 0;
  this.z = parameter.z || 0;

  this.rotX = parameter.rotX || 0;
  this.rotY = parameter.rotY || 0;
  this.rotZ = parameter.rotZ || 0;

  this.matrixSize = 4 * 16; // 4x4 matrix
  this.offset = 256; // uniformBindGroup offset must be 256-byte aligned
  this.uniformBufferSize = this.offset + this.matrixSize;

  this.modelViewProjectionMatrix = mat4.create();

  // CONSTRUCTOR
  this.vertexCount = vertexCount;
  this.renderPipeline = device.createRenderPipeline({
    vertex: {
      module: device.createShaderModule({
        code: wgslShaders.vertex,
      }),
      entryPoint: "main",
      buffers: [
        {
          arrayStride: vertexSize,
          attributes: [
            {
              // position
              shaderLocation: 0,
              offset: positionOffset,
              format: "float32x4",
            },
            {
              // color
              shaderLocation: 1,
              offset: colorOffset,
              format: "float32x4",
            },
          ],
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({
        code: wgslShaders.fragment,
      }),
      entryPoint: "main",
      targets: [
        {
          format: "bgra8unorm",
        },
      ],
    },
    primitive: {
      topology: "triangle-list",
      cullMode: "back",
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: "less",
      format: "depth24plus-stencil8",
    },
  });

  this.uniformBuffer = device.createBuffer({
    size: this.uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  this.uniformBindGroup = device.createBindGroup({
    layout: this.renderPipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: {
          buffer: this.uniformBuffer,
          offset: 0,
          size: this.matrixSize,
        },
      },
    ],
  });

  this.verticesBuffer = device.createBuffer({
    size: verticesArray.byteLength,
    usage: GPUBufferUsage.VERTEX,
    mappedAtCreation: true,
  });
  new Float32Array(this.verticesBuffer.getMappedRange()).set(verticesArray);
  this.verticesBuffer.unmap();

  this.setTransformation(parameter);
}

export function cube(device, parameter) {
  return new RenderObject(device, cubeVertexArray, cubeVertexCount, parameter);
}

export function pyramid(device, parameter) {
  return new RenderObject(
    device,
    triangleVertexArray,
    triangleVertexCount,
    parameter
  );
}

RenderObject.prototype.draw = function (passEncoder, device, camera) {
  this.updateTransformationMatrix(camera.getCameraViewProjMatrix());

  passEncoder.setPipeline(this.renderPipeline);
  device.queue.writeBuffer(
    this.uniformBuffer,
    0,
    this.modelViewProjectionMatrix.buffer,
    this.modelViewProjectionMatrix.byteOffset,
    this.modelViewProjectionMatrix.byteLength
  );
  passEncoder.setVertexBuffer(0, this.verticesBuffer);
  passEncoder.setBindGroup(0, this.uniformBindGroup);
  passEncoder.draw(this.vertexCount, 1, 0, 0);
};

// Question: Why do we need this?
RenderObject.prototype.updateTransformationMatrix = function (
  cameraProjectionMatrix
) {
  // MOVE / TRANSLATE OBJECT
  const modelMatrix = mat4.create();
  mat4.translate(
    modelMatrix,
    modelMatrix,
    vec3.fromValues(this.x, this.y, this.z)
  );
  mat4.rotateX(modelMatrix, modelMatrix, this.rotX);
  mat4.rotateY(modelMatrix, modelMatrix, this.rotY);
  mat4.rotateZ(modelMatrix, modelMatrix, this.rotZ);

  // PROJECT ON CAMERA
  mat4.multiply(
    this.modelViewProjectionMatrix,
    cameraProjectionMatrix,
    modelMatrix
  );
};

// Question: Why do we need this?
RenderObject.prototype.setTransformation = function (parameter) {
  if (parameter == null) {
    return;
  }

  this.x = parameter.x ? parameter.x : 0;
  this.y = parameter.y ? parameter.y : 0;
  this.z = parameter.z ? parameter.z : 0;

  this.rotX = parameter.rotX ? parameter.rotX : 0;
  this.rotY = parameter.rotY ? parameter.rotY : 0;
  this.rotZ = parameter.rotZ ? parameter.rotZ : 0;
};
