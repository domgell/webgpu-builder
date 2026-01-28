# Builder style creation of WebGPU objects

```ts
const cameraBuffer = buildBuffer(device)
    .usage("uniform", "copy-dst")
    .size(64)
    .build("CameraBuffer");

const screenTetxure = buildTexture(device)
    .usage("render-attachment", "texture-binding")
    .format("rgba8unorm")
    .size(800, 600)
    .build("ScreenTexture")

const layout = buildBindGroupLayout(device)
    .uniform()
    .texture()
    .build()

const bindGroup = buildBindGroup(device)
    .entries(cameraBuffer, screenTexture)
    .layout(layout)
    .build()
```

## Supported WebGPU object builders
* BindGroup
* BindGroupLayout
* Buffer
* RenderPass
* RenderPipeline
* Sampler
* Texture

## Installation
```
npm i @domgell/webgpu-builder
```
