import {ProjectRef} from "../types";


export enum ProjectLayerTypeEnum {
    DATA = "app",
    REPOSITORY = "project",
    GLOBAL = "global"
}

export type ProjectLayerType = ProjectLayerTypeEnum;

export const ProjectLayerType = Object.assign({}, ProjectLayerTypeEnum, {
    label(type: ProjectLayerTypeEnum): string {
        switch(type) {
            case ProjectLayerTypeEnum.DATA:
                return "Data";

            case ProjectLayerTypeEnum.GLOBAL:
                return "Global";

            case ProjectLayerTypeEnum.REPOSITORY:
                return "Repository";

            default:
                return type;
        }
    },
    fileName(type: ProjectLayerTypeEnum, projectRef: ProjectRef) {
        switch(type) {
            case ProjectLayerTypeEnum.DATA:
                return `projects/${projectRef.name}/config.json`;

            case ProjectLayerTypeEnum.REPOSITORY:
                return `wocker.config.json`;

            default:
                throw new Error(`Unknown config layer: ${type}`);
        }
    }
});

