export interface BindGroupLayoutBuilder {
    /**
     * Add a uniform buffer binding.
     * @param type
     * @param options
     */
    uniform(options?: Omit<GPUBufferBindingLayout, "type">): this,

    /**
     * Add a storage or readonly-storage buffer binding.
     *
     * `options.access` defaults to `"read"` if not provided.
     * @param type
     * @param options
     */
    storage(options?: Omit<GPUBufferBindingLayout, "type"> & { access?: "read" | "read-write" }): this,

    /**
     * Add a sampled texture binding.
     *
     * This corresponds to a sampled texture, for example a `texture_2d<f32>` in a WGSL shader.
     * @param type
     * @param options
     */
    texture(options?: GPUTextureBindingLayout): this,

    /**
     * Add a storage texture binding.
     *
     * This corresponds to a storage texture, for example a `texture_storage_2d<rgba8unorm, read>` in a WGSL shader.
     * @param type
     * @param options
     */
    textureStorage(options: GPUStorageTextureBindingLayout): this,

    /**
     * Add an external texture binding.
     * @param type
     */
    textureExternal(): this,

    /**
     * Add a sampler binding.
     *
     * `type` defaults to `"filtering"`
     * @param type
     */
    sampler(type?: GPUSamplerBindingType): this,

    /**
     * Create the `GPUBindGroupLayout` instance.
     * @param label
     */
    build(label?: string): GPUBindGroupLayout,
}

/**
 * Build a `GPUBindGroupLayout` using a builder pattern.
 *
 * Example:
 * ```ts
 * const bindGroupLayout = buildBindGroupLayout(device)
 *     .buffer("uniform")
 *     .texture("storage", {access: "read-only"})
 *     .sampler("filtering")
 *     .build("BindGroupLayout");
 * ```
 * @param device
 */
export function buildBindGroupLayout(device: GPUDevice): BindGroupLayoutBuilder {
    const entries: GPUBindGroupLayoutEntry[] = []
    let bindingIndex = 0;

    return {
        uniform(options = {}) {
            const buffer = {type: "uniform", ...options} as const
            entries.push({buffer, binding: bindingIndex++, visibility: defaultVisibility})
            return this
        },
        storage(options = {}) {
            const readonly = options.access === "read-write"
            const access: GPUBufferBindingType = readonly ? "storage" : "read-only-storage"
            const buffer = {type: access, ...options} as const
            // read-write storage buffers are not allowed in vertex shader
            const visibility = readonly ? (GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE) : defaultVisibility
            entries.push({buffer, binding: bindingIndex++, visibility})
            return this
        },
        texture(options = {}) {
            entries.push({texture: options, binding: bindingIndex++, visibility: defaultVisibility})
            return this
        },
        textureStorage(options) {
            const readonly = options.access === "read-only";
            const visibility = readonly ? defaultVisibility : (GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE)
            entries.push({texture: options, binding: bindingIndex++, visibility})
            return this
        },
        textureExternal() {
            entries.push({externalTexture: {}, binding: bindingIndex++, visibility: defaultVisibility})
            return this
        },
        sampler(type = "filtering") {
            entries.push({sampler: {type}, binding: bindingIndex++, visibility: defaultVisibility})
            return this
        },
        build(label = "BindGroupLayout") {
            return device.createBindGroupLayout({entries, label})
        }
    }
}

const defaultVisibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE