import {Inject, Injectable} from "../../../decorators";
import {Project} from "../makes/Project";
import {ProjectConfig} from "../makes/ProjectConfig";
import {FileSystem} from "../../../makes/FileSystem";
import {AppFileSystemService, AppService} from "../../../services";
import {FILE_SYSTEM_DRIVER_KEY} from "../../../env";
import {FileSystemDriver} from "../../../types";
import {ProjectConfigScope, ProjectConfigScopeEnum} from "../types";


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
        project.save();
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
