import {RenderPipelineCreateArgs, createRenderPipeline, createRenderPipelineAsync} from "@domgell/webgpu-util";

export interface RenderPipelineBuilder {
    /**
     * Set the shader source code.
     *
     * Assumes the shader source contains both the vertex and fragment shaders.
     *
     * Pipeline layout is automatically generated based on the shader code.
     * @param source
     */
    shader(source: string): this & { shader: never },
    /**
     * Add a color target state.
     *
     * Multiple color target states can be added.
     * @param target
     */
    color(target?: GPUColorTargetState): this,
    /**
     * Set the depth-stencil state.
     * @param state
     */
    depth(state?: GPUDepthStencilState): this & { depth: never },
    /**
     * Set the primitive state.
     * @param state
     */
    primitive(state: GPUPrimitiveState): this & { primitive: never },
    /**
     * Set the pipeline layout.
     *
     * If not set, the layout is automatically generated based on the shader code.
     * @param layout
     */
    layout(layout: GPUPipelineLayout): this & { layout: never },
    /**
     * Set pipeline override-constants.
     * @param values
     */
    constants(values: Record<string, number>): this & { constants: never },
    /**
     * Create the `GPURenderPipeline` instance.
     * @param label
     */
    build(this: { shader: never }, label?: string): GPURenderPipeline,
    /**
     * Asynchronously create the `GPURenderPipeline` instance with `device.createRenderPipelineAsync`.
     * @param label
     */
    buildAsync(this: { shader: never }, label?: string): Promise<GPURenderPipeline>,
}

/**
 * Builder-style `GPURenderPipeline` creation.
 *
 * Example:
 * ```ts
 * const pipeline = buildRenderPipeline(device)
 *    .shader(shaderSource)
 *    .color({format: "rgba8unorm"})
 *    .primitive({topology: "triangle-list"})
 *    .build("MyRenderPipeline");
 * ```
 * @param device
 */
export function buildRenderPipeline(device: GPUDevice): RenderPipelineBuilder {
    const args = {} as RenderPipelineCreateArgs;

    return {
        shader(source) {
            args.shader = source;
            return this as any;
        },
        color(target) {
            ((args.color ??= []) as Array<GPUColorTargetState | null>).push(target ?? null);
            return this as any;
        },
        depth(state) {
            args.depth = state;
            return this as any;
        },
        primitive(state) {
            args.primitive = state;
            return this as any;
        },
        layout(layout) {
            args.layout = layout;
            return this as any;
        },
        constants(values) {
            args.constants = values;
            return this as any;
        },
        build(label = "RenderPipeline") {
            args.label = label;
            return createRenderPipeline(device, args);
        },
        buildAsync(label = "RenderPipeline") {
            args.label = label;
            return createRenderPipelineAsync(device, args);
        },
    };
}
