import {Injectable} from "../../../decorators";
import {Project} from "../makes/Project";


export type ProjectRepositorySearchParams = Partial<{
    name: string;
    path: string;
}>;

@Injectable("PROJECT_REPOSITORY")
export abstract class ProjectRepository {
    public abstract getByName(name: string): Project;
    public abstract save(project: Project): void;
    public abstract search(params: ProjectRepositorySearchParams): Project[];
    public abstract searchOne(params: ProjectRepositorySearchParams): Project;
}
