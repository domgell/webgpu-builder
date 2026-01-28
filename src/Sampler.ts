export interface SamplerBuilder {
    /**
     * Sets both the min and mag filter mode to `filter`.
     * @param filter
     */
    filter(filter: GPUFilterMode): this & { filter: never },
    /**
     * Sets the min and mag filter modes.
     * @param min
     * @param mag
     */
    filter(min: GPUFilterMode, mag: GPUFilterMode): this & { filter: never },
    /**
     * Sets the U, V, and W address modes to `mode`.
     * @param mode
     */
    addressMode(mode: GPUAddressMode): this & { wrap: never },
    /**
     * Sets the U, V, and W address modes.
     * @param u
     * @param v
     * @param w
     */
    addressMode(u: GPUAddressMode, v: GPUAddressMode, w?: GPUAddressMode): this & { wrap: never },
    /**
     * Sets the comparison function for the sampler.
     * @param func
     */
    compare(func: GPUCompareFunction): this & { compare: never },
    /**
     * Sets the LOD clamp range.
     * @param min
     * @param max
     */
    lodClamp(min: number, max: number): this & { lodClamp: never },
    /**
     * Sets the mipmap filter mode.
     * @param filter
     */
    mipmapFilter(filter: GPUFilterMode): this & { mipmapFilter: never },
    /**
     * Sets the maximum anisotropy value.
     * @param value
     */
    maxAnisotropy(value: number): this & { maxAnisotropy: never },
    build(this: { filter: never, wrap: never }): GPUSampler,
}

/**
 * Builder-style `GPUSampler` creation.
 *
 * Example:
 * ```ts
 * const sampler = buildSampler(device)
 *     .filter("linear")
 *     .addressMode("repeat")
 *     .build("MySampler")
 * ```
 * @param device `GPUDevice` to use for sampler creation
 */
export function buildSampler(device: GPUDevice): SamplerBuilder {
    let descriptor: GPUSamplerDescriptor = {};

    return {
        filter(...args: any[]) {
            if (args.length === 1) {
                descriptor.minFilter = args[0];
                descriptor.magFilter = args[0];
            } else if (args.length === 2) {
                descriptor.minFilter = args[0];
                descriptor.magFilter = args[1];
            }
            return this as any;
        },
        addressMode(...args: any[]) {
            if (args.length === 1) {
                descriptor.addressModeU = args[0];
                descriptor.addressModeV = args[0];
                descriptor.addressModeW = args[0];
            } else if (args.length === 2 || args.length === 3) {
                descriptor.addressModeU = args[0];
                descriptor.addressModeV = args[1];
                descriptor.addressModeW = args[2];
            }
            return this as any;
        },
        compare(func: GPUCompareFunction) {
            descriptor.compare = func;
            return this as any;
        },
        lodClamp(min: number, max: number) {
            descriptor.lodMinClamp = min;
            descriptor.lodMaxClamp = max;
            return this as any;
        },
        mipmapFilter(filter: GPUFilterMode) {
            descriptor.mipmapFilter = filter;
            return this as any;
        },
        maxAnisotropy(value: number) {
            descriptor.maxAnisotropy = value;
            return this as any;
        },
        build(this: { filter: never, wrap: never }) {
            return device.createSampler(descriptor);
        },
    };
}