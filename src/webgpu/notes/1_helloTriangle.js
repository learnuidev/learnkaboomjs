// GPU Buffer Usage
export const GPUBufferUsage = {
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

// 0. Canvas & Context
var canvas = document.createElement("canvas");
var context = canvas.getContext("webgpu");

// 1. GPUAdapter
export const adapter = {
  name: "Default",
  features: { size: 2 }, // GPUSupportedFeatures
  isFallbackAdapter: false,
  isSoftware: false,
  //  GPUSupportedLimits
  limits: {
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

// Step 2: Device
export const device = {
  adapter: adapter,
  // GPUSupportedFeatures
  features: { size: 0 },
  label: null,
  limits: adapter.limits,
  lost: Promise, // {<pending>}
  onuncapturederror: null,
  // GPUQueue
  queue: { label: null },
  // Methods (17)
  // Bind Groups - 2
  createBindGroup: () => this.createBindGroup(),
  createBindGroupLayout: () => this.createBindGroupLayout(),
  // Buffer - 1
  createBuffer: () => this.createBuffer(),
  // * Command Encoder - 1
  createCommandEncoder: () => this.createCommandEncoder(), // *
  // Compute Pipeline - 2
  createComputePipeline: () => this.createComputePipeline(),
  createComputePipelineAsync: () => this.createComputePipelineAsync(),
  // Pipeline Layout - 1
  createPipelineLayout: () => this.createPipelineLayout(),
  // Query Set - 1
  createQuerySet: () => this.createQuerySet(),
  // Bundle Encoder - 1
  createRenderBundleEncoder: () => this.createRenderBundleEncoder(),
  // Render Pipeline - 2
  createRenderPipeline: () => this.createRenderPipeline(), // *
  createRenderPipelineAsync: () => this.createRenderPipelineAsync(),
  // Sampler - 1
  createSampler: () => this.createSampler(),
  // Shader Module - 1
  createShaderModule: () => this.createShaderModule(), // *
  // Texture - 2
  createTexture: () => this.createTexture(),
  importExternalTexture: () => this.importExternalTexture(),
  // Error - 2
  popErrorScope: () => this.popErrorScope(),
  pushErrorScope: () => this.pushErrorScope(),
};

// 3. Swap Chain ===
// 3.1 Presentaion Size and Format
const devicePixelRatio = window.devicePixelRatio || 1;

const presentationSize = [
  canvas.clientWidth * devicePixelRatio,
  canvas.clientHeight * devicePixelRatio,
];

const presentationFormat = context.getPreferredFormat(adapter);

// 3.2 Configure swap chain
context.configure({
  device,
  format: presentationFormat,
});

// 4 pipeline
const pipeline = device.createRenderPipeline({
  vertex: {
    module: device.createShaderModule({
      code: ``,
    }),
    entryPoint: "main",
  },

  fragment: {
    module: device.createShaderModule({
      code: ``,
    }),
    entryPoint: "main",
    targets: [
      {
        format: presentationFormat,
      },
    ],
  },
  primitive: {
    topology: "triangle-list",
  },
});

// draw
const commandEncoder = device.createCommandEncoder();
const textureView = context.getCurrentTexture().createView();
// GPURenderPassDescriptor
const renderPassDescriptor = {
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
