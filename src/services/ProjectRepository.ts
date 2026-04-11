import {Inject, Injectable} from "../decorators";
import {Project} from "../makes/Project";
import {ProjectConfig} from "../makes/ProjectConfig";
import {FileSystem} from "../makes";
import {AppService} from "./AppService";
import {AppFileSystemService} from "./AppFileSystemService";
import {FileSystemDriver, ProjectConfigScope, ProjectConfigScopeEnum} from "../types";
import {FILE_SYSTEM_DRIVER_KEY} from "../env";


@Injectable("PROJECT_REPOSITORY")
export class ProjectRepository {
    public constructor(
        protected readonly appService: AppService,
        protected readonly fs: AppFileSystemService,
        @Inject(FILE_SYSTEM_DRIVER_KEY)
        protected readonly driver: FileSystemDriver
    ) {}

    public getConfig(name: string, scope: ProjectConfigScope): ProjectConfig {
        const ref = this.appService.getProject(name);

        if(!ref) {
            throw new Error("");
        }

        switch(scope) {
            case ProjectConfigScope.APP:
                return ProjectConfig.make(
                    this.fs.cd(`projects/${ref.name}`),
                    "config.json"
                );

            case ProjectConfigScopeEnum.LOCAL:
                return ProjectConfig.make(
                    new FileSystem(ref.path, this.driver),
                    "wocker.config.json"
                );
        }
    }

    public getByName(name: string): Project {
        const ref = this.appService.getProject(name);

        if(!ref) {
            throw new Error(`Project "${name}" not found`);
        }

        return new Project(
            ref.name,
            ref.path
        );
    }

    public save(project: Project): void {
        if(!project.ref) {
            this.appService.addProject(project.name, project.path);
        }

        if(!this.fs.exists(`projects/${project.name}`)) {
            this.fs.mkdir(`projects/${project.name}`);
        }

        if(project.configs.app.isDirty()) {
            this.fs.writeFile(`projects/${project.name}/config.json`, project.configs.app.toString());
        }

        if(project.configs.project.isDirty()) {
            const projectFS = new FileSystem(project.path, this.driver);

            projectFS.writeFile("wocker.config.json", project.configs.project.toString());
        }
    }

    public search(params: ProjectRepository.SearchParams): Project[] {
        const {name, path} = params,
              projects: Project[] = [];

        for(const ref of this.appService.projects) {
            if(name && ref.name !== name) {
                continue;
            }

            if(path && ref.path !== path) {
                continue;
            }

            const project = this.getByName(ref.name);

            projects.push(project);
        }

        return projects;
    }

    public searchOne(params: ProjectRepository.SearchParams): Project | null {
        const [project] = this.search(params);

        return project || null;
    }
}

export namespace ProjectRepository {
    export type SearchParams = Partial<{
        name: string;
        path: string;
    }>;
}
