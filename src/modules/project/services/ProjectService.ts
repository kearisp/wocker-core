import {Injectable} from "../../../decorators";
import {Project} from "../makes/Project";
import {ProjectRepositorySearchParams} from "../repositories/ProjectRepository";


@Injectable("PROJECT_SERVICE")
export abstract class ProjectService {
    public abstract get(name?: string): Project;
    public abstract save(project: Project): void;
    public abstract start(project: Project): Promise<void>;
    public abstract stop(project: Project): Promise<void>;
    public abstract search(params: ProjectRepositorySearchParams): Project[];

    public searchOne(params: ProjectRepositorySearchParams = {}): Project | null {
        const [project] = this.search(params);

        return project || null;
    }

    /**
     * @deprecated
     */
    public cdProject(name?: string): void {}
}
