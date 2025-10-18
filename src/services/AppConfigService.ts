import Path from "path";
import {Inject, Injectable} from "../decorators";
import {PROJECT_TYPE_PRESET, PROJECT_TYPE_IMAGE, PROJECT_TYPE_DOCKERFILE, PROJECT_TYPE_COMPOSE} from "../modules";
import {AppConfig, AppConfigProperties} from "../makes/AppConfig";
import {PresetSource, PresetRef, ProjectRef, PluginRef} from "../types";
import {AppFileSystemService} from "./AppFileSystemService";
import {ProcessService} from "./ProcessService";
import {WOCKER_VERSION_KEY} from "../env";


type TypeMap = {
    [type: string]: string;
};

@Injectable("APP_CONFIG")
export class AppConfigService {
    protected _pwd: string;
    protected _config?: AppConfig;
    protected readonly mapTypes: TypeMap = {
        [PROJECT_TYPE_PRESET]: "Preset",
        [PROJECT_TYPE_IMAGE]: "Image",
        [PROJECT_TYPE_DOCKERFILE]: "Dockerfile"
    };

    public constructor(
        @Inject(WOCKER_VERSION_KEY)
        public readonly version: string,
        protected readonly processService: ProcessService,
        public readonly fs: AppFileSystemService
    ) {
        this._pwd = (process.cwd() || process.env.PWD) as string;
    }

    public get experimentalFeatures(): string[] {
        return [
            "projectComposeType",
            "buildKit",
            "dns"
        ];
    }

    public get debug(): boolean {
        return this.config.debug || false;
    }

    public set debug(debug: boolean) {
        this.config.debug = debug;
    }

    public get config(): AppConfig {
        if(!this._config) {
            let data: AppConfigProperties = {};

            if(this.fs.exists("wocker.config.js")) {
                try {
                    const {config} = require(this.fs.path("wocker.config.js"));

                    data = config;
                }
                catch(err) {
                    // TODO: Log somehow
                    // this.logService.error(err);

                    if(this.fs.exists("wocker.config.json")) {
                        let json = this.fs.readJSON("wocker.config.json");

                        if(typeof json === "string") {
                            json = JSON.parse(json);
                        }

                        data = json;
                    }
                }
            }
            else if(this.fs.exists("wocker.config.json")) {
                data = this.fs.readJSON("wocker.config.json");
            }
            else if(this.fs.exists("wocker.json")) {
                let json = this.fs.readJSON("wocker.json");

                if(typeof json === "string") {
                    json = JSON.parse(json);
                }

                data = json;
            }
            else if(this.fs.exists("data.json")) {
                data = this.fs.readJSON("data.json");
            }
            else if(!this.fs.exists()) {
                this.fs.mkdir("", {
                    recursive: true
                });
            }

            this._config = new AppConfig(data);
        }

        return this._config;
    }

    public get presets(): PresetRef[] {
        return this.config.presets;
    }

    public get projects(): ProjectRef[] {
        return this.config.projects;
    }

    public get plugins(): PluginRef[] {
        return this.config.plugins
    }

    /**
     * @deprecated
     */
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

    /**
     * @deprecated
     */
    public pwd(...parts: string[]): string {
        return this.processService.pwd(Path.join(...parts));
    }

    /**
     * @deprecated
     */
    public setPWD(pwd: string): void {
        this.processService.chdir(pwd);
    }

    /**
     * @deprecated
     */
    public dataPath(...args: string[]): string {
        return this.fs.path(...args);
    }

    /**
     * @deprecated
     */
    public getConfig(): AppConfig {
        return this.config;
    }

    public addProject(name: string, path: string): void {
        this.config.addProject(name, path);
    }

    public removeProject(name: string): void {
        this.config.removeProject(name);
        this.save();
    }

    public registerPreset(name: string, source: PresetSource, path?: string): void {
        this.config.registerPreset(name, source, path);
        this.save();
    }

    public unregisterPreset(name: string): void {
        this.config.unregisterPreset(name);
        this.save();
    }

    public addPlugin(name: string, env?: PluginRef["env"]): void {
        this.config.addPlugin(name, env);
    }

    public removePlugin(name: string): void {
        this.config.removePlugin(name);
    }

    public setEnv(name: string, value: string): void {
        this.config.setEnv(name, value);
    }

    public unsetEnv(name: string): void {
        this.config.unsetEnv(name);
    }

    public getMeta(name: string, byDefault?: string): string|undefined;
    public getMeta(name: string, byDefault: string): string;
    public getMeta(name: string, byDefault?: string): string|undefined {
        return this.config.getMeta(name, byDefault);
    }

    public setMeta(name: string, value: string): void {
        this.config.setMeta(name, value);
    }

    public unsetMeta(name: string): void {
        this.config.unsetMeta(name);
    }

    public isExperimentalEnabled(key: string): boolean {
        return this.config.getMeta(`experimental.${key}`) === "enabled";
    }

    public getProjectTypes() {
        if(this.isExperimentalEnabled("projectComposeType")) {
            return {
                ...this.mapTypes,
                [PROJECT_TYPE_COMPOSE]: "Docker compose"
            };
        }

        return this.mapTypes;
    }

    public save(): void {
        const fs = this.fs;

        if(!fs.exists()) {
            fs.mkdir("", {
                recursive: true
            });
        }

        fs.writeFile("wocker.config.js", this.config.toJsString());
        fs.writeJSON("wocker.config.json", this.config.toObject()); // Backup file

        if(fs.exists("data.json")) {
            fs.rm("data.json");
        }

        if(fs.exists("wocker.json")) {
            fs.rm("wocker.json");
        }
    }
}
