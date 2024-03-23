import {Container} from "dockerode";

import {Injectable} from "../decorators";
import {Project} from "../makes/Project";


type SearchParams = Partial<{
    id: string;
    name: string;
    path: string;
}>;

@Injectable("PROJECT_SERVICE")
export abstract class ProjectService {
    public abstract cdProject(name: string): Promise<void>;
    public abstract get(): Promise<Project>;
    public abstract getContainer(): Promise<Container|null>;
    public abstract start(project: Project): Promise<void>;
    public abstract stop(project: Project): Promise<void>;
    public abstract save(project: Project): Promise<void>;
    public abstract search(params: SearchParams): Promise<Project[]>;

    public async searchOne(params: SearchParams = {}): Promise<Project | null> {
        const [project] = await this.search(params);

        return project || null;
    }
}


export {SearchParams as ProjectServiceSearchParams};
