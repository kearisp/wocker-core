import {Inject, Injectable} from "../decorators";
import {FileSystem} from "../makes";
// noinspection ES6PreferShortImport
import {Project} from "../makes/Project";
import {ProjectConfig} from "../makes/ProjectConfig";
import {AppService} from "./AppService";
import {AppFileSystemService} from "./AppFileSystemService";
import {FileSystemDriver, ProjectLayerType} from "../types";
import {FILE_SYSTEM_DRIVER_KEY} from "../env";


@Injectable("PROJECT_REPOSITORY")
export class ProjectRepository {
    public constructor(
        protected readonly appService: AppService,
        protected readonly fs: AppFileSystemService,
        @Inject(FILE_SYSTEM_DRIVER_KEY)
        protected readonly driver: FileSystemDriver
    ) {}

    public getConfig(scope: ProjectLayerType, name: string, path?: string): ProjectConfig {
        const ref = this.appService.getProject(name);

        switch(scope) {
            case ProjectLayerType.DATA: {
                if(!ref) {
                    return new ProjectConfig("{}");
                }

                const fs = this.fs.cd(`projects/${ref.name}`);

                if(!fs.exists("config.json")) {
                    return new ProjectConfig("{}");
                }

                return new ProjectConfig(
                    fs.readFile("config.json").toString(),
                );
            }

            case ProjectLayerType.REPOSITORY:
                path = path || ref?.path;

                if(!path) {
                    return new ProjectConfig("{}");
                }

                const fs = new FileSystem(path);

                if(!fs.exists("wocker.config.json")) {
                    return new ProjectConfig("{}");
                }

                return new ProjectConfig(
                    fs.readFile("wocker.config.json").toString()
                );

            case ProjectLayerType.GLOBAL:
                return new ProjectConfig(
                    JSON.stringify({
                        env: this.appService.config.env
                    })
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

        const appLayer = project.layer(ProjectLayerType.DATA),
              projectLayer = project.layer(ProjectLayerType.REPOSITORY);

        if(appLayer.isDirty()) {
            this.fs.writeFile(`projects/${project.name}/config.json`, appLayer.toString());
        }

        if(projectLayer.isDirty()) {
            const projectFS = new FileSystem(project.path, this.driver);

            projectFS.writeFile("wocker.config.json", projectLayer.toString());
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
