enum ProjectTypeEnum {
    DOCKERFILE = "dockerfile",
    IMAGE = "image",
    COMPOSE = "compose",
    PRESET = "preset"
}
/** @deprecated */
export const PROJECT_TYPE_DOCKERFILE = ProjectTypeEnum.DOCKERFILE;
/** @deprecated */
export const PROJECT_TYPE_IMAGE = ProjectTypeEnum.IMAGE;
/** @deprecated */
export const PROJECT_TYPE_PRESET = ProjectTypeEnum.PRESET;
/** @deprecated */
export const PROJECT_TYPE_COMPOSE = ProjectTypeEnum.COMPOSE;

export type ProjectType = ProjectTypeEnum;

export const ProjectType = Object.assign({}, ProjectTypeEnum, {
    values() {
        return Object.values(ProjectTypeEnum);
    }
});
