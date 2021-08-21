var GPUTextureUsage = window.GPUTextureUsage;

// `Module 5: WebGPU Renderer ===`;

export function WebGPURenderer() {
  this.swapChainFormat = "bgra8unorm";
  this.initSuccess = false;
}

// DONE

WebGPURenderer.prototype.init = async function (canvas) {
  if (!canvas) {
    console.log("missing canvas!");
    return false;
  }

  const adapter = await navigator.gpu.requestAdapter();
  this.device = await adapter.requestDevice();

  if (!this.device) {
    console.log("found no gpu device!");
    return false;
  }

  this.context = canvas.getContext("webgpu");

  this.presentationFormat = this.context.getPreferredFormat(adapter);
  this.presentationSize = [
    canvas.clientWidth * devicePixelRatio,
    canvas.clientHeight * devicePixelRatio,
  ];

  this.context.configure({
    device: this.device,
    format: this.presentationFormat,
    size: this.presentationSize,
  });
  const depthTextureView = this.depthTextureView();
  this.renderPassDescriptor = {
    colorAttachments: [
      {
        // attachment is acquired and set in render loop.
        view: undefined,
        loadValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
      },
    ],
    depthStencilAttachment: {
      view: depthTextureView,

      depthLoadValue: 1.0,
      depthStoreOp: "store",
      stencilLoadValue: 0,
      stencilStoreOp: "store",
    },
  };

  this.initSuccess = true;
  return this.device;
};

// DONE
WebGPURenderer.prototype.update = function (canvas) {
  if (!this.initSuccess) {
    return;
  }

  this.updateRenderPassDescriptor(canvas);
};

// DONE
WebGPURenderer.prototype.frame = function (camera, scene) {
  if (!this.initSuccess) {
    return;
  }

  this.renderPassDescriptor.colorAttachments[0].view = this.context
    .getCurrentTexture()
    .createView();

  const commandEncoder = this.device.createCommandEncoder();
  const passEncoder = commandEncoder.beginRenderPass(this.renderPassDescriptor);

  for (let object of scene.getObjects()) {
    object.draw(passEncoder, this.device, camera);
  }

  passEncoder.endPass();
  this.device.queue.submit([commandEncoder.finish()]);
};

// DONE
WebGPURenderer.prototype.depthTextureView = function () {
  return this.device
    .createTexture({
      size: this.presentationSize,
      format: "depth24plus-stencil8",
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    })
    .createView();
};

// DONE
WebGPURenderer.prototype.updateRenderPassDescriptor = function () {
  this.renderPassDescriptor.depthStencilAttachment.view =
    this.depthTextureView();
};
