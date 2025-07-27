export const PROJECT_TYPE_DOCKERFILE = "dockerfile";
export const PROJECT_TYPE_IMAGE = "image";
export const PROJECT_TYPE_PRESET = "preset";
export const PROJECT_TYPE_COMPOSE = "compose";
export type ProjectType = typeof PROJECT_TYPE_DOCKERFILE
                        | typeof PROJECT_TYPE_IMAGE
                        | typeof PROJECT_TYPE_PRESET
                        | typeof PROJECT_TYPE_COMPOSE;
