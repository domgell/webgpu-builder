import {assert} from "@domgell/ts-util";
import {BufferDataSource, createBufferWithData} from "@domgell/webgpu-util";
import {convertUsageStringsToBits} from "./util.ts";

export interface BufferBuilder {
    /**
     * Set the buffer size in bytes.
     * @param byteSize
     */
    size(byteSize: number): this & { size: never },
    /**
     * Set the buffer usage as `GPUBufferUsageFlags` bits.
     * @param bits
     */
    usage(bits: GPUBufferUsageFlags): this & { usage: never },
    /**
     * Set the buffer usage as usage strings.
     * @param flags
     */
    usage(...flags: BufferUsageString[]): this & { usage: never },
    /**
     * Set initial data for the buffer.
     *
     * If `size` is set, then the byte size of `data` must less than or equal to `size`.
     * @param data
     */
    data(data: BufferDataSource): this & { data: never, size: never },
    /**
     * Set `mappedAtCreation` to true. 
     */
    mapped(): this & { mapped: never, data: never },
    /**
     * Create the `GPUBuffer` instance.
     * @param label
     */
    build(this: { size: never, usage: never }, label?: string): GPUBuffer,
}

/**
 * Builder-style `GPUBuffer` creation.
 *
 * Example:
 * ```ts
 * const cameraBuffer = buildBuffer(device)
 *    .usage("uniform", "copy-dst")
 *    .size(128)
 *    .build("CameraBuffer");
 * ```
 * @param device `GPUDevice` to use for buffer creation
 */
export function buildBuffer(device: GPUDevice): BufferBuilder {
    let usage: GPUBufferUsageFlags;
    let size: number;
    let data: BufferDataSource;
    let mappedAtCreation: true;

    return {
        usage(..._usage: any) {
            // Usage bits
            if (typeof _usage[0] === "number") {
                usage = _usage[0];
            }
            // Usage string array
            else {
                usage = convertUsageStringsToBits(GPUBufferUsage, _usage);
            }
            return this as any;
        },
        size(_size) {
            size = _size;
            return this as any;
        },
        data(_data) {
            data = _data;
            return this as any;
        },
        mapped() {
            mappedAtCreation = true;
            return this as any;
        },
        build(label = "Buffer") {
            assert(usage !== undefined, "Buffer usage not set");

            // Create with initial data
            if (data !== undefined) {
                return createBufferWithData(device, {
                    usage, size, label, remainMapped: mappedAtCreation
                }, data);
            }
            // Create without initial data
            else {
                assert(size !== undefined, "Buffer size not set");
                return device.createBuffer({usage, label, size, mappedAtCreation});
            }
        },
    };
}

export type BufferUsageString =
    "storage"
    | "uniform"
    | "copy-dst"
    | "copy-src"
    | "vertex"
    | "index"
    | "map-read"
    | "map-write"
    | "query-resolve"
    | "indirect"