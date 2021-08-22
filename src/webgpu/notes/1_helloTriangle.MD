## Step 1: GPUAdapter

```js

const adapter = await navigator.gpu.requestAdapter()

// adapter
{
  // Props
  requestDevice: () => `Requests a device from the adapter.`
  name: "Default",
  features: { size: 2 }, // GPUSupportedFeatures
  isFallbackAdapter: false,
  isSoftware: false,
  limits: {              //  GPUSupportedLimits
    maxBindGroups: 4,
    maxComputeInvocationsPerWorkgroup: 256,
    maxComputeWorkgroupSizeX: 256,
    maxComputeWorkgroupSizeY: 256,
    maxComputeWorkgroupSizeZ: 64,
    maxComputeWorkgroupStorageSize: 16352,
    maxComputeWorkgroupsPerDimension: 65535,
    maxDynamicStorageBuffersPerPipelineLayout: 4,
    maxDynamicUniformBuffersPerPipelineLayout: 8,
    maxInterStageShaderComponents: 60,
    maxSampledTexturesPerShaderStage: 16,
    maxSamplersPerShaderStage: 16,
    maxStorageBufferBindingSize: 134217728,
    maxStorageBuffersPerShaderStage: 4,
    maxStorageTexturesPerShaderStage: 4,
    maxTextureArrayLayers: 2048,
    maxTextureDimension1D: 8192,
    maxTextureDimension2D: 8192,
    maxTextureDimension3D: 2048,
    maxUniformBufferBindingSize: 16384,
    maxUniformBuffersPerShaderStage: 12,
    maxVertexAttributes: 16,
    maxVertexBufferArrayStride: 2048,
    maxVertexBuffers: 8,
    minStorageBufferOffsetAlignment: 256,
    minUniformBufferOffsetAlignment: 256,
  },
};

```

## Step 2: GPUDevice

