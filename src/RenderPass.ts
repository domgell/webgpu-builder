import {createColorAttachment, createDepthAttachment, DepthAttachmentMode} from "@domgell/webgpu-util";

export interface RenderPassBuilder {
    /**
     * Add a color attachment with an optional clear color.
     *
     * A RenderPass can have zero, one or many color attachments,
     * @param view
     * @param clear
     */
    color(view: GPUTextureView | GPUTexture, clear?: GPUColor): this,

    /**
     * Add a color attachment with full `GPURenderPassColorAttachment` options.
     *
     * A RenderPass can have zero, one or many color attachments,
     * @param view
     * @param options
     */
    color(view: GPUTextureView | GPUTexture, options: ColorAttachmentOptions): this,
    /**
     * Add a depth attachment with a `DepthAttachmentMode`.
     *
     * A RenderPass can have zero or one depth attachment.
     * @param view
     * @param mode
     */
    depth(view: GPUTextureView | GPUTexture, mode: DepthAttachmentMode): this & { depth: never },

    /**
     * Add a depth attachment with full `GPURenderPassDepthStencilAttachment` options.
     *
     * A RenderPass can have zero or one depth attachment.
     * @param view
     * @param options
     */
    depth(view: GPUTextureView | GPUTexture, options: DepthAttachmentOptions): this & { depth: never },
    /**
     * Create the `GPURenderPassEncoder` instance.
     * @param label
     */
    build(label?: string): GPURenderPassEncoder,
}

export type ColorAttachmentOptions = Omit<GPURenderPassColorAttachment, "view">

export type DepthAttachmentOptions = Omit<GPURenderPassDepthStencilAttachment, "view">

/**
 * Builder-style `GPURenderPassEncoder` creation.
 *
 * Example:
 * ```ts
 * const renderPass = buildRenderPass(commandEncoder)
 *    .color(colorView, [0.65, 0.65, 0.65, 1.0])
 *    .color(normalView, [0, 0, 0, 1])
 *    .depth(depthTextureView, "clear")
 *    .build("RenderPass");
 * ```
 * @param commandEncoder
 */
export function buildRenderPass(commandEncoder: GPUCommandEncoder): RenderPassBuilder {
    const colorAttachments: GPURenderPassColorAttachment[] = [];
    let depthStencilAttachment: GPURenderPassDepthStencilAttachment;

    return {
        color(
            view: GPUTextureView | GPUTexture,
            arg?: GPUColor | ColorAttachmentOptions
        ) {
            // `arg` is clear color
            if (arg === undefined || arg["loadOp"] === undefined) {
                const attachment = createColorAttachment(view, arg as GPUColor | undefined);
                colorAttachments.push(attachment);
            }
            // `arg` is options
            else {
                const attachment = {view, ...arg as ColorAttachmentOptions}
                colorAttachments.push(attachment);
            }

            return this
        },
        depth(
            view: GPUTextureView | GPUTexture,
            arg?: DepthAttachmentMode | DepthAttachmentOptions
        ) {
            // `arg` is mode
            if (arg === undefined || typeof arg === "string") {
                depthStencilAttachment = createDepthAttachment(view, arg as DepthAttachmentMode);
            }
            // `arg` is options
            else {
                depthStencilAttachment = {view, ...arg as DepthAttachmentOptions}
            }

            return this as any;
        },
        build(label) {
            return commandEncoder.beginRenderPass({
                label,
                colorAttachments,
                depthStencilAttachment,
            });
        },
    };
}