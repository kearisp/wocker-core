import {ProjectRef} from "../types";


export enum ProjectConfigScopeEnum {
    APP = "app",
    LOCAL = "project"
}

export type ProjectConfigScope = ProjectConfigScopeEnum;

export const ProjectConfigScope = Object.assign({}, ProjectConfigScopeEnum, {
    fileName(scope: ProjectConfigScopeEnum, projectRef: ProjectRef) {
        switch(scope) {
            case ProjectConfigScopeEnum.APP:
                return `projects/${projectRef.name}/config.json`;

            case ProjectConfigScopeEnum.LOCAL:
                return `wocker.config.json`;

            default:
                throw new Error(`Unknown config scope: ${scope}`);
        }
    }
});
