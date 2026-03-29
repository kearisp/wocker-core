import {Injectable} from "../../../decorators";
import {Project} from "../makes/Project";


@Injectable("PROJECT_REPOSITORY")
export abstract class ProjectRepository {
    public abstract getByName(name: string): Project;
    public abstract save(project: Project): void;
    public abstract search(params: ProjectRepository.SearchParams): Project[];
    public abstract searchOne(params: ProjectRepository.SearchParams): Project;
}

export namespace ProjectRepository {
    export type SearchParams = Partial<{
        name: string;
        path: string;
    }>;
}
