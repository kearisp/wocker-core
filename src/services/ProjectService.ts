import {Project} from "../models/Project";


type SearchParams = {
    id: string;
    name: string;
    path: string;
};

class ProjectService {
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

    public async save(project: Project) {
        throw new Error("Dependency is missing");
    }

    public async search(params: Partial<SearchParams> = {}): Promise<Project[]> {
        throw new Error("Dependency is missing");
    }
}


export {
    ProjectService,
    SearchParams as ProjectServiceSearchParams
};
