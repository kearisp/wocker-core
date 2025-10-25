export const PRESET_SOURCE_INTERNAL = "internal" as const;
export const PRESET_SOURCE_EXTERNAL = "external" as const;
export const PRESET_SOURCE_GITHUB = "github" as const;

export type PresetSource = typeof PRESET_SOURCE_INTERNAL
                         | typeof PRESET_SOURCE_EXTERNAL
                         | typeof PRESET_SOURCE_GITHUB;
