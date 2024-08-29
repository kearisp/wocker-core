import {EnvConfig, PickProperties} from "../types";
import {PresetType} from "./Preset";


export type ConfigProperties = Omit<PickProperties<Config>, "logLevel"> & {
    logLevel?: Config["logLevel"];
};

export abstract class Config {
    public debug?: boolean;
    public logLevel: "off" | "info" | "warn" | "error" = "off";
    public plugins: string[] = [];
    public presets?: {
        name: string;
        source: PresetType;
        path?: string;
    }[] = [];
    public projects: {
        id: string;
        name?: string;
        src: string;
    }[] = [];
    public meta?: EnvConfig;
    public env?: EnvConfig;

    protected constructor(data: ConfigProperties) {
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
        this.plugins = this.plugins.filter((plugin) => plugin !== removePlugin);
    }

    public setProject(id: string, path: string): void {
        this.projects = [
            ...this.projects.filter((project) => {
                return project.id !== id && project.src !== path;
            }),
            {
                id,
                src: path
            }
        ];
    }

    public registerPreset(name: string, source: PresetType, path?: string): void {
        if(!this.presets) {
            this.presets = [];
        }

        const preset = this.presets.find((preset): boolean => {
            return preset.name === name;
        });

        if(!preset) {
            this.presets.push({
                name,
                source,
                path
            });
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

    // noinspection JSUnusedGlobalSymbols
    public toJson(): ConfigProperties {
        return {
            debug: this.debug,
            logLevel: this.logLevel,
            plugins: this.plugins,
            projects: this.projects,
            presets: (this.presets || []).length > 0 ? this.presets : undefined,
            env: this.env,
            meta: this.meta
        };
    }
}
