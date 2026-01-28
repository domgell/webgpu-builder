/**
 * Convert an array of usage strings to equivalent usage bits
 *
 * For example GPUBufferUsage `["copy-dst", "copy-src"]` to `GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC`
 * @param usage
 * @param strings
 */
export function convertUsageStringsToBits<T extends string>(usage: Record<T, number>, strings: string[]): number {
    return strings.map(u => usage[u.toUpperCase().replace("-", "_")]).reduce((a, b) => a | b);
}