```js
const device = await adapter.requestDevice();

export const device = {
  adapter: adapter,
  features: { size: 0 }, // GPUSupportedFeatures
  label: null,
  limits: adapter.limits,
  lost: Promise, // {<pending>}
  onuncapturederror: null,
  queue: {
    // GPUQueue
    label: null,
    copyExternalImageToTexture: () => copyExternalImageToTexture(),
    copyImageBitmapToTexture: () => copyImageBitmapToTexture(),
    onSubmittedWorkDone: () => onSubmittedWorkDone(),
    submit: () => submit(),

    writeBuffer: () => `
    source:
    writeBuffer(buffer, bufferOffset, data, dataOffset, size)

    Issues a write operation of the provided data into a GPUBuffer.

    Called on: GPUQueue this.
    Arguments:

    Parameter	        Type	  Nullable	Optional
    -
    1. buffer	(GPUBuffer)
    - The buffer to write to.

    2. bufferOffset (GPUSize64)
    - Offset in bytes into buffer to begin writing at. aka a number

    3. data (BufferSource)
    - Data to write into buffer.

    4. dataOffset	(GPUSize64): Offset in into data to begin writing from. Given in elements if data is a TypedArray and bytes otherwise.
    5. size (GPUSize64) - optional: Size of content to write from data to buffer.  Given in elements if data is a TypedArray and bytes otherwise.

    // ================================= Detailed Example
    Example 1
    import { mat4 } from 'gl-matrix';

    // Step 0: Data
    matrixSize = 4 * 16; // 4x4 matrix
    offset = 256; // uniformBindGroup offset must be 256-byte aligned
    uniformBufferSize = offset + matrixSize;

    // Step 1: Create a buffer
    uniformBuffer = device.createBuffer({
      size: uniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // aside: GPUBufferUsage (10 properties)
    GPUBufferUsage = {
      MAP_READ: 1,
      MAP_WRITE: 2,
      COPY_SRC: 4,
      COPY_DST: 8,
      INDEX: 16,
      VERTEX: 32,
      UNIFORM: 64,
      STORAGE: 128,
      INDIRECT: 256,
      QUERY_RESOLVE: 512,
    };

    // Step 2: Create Model View Projection Matrix
    const modelViewProjectionMatrix = mat4.create(); // gl-matrix

    // Step 3: Apply
    device.queue.writeBuffer(
      uniformBuffer, // 1. buffer - The buffer to write to.
      0,  // 2. bufferOffset: Offset in bytes into buffer to begin writing at.
      modelViewProjectionMatrix.buffer, // data - Data to write into buffer.
      modelViewProjectionMatrix.byteOffset,
      modelViewProjectionMatrix.byteLength
    );

    
    `,
    writeTexture: () => writeTexture(),
  },
  // Methods (17)
  // 1. Bind Groups - 2
  createBindGroup: (
    props = {
      // pipeline = createRenderPipeline()
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: uniformBuffer,
          },
        },
        {
          binding: 1,
          resource: sampler,
        },
        {
          binding: 2,
          resource: cubeTexture.createView(),
        },
      ],
    }
  ) => this.createBindGroup(),
  createBindGroupLayout: () => this.createBindGroupLayout(),
  // 2. Buffer - 1
  createBuffer: (
    props = {
      size: (uniformBufferSize = 4 * 16), // 4x 4 matrix
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, // 64 | 8 => 72
    }
  ) => this.createBuffer(),
  // 3. Command Encoder - 1
  createCommandEncoder: () => this.createCommandEncoder(), // *
  // 4. Compute Pipeline - 2
  createComputePipeline: () => this.createComputePipeline(),
  createComputePipelineAsync: () => this.createComputePipelineAsync(),
  // 5. Pipeline Layout - 1
  createPipelineLayout: () => this.createPipelineLayout(),
  // 6. Query Set - 1
  createQuerySet: () => this.createQuerySet(),
  // 7. Bundle Encoder - 1
  createRenderBundleEncoder: () => this.createRenderBundleEncoder(),
  // 8. Render Pipeline - 2
  createRenderPipeline: (
    input = {
      vertex: {
        module: device.createShaderModule({
          code: `
          [[block]] struct Uniforms {
            modelViewProjectionMatrix : mat4x4<f32>;
          };
          [[binding(0), group(0)]] var<uniform> uniforms : Uniforms;

          struct VertexOutput {
            [[builtin(position)]] Position : vec4<f32>;
            [[location(0)]] fragUV : vec2<f32>;
            [[location(1)]] fragPosition: vec4<f32>;
          };

          [[stage(vertex)]]
          fn main([[location(0)]] position : vec4<f32>,
                  [[location(1)]] uv : vec2<f32>) -> VertexOutput {
            var output : VertexOutput;
            output.Position = uniforms.modelViewProjectionMatrix * position;
            output.fragUV = uv;
            output.fragPosition = 0.5 * (position + vec4<f32>(1.0, 1.0, 1.0, 1.0));
            return output;
          }
          `,
        }),
        entryPoint: "main",
        buffers: [
          {
            arrayStride: (cubeVertexSize = 4 * 10), // Byte size of one cube vertex.
            attributes: [
              {
                // position
                shaderLocation: 0,
                offset: (cubePositionOffset = 0),
                format: "float32x4",
              },
              {
                // uv
                shaderLocation: 1,
                offset: (cubeUVOffset = 4 * 8),
                format: "float32x2",
              },
            ],
          },
        ],
      },
      fragment: {
        module: device.createShaderModule({
          code: `
          [[group(0), binding(1)]] var mySampler: sampler;
          [[group(0), binding(2)]] var myTexture: texture_2d<f32>;

          [[stage(fragment)]]
          fn main([[location(0)]] fragUV: vec2<f32>,
                  [[location(1)]] fragPosition: vec4<f32>) -> [[location(0)]] vec4<f32> {
            return textureSample(myTexture, mySampler, fragUV) * fragPosition;
          }
          `,
        }),
        entryPoint: "main",
        targets: [
          {
            format: "bgraunorm",
          },
        ],
      },
      primitive: { topology: "triangle-list", cullMode: "back" },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth24plus",
      },
    }
  ) =>
    `Creates a GPURenderPipeline.
     - A GPURenderPipeline is a kind of pipeline that controls the vertex
       and fragment shader stages, and can be used in GPURenderPassEncoder
       as well as GPURenderBundleEncoder.
  `,
  createRenderPipelineAsync: () => this.createRenderPipelineAsync(),
  // 9. Sampler - 1
  createSampler: (
    props = {
      magFilter: "linear",
      minFilter: "linear",
    }
  ) => this.createSampler(),
  // 10. Shader Module - 1
  createShaderModule: () => `
   Creates a GPUShaderModule
   - It is a reference to an internal shader module object.
   - GPUShaderModule is Serializable. Serializable means that the reference can be
     copied between realms (threads/workers), allowing multiple realms
     to access it concurrently.
   - GPUShaderModule is immutable. Since GPUShaderModule is immutable, there are no race conditions.

  `,
  // 11. Texture - 2
  // depth texture
  createTexture: (
    props = {
      size: [
        canvas.clientWidth * (window.devicePixelRatio || 1),
        canvas.clientHeight * (window.devicePixelRatio || 1),
      ],
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT || 16,
    }
  ) => this.createTexture(),
  // Cube Texture
  createTexture: (
    props = {
      size: [imageBitmap.width, imageBitmap.height, 1],
      format: "rgba8unorm",
      // usage: 4 | 2 | 16 => 6 | 16 => 22
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    }
  ) => this.createTexture(),

  importExternalTexture: () => this.importExternalTexture(),
  // 12. Error - 2
  popErrorScope: () => this.popErrorScope(),
  pushErrorScope: () => this.pushErrorScope(),
};
```

### Step 3: Configure Swap Chain

```js
// Device Pixel Ratio, Presentation Format & Presentation Size
const devicePixelRatio = window.devicePixelRatio || 1;
=> 2

const presentationSize = [
    canvasRef.current.clientWidth * devicePixelRatio,
    canvasRef.current.clientHeight * devicePixelRatio,
];

const presentationFormat = context.getPreferredFormat(adapter);
// Ordinary format with four 8-bit normalized unsigned integer components in BGRA order. - https://developer.apple.com/documentation/metal/mtlpixelformat/bgra8unorm
=> 'bgra8unorm'


// swap chain is configured here
context.configure({
    device,
    format: presentationFormat,
    size: presentationSize,
});

```

### Step 4: Create Render Pipeline

```js
// Step 1: Get vertex and fragment shader code

const pipeline = device.createRenderPipeline({
  vertex: {
    module: device.createShaderModule({
      code: `
      [[stage(vertex)]]
      fn main([[builtin(vertex_index)]] VertexIndex : u32) -> [[builtin(position)]] vec4<f32> {
         var pos = array<vec2<f32>, 3>(
             vec2<f32>(0.0, 0.5),
             vec2<f32>(-0.5, -0.5),
             vec2<f32>(0.5, -0.5)
         );
         return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
      }
      
      `,
    }),
    entryPoint: "main",
  },
  fragment: {
    module: device.createShaderModule({
      code: `
      [[stage(fragment)]]
      fn main() -> [[location(0)]] vec4<f32> {
          return vec4<f32>(1.0, 0.0, 0.0, 1.0);
      }
      `,
    }),
    entryPoint: "main",
    targets: [
      {
        format: presentationFormat, // 'bgra8unorm'
      },
    ],
  },
  primitive: {
    topology: "triangle-list",
  },
});
```

### Step 5: Render Pass and Submit the work

```js
// Begins encoding a render pass described by descriptor.
const commandEncoder = device.createCommandEncoder();
const textureView = context.getCurrentTexture().createView();

const renderPassDescriptor: GPURenderPassDescriptor = {
  colorAttachments: [
    {
      view: textureView,
      loadValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
      storeOp: "store",
    },
  ],
};

const renderPassEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
renderPassEncoder.setPipeline(pipeline);
renderPassEncoder.draw(3, 1, 0, 0);
renderPassEncoder.endPass();

device.queue.submit([commandEncoder.finish()]);
```
