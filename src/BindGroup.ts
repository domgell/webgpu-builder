import {assert} from "@domgell/ts-util";
import {BindGroupEntryResource, createBindGroup} from "@domgell/webgpu-util";

export interface BindGroupBuilder {
    /**
     * Set the `GPUBindGroupLayout` for the bind group.
     * @param layout
     */
    layout(layout: GPUBindGroupLayout): this & { layout: never },
    /**
     * Set the entries for the bind group.
     *
     * Each binding index is inferred from its array index.
     * @param entries
     */
    entries(...entries: BindGroupEntryResource[]): this & { entries: never },
    /**
     * Create the `GPUBindGroup` instance.
     * @param label
     */
    build(this: { layout: never, entries: never }, label?: string): GPUBindGroup,
}

/**
 * Builder-style `GPUBindGroup` creation.
 *
 * Example:
 * ```ts
 * const bindGroup = buildBindGroup(device)
 *    .layout(bindGroupLayout)
 *    .entries(cameraBuffer, meshBuffer)
 *    .build("MyBindGroup");
 * ```
 * @param device
 */
export function buildBindGroup(device: GPUDevice): BindGroupBuilder {
    let layout: GPUBindGroupLayout;
    let entries: BindGroupEntryResource[];

    return {
        layout(_layout) {
            assert(layout === undefined, "BindGroupLayout already set");
            layout = _layout;
            return this as any;
        },
        entries(..._entries) {
            assert(entries === undefined, "BindGroupEntries already set");
            entries = _entries;
            return this as any;
        },
        build(label = "BindGroup") {
            assert(layout !== undefined, "Must provide BindGroupLayout");
            return createBindGroup(device, {layout, entries, label});
        },
    };
}

