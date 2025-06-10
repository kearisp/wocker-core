import {Injectable, Inject} from "../decorators";
import {AppConfigService} from "./AppConfigService";
import {AppFileSystemService} from "./AppFileSystemService";
import {ProjectRef} from "../types/ProjectRef";
import {WOCKER_VERSION_KEY} from "../env";


type TypeMap = {
    [type: string]: string;
};

@Injectable("APP_SERVICE")
export class AppService {
    public constructor(
        @Inject(WOCKER_VERSION_KEY)
        public readonly version: string,
        protected readonly appConfigService: AppConfigService,
        protected readonly fs: AppFileSystemService
    ) {}

    public get projects(): ProjectRef[] {
        return this.appConfigService.projects;
    }

    public isVersionGTE(version: string): boolean {
        const current = this.version.split(".").map(Number);
        const compare = version.split(".").map(Number);

        for(let i = 0; i < 3; i++) {
            if(current[i] > compare[i]) {
                return true;
            }
            else if(current[i] < compare[i]) {
                return false;
            }
        }

        return true;
    }

    public get experimentalFeatures(): string[] {
        return this.appConfigService.experimentalFeatures;
    }

    public getProjectTypes(): TypeMap {
        return this.appConfigService.getProjectTypes();
    }

    public addProject(id: string, name: string, path: string): void {
        this.appConfigService.addProject(id, name, path);
        this.appConfigService.save();
    }

    public getMeta(name: string, byDefault?: string): string|undefined
    public getMeta(name: string, byDefault: string): string;
    public getMeta(name: string, byDefault?: string): string|undefined {
        return this.appConfigService.getMeta(name, byDefault);
    }
}
