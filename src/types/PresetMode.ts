enum PresetModeEnum {
    PROJECT = "project",
    GLOBAL = "global"
}

export type PresetMode = PresetModeEnum;

export const PresetMode = Object.assign({}, PresetModeEnum, {
    values: () => {
        return Object.values(PresetModeEnum);
    },
    options: () => {
        return PresetMode.values().map((mode) => {
            return {
                label: PresetMode.label(mode),
                value: mode
            };
        });
    },
    label: (mode: PresetModeEnum): string => {
        switch(mode) {
            case PresetModeEnum.PROJECT:
                return "For project only";

            case PresetModeEnum.GLOBAL:
                return "Global usage";

            default:
                throw new Error(`Unsupported mode "${mode}"`);
        }
    }
});
