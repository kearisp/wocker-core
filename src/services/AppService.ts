import {Injectable, Inject} from "../decorators";
import {Version} from "../makes/Version";
import {AppConfig} from "../makes/AppConfig";
import {AppFileSystemService} from "./AppFileSystemService";
import {ProcessService} from "./ProcessService";
import {LogService} from "./LogService";
import {ProjectRef, PluginRef, PresetRef, PresetSource, ProjectType} from "../types";
import {WOCKER_VERSION_KEY} from "../env";


type TypeMap = {
    [type: string]: string;
};

@Injectable("APP_SERVICE")
export class AppService {
    protected _config?: AppConfig;
    protected readonly mapTypes: TypeMap = {
        [ProjectType.IMAGE]: "Image",
        [ProjectType.PRESET]: "Preset",
        [ProjectType.DOCKERFILE]: "Dockerfile"
    };

    public constructor(
        @Inject(WOCKER_VERSION_KEY)
        public readonly version: string,
        public readonly fs: AppFileSystemService,
        protected readonly processService: ProcessService,
        protected readonly logService: LogService
    ) {}

    public get config(): AppConfig {
        if(!this._config) {
            this._config = AppConfig.make(this.fs);
        }

        return this._config;
    }

    public get debug(): boolean {
        return this.config.debug || false;
    }

    public set debug(debug: boolean) {
        this.config.debug = debug;
    }

    public get projects(): ProjectRef[] {
        return this.config.projects;
    }

    public get plugins(): PluginRef[] {
        return this.config.plugins;
    }

    public get presets(): PresetRef[] {
        return this.config.presets;
    }

    public isVersionGT(version: string): boolean {
        return Version.parse(this.version).compare(version) > 0;
    }

    public isVersionGTE(version: string): boolean {
        return Version.parse(this.version).compare(version) >= 0;
    }

    public getProjectTypes() {
        if(this.isExperimentalEnabled("projectComposeType")) {
            return {
                ...this.mapTypes,
                [ProjectType.COMPOSE]: "Docker compose"
            };
        }

        return this.mapTypes;
    }

    public getProject(name: string): ProjectRef | undefined {
        return this.config.getProject(name);
    }

    public addProject(name: string, path: string): void {
        this.config.addProject(name, path);
        this.config.save();
    }

    public removeProject(name: string): void {
        this.config.removeProject(name);
        this.config.save();
    }

    public addPlugin(name: string, env?: PluginRef["env"]): void {
        this.config.addPlugin(name, env);
        this.config.save();
    }

    public removePlugin(name: string): void {
        this.config.removePlugin(name);
        this.config.save();
    }

    public registerPreset(name: string, source: PresetSource, path?: string): void {
        this.config.registerPreset(name, source, path);
        this.config.save();
    }

    public unregisterPreset(name: string): void {
        this.config.unregisterPreset(name);
        this.config.save();
    }

    public getEnv(key: string, byDefault?: string): string|undefined;
    public getEnv(key: string, byDefault: string): string;
    public getEnv(key: string, byDefault?: string): string | undefined {
        return this.config.getEnv(key, byDefault);
    }

    public setEnv(key: string, value: string): void {
        this.config.setEnv(key, value);
        this.config.save();
    }

    public unsetEnv(key: string): void {
        this.config.unsetEnv(key);
        this.config.save();
    }

    public getMeta(key: string, byDefault?: string): string|undefined
    public getMeta(key: string, byDefault: string): string;
    public getMeta(key: string, byDefault?: string): string|undefined {
        return this.config.getMeta(key, byDefault);
    }

    public setMeta(key: string, value: string): void {
        this.config.setMeta(key, value);
        this.config.save();
    }

    public unsetMeta(key: string): void {
        this.config.unsetMeta(key);
        this.config.save();
    }

    public get experimentalFeatures(): string[] {
        return [
            "projectComposeType",
            "buildKit",
            "dns"
        ];
    }

    public isExperimentalEnabled(key: string): boolean {
        return this.config.getMeta(`experimental.${key}`) === "enabled";
    }

    public save(): void {
        this.config.save();
    }
}
