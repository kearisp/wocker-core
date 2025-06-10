import {Injectable} from "../decorators";
import {Project} from "../makes/Project";


type SearchParams = Partial<{
    name: string;
    path: string;
}>;

@Injectable("PROJECT_SERVICE")
export abstract class ProjectService {
    public abstract get(name?: string): Project;
    public abstract save(project: Project): void;
    public abstract search(params: SearchParams): Project[];
    public abstract start(project: Project): Promise<void>;
    public abstract stop(project: Project): Promise<void>;

    public searchOne(params: SearchParams = {}): Project | null {
        const [project] = this.search(params);

        return project || null;
    }

    /**
     * @deprecated
     */
    public cdProject(name?: string): void {}
}

export {SearchParams as ProjectServiceSearchParams};
