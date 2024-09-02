import {EnvConfig, PickProperties} from "../types";
import {PRESET_SOURCE_EXTERNAL, PresetType} from "./Preset";


type ProjectData = {
    id: string;
    name?: string;
    path?: string;
    /** @deprecated */
    src?: string;
};

type PresetData = {
    name: string;
    source: PresetType;
    path?: string;
};

export type AppConfigProperties = Omit<PickProperties<AppConfig>, "logLevel"> & {
    logLevel?: AppConfig["logLevel"];
};

export abstract class AppConfig {
    public debug?: boolean;
    public logLevel: "off" | "info" | "warn" | "error" = "off";
    public plugins?: string[];
    public presets?: PresetData[];
    public projects?: ProjectData[];
    public meta?: EnvConfig;
    public env?: EnvConfig;

    protected constructor(data: AppConfigProperties) {
        Object.assign(this, data);
    }

    public addPlugin(plugin: string): void {
        if(!this.plugins) {
            this.plugins = [];
        }

        if(this.plugins.includes(plugin)) {
            return;
        }

        this.plugins.push(plugin);
    }

    public removePlugin(removePlugin: string): void {
        if(!this.plugins) {
            return;
        }

        this.plugins = this.plugins.filter((plugin) => plugin !== removePlugin);

        if(this.plugins.length === 0) {
            delete this.plugins;
        }
    }

    public getProject(id: string): ProjectData|undefined {
        if(!this.projects) {
            return;
        }

        return this.projects.find((projectData) => {
            return projectData.id === id;
        });
    }

    /* istanbul ignore next */
    /**
     * @deprecated
     * @see Project.addProject
     */
    public setProject(id: string, path: string): void {
        if(!this.projects) {
            this.projects = [];
        }

        let projectData = this.projects.find((projectData) => {
            return projectData.id === id;
        });

        if(!projectData) {
            this.projects.push({
                id,
                path,
                src: path
            });
            return;
        }

        projectData.name = id;
        projectData.path = path;
        projectData.src = path;
    }

    public addProject(id: string, name: string, path: string): void {
        if(!this.projects) {
            this.projects = [];
        }

        let projectData = this.projects.find((projectData) => {
            return projectData.id === id;
        });

        if(!projectData) {
            this.projects.push({
                id,
                name,
                path,
            });
            return;
        }

        /* istanbul ignore next */
        if(projectData.src) {
            delete projectData.src;
        }

        projectData.name = name;
        projectData.path = path;
    }

    public removeProject(id: string): void {
        if(!this.projects) {
            return;
        }

        this.projects = this.projects.filter((projectData): boolean => {
            return projectData.id !== id;
        });

        if(this.projects.length === 0) {
            delete this.projects;
        }
    }

    public registerPreset(name: string, source: PresetType, path?: string): void {
        if(!this.presets) {
            this.presets = [];
        }

        let presetData = this.presets.find((preset): boolean => {
            return preset.name === name;
        });

        if(!presetData) {
            presetData = {
                name,
                source
            };

            this.presets.push(presetData);
        }

        presetData.source = source;

        if(presetData.source === PRESET_SOURCE_EXTERNAL) {
            presetData.path = path;
        }
        else if(presetData.path) {
            delete presetData.path;
        }
    }

    public unregisterPreset(name: string): void {
        if(!this.presets) {
            return;
        }

        this.presets = this.presets.filter((preset) => {
            return preset.name !== name;
        });

        if(this.presets.length === 0) {
            delete this.presets;
        }
    }

    public getMeta(name: string): string|undefined;
    public getMeta(name: string, defaultValue: string): string;
    public getMeta(name: string, defaultValue?: string): string|undefined {
        if(!this.meta || !(name in this.meta)) {
            return defaultValue;
        }

        return this.meta[name];
    }

    public setMeta(name: string, value: string): void {
        if(!this.meta) {
            this.meta = {};
        }

        this.meta[name] = value;
    }

    public unsetMeta(name: string): void {
        if(!this.meta || !(name in this.meta)) {
            return;
        }

        delete this.meta[name];

        if(Object.keys(this.meta).length === 0) {
            delete this.meta;
        }
    }

    public getEnv(name: string): string|undefined;
    public getEnv(name: string, defaultValue: string): string;
    public getEnv(name: string, defaultValue?: string): string|undefined {
        if(!this.env || !(name in this.env)) {
            return defaultValue;
        }

        return this.env[name];
    }

    public setEnv(name: string, value: string): void {
        if(!this.env) {
            this.env = {};
        }

        this.env[name] = value;
    }

    public unsetEnv(name: string): void {
        if(!this.env || !(name in this.env)) {
            return;
        }

        delete this.env[name];

        if(Object.keys(this.env).length === 0) {
            delete this.env;
        }
    }

    public abstract save(): Promise<void>;

    public toJson(): AppConfigProperties {
        const json: any = {
            debug: this.debug,
            logLevel: this.logLevel,
            plugins: this.plugins,
            projects: this.projects,
            presets: this.presets,
            env: this.env,
            meta: this.meta
        };

        return Object.keys(json).reduce((res: AppConfigProperties, key: string) => {
            if(typeof json[key] !== "undefined") {
                (res as any)[key] = json[key];
            }

            return res;
        }, {});
    }
}
