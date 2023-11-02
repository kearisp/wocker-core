import {Project} from "../models/Project";


class ProjectServiceInterface {
    public async cdProject(name: string): Promise<void> {
        throw new Error("Project not found");
    }

    public async get(): Promise<Project> {
        throw new Error("Project not found");
    }

    public async start(project: Project) {
        throw new Error("Project not found");
    }

    public async stop(project: Project) {
        throw new Error("Project not found");
    }
}


export {ProjectServiceInterface};
