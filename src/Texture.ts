import {assert} from "@domgell/ts-util";
import {TextureImageSource, createTextureWithData} from "@domgell/webgpu-util";
import {convertUsageStringsToBits} from "./util.ts";

export interface TextureBuilder {
    /**
     * Set texture usage as `GPUTextureUsageFlags` bits
     * @param bits
     */
    usage(bits: GPUTextureUsageFlags): this & { usage: never },
    /**
     * Set texture usage as usage strings
     * @param flags
     */
    usage(...flags: TextureUsageString[]): this & { usage: never },
    /**
     * Set texture format
     * @param format
     */
    format(format: GPUTextureFormat): this & { format: never },
    /**
     * Set texture size
     * @param width
     * @param height Defaults to `1` if not provided.
     * @param depthOrArrayLayers Defaults to `1` if not provided.
     */
    size(width: number, height?: number, depthOrArrayLayers?: number): this & { size: never },
    /**
     * Set texture dimension
     *
     * Textures default to `2d` if not set.
     * @param dimension
     */
    dimension(dimension: GPUTextureDimension): this & { dimension: never },
    /**
     * Set initial texture data.
     *
     * `data` is assumed to 2d i.e. such as an image.
     * @param data
     */
    data(data: TextureImageSource): this & { size: never, data: never },
    build(this: { size: never, format: never, usage: never }, label?: string): GPUTexture,
}

/**
 * Builder-style `GPUTexture` creation.
 *
 * Example:
 * ```ts
 * const imageTexture = buildTexture(device)
 *    .usage("render-attachment", "texture-binding")
 *    .size(512, 512)
 *    .format("rgba8unorm")
 *    .build("ImageTexture");
 * ```
 * @param device `GPUDevice` to use for texture creation
 */
export function buildTexture(device: GPUDevice): TextureBuilder {
    let usage: GPUTextureUsageFlags;
    let format: GPUTextureFormat;
    let size: GPUExtent3DStrict;
    let data: TextureImageSource;
    let dimension: GPUTextureDimension = "2d";

    return {
        usage(..._usage: any) {
            // Usage bits
            if (typeof _usage[0] === "number") {
                usage = _usage[0];
            }
            // Usage string array
            else {
                usage = convertUsageStringsToBits(GPUTextureUsage, _usage);
            }

            return this as any;
        },
        format(_format: GPUTextureFormat) {
            format = _format;
            return this as any;
        },
        size(x: number, y: number, z: number = 1) {
            size = [x, y, z];
            return this as any;
        },
        data(_data: TextureImageSource) {
            data = _data;
            return this as any;
        },
        dimension(_dimension) {
            dimension = _dimension;
            return this as any;
        },
        build(label: string = "Texture") {
            assert(format !== undefined, "Texture format not set");
            assert(usage !== undefined, "Texture usage not set");

            // Create with data and optional size
            if (data !== undefined) {
                return createTextureWithData(device, {
                    format, label, usage, size, dimension,
                }, data);
            }
            // Create without data and required size
            else {
                assert(size !== undefined, "Texture size not set");
                return device.createTexture({size, format, usage, dimension});
            }
        },
    };
}

export type TextureUsageString = "copy-src" | "copy-dst" | "render-attachment" | "storage-binding" | "texture-binding"