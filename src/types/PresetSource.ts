enum PresetSourceEnum {
    INTERNAL = "internal",
    EXTERNAL = "external",
    GITHUB = "github"
}

export type PresetSource = PresetSourceEnum;

export const PresetSource = Object.assign({}, PresetSourceEnum, {
    values: (): PresetSourceEnum[] => Object.values(PresetSourceEnum)
});